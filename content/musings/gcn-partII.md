---
title: "Graph Convolution Network - Part I"
date: 2026-10-10
description: "an essay about graph-convolution network - Part II"
tags: ["essays"]
back: true
---

# Embedding/Latent Space
It is a space where a list of embeddings live. The sentences with similar semantics end up closer to each other while the sentences with different semantics end up a little farther.
One cannot make sense of the meaning just by looking at the embeddings as it is just a sequence of numbers. But when it is compared with other known patterns, it starts making sense.

# Main Idea
Given a specific node, it aggregates the features of neighbouring nodes with it's own and embeds them in a newer latent space. The new embeddings are the node's features now. 
If a node wants to aggregate the features of nodes farther from it, the same process is repeated. Each repetition gives convolution of node one step farther.

# ST-GCN
The aforementioned convolution is spatial. If we introduce time to it, we can call it temporal. Spatial aggregates the features of multiple neighbouring nodes across the graph for a single instance of time but temporal aggregates the frames of the same node across different time T.

# Architecture - One piece at a time

# Input
![input](/nsl/input.png)

Input has 5 components:
N = Batch size(How many clips are processed at once?)
C = How many points are used to represent a node?(CoordinateX/CoordinateY/Confidence_Score) - Channel: General ML term for `how many points describe one node?`
T = Number of frames
V = Number of graph nodes
M = Number of skeletons in the frame(ST-GCN was designed to accomodate multiple people signing in the same frame)

## Permute, View
![pv](/nsl/pv.png)

***Permute***: Permute means reodering or relabeling the axes.
***View***: View means reshaping the tensor shape often by merging.

# BatchNorm1d
![bn](/nsl/bn.png)

Permute changes the input into: 
$[(N, M, V, C, T)]$

View changes the permuted input into:
$[(N*M, V*C, T)]$

## Why do we need BatchNorm1d?
Real joints coordinates vary along a very large range and are quite messy. If they are fed directly into the model, it has to spend time first to figure out those scales rather than actual ranges. 

## Actual Operations
***Goal***: Mean = 0, Spread = 1 
- Find the mean and subract mean from every element in the list
- Find the spread of the newly found list and divide each element by the spread
- The new obtained list is centered at 0 with mean = 0 and spread = 1.

BatchNorm1d takes the input in the format `(batch, channels, length)`, permute and view help convert 5D tensor into the format needed.

# ST-GCN Block

![st-gcn](/nsl/st.png)

There are two new terms that we need to get familiar with in the first place.
***Spatial Ker***: It indicates the number of relationships that exist between the nodes.
***Temporal Ker***: It indicates the number of frames that blend together.

## Zoom out
> Take a sequence of pose data of the body and figure out the actual sign.

