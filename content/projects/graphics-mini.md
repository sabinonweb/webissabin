---
title: "Operations Research Visualizer"
date: 2026-01-16
description: "Animated MP4 visualizations of Operations Research problems — LP, Transportation, and TSP — rendered with Manim behind a FastAPI API."
github: "https://github.com/sabinonweb/graphics-mini"
stack: ["python", "fastapi", "manim"]
project: true
---

The Operations Research Visualizer turns textbook math into **animated,
high-quality video** — 1080p at 60fps MP4s that walk through classic OR
problems step by step, generated on demand.

It supports three families of problems:

- **Linear Programming** — solved with the graphical corner-point method,
  watching the feasible region and the objective line move together.
- **Transportation** — initial allocations via Vogel's Approximation
  Method, penalty cell by penalty cell.
- **Travelling Salesman** — exact brute force for up to 10 cities,
  nearest-neighbor heuristic beyond that.

Everything runs through a `POST /generate` API (FastAPI) where you submit
your own constraints, costs, or distances; Manim renders the animation and
hands back a video. The pipeline needs Python 3.8+, FFmpeg, and LaTeX —
because the axis labels are real math, not screenshots.

[View on GitHub](https://github.com/sabinonweb/graphics-mini)
