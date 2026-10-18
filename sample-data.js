(() => {
  const assets = [
    {asset_id:"PU-01",asset_name:"Canal pump 01",asset_type:"Pump",region:"North district",latitude:28.625,longitude:77.215,reading:72,unit:"°C",healthy_min:35,healthy_max:78,last_service:"2026-08-22",criticality:4},
    {asset_id:"PU-02",asset_name:"Canal pump 02",asset_type:"Pump",region:"North district",latitude:28.641,longitude:77.238,reading:69,unit:"°C",healthy_min:35,healthy_max:78,last_service:"2026-09-15",criticality:3},
    {asset_id:"PU-03",asset_name:"Canal pump 03",asset_type:"Pump",region:"East district",latitude:28.612,longitude:77.251,reading:88,unit:"°C",healthy_min:35,healthy_max:78,last_service:"2026-08-04",criticality:5},
    {asset_id:"PU-04",asset_name:"Canal pump 04",asset_type:"Pump",region:"East district",latitude:28.598,longitude:77.229,reading:61,unit:"°C",healthy_min:35,healthy_max:78,last_service:"2026-09-09",criticality:2},
    {asset_id:"WT-01",asset_name:"Reservoir valve 01",asset_type:"Valve",region:"Central district",latitude:28.632,longitude:77.198,reading:14,unit:"bar",healthy_min:8,healthy_max:16,last_service:"2026-08-29",criticality:4},
    {asset_id:"WT-02",asset_name:"Reservoir valve 02",asset_type:"Valve",region:"Central district",latitude:28.619,longitude:77.187,reading:18,unit:"bar",healthy_min:8,healthy_max:16,last_service:"2026-07-28",criticality:5},
    {asset_id:"WT-03",asset_name:"Reservoir valve 03",asset_type:"Valve",region:"West district",latitude:28.647,longitude:77.179,reading:12,unit:"bar",healthy_min:8,healthy_max:16,last_service:"2026-09-18",criticality:2},
    {asset_id:"WT-04",asset_name:"Reservoir valve 04",asset_type:"Valve",region:"West district",latitude:28.656,longitude:77.202,reading:9,unit:"bar",healthy_min:8,healthy_max:16,last_service:"2026-09-01",criticality:3},
    {asset_id:"FN-01",asset_name:"Air handling unit 01",asset_type:"Fan",region:"North district",latitude:28.608,longitude:77.206,reading:46,unit:"mm/s",healthy_min:5,healthy_max:48,last_service:"2026-08-13",criticality:4},
    {asset_id:"FN-02",asset_name:"Air handling unit 02",asset_type:"Fan",region:"East district",latitude:28.626,longitude:77.247,reading:57,unit:"mm/s",healthy_min:5,healthy_max:48,last_service:"2026-08-20",criticality:5},
    {asset_id:"FN-03",asset_name:"Air handling unit 03",asset_type:"Fan",region:"Central district",latitude:28.643,longitude:77.218,reading:34,unit:"mm/s",healthy_min:5,healthy_max:48,last_service:"2026-09-12",criticality:3},
    {asset_id:"FN-04",asset_name:"Air handling unit 04",asset_type:"Fan",region:"West district",latitude:28.604,longitude:77.191,reading:29,unit:"mm/s",healthy_min:5,healthy_max:48,last_service:"2026-09-25",criticality:1}
  ];
  const events = [
    "2026-10-18T06:12:11Z INFO PU-01 sample accepted reading=71.4 source=synthetic",
    "2026-10-18T06:12:19Z INFO PU-03 sample accepted reading=85.2 source=synthetic",
    "2026-10-18T06:13:03Z WARN PU-03 temperature above reference threshold value=88.0 expected_max=78.0",
    "2026-10-18T06:14:22Z INFO WT-01 valve pressure stable reading=14.1 source=synthetic",
    "2026-10-18T06:15:42Z WARN WT-02 pressure outside reference threshold value=18.0 expected_max=16.0",
    "2026-10-18T06:18:09Z INFO FN-02 sample accepted vibration=56.0 source=synthetic",
    "2026-10-18T06:20:01Z WARN FN-02 vibration above reference threshold value=57.0 expected_max=48.0",
    "2026-10-18T06:21:11Z INFO PU-02 sample accepted reading=68.7 source=synthetic",
    "2026-10-18T06:22:53Z INFO WT-03 sample accepted reading=12.4 source=synthetic",
    "2026-10-18T06:24:19Z INFO FN-04 sample accepted vibration=28.5 source=synthetic",
    "2026-10-18T06:26:50Z WARN PU-03 maintenance window approaching days=9",
    "2026-10-18T06:28:05Z INFO WT-04 sample accepted pressure=9.1 source=synthetic"
  ];
  const notes = [
    {title:"Vibration checks",text:"A vibration reading can vary with load, mounting, sensor placement, and time since service. Compare repeat measurements under similar conditions, confirm that the sensor is attached and reporting in the expected unit, and ask a qualified technician to review an unusual change. The synthetic demo uses a reference range only as an example."},
    {title:"Temperature trends",text:"Temperature is easier to interpret alongside ambient conditions, operating hours, load, and recent work. Check whether multiple readings move together before interpreting one high point. A single synthetic sample does not establish overheating or equipment failure."},
    {title:"Baseline and anomaly review",text:"A baseline summarizes earlier observations; it does not define every normal operating state. Confirm dates, units, missing values, and operating context. Document why an alert was reviewed and what evidence supported a human conclusion. Investigate drift before changing a threshold."},
    {title:"Data quality checklist",text:"Check asset IDs for duplicates, preserve the source timestamp and timezone, validate units and numeric ranges, and record missing values instead of silently filling them. Keep the original measurement beside any transformed value so the path from source to chart can be reviewed."},
    {title:"Event logs",text:"A structured event should have a timestamp, level, asset identifier, and short message. Preserve enough context to investigate without copying credentials, personal data, precise sensitive locations, or operationally restricted information into logs. Treat log text as untrusted input and render it as text."},
    {title:"GIS and schematic maps",text:"Coordinate displays should carry a source, coordinate system, accuracy, and intended use. A schematic can help explain a UI without implying geographic accuracy. Exclude private or safety-sensitive locations from a public demo. This repository's pins are fictional and not for navigation."},
    {title:"Data cleaning and summary",text:"Before calculating a summary, confirm the population, field meaning, unit, missingness, and duplicate policy. For weighted averages, show both the weighting rule and denominator. Small samples can hide edge cases; label sample size and uncertainty before a decision-maker interprets a chart."},
    {title:"Search and document retrieval",text:"Show the source title and enough surrounding text for a reviewer to verify a search result. A keyword match is not evidence that a passage answers the question. The demo search ranks matching terms in local markdown files and does not create an AI-generated answer."},
    {title:"Human review",text:"A score is a sorting aid. State its inputs, limits, and intended users. Keep a human accountable for interpretation, give that person a way to inspect underlying records, and do not turn an unvalidated signal into an automatic high-impact decision."}
  ];
  function seriesFor(asset) {
    const seed = [...asset.asset_id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const center = asset.reading, span = asset.healthy_max - asset.healthy_min, today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    return {series:Array.from({length:14}, (_, day) => {
      let value = center - (day / 13) * span * (seed % 4 === 0 ? .12 : -.02) + Math.sin((day + seed % 5) / 2.5) * span * .045;
      if (day === 12 && asset.criticality >= 4) value += span * .17;
      if (day === 13) value = center;
      const date = new Date(today); date.setUTCDate(today.getUTCDate() - (13 - day));
      return {date:date.toISOString().slice(0,10),value:Number(value.toFixed(2))};
    })};
  }
  function assess(asset) {
    const series = seriesFor(asset).series.map(point => point.value), baseline = series.slice(0, -1);
    const mean = baseline.reduce((sum, value) => sum + value, 0) / baseline.length;
    const spread = Math.sqrt(baseline.reduce((sum, value) => sum + (value - mean) ** 2, 0) / baseline.length) || 1;
    const z = (asset.reading - mean) / spread, low = asset.healthy_min, high = asset.healthy_max;
    const out = asset.reading < low || asset.reading > high, deviation = Math.max(0, (asset.reading - high) / Math.max(high-low,1), (low-asset.reading) / Math.max(high-low,1));
    const score = Math.min(99, Math.round(18 + deviation * 95 + Math.max(0, Math.abs(z)-1.5) * 11 + (asset.criticality-1) * 7));
    const level = out || Math.abs(z) >= 2.4 ? "High" : score >= 52 || Math.abs(z) >= 1.7 ? "Watch" : "Normal";
    const reasons = [];
    if (out) reasons.push(`reading ${asset.reading} ${asset.unit} is outside the reference band (${low}–${high})`);
    if (Math.abs(z) >= 1.7) reasons.push(`recent value is ${Math.abs(z).toFixed(1)} baseline standard deviations from its 13-day mean`);
    if (asset.criticality >= 4) reasons.push(`asset criticality is ${asset.criticality}/5`);
    if (!reasons.length) reasons.push("reading is inside its reference band and close to its recent baseline");
    return {risk:level,risk_score:score,z_score:Number(z.toFixed(2)),mean:Number(mean.toFixed(2)),explanation:reasons};
  }
  function searchNotes(query) {
    const terms = [...new Set(query.toLowerCase().match(/[a-z0-9]+/g) || [])];
    return notes.map(note => {
      const haystack = `${note.title} ${note.text}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 + Math.log((haystack.match(new RegExp(term,"g")) || []).length) : 0), 0);
      return {title:note.title,source:"field-notes.md",score,snippet:note.text.slice(0,320)};
    }).filter(note => note.score).sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title)).slice(0,8);
  }
  window.OpenInfraSample = {assets,events,notes,seriesFor,assess,searchNotes};
})();

