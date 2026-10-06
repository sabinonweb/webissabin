---
title: "NSL"
date: 2026-09-25
description: "a poem about leaving your old self behind and walking into the dark alone"
tags: ["poems"]
back: true
---


## What are we trying to achieve?
A model which takes any sequence of fingerspellings, and it should give as output, the continuous signing with pauses and natural motion of hands which will be used as a synthetic dataset for the project.

## What do we need for that matter?
- What each letter looks like?
- How do hands move between letters?
- Where does sign for a letter start and end?

## 2026-09-25 — nsl / aligner boundaries
**Broke**: Aligner was supposed to beat a naive baseline model which just takes equal intervals in determining the start and end of a sign but it did worse.

**First Guess**: I didn't have idea about it. I just thought, "It is guessing it wrong".

**Real Cause**: The real cause was the fact it assumed, that the transistion will have motion and the sign will be static but that isn't always the case. In continuous signing, the sign is held for way short of a time and the aligner mistook the fast changes for transistion.

**Boundary**: In isolated letters the signs are static but for continuous signing the signs move pretty fast.

## 2026-10-06 - Unisign Paper
### Methodology

#### Unified Pre-training and finetuning

#####***Preliminaries****
There are 133 keypoints for the whole body but we specifically utilize 69 keypoints only: 21 for each hand, 9 for the body and 18 for the face. Each group of keypoints `i` has an encoder, which is composed of three-layer spatial GCN(For a single frame, it travels 3 hops across hand per say so that fingertips have information about joints several hops away.)
It produces an output `Fp_i ∈ R^(T ×Ni×C)` where,
                        T = number of frames 
                        Ni = Number of keypoints in group `i`
                        C = How many features represent keypoints after encoding?
                        i ∈ {lh, rh, b, f }
