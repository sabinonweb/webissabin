---
title: "LaTeX Maths"
date: 2026-10-14
url: "/latex_maths/"
build:
  list: never
sitemap:
  disable: true
---

Inline: `$...$` · Block: `$$...$$`

| What | Write | Renders |
|---|---|---|
| subscript | `N_i`, `x_{ij}` | $N_i$, $x_{ij}$ |
| superscript | `x^2`, `e^{-x}` | $x^2$, $e^{-x}$ |
| fraction | `\frac{a}{b}` | $\frac{a}{b}$ |
| root | `\sqrt{x}` | $\sqrt{x}$ |
| sets | `\mathbb{R}`, `\mathbb{N}` | $\mathbb{R}$, $\mathbb{N}$ |
| calligraphic | `\mathcal{F}`, `\mathcal{L}` | $\mathcal{F}$, $\mathcal{L}$ |
| bold | `\mathbf{x}`, `\mathbf{W}` | $\mathbf{x}$, $\mathbf{W}$ |
| greek | `\alpha \beta \theta \sigma \lambda` | $\alpha \beta \theta \sigma \lambda$ |
| operators | `\times \cdot \in \le \ge \ne \approx` | $\times \cdot \in \le \ge \ne \approx$ |
| sum / product | `\sum_{i=1}^{N}`, `\prod` | $\sum_{i=1}^{N}$, $\prod$ |
| text in math | `\text{loss}` | $\text{loss}$ |
| functions | `\log \exp \max \arg\max` | $\log \exp \max \arg\max$ |
| hat / bar | `\hat{y}`, `\bar{x}` | $\hat{y}$, $\bar{x}$ |
| sized brackets | `\left( \frac{a}{b} \right)` | $\left( \frac{a}{b} \right)$ |

Multi-line aligned (`&` = align point, `\\` = newline):

```latex
\begin{aligned}
a &= b + c \\
d &= e
\end{aligned}
```

$$
\begin{aligned}
a &= b + c \\
d &= e
\end{aligned}
$$
