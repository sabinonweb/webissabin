---
title: "SEAS"
date: 2025-04-21
description: "A snake recognition system — a machine-learning model that identifies snakes, with a server and web frontend."
github: "https://github.com/sabinonweb/SEAS"
stack: ["python", "machine-learning"]
project: true
---

SEAS is a **snake recognition system** built in three parts: a
`snake_recognition` module that trains and runs the identification model,
a server that exposes it, and a frontend where users submit a photo or
sighting and get back what the snake likely is.

In a country like Nepal, where snakebites are a real medical emergency and
most people can't tell a cobra from a rat snake, a tool that helps identify
a snake quickly matters — identification drives the right first aid and
the right antivenom.

The interesting engineering lives in the pipeline: taking an uncontrolled
photo from the field, getting it through a classifier, and returning a
confident answer through an API that the frontend can rely on.

[View on GitHub](https://github.com/sabinonweb/SEAS)
