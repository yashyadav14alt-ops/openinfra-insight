# Data dictionary

All rows in `data/assets.csv` are fictional, created to exercise the dashboard. The coordinates are synthetic and only used to position points on a schematic.

| Field | Type | Meaning |
|---|---|---|
| `asset_id` | string | Fictional, stable identifier for this sample record |
| `asset_name` | string | Fictional display name |
| `asset_type` | string | Sample asset category |
| `region` | string | Fictional district label |
| `latitude`, `longitude` | decimal degrees | Synthetic coordinates for a schematic only |
| `reading` | number | Latest sample value |
| `unit` | string | Display unit for the reading and reference band |
| `healthy_min`, `healthy_max` | number | Illustrative reference band used in the demo rules |
| `last_service` | ISO date | Fictional service date |
| `criticality` | integer 1–5 | Sample ranking input; not a real consequence assessment |

`data/sample-events.log` contains twelve fictional lines in `timestamp level asset_id message` format. The lines are examples for local filtering; they are not collected from real devices or systems.
