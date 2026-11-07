---
title: "Encoder"
date: 2026-11-03
description: "an essay about encoder"
tags: ["essays"]
back: true
---

# Background
***Goal***: a computer takes a list of numbers and it tells us what sign is it
***Problem***: it might produce different numbers for same sign. 

The three things that cause this difference might be:
- Position: B might be further right to A leading to B's `x` being larger.
- Speed: B might be signing faster causing it to complete the same sign in lesser frames than A who is signing slower.
- Distance: B who is farther away from the camera might have lesser pixel movement than A who is closer.

### Terminology Alert
***Nuisance Variation***
This is difference in raw numbers that have nothing to do with what we are trying to achive.

# Let's design a Solution 
- Position: Subtract a body point from another. Moving sideways adds 400 pixels to every point in body 
    A: wrist -> x=100, shoulder -> x=80
    B: wrist -> x=500, shoulder -> x=480
    ***wrist is 20 pixels away. It cancels the 400 pixels.***
- Distance: Divide a body length. 
    A: hand -> 100, shoulder width -> 50
    B: wrist -> 40, shoulder width -> 20
    ***distance are same when we divide them*** 
- Speed: 
    A: 300 350 200
    B: 300 280 260 240 220 200 -> 300 250 200

# What's the point?
See a child doesn't learn by memorizing that a dog has 4 legs, 2 ears and so forth. S/he guesses, their parents correct them and that's how they learn. In the same way, the encoder doesn't produce perfect 768 numbers in the first go. It considers positions, speed, turns even. But with training it learns to ignore those factors and only focus on the movement i.e. learns to remove the `Nuisance Variation`. It then clusters the similar signs.

# Why can't we just compare raw numbers?
- A = [100, 300, 100, 250, 100, 200]
- B = [500, 320, 500, 300, 500, 280]
They are same signs but they are going to land on diferent clusters.

# How do nearest-neighbour and the classifier head turn the encoder's 768 numbers into a word
Nearest-neighbour has a pile of human labeled reference clips which are fed into the encoder and embeddings are kept. When new clips arrive, they are also fed into the encoder and it gives embeddings of 768 numbers which are compared with references. Whichever pile is matched, it takes the label from that nearest-neighbour. If new labels are to be added, then human labeled clips are fed into the encoder and kept in the pile for reference. If by any chance one clip is wrongly labeled, then it might give new clips that land near it the wrong label.

Head on the other hand, has a line that separates the two-clusters and the embeddings are compared based on which side of the line they appear on. To add new labels it has to be retrained but if one word is wrongly misplaced it doesn't affect much because it depends on the line not on neighbour
