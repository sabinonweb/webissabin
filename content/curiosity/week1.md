---
title: "Week #1 of Curiosity"
date: 2026-08-31
description: "A week of understanding how sound becomes numbers, text becomes speech, and neural networks learn to remember with a hell lot of music."
tags: ["essays"]
curious: true
---

---

week: 2026-08-25 to 2025-08-31
----------------

## Sound

I started learning about speech synthesis and realized I didn't actually understand what sound looks like to a computer.

Sound is just pressure moving through the air: compression raises the pressure, while rarefaction lowers it. The frequency of that wave relates to pitch, while its amplitude relates to loudness.

When we speak, the vocal folds produce a buzzing sound containing a fundamental frequency and its harmonics. That sound then passes through the vocal tract. The shape of the mouth, tongue, and lips acts almost like an equalizer, amplifying some frequencies and reducing others. These boosted regions are called **formants**, and they help distinguish sounds like "aaaa" and "eeee."

### Getting sound into a computer

A computer doesn't store the continuous pressure wave directly. A microphone samples it at regular intervals and converts those measurements into numbers.

At 16 kHz, we take 16,000 samples every second. With 16-bit PCM, each sample needs 2 bytes, so raw mono audio takes:

`16,000 × 2 = 32,000 bytes/s`

We don't normally process all 16,000 samples at once. We divide them into small **frames**. At 10 ms per frame, that's 160 samples per frame.

The reason for using small frames is that speech changes relatively slowly over a few milliseconds, so we can treat the vocal tract as approximately stationary within each frame.

### From waveform to spectrogram

The raw waveform isn't a particularly useful representation for understanding speech.

The ear is much more interested in:

* which frequencies are present
* how strong they are
* how they change over time

A spectrogram gives us roughly that information. We take a short window of samples, apply a Fourier transform, and see which frequencies are present in that window. We repeat this while moving the window through the audio, usually with overlapping windows.

Then we use the **Mel scale** because human hearing doesn't perceive frequency differences linearly. A 100 Hz → 200 Hz change is much easier to distinguish than a 5100 Hz → 5200 Hz change.

We also use a logarithmic representation of energy because our perception of loudness isn't linear either.

### The interesting problem with "ssss"

Vowels are relatively predictable. When someone says "aaaa" repeatedly, the vocal folds produce a fairly consistent harmonic structure.

But sounds like `ssss` are different. They're produced largely by turbulent airflow rather than periodic vocal-fold vibration. Their frequency content looks more like a changing cloud of noise.

This creates an interesting problem for neural networks.

If the model sees many different versions of the same noisy sound, a typical loss function encourages it to predict the **average** of those possibilities.

But the average of random noise isn't noisy.

It's closer to a smooth signal.

That smooth prediction can turn the natural `ssss` into an unnatural tonal or metallic buzzing sound.

So the problem isn't necessarily that the neural network "failed." The objective asked it to minimize the error, and the mathematically convenient solution was the average. The problem is that the objective didn't match what we actually wanted the sound to be.

One solution is to let the model predict the underlying signal and then inject appropriate noise back into these unvoiced/sibilant regions.

That small distinction — **predicting the average versus reproducing the randomness** — ended up being one of the more interesting things I learned about neural speech synthesis.

### A few numbers I want to remember

* 16 kHz → 16,000 samples/second
* 16-bit PCM → 65,536 possible amplitude values
* 10 ms frame at 16 kHz → 160 samples
* 16 kHz sampling → frequencies up to 8 kHz can be represented
* 100 frames/second → 10 ms per frame

The main thing I took away is that speech isn't simply a waveform. There are several representations between the physical sound and what a neural network eventually learns — and each representation throws away or emphasizes different information.


## From text to phonemes

I was trying to understand what actually happens between typing a sentence and a TTS model producing speech. There are a few surprisingly important steps before the model even starts generating sound.

### Text normalization

Computers can't directly pronounce everything we write. Numbers, abbreviations, dates, and symbols need to be converted into something that can be spoken.

For example:

`Dr. Smith paid $3.50 on 3/4.`

becomes something like:

`Dr. Smith paid three dollars fifty cents on March fourth.`

This process is called **text normalization**.

### Grapheme to phoneme

The next problem is pronunciation. Written English doesn't map cleanly to sounds.

For example, `read` can have different pronunciations depending on context.

So TTS systems convert written characters into **phonemes** — representations of the sounds that need to be spoken.

For example:

`fish → /f ɪ ʃ/`

There are neural G2P systems that learn pronunciations and rule-based systems that use predefined pronunciation rules. For a tiny embedded TTS system, rule-based G2P is attractive because it is deterministic, small, and doesn't require another neural network.

### How long should each sound last?

Knowing *what* sounds to produce isn't enough. The system also needs to know **how long each phoneme should last**.

For example, in:

`cat`

the `/k/` might last around 10 ms, the vowel much longer, and `/t/` somewhere in between.

A duration model predicts these durations, usually in terms of acoustic frames.

### From phonemes to numbers

Now comes the acoustic model.

A large teacher TTS model produces a representation containing **192 numbers per frame**. An encoder compresses this into a much smaller **40-number representation**.

The interesting part is that the deployed system doesn't need the teacher.

During training:

```text
Teacher
   ↓
192-dimensional representation
   ↓
Encoder
   ↓
40-dimensional representation
```

The small acoustic model learns to produce those 40 numbers directly:

```text
Phonemes + durations
        ↓
Acoustic model
        ↓
40 numbers / frame
```

Once it has learned this mapping, the teacher and encoder can be thrown away.

### Vocoder

The final step is the vocoder.

It takes the acoustic representation and turns it into an actual waveform that can be played through a speaker:

```text
Text
 ↓
Normalization
 ↓
Phonemes
 ↓
Duration
 ↓
Acoustic model
 ↓
40-number representation
 ↓
Vocoder
 ↓
Waveform
 ↓
Sound
```

What surprised me most was how much happens before the system actually produces a waveform. The tiny model doesn't simply turn text directly into sound. It learns a chain of increasingly useful representations, while the large teacher is used during training and then discarded.

The deployed system contains only three neural networks:

* Duration model — **36,164 parameters**
* Acoustic model — **199,536 parameters**
* Vocoder — **331,308 parameters**

The teacher and encoder are only there to teach the smaller system. Once training is finished, they disappear.


## How does a neural network remember?

I used to think of a neural network as something mysterious that somehow "learns." The simplest way I found to think about it is: **a neural network is a function with a lot of adjustable numbers**.

Those numbers are called **parameters** or **weights**. Training is essentially the process of adjusting them until the network's predictions become useful.

A single neuron does something like:

`y = f(Wx + b)`

It takes an input, multiplies it by weights, adds a bias, and passes the result through an activation function.

A useful thing to realize is how quickly the number of parameters grows. If a layer has 40 inputs and 160 neurons, it already needs:

`160 × 40 + 160 = 6,560 parameters`

The basic training loop is then surprisingly simple:

```text
predict
   ↓
measure error
   ↓
adjust parameters
   ↓
repeat
```

More parameters generally give a model more capacity to represent complicated relationships, although simply adding parameters doesn't automatically make a model better.

### Teaching a small model

This becomes especially important when building tiny models.

Instead of asking a small model to learn everything from scratch, sanoTTS uses a larger teacher model. The teacher produces a 192-dimensional representation for each frame, and an encoder compresses it into 40 dimensions.

The smaller models can then learn from this compact representation.

```text
Large teacher
     ↓
192 numbers
     ↓
Encoder
     ↓
40 numbers
     ↓
Small model
```

This is **knowledge distillation**: use a large model to teach a smaller one.

### But speech has memory

A normal neural network can process an input without knowing what came before it.

Speech doesn't work that way.

If I say:

`I love systems engineering`

the meaning and sound at the current moment depend partly on what happened in previous frames.

At 100 frames per second, even one second of speech contains around 100 sequential pieces of information.

This is where **recurrent neural networks** come in.

A RNN maintains a hidden state — essentially a vector representing what the model currently remembers.

```text
Frame 1 → hidden state
              ↓
Frame 2 → updated hidden state
              ↓
Frame 3 → updated hidden state
              ↓
...
```

Instead of treating every frame independently, the model carries information from one frame to the next.

### The problem: forgetting

There is a problem with this approach.

During training, gradients are repeatedly multiplied as they travel backward through many time steps. If those values become smaller at every step, the gradient can eventually become tiny.

This is the **vanishing gradient problem**.

The model then struggles to learn relationships between things that are far apart in time.

For speech, this matters because useful information from earlier frames may need to survive for later frames.

### GRU: memory with gates

A **Gated Recurrent Unit (GRU)** gives the recurrent network gates that control its memory.

I find it easiest to think of them as little decisions:

> Should I keep the old information?
> Should I replace it?
> Should I ignore the past?

The **update gate** controls how much the hidden state should change.

If the sound remains something like:

`aaaaaaaaaaaa`

there may not be much reason to completely replace the existing information.

But when the sound changes:

`aaaasssss`

the information describing the vowel may no longer be useful. The model needs to adapt to the new sound.

The **reset gate** helps with this by controlling how much of the previous hidden state should influence the new candidate state.

So the important idea isn't really memorizing every previous frame. The GRU continuously decides **what information is worth carrying forward**.

### Why this matters for tiny TTS

In a recurrent vocoder, these weights are reused for every frame.

That means the same parameters are repeatedly loaded and computed with while generating speech.

So when building something that needs to run on a tiny device, the architecture isn't just about getting good speech. It also has to be designed around **memory usage and computation**.

That's one of the things I find interesting about embedded ML: a model isn't finished when it works. It has to fit the machine that will actually run it.


## double entendre
A word or phrase open to two interpretations
- Saath hui shaamil, vo na Tamil, but she vanakkam ... Vannakam -> Wannacum
- 6 mahine se ho raha flop hi, diss ke bina iske hore 10 milli paar nahi ... flop hi -> floppy disk

## Music This week
- [Nothing else Matters - Metallica](https://open.spotify.com/track/6QAsrXPnMSXIbV0yEJHlEX)
- [Thinking Out Loud - Ed Sheeran](https://open.spotify.com/track/34gCuhDGsG4bRPIf9bb02f)
- [No competition - Jass Manak ft. Divine](https://open.spotify.com/track/4w3SKupiTNoAMi8JKbJAl9)
- [Lil Bunty - KR$NA](https://open.spotify.com/track/60i2YCe54R8ojPnXzlelKg)
- [Kalakar - Rato Rani](https://open.spotify.com/track/3IjA0mtzAQs4UX8INnLQRR)
- [Jamure - BiggSmoke](https://open.spotify.com/track/5V099cCJSdGwWv2nMYmVQr)
- [Jhoot - Harmeet](https://open.spotify.com/track/1jwKDC0GL5bTLJnu9LegTZ)

## Quote of the week
You are Larger than life. 
