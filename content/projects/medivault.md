---
title: "MediVault"
date: 2024-05-05
description: "A medicine management system with reminders, inventory tracking and email alerts — built at DeerHack."
github: "https://github.com/sabinonweb"
stack: ["rust", "actix", "react", "node-mcu"]
project: true
---

MediVault is a **medicine management system** that helps users keep track of
their medications with reminders and alerts for dosage schedules. It also
monitors medication inventory and sends email notifications when supplies
run low, so refills happen on time. Built at **DeerHack (May 2024)**.

Key contributions:

- Implemented **authorization and the backend server** for the nodeMCU
  integration using Actix — the physical device talks to the same API as the
  web app.
- Developed the interactive **frontend in ReactJS**.
- Built the **email notification service** for reminders and low-supply
  alerts.

The hardware twist is what made it fun: a cheap nodeMCU board reporting
dispenser state to a Rust backend means the boundary between "embedded
project" and "web app" disappears — it's all just messages.

[View on GitHub](https://github.com/sabinonweb)
