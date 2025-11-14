---
layout: post
title: house-of-einherjar
description:
date: 2025-11-30
categories:
  - Guide
  - heap-exploitation
  - pwn
tags:
  - heap-exploitation
---


This technique forces `malloc` to return a chunk from any address (arbitrary write/read primitive). It uses a off-by-one vulnerability to modify the `prev_size` of the next heap block, and unset the `prev_inuse` bit.

`null-byte-overwrite -> consolidation -> overlapped chunk -> tcache/fastbin poisonging.`

Steps 

1. Allocate 3 chunks (a,b, & c).
2. Prepare fake chunk in `a`
3. modify the `prev_size` of c and use off-by-null to overwrite `prev_inuse` flag of c.
4. Free c to trigger consolidation.
5. Allocate a new chunk (d)
6. used d to write a `fd/next` field and apply `tcache poisoning`
7. Allocate 2 new chunks.
