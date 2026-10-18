# Method note

## Purpose

The dashboard sorts synthetic asset records so a reviewer can see how a small, inspectable rule-based triage view might work. A signal is a prompt for a human review, not a diagnosis or action recommendation.

## Inputs

Each sample asset includes one latest reading, a unit, a healthy reference minimum and maximum, a fictional criticality score from 1 to 5, a fictional service date, and fictional map coordinates. A deterministic generator supplies 14 daily values for the chart; it intentionally adds small variation and a few seeded examples.

## Rule summary

- Calculate the mean and population standard deviation of the first 13 generated values.
- Compare the latest supplied reading with the healthy reference band.
- Calculate a z-score relative to the 13-day baseline.
- Construct an illustrative score from reference-band deviation, larger baseline deviations, and sample criticality; cap it at 99.
- Mark **High** when a reading is outside its reference band or at least 2.4 baseline standard deviations from the mean.
- Mark **Watch** when the score is at least 52 or baseline deviation is at least 1.7 standard deviations.
- Otherwise mark **Normal**.

The API returns the rules that contributed to each asset's explanation. The thresholds and score weights are demo choices; no outcome labels or real failure data were used to fit them.

## What this does not establish

A range violation or unusual reading does not prove a fault. A synthetic baseline cannot represent seasonal changes, operating modes, sensor calibration, missingness, maintenance history, or different asset populations. There is no model training, failure prediction, or calibrated probability. This prototype must not be used to schedule maintenance, assess safety, or make decisions about a real asset.

Any applied system should be designed with qualified operators, documented data provenance, sensor-health checks, representative evaluation data, false-positive and false-negative review, drift monitoring, access control, and a clear human escalation path.
