---
title: "Week #6 of Curiosity"
date: 2026-10-19
description: "Andy Dufresne literally swam through three hundred yards of piss and shit for the opportunity to have freedom. Are you sure you're not wasting yours?"
tags: ["essays"]
curious: true
---

# Hugo and mathematical Calculation
I had to render mathematical formulas in my musings and I was using KaTex. I had mapped `$` to inline equations and `$$$` to block equations.
I then used `$$$` for the block but it was printing inline with `$` at the end. Turns out hugo reads it from left to right. I had mapped `$` first so `$$$` was matching in the first go:
- `$$$` -> First 2 `$` match and `$` opens the inline equation. It ends with `$`.
- The last `$` has nothing to end with, so it gets printed.


# Quote of the week 
> Follow your heart is a marketing slogan, not life advice. Your heart wants tacos at midnight and drunk texts your ex. Try following your mind for once. 
