---
layout: post
title: Race Conditions
description:
date: 2026-11-02
categories:
  - Guide
tags:
---

# Race condtions

Race conditions are a class of software bugs, often tied to concurrency and timing issues in a system. Race conditions arise from multiple processes/threads that operate on a shared object.

Within user-land processes, most race conditions reduce to races in the file system, while in kernel they are present in various places.

Exploits based on race conditions typically require repeated attempts within the short time period.
## Time-of-Check to Time-of-Use (TOCTOU)

`TOCTOU` is caused by race conditions that involves checking the state of a part of a system and then using the result of that check.

The issue is that applications cannot assume that the state managed by a operating system will not change between system calls.

Exploiting a TOCTOU race condition requires highly precise timing to ensure the attacker’s operations interleave properly with the victim's operations. Techniques to achieve this single-stepping of the victim program include using file system mazes or algorithmic complexity attacks to manipulate the OS scheduling state