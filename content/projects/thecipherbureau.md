---
title: "TheCipherBureau"
date: 2026-07-05
description: "A browser playground for classical ciphers — encode, decode, break."
github: "https://github.com/sabinonweb/TheCipherBureau"
stack: ["javascript", "html", "cryptography"]
project: true
---

TheCipherBureau is a playground for **classical ciphers** — Caesar,
Vigenère, substitution, transposition, and friends. Type text, pick a cipher,
watch it encrypt before your eyes; paste ciphertext, break it back open.

It exists because cryptology is one of those subjects that only clicks when
you *play* with it. Reading about frequency analysis is boring. Watching a
Vigenère ciphertext crack apart as the key length reveals itself is a magic
trick you performed yourself.

The playground covers all three verbs:

- **Encode** — turn plaintext into ciphertext with any supported cipher.
- **Decode** — reverse it, with the key.
- **Break** — attack ciphertexts *without* the key: frequency counting,
  Kasiski examination, dictionary attacks.

Everything runs client-side in vanilla JavaScript — no server, no build
step, just the page. The code for each cipher is small enough to read in one
sitting, which is exactly the point: the site teaches, and so does its
source.

[View on GitHub](https://github.com/sabinonweb/TheCipherBureau)
