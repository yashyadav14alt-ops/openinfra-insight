# Local field notes

These short notes are fictional training text included to demonstrate local keyword search. They are not approved operating instructions for a real asset or site.

## Vibration checks

A vibration reading can vary with load, mounting, sensor placement, and time since service. Compare repeat measurements under similar conditions, confirm that the sensor is attached and reporting in the expected unit, and ask a qualified technician to review an unusual change. The synthetic demo uses a reference range only as an example.

## Temperature trends

Temperature is easier to interpret alongside ambient conditions, operating hours, load, and recent work. Check whether multiple readings move together before interpreting one high point. A single synthetic sample does not establish overheating or equipment failure.

## Baseline and anomaly review

A baseline summarizes earlier observations; it does not define every normal operating state. Confirm dates, units, missing values, and operating context. Document why an alert was reviewed and what evidence supported a human conclusion. Investigate drift before changing a threshold.

## Data quality checklist

Check asset IDs for duplicates, preserve the source timestamp and timezone, validate units and numeric ranges, and record missing values instead of silently filling them. Keep the original measurement beside any transformed value so the path from source to chart can be reviewed.

## Event logs

A structured event should have a timestamp, level, asset identifier, and short message. Preserve enough context to investigate without copying credentials, personal data, precise sensitive locations, or operationally restricted information into logs. Treat log text as untrusted input and render it as text.

## GIS and schematic maps

Coordinate displays should carry a source, coordinate system, accuracy, and intended use. A schematic can help explain a UI without implying geographic accuracy. Exclude private or safety-sensitive locations from a public demo. This repository's pins are fictional and not for navigation.

## Data cleaning and summary

Before calculating a summary, confirm the population, field meaning, unit, missingness, and duplicate policy. For weighted averages, show both the weighting rule and denominator. Small samples can hide edge cases; label sample size and uncertainty before a decision-maker interprets a chart.

## Search and document retrieval

Show the source title and enough surrounding text for a reviewer to verify a search result. A keyword match is not evidence that a passage answers the question. The demo search ranks matching terms in local markdown files and does not create an AI-generated answer.

## Human review

A score is a sorting aid. State its inputs, limits, and intended users. Keep a human accountable for interpretation, give that person a way to inspect underlying records, and do not turn an unvalidated signal into an automatic high-impact decision.
