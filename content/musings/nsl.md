---
title: "NSL"
date: 2026-10-14
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

##### Preliminaries

There are 133 keypoints for the whole body but we specifically utilize 69 keypoints only: 21 for each hand, 9 for the body and 18 for the face. Each group of keypoints `i` has an encoder, which is composed of three-layer spatial GCN(For a single frame, it travels 3 hops across hand per say so that fingertips have information about joints several hops away). Learn more about it at [GCN-PartI](https://sabinonweb.tech/musings/gcn-parti/) and [GCN-PartII](https://sabinonweb.tech/musings/gcn-partii/).
It produces an output $\mathcal{F}_{p}^r \in \mathbb{R}^{T \times N_i \times w \times C}$ where,
                        T = number of frames 
                        $\mathcal{N_i}$ = Number of keypoints in group `i`
                        C = How many features represent keypoints after encoding?
                        i ∈ {lh, rh, b, f }

In the second part, idea of decoupling visual cues is used. Videos are cropped using keypoint coordinates and resized to 112 * 112 pixels which are processed by Vision Encoder. It gives out results $\mathcal{F}_{lh}^r \in \mathbb{R}^{T \times h \times w \times C}$ and $\mathcal{F}_{rh}^r \in \mathbb{R}^{T \times h \times w \times C}$. Then the two ouputs, $\mathcal{F}_i^p$ and $\mathcal{F}_i^r$ are fused to form $\tilde{\mathcal{F}}_i^p$. Fusion is done in order to ensure the data lost duirng posing is recovered.  

### Zoom out
A sequence of keypoints 133 keypoints for each frame arrive, then it is divided into 4 body parts(face, body, lh, rh) 21 points for hands, 9 for body and 18 for face by taking 69 points and discarding the other 64. It is then processed by 3 layer spatial GCN which takes each group of points and for each joint point aggregates it with the first neighbour thne the resulting to second then to third which gives the result Fpi belongs to R^(T×Ni×C) which means a tensor of 3 dimension consisting of real numbers, Fpi = pose features for gorup i T = number of frames, Ni = number of points in froup i and C = channel or the dimension of points features or the number of points used to represent a feature.

## How it works?

There are two parts of it. Let's look at one part of it first.

### Pose Encoding
![Unisign](/nsl/uni1.png)

There are 133 keypoints in pose data but only 69 are taken. There are 69 sub-pose groups: 21 for each hand, 18 for the face and 9 for the body. These sub-groups are fed into each of their own PoseEncoder which is composed of three-layer spatial GCN. It gives out an ouput: $\mathcal{F}_{i}^p \in \mathbb{R}^{T \times N_i \times w \times C}$

where,

$$
\begin{aligned}
T   &= \text{number of frames} \\
N_i &= \text{number of keypoints in frame } i \\
C   &= \text{number of values used to represent each keypoint}
\end{aligned}
$$

## Vision Encoding

![Unisign](/nsl/uni2.png)

The pose encoder misses many important encodings. It occluded the hand data. So, vision encoder is used to improve on that data. 

### Few questions before moving on

#### Why only take lh and rh in consideration?
- Hand data carries the most critical information.
- Fingers, curls, twists are occluded the most.

#### PoseEncoder has $N_i$ only but Vision Encoder has $w, h$?
- In pose encoder, data is 2D = $w, h$
- Pose data is sparse(only 21 for hand) list of named(wrist, tip) points.

#### There is a mention of resizing back to 112 * 112, why do we resize?

##### Batch 
- Group of several tasks executing in parallel. 

- GPU is designed to perform these calculations in parallel, rather than one at a time.

##### Condition for Batching 
The tensors need to be of same side. 

##### Problem with pictures
Due to camera angle and distance, the cropped pictures have different sizes and resizing is necessary to make batches

### I'm backkkkkkkkk
The short term temporal encoder is used in Vision Encoding which is constructed employing ST-GCN. It crops the hand data using pose coordinates. It then resizes the image to 112 * 112 size grids. It performs CNN to convolve the pixels. It then produces $\mathcal{F}_{lh}^r \in \mathbb{R}^{T \times h \times w \times C}$ and $\mathcal{F}_{rh}^r \in \mathbb{R}^{T \times h \times w \times C}$. The two features $\mathcal{F}_{i}^r$ and $\mathcal{F}_{i}^p$ are fused in order to receive $\tilde{\mathcal{F}}_i^p$. The temporal encoder is fed with ({$\tilde{\mathcal{F}}_i^p$} or $\mathcal{F}_i^p$). 

#### $\mathcal{F}_i^p$ as input
![uni](/nsl/uni3.png)

#### {$\tilde{\mathcal{F}}_i^p$} as input
![uni](/nsl/uni4.png)

The temporal encoder outputs are aggregated intra-group via mean pooling layer and concatenated across all groups(face, body, hands) to get final $\mathcal{F}_{sign} \in \mathbb{R}^{T \times 4C}$ which is then fed as input into Pre-trained LLM. 
