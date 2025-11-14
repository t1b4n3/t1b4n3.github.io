

Many ROP exploits involves finding a `pop rdi; ret` gadget. Since `rdi` is used to pass the first argument to functions in the `x86_64` calling convention, this gadget is crucial for setting up calls to functions. 

In binaries compiled with modern `glibc (2.34 and newer)`, this and other useful gadgets are often missing.

Source of the gadget
- The gadget was commonly found in the `__libc_csu_init` function, which used to be included in most dynamically linked binaries.
- The disassembly of `__libc_csu_init` contains the instruction sequence `pop r15; ret`. The machine code for this is `41 5f c3`. The last two bytes `5f c3` of that sequence happen to be the exact machine code for `pop rdi ; ret`, therefore if a attacker as the address of  `pop r15; ret`, they could add one byte to that address to get `pop rdi; ret`

Why it disappeared.
A patch in `glibc 2.34` was introduced to remove useful ROP gadgets for the `ret2csu` exploit technique, which had the side effect of no longer compiling the `__libc_csu_init` function into binaries.

---
To overcome the lack of `pop rdi; ret` gadget a technique known as `ret2gets` can be used.

This techniques leverages the behaviour of the `gets()` function to control the `rdi` register and even leak the base address of libc.

When `gets()` finishes reading from `stdin`, it often leaves the address of a writable libc structure, `_IO_stdfile_0_lock`, in the `rdi` register before it returns. This behaviour is because of the thread-safe locking mechanism used by glibc's I/O functions.

To prevent race conditions in multi-threaded programs, I/O functions like `gets()` must "lock" the file stream they are using. `gets()` calls `_IO_acquire_lock` at the beginning and `_IO_release_lock` at the end. The release macro calls `_IO_lock_unlock`, and this function loads the address of the lock structure for `stdin` (which is `_IO_stdfile_0_lock` ) into the `rdi` register just before returning, this is done to prepare for a potential call to an underlying system function that expects its argument in `rdi`. When `gets()` returns, `rdi` points to `_IO_stdfile_0_lock`, a writable location in libc's memory.

## How to exploit this.
### Writing to `rdi`

Since `gets()` leaves a pointer to a writable memory in `rdi`, we can use a second call to `gets()` to write data to that location.

The attack goes as follows:
1. First `gets()`: 
	- The first `gets()` is called, whether called in binary or in your `ROP chain`. After this call returns, `rdi` will contain the address of `_IO_stdfile_0_lock`
2. Second `gets()`:
	- Call `gets()` again (`gets@plt`). This time when gets executes, it will read input from you and write it to the address currently in `rdi` (`_IO_stdfile_0_lock`).
3. Payload:
	- Send the string you want to populate `rdi`. e.g. `/bin/sh`
4. Call the function:
	- In `ROP chain` follow the second `gets@plt` with a call to the function you want to execute (e.g. `system` | when system is called `rdi` will still point to the `_IO_stdfile_0_lock`) . 

Example
```python
payload = flat(
	gets_plt,
	gets_plt,
	system_plt
)

#
#
binsh = b"/bin" + p8(u8(b"/")+1) + b"sh"

p.sendline(payload)
p.sendline(binsh)

p.interactive()

# get shell

```

> Note
> The `_IO_stdfile_0_lock` structure contains a counter field named `cnt`. The unlock function decrements this counter, and if it becomes zero, it may ruin you payload. To avoid this, you must overwrite `cnt` with a value other than 1 as part of your string that is placed in `_IO_stdfile_0_lock`.

### Leaking the Libc base address

The `_IO_stdfile_0_lock`  structure also contains the field named `owner`, which points to the Thread Local Storage (`TLS`) for the current thread. The `TLS` address has a predictable offset from the libc base address, so leaking the owner pointer allows you to calculate the base address of libc.

#### Method 1

This works for `glibc 2.30 - 2.36`
1. First `gets()`:
2. Send a payload that sets the `cnt` field to 0
3. When the unlock function runs, it first decrements `cnt`, which undeflows from 0 to 0xffffffff, then the check to see if `cnt` is zero fails.
4. Because the check fails, the owner field is not cleared, and the null byte from `gets()` is written after the `TLS` pointer allowing a call to `puts()` to leak the address.

#### Method 2

`glibc 2.37+`
1. First gets():


--- 



---
## Reference

[ret2gets](https://sashactf.gitbook.io/pwn-notes/pwn/rop-2.34+/ret2gets#exploit-techniques)
