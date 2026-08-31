---
title: "PlantGO"
date: 2026-05-12
description: "A decentralized NFT-based plant card game on the Solana blockchain."
github: "https://github.com/sabinonweb/frontier-plantgo"
stack: ["rust", "solana", "blockchain", "spl"]
project: true
---

PlantGO is a **gamified, decentralized plant card game on the Solana
blockchain**. Users mint, collect, and trade plant cards with different
rarities — and because the game lives on-chain, ownership and rarity rules
are enforced by the blockchain itself, not by a server we promise to behave.

Key contributions:

- Designed and implemented the **on-chain program in Rust** using the Solana
  Program Library (SPL) to manage NFT minting, global rarity limits, and
  ownership tracking.
- Created **pre-defined plant configurations and global plant counters** to
  enforce first-card restrictions and automatic rarity-based downgrades.
- Integrated **associated token account creation and NFT minting logic** for
  seamless, secure on-chain transactions.
- Implemented **admin-controlled functions** to pre-load plant rarity
  configurations, ensuring consistent game rules and access control.

The interesting engineering problem here is making game rules *trustless*:
when a card says "legendary, only 10 exist," that's not a database row —
it's a constraint the whole network enforces.

[View on GitHub](https://github.com/sabinonweb/frontier-plantgo)
