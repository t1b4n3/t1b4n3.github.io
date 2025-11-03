---
layout: post
title: house-of-einherjar
description:
date: 2025-11-10
categories:
  - notes
  - heap-exploitation
  - pwn
tags:
  - heap-exploitation
---


This technique forces `malloc` to return a chunk from any address. It uses a off-by-one vulnerability to modify the `prev_size` of the next heap block, and unset the `prev_inuse` bit

