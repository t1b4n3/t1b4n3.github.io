---
layout: post
title: Overlapping chunks
description: Overlapping chunks
date: 2025-12-10
categories:
tags:
---
## Overview

To create overlapping chunks, you will need to leverage a vulnerability to extend/shrink a chunk to create overlapping chunks by controlling its metadata.


## Prerequisites

This needs some kind of vulnerability such as
- heap overflows
- off-by-null
- etc.

## Ways to extend

### Fastbin/Tcache


heap buffer overflow

```c
int main() {
	void *ptr1, *ptr2, *ptr3;
	ptr1 = malloc(0x10);
	ptr2 = malloc(0x10);
	// vulnerability to modify the size field of chunk1
	*(long long*)((long long)ptr1-0x8)=0x41;
	//
	
	
	free(ptr1);
	ptr3=malloc(0x30); // returns chunk1 upto chunk2_metadata 
	return 0;
}
```

off-by-null

```

```