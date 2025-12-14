---
layout: post
title: Symbolic exec
description:
date: 2026-02-14
categories:
tags:
---

Symbolic execution is a way to analyse a program and determine which inputs cause which specific part of a program to execute. Symbolic execution uses symbolic values instead of regular input values. This allows to construct a result that can be expressed as an equation of these symbolic values, and can be solved mathematically.

Symbolic execution is a powerful tool for code verification, bug hunting and reverse engineering. 

Symbolic execution acts like a interpreter, in that it will go over each instruction of a program and apply its semantics on the given input. The difference is that, where an interpreter would consider concrete values, symbolic execution will consider symbolic values.  Along the execution the SE engine will maintain information about the state of the program.

- **Symbolic state**: A map binding variables to their symbolic value
- **Path Predicate**: A predicate over the symbolic variables, describing the condition for a test case to reach the current instruction.