---
title: "Decentralized AI (DAI)"
date: 2025-12-25
description: "A P2P blockchain AI platform in Rust — distributed AI tasks with on-chain data integrity."
github: "https://github.com/KUHackFest-DAi/daikodai"
stack: ["rust", "tokio", "blockchain", "p2p"]
project: true
---

DAI is a **decentralized AI platform built in Rust**, designed to run AI
tasks over a peer-to-peer network with **blockchain-backed data integrity**.
It enables secure, distributed computation and collaborative AI processing
across multiple nodes — with no central server in the middle.

Key contributions:

- Designed and implemented a **peer-to-peer protocol in Rust** for secure
  node-to-node communication and distributed AI task coordination.
- Developed a **blockchain-based system** for recording task submissions,
  results, and consensus verification across nodes.
- Implemented **message handling for blocks, transactions, peers, and
  pings**, ensuring real-time network updates and synchronization.
- Integrated **asynchronous networking and connection pooling** to manage
  multiple node connections simultaneously using Tokio.

The core idea: when compute is spread across untrusted peers, the
blockchain becomes the shared source of truth — who submitted what, which
results were verified, and what the network agreed on. It's the same
problem consensus systems have always solved, applied to AI workloads.

[View on GitHub](https://github.com/KUHackFest-DAi/daikodai)
