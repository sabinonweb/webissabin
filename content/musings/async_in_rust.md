---
title: "Async In Rust"
date: 2026-11-30
description: ""
tags: ["essays"]
back: true
---

Let's start with the futures first. Futures are just state machines. In rust, futures are generally lazy and they don't return anything until they are prompted or the better word in this case would be called `polled`. It returns `Pending` if the task is yet to be completed and returns a `Ready` in case of task completion. 

## Future and Pinning 
```rust

async {
    let x = String::from("pay");
    let v = &x;
    repo().await;
    println!("{r}");
}

```

A pending future stores both x and v. In this case, if x is moved to a new memory location, v would still be pointing to the same old memory address causing it to be a dangling pointer. So, Pin is a contract which ensures that once the future is polled, this won't move in memory. 

## Familiarity with some terms before diving head on 
### Waker
Cloneable handle given to each `poll` by executor. `wake()` puts back the task in ready queue. 

### epoll 
At the start, epoll registers  
