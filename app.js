const state = { assets: [], events: [], toastTimer: null };
const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

async function api(path) {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}
function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function riskClass(value) { return value.toLowerCase(); }
function renderSummary(summary) {
  $("#assetCount").textContent = summary.asset_count;
  $("#highCount").innerHTML = `${summary.high}<small> assets</small>`;
  $("#watchCount").innerHTML = `${summary.watch}<small> assets</small>`;
  $("#normalCount").innerHTML = `${summary.normal}<small> assets</small>`;
}
function renderTable() {
  const term = $("#tableSearch").value.trim().toLowerCase();
  const risk = $("#riskFilter").value.toLowerCase();
  const filtered = state.assets.filter((asset) => {
    const matches = `${asset.asset_id} ${asset.asset_name} ${asset.asset_type} ${asset.region}`.toLowerCase().includes(term);
    return matches && (!risk || asset.risk.toLowerCase() === risk);
  }).sort((a, b) => b.risk_score - a.risk_score || a.asset_id.localeCompare(b.asset_id));
  $("#assetRows").innerHTML = filtered.length ? filtered.map((asset) => `
    <tr data-asset="${escapeHtml(asset.asset_id)}" tabindex="0" aria-label="Open ${escapeHtml(asset.asset_name)} details">
      <td><span class="asset-name">${escapeHtml(asset.asset_name)}</span><span class="asset-id">${escapeHtml(asset.asset_id)}</span></td>
      <td><span class="type-chip">${escapeHtml(asset.asset_type)}</span></td><td>${escapeHtml(asset.region)}</td>
      <td><span class="reading">${Number(asset.reading).toFixed(1)}</span> <span class="unit">${escapeHtml(asset.unit)}</span></td>
      <td><span class="status-chip status-${riskClass(asset.risk)}"><i></i>${escapeHtml(asset.risk)}</span></td>
      <td class="score-cell">${asset.risk_score}<span class="unit"> / 100</span></td><td class="row-arrow">›</td>
    </tr>`).join("") : '<tr><td colspan="7" class="no-results">No assets match those filters.</td></tr>';
  $("#tableCount").textContent = `Showing ${filtered.length} of ${state.assets.length} assets`;
  $("#assetRows").querySelectorAll("tr[data-asset]").forEach((row) => {
    row.addEventListener("click", () => showAsset(row.dataset.asset));
    row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); showAsset(row.dataset.asset); } });
  });
}
function renderPins() {
  const latitudes = state.assets.map((asset) => asset.latitude), longitudes = state.assets.map((asset) => asset.longitude);
  const latMin = Math.min(...latitudes), latMax = Math.max(...latitudes), lonMin = Math.min(...longitudes), lonMax = Math.max(...longitudes);
  $("#mapPins").innerHTML = state.assets.map((asset) => {
    const x = 11 + ((asset.longitude - lonMin) / (lonMax - lonMin || 1)) * 77;
    const y = 13 + (1 - ((asset.latitude - latMin) / (latMax - latMin || 1))) * 71;
    return `<button class="map-pin ${riskClass(asset.risk)}" style="left:${x}%;top:${y}%" title="${escapeHtml(asset.asset_name)} · ${escapeHtml(asset.risk)} · ${asset.risk_score}/100" aria-label="Open ${escapeHtml(asset.asset_name)} details" data-asset="${escapeHtml(asset.asset_id)}"></button>`;
  }).join("");
  $("#mapPins").querySelectorAll("button").forEach((pin) => pin.addEventListener("click", () => showAsset(pin.dataset.asset)));
}
function renderEvents(events) {
  state.events = events;
  $("#eventCount").textContent = `${events.length} events`;
  const term = $("#eventSearch").value.trim().toLowerCase();
  const visible = events.filter((line) => line.toLowerCase().includes(term)).slice(-8).reverse();
  $("#eventList").innerHTML = visible.length ? visible.map((line) => {
    const parts = line.match(/^(\S+)\s+(INFO|WARN)\s+(\S+)\s+(.*)$/);
    if (!parts) return `<div class="event-item"><span class="event-time">—</span><span class="event-message">${escapeHtml(line)}</span></div>`;
    const [, timestamp, level, asset, description] = parts;
    const time = timestamp.slice(11, 16);
    return `<div class="event-item"><span class="event-time">${escapeHtml(time)} UTC</span><span class="event-message"><span class="event-level ${level.toLowerCase()}">${level}</span><b>${escapeHtml(asset)}</b> ${escapeHtml(description)}</span></div>`;
  }).join("") : '<div class="no-results">No matching events.</div>';
}
function drawTrend(data, asset) {
  const series = data.series;
  const values = series.map((point) => point.value);
  const span = asset.healthy_max - asset.healthy_min;
  const min = Math.min(asset.healthy_min - span * .12, ...values) - span * .08;
  const max = Math.max(asset.healthy_max + span * .12, ...values) + span * .08;
  const x = (index) => 8 + index * (704 / Math.max(1, series.length - 1));
  const y = (value) => 196 - ((value - min) / (max - min || 1)) * 184;
  const path = values.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(" ");
  $("#trendPath").setAttribute("d", path);
  const bandTop = y(asset.healthy_max), bandBottom = y(asset.healthy_min);
  $("#rangeBand").setAttribute("d", `M0,${bandTop} L720,${bandTop} L720,${bandBottom} L0,${bandBottom} Z`);
  $("#trendPoints").innerHTML = series.map((point, index) => `<circle class="trend-point" cx="${x(index).toFixed(1)}" cy="${y(point.value).toFixed(1)}" r="${index === series.length - 1 ? 4 : 2.3}"><title>${escapeHtml(point.date)}: ${point.value} ${escapeHtml(asset.unit)}</title></circle>`).join("");
  const yMarks = [max, max * .75 + min * .25, (max + min) / 2, max * .25 + min * .75, min];
  $("#yLabels").innerHTML = yMarks.map((mark) => `<span>${mark.toFixed(0)}</span>`).join("");
  const dateAt = (index) => series[Math.round(index * (series.length - 1) / 4)].date;
  $("#xLabels").innerHTML = [0, 1, 2, 3, 4].map((index) => `<span>${new Date(`${dateAt(index)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })}</span>`).join("");
  $("#trendUnit").textContent = asset.unit;
  const summary = data.reasons.join("; ");
  $("#trendInsight").textContent = `${asset.asset_id}: ${data.level.toLowerCase()} signal · ${summary}.`;
}
async function selectedTrend() {
  const asset = state.assets.find((item) => item.asset_id === $("#assetSelect").value) || state.assets[0];
  if (!asset) return;
  try {
    const data = await api(`/api/assets/${encodeURIComponent(asset.asset_id)}/series`);
    drawTrend(data, asset);
  } catch {
    drawTrend({ ...window.OpenInfraSample.seriesFor(asset), level: asset.risk, reasons: asset.explanation }, asset);
  }
}
async function showAsset(assetId) {
  const asset = state.assets.find((item) => item.asset_id === assetId);
  if (!asset) return;
  $("#assetSelect").value = assetId;
  selectedTrend();
  const dialog = $("#detailDialog");
  $("#dialogContent").innerHTML = `
    <div class="section-kicker">ASSET PROFILE · ${escapeHtml(asset.asset_id)}</div><h2>${escapeHtml(asset.asset_name)}</h2>
    <p>${escapeHtml(asset.asset_type)} in ${escapeHtml(asset.region)} · Synthetic sample record</p>
    <div class="dialog-stat-grid"><div class="dialog-stat"><small>LATEST READING</small><b>${Number(asset.reading).toFixed(1)} ${escapeHtml(asset.unit)}</b></div><div class="dialog-stat"><small>REFERENCE BAND</small><b>${asset.healthy_min}–${asset.healthy_max} ${escapeHtml(asset.unit)}</b></div><div class="dialog-stat"><small>RISK SIGNAL</small><b>${escapeHtml(asset.risk)} · ${asset.risk_score}/100</b></div><div class="dialog-stat"><small>LAST SERVICE</small><b>${escapeHtml(asset.last_service)}</b></div></div>
    <div class="dialog-explanation"><b>Why it received this signal</b><br>${asset.explanation.map(escapeHtml).join(". ")}.</div>
    <p>Criticality ${asset.criticality}/5 · ${asset.latitude.toFixed(3)}, ${asset.longitude.toFixed(3)} (synthetic coordinates)</p>`;
  dialog.showModal();
}
async function searchNotes(query) {
  if (!query.trim()) { $("#notesResults").innerHTML = '<span class="empty-hint">Type a topic to find a note.</span>'; return; }
  let results;
  try { results = await api(`/api/search?q=${encodeURIComponent(query)}`); }
  catch { results = window.OpenInfraSample.searchNotes(query); }
  $("#notesResults").innerHTML = results.length ? results.map((item) => `<div class="note-result"><b>${escapeHtml(item.title)} <span class="unit">· ${escapeHtml(item.source)}</span></b><p>${escapeHtml(item.snippet)}</p></div>`).join("") : '<span class="empty-hint">No matching note in this demo playbook.</span>';
}
async function refresh() {
  try {
    const [summary, assets, events] = await Promise.all([api("/api/summary"), api("/api/assets"), api("/api/logs")]);
    state.assets = assets;
    renderSummary(summary); renderTable(); renderPins(); renderEvents(events.events);
    $("#assetSelect").innerHTML = assets.map((asset) => `<option value="${escapeHtml(asset.asset_id)}">${escapeHtml(asset.asset_id)} · ${escapeHtml(asset.asset_name)}</option>`).join("");
    await selectedTrend();
    $(".data-status").innerHTML = "<i></i> LOCAL API ONLINE";
  } catch (error) {
    const sample = window.OpenInfraSample;
    state.assets = sample.assets.map((asset) => ({ ...asset, ...sample.assess(asset) }));
    renderSummary({ asset_count: state.assets.length, high: state.assets.filter((asset) => asset.risk === "High").length, watch: state.assets.filter((asset) => asset.risk === "Watch").length, normal: state.assets.filter((asset) => asset.risk === "Normal").length });
    renderTable(); renderPins(); renderEvents(sample.events);
    $("#assetSelect").innerHTML = state.assets.map((asset) => `<option value="${escapeHtml(asset.asset_id)}">${escapeHtml(asset.asset_id)} · ${escapeHtml(asset.asset_name)}</option>`).join("");
    await selectedTrend();
    $(".data-status").innerHTML = "<i></i> STATIC DEMO MODE";
  }
}
$("#tableSearch").addEventListener("input", renderTable);
$("#riskFilter").addEventListener("change", renderTable);
$("#clearFilters").addEventListener("click", () => { $("#tableSearch").value = ""; $("#riskFilter").value = ""; renderTable(); });
$("#assetSelect").addEventListener("change", selectedTrend);
$("#refreshButton").addEventListener("click", () => { refresh(); notify("Synthetic sample refreshed."); });
$("#eventSearch").addEventListener("input", () => renderEvents(state.events));
$("#notesForm").addEventListener("submit", (event) => { event.preventDefault(); searchNotes($("#notesQuery").value).catch((error) => notify(error.message)); });
$("#methodButton").addEventListener("click", () => $("#methodDialog").showModal());
$("#explainButton").addEventListener("click", () => $("#methodDialog").showModal());
$("#exportButton").addEventListener("click", () => {
  const payload = { exported_at: new Date().toISOString(), data_mode: "synthetic-demo", assets: state.assets };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "openinfra-insight-snapshot.json"; link.click(); URL.revokeObjectURL(link.href);
  notify("Snapshot downloaded as JSON.");
});
refresh();
