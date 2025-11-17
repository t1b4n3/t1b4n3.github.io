---
layout: post
title: Large Bin attack
description: Explanation of large bin attack
date: 2025-11-15
categories:
  - Guide
  - heap-exploitation
tags:
  - large-bin
  - heap
---

# Large bin attack.

This technique allows you to modify an arbitrary address with an value of a large bin chunk. This technique alone is not enough to get code execution, in modern `GLIBC` FSOP in needed to finish exploit, overwrite `_IO_list_all` to forge fake `_IO_File` structures and in older `GLIBC` you could overwrite `global_max_fast` and perform a `fastbin poison/dup`.
## Large bin summary:

This is the structure for large bins.

```c
struct malloc_chunk {
  INTERNAL_SIZE_T      mchunk_prev_size;  /* Size of previous chunk, if it is free. */
  INTERNAL_SIZE_T      mchunk_size;       /* Size in bytes, including overhead. */
    /* double links -- used only if this chunk is free. */
  struct malloc_chunk* fd;              
  struct malloc_chunk* bk;
  /* Only used for large blocks: pointer to next larger size.  */
  struct malloc_chunk* fd_nextsize;
  struct malloc_chunk* bk_nextsize;
};
typedef struct malloc_chunk* mchunkptr;
```

Large bins store chunks within a specific range and not of the same size. In order to speed up indexing and searching the `fd_nextsize` and `bk_nextsize` were introduced, these points are used to traverse chunks of the group size.

## How does the attack work?

The attack happens in the process when a chunk is inserted into a large bin, which then is unlinked and pointers are changed in the relevant chunks.

The goal is to modify the `bk_nextsize` field of a chunk. 

When `GLIBC` inserts a chunk into a large bin, it performs pointer updates. The goal is to hijack which pointers `GLIBC` updates, so that it writes an arbitrary address into a arbitrary memory location.

**So why do we need to used chunks of different sizes?** 

When inserting a chunk into a large bin, `glibc` compares sizes:

```c
if (size == chunksize_nomask(fwd)) 
	fwd = fwd->fd; // insert second inlist, skip nextsize updates.
```

if the sizes are equal, `GLIBC` does not touch the `nextsize` pointers.

This attack targets the `nextsize` list, which is used when chunks are not of the same size but are still in the same large (within a certain range).

**What actually happens during large bin insertion?**

`GLIBC` <= 2.29

There are two possible cases depending on size: 
1. Inserted chunk is smaller
	- `fwd->fd->bk_nextsize  = victim;`
2. Inserted chunk is larger
	- `victim->bk_nextsize->fd_nextsize = victim;`

Either cases gives a write to one of the `nextsize` pointers.

`GLIBC` >= 2.30 

Everything changed, as a new integrity check was introduced to prevent the second case (inserted chunk is larger) from working.

Only this case works:

1. Inserted chunk is smaller than the smallest chunk
	- `victim->bk_nextsize->fd_nextsize = victim;`

This means `GLIBC` will write the address of the inserted chunk into `bk_next_size + 0x20` because `fd_nextsize` is `0x20` bytes after the pointer to the chunk. 

## Exploitation Steps

### Prerequisites

1. Allocate a large chunk.
	- Lets call it  `chunkA`
2. Allocate a chunk smaller than `chunkA`.
		- Lets call it `chunkB`
3. Allocate a guard chunk to prevent consolidation.
4. Free `chunkA`.
	- `chunkA` will be placed in the unsorted bin.
5. Allocate a chunk larger than `chunkA`.
	- Lets call it `chunkC`
	- This is done so that `chunkA` is sorted into the large bin.
6. Free `chunkB`
7. Now modify `chunkA`
	- Modify `chunkA->bk_nextsize` to point to `[target - 0x20]`
8. Allocate a larger chunk than `chunkB`.
	- This is done so that `chunkB` can be sorted into large bin, then `GLIBC` will try to update the pointers which leads to overwriting the address `chunkA->bk_nextsize->fd_nextsize` with the address of `chunkB`
9.  Now `target == chunkB`

---

## Demo

Comming soon

## Resources

