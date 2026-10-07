---
title: "Graph Convolution Network"
date: 2026-10-20
description: "an essay about graph-convolution network"
tags: ["essays"]
back: true
---

I was reading a paper on Unisign and a term popped up there which read `ST-GCN`. I found the paper on itand it was daunting. So, I thought, let's read a blog first and here I am writing my understanding from the paper and the blog. 

Before diving in, let's get familiar with a few terms.

### Convolution
There are a set of pixels, let's imagine and a window(kernel) which determines how much of the pixels is to be considered at a time. Each pixel has a weight. Let us a  suppose an window of pixels `[2, 5, 8]` with weights. `(2 × 0.5) + (5 × 1) + (8 × 0.5) = 1 + 5 + 4 = 10` is carried out and the strip is replaced with 10. This process is called Convolution. This whole process is repeated by sliding the window one pixel at a time.

Let's dive a little deep. This is taken from [Statquest's video](https://www.youtube.com/watch?v=HGwBXDKFk9I). 
/var/folders/mk/4z3602yd0wvcym92s19y572w0000gn/T/TemporaryItems/NSIRD_screencaptureui_MXqTS5/Screenshot 2026-10-07 at 17.14.50.png
