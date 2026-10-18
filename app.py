#!/usr/bin/env python3
"""OpenInfra Insight: a standard-library demo API for synthetic asset telemetry."""
from __future__ import annotations

import csv
import json
import math
import re
from collections import Counter
from datetime import datetime, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
HOST = "127.0.0.1"
PORT = 8000


def load_assets() -> list[dict]:
    with (DATA / "assets.csv").open(newline="", encoding="utf-8") as stream:
        rows = list(csv.DictReader(stream))
    assets = []
    for row in rows:
        try:
            row["latitude"] = float(row["latitude"])
            row["longitude"] = float(row["longitude"])
            row["reading"] = float(row["reading"])
            row["healthy_min"] = float(row["healthy_min"])
            row["healthy_max"] = float(row["healthy_max"])
            row["criticality"] = int(row["criticality"])
        except (KeyError, ValueError) as error:
            raise ValueError(f"Invalid numeric field in asset row {row.get('asset_id', '?')}") from error
        if not row["asset_id"] or not -90 <= row["latitude"] <= 90 or not -180 <= row["longitude"] <= 180:
            raise ValueError(f"Invalid asset identity or coordinates: {row.get('asset_id', '?')}")
        assets.append(row)
    return assets


ASSETS = load_assets()

def series_for(asset: dict) -> list[dict]:
    """Repeatable synthetic 14-day series; recent outliers are intentionally seeded."""
    seed = sum(ord(char) for char in asset["asset_id"])
    center = asset["reading"]
    span = asset["healthy_max"] - asset["healthy_min"]
    values = []
    now = datetime.now(timezone.utc).replace(hour=12, minute=0, second=0, microsecond=0)
    for day in range(14):
        wobble = math.sin((day + seed % 5) / 2.5) * span * 0.045
        drift = (day / 13) * span * (0.12 if seed % 4 == 0 else -0.02)
        value = center - drift + wobble
        if day == 12 and asset["criticality"] >= 4:
            value += span * 0.17
        if day == 13:
            value = center
        values.append({"date": (now - timedelta(days=13 - day)).date().isoformat(), "value": round(value, 2)})
    return values


def assess(asset: dict) -> dict:
    series = series_for(asset)
    values = [point["value"] for point in series]
    baseline = values[:-1]
    mean = sum(baseline) / len(baseline)
    spread = math.sqrt(sum((value - mean) ** 2 for value in baseline) / len(baseline)) or 1.0
    current = asset["reading"]
    z_score = (current - mean) / spread
    low, high = asset["healthy_min"], asset["healthy_max"]
    out_of_band = current < low or current > high
    deviation = max(0.0, (current - high) / max(high - low, 1.0), (low - current) / max(high - low, 1.0))
    score = min(99, round(18 + deviation * 95 + max(0, abs(z_score) - 1.5) * 11 + (asset["criticality"] - 1) * 7))
    if out_of_band or abs(z_score) >= 2.4:
        level = "High"
    elif score >= 52 or abs(z_score) >= 1.7:
        level = "Watch"
    else:
        level = "Normal"
    reasons = []
    if out_of_band:
        reasons.append(f"reading {current:g} {asset['unit']} is outside the reference band ({low:g}–{high:g})")
    if abs(z_score) >= 1.7:
        reasons.append(f"recent value is {abs(z_score):.1f} baseline standard deviations from its 13-day mean")
    if asset["criticality"] >= 4:
        reasons.append(f"asset criticality is {asset['criticality']}/5")
    if not reasons:
        reasons.append("reading is inside its reference band and close to its recent baseline")
    return {"level": level, "score": score, "z_score": round(z_score, 2), "mean": round(mean, 2), "reasons": reasons, "series": series}


def get_assets() -> list[dict]:
    output = []
    for asset in ASSETS:
        analysis = assess(asset)
        output.append({**asset, "risk": analysis["level"], "risk_score": analysis["score"], "explanation": analysis["reasons"]})
    return output


def search_notes(query: str) -> list[dict]:
    terms = set(re.findall(r"[a-z0-9]+", query.casefold()))
    if not terms:
        return []
    results = []
    for path in sorted((ROOT / "docs").glob("*.md")):
        content = path.read_text(encoding="utf-8")
        for block in re.split(r"\n(?=##? )", content):
            tokens = re.findall(r"[a-z0-9]+", block.casefold())
            counts = Counter(tokens)
            score = sum(1 + math.log(counts[token]) for token in terms if counts[token])
            if score:
                heading = next((line.lstrip("# ").strip() for line in block.splitlines() if line.startswith("#")), path.stem)
                snippet = " ".join(line.strip() for line in block.splitlines() if line.strip() and not line.startswith("#"))
                results.append({"title": heading, "source": path.name, "score": round(score, 2), "snippet": snippet[:320]})
    return sorted(results, key=lambda item: (-item["score"], item["title"]))[:8]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, payload: object, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        route = urlparse(self.path)
        query = parse_qs(route.query)
        assets = get_assets()
        if route.path == "/api/health":
            self.send_json({"status": "ok", "mode": "synthetic-demo", "assets": len(assets)})
        elif route.path == "/api/summary":
            counts = Counter(item["risk"] for item in assets)
            self.send_json({"asset_count": len(assets), "high": counts["High"], "watch": counts["Watch"], "normal": counts["Normal"], "last_updated": datetime.now(timezone.utc).isoformat()})
        elif route.path == "/api/assets":
            kind = (query.get("type", [""])[0]).casefold()
            risk = (query.get("risk", [""])[0]).casefold()
            result = [item for item in assets if (not kind or item["asset_type"].casefold() == kind) and (not risk or item["risk"].casefold() == risk)]
            self.send_json(result)
        elif route.path.startswith("/api/assets/") and route.path.endswith("/series"):
            asset_id = route.path.split("/")[3]
            asset = next((item for item in ASSETS if item["asset_id"] == asset_id), None)
            self.send_json({"asset_id": asset_id, **assess(asset)} if asset else {"error": "Asset not found"}, 200 if asset else 404)
        elif route.path == "/api/search":
            self.send_json(search_notes(query.get("q", [""])[0]))
        elif route.path == "/api/logs":
            text = (DATA / "sample-events.log").read_text(encoding="utf-8")
            term = query.get("q", [""])[0].casefold()
            lines = [line for line in text.splitlines() if not term or term in line.casefold()]
            self.send_json({"count": len(lines), "events": lines[:40]})
        elif route.path.startswith("/api/"):
            self.send_json({"error": "Unknown API route"}, 404)
        else:
            super().do_GET()

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.log_date_time_string()} {format % args}")


if __name__ == "__main__":
    print(f"OpenInfra Insight demo: http://{HOST}:{PORT}")
    print("Demo mode uses local synthetic records only. Press Ctrl+C to stop.")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
