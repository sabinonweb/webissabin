---
title: "Graph Convolution Network - Part I"
date: 2026-10-07
description: "an essay about graph-convolution network - Part I"
tags: ["essays"]
back: true
---

I was reading a paper on Unisign and a term popped up there which read `ST-GCN`. I found the paper on itand it was daunting. So, I thought, let's read a blog first and here I am writing my understanding from the paper and the blog. 

Before diving in, let's get familiar with a few terms.

## Convolution
There are a set of pixels, let's imagine and a window(kernel) which determines how much of the pixels is to be considered at a time. Each pixel has a weight. Let us a  suppose an window of pixels `[2, 5, 8]` with weights. `(2 × 0.5) + (5 × 1) + (8 × 0.5) = 1 + 5 + 4 = 10` is carried out and the strip is replaced with 10. This process is called Convolution. This whole process is repeated by sliding the window one pixel at a time.

Let's dive a little deep. This is taken from [Statquest's video](https://www.youtube.com/watch?v=HGwBXDKFk9I). 

![Letter O](/nsl/figure1.png)

If we are playing tic-tac-toe with a computer, for it to know whether we added a `O` or an `X`, it needs to process the image. Let's say, it uses a normal neural network. This takes 6*6 = 36 values as input values. 

![36 inputs](/nsl/figure2.png)

But there are a few problems:

#### Problem 1
Here, if we have 100*100 pixels image, there would be 10,000 weights per node in the hidden layer.

![hidden layer](/nsl/figure3.png)

#### Problem 2 
We don't know if the neural network will still recognize the letters when we shift the image by one pixel.

![hidden layer](/nsl/figure4.png)

#### Problem 3 
In a complicated image too, there might be pixels which are co-related with each other. For eg: white pixel is surrounded by other white pixels.

![hidden layer](/nsl/figure3.png)

Convolution Neural Networks are needed for exactly this purpose. 
***They reduce the number of input nodes.***
***They tolerate small shifts in the images.***
***They use the co-relation between adjacent pixels.***

## How does it work?

There is a kernel(filter) in each convolution. It is a smaller 3*3 square matrix. It starts with a random value before training.

![Before Training](/nsl/figure6.png)

But with backpropagation, we get something useful.

![After Training](/nsl/figure7.png)

Filter is then overlapped over the pixels and the overlapping pixels are multiplied. 

![Overlapped](/nsl/8.png)

A dot product of image pixels and filter is produced and added with bias. The obtained values is added to the feature map. Then, the pixels are moved by one, two or more pixels and their sum of dot product and bias is added to the feature map.

![Overlapped](/nsl/9.png)

The feature map is then put through the ReLu function. After that, it is max pooled i.e. out of 4, maxiumum value is choosen. 

![Overlapped](/nsl/10.png)
![Overlapped](/nsl/11.png)

The max pooled values are taken as input into the neural network. 
`weighted sum -> + bias -> + ReLu`
It gives us 1 for letter `O` and 0 for letter `X`.

![Overlapped](/nsl/12.png)

It works the same way for the letter `X`.

![Overlapped](/nsl/13.png)

For shifted pixels also, it gives higher probability of 1.23 to letter `X`.

#### Problem 1
Here, if we have 100*100 pixels image, there would be 10,000 weights per node in the hidden layer.

***It is solved using Feature Map and Max pooling. A small filter(3*3) is used for weight sharing across the entire image instead of 10,000 weights for 10,000 pixels.***

#### Problem 2 
We don't know if the neural network will still recognize the letters when we shift the image by one pixel.

![hidden layer](/nsl/14.png)

#### Problem 3 
In a complicated image too, there might be pixels which are co-related with each other. For eg: white pixel is surrounded by other white pixels.

***It is obtained using the filter.***


