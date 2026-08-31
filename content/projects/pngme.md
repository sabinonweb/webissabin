---
title: "pngme"
date: 2023-11-13
description: "A CLI encoder that hides secret messages inside PNG files using the least significant bits."
github: "https://github.com/sabinonweb/pngme"
stack: ["rust", "cli", "steganography"]
project: true
---

pngme is a **command-line secret encoder** that hides messages inside PNG
files. It writes the secret into the **least significant bits** of the image
data — changes so small the image looks completely untouched to the human
eye.

The secret can also be **decoded, printed, and deleted** seamlessly, as long
as the user has the required access.

The magic it demonstrates:

- **Steganography over cryptography** — encryption says "there's a secret
  but you can't read it"; steganography says "there's no secret at all."
  Hiding in LSBs means file size, dimensions, and visual appearance all stay
  identical.
- **Byte-level comfort in Rust** — parsing PNG chunks, flipping single bits,
  and re-serializing without corrupting the format is exactly the kind of
  careful systems work Rust's type system makes pleasant.

A small, sharp tool: does one thing, impossible to use wrong.

[View on GitHub](https://github.com/sabinonweb/pngme)
