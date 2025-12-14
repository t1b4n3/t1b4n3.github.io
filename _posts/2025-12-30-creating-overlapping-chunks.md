---
layout: post
title: Overlapping chunks
description: Overlapping chunks
date: 2025-12-30
categories:
  - Guide
tags:
  - heap-exploitation
---
## Overview

To create overlapping chunks, you will need to leverage a vulnerability to extend/shrink a chunk to create overlapping chunks by controlling its metadata. 

The are a number of ways to create overlapping chunks like leveraging consolidation with 


## Prerequisites

This needs some kind of vulnerability such as
- heap overflows
- one byte overflow
- poison null byte
- etc.

## Flow of attack

1. Corrupt size of chunk
2. Free the corrupted chunk (if allocated)
3. Allocate the chunk to overlap with other chunk
4. OVERLAPPING CHUNKS

## Ways to extend

### Fastbin/Tcache


heap buffer overflow | one byte overflow

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
	void *ptr1, *ptr2, *ptr3;
	ptr1 = malloc(0x10);
	ptr2 = malloc(0x10);
	// vulnerability to modify the size field of chunk1
	*(long long*)((long long)ptr1-0x8)=0x41;
	//
	free(ptr1);
	ptr3=malloc(0x30); // returns chunk1 upto chunk2_metadata 
	
	memset(ptr1, 'A', 0x10);
	memset(ptr2, 'B', 0x10);
	printf("PTR1(%p) : %s\nPTR2(%p) : %s\n", ptr1, ptr1,  ptr2, ptr2);
	memset(ptr3, 'C', 0x30);
	puts("------");
	printf("PTR1(%p) : %s\nPTR2(%p) : %s\nPTR3(%p) : %s\n", ptr1, ptr1, ptr2, ptr2, ptr3, ptr3);
	return 0;
}

```

off-by-null

```

```


Extending chunks via consolidation

	