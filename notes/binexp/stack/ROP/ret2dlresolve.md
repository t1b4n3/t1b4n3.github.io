
# ret2dlresolve
This is a technique used to bypass `ASLR` and `NX` protections when you don't have a leak of `libc` addresses (without a information leak vulnerability). This technique works by tricking the dynamic linker into resolving a functions into the `PLT` at runtime, and by doing this you can use the `PLT` functions as if it was an original component of the binary..

## How it works.
### Dynamic linking in linux
- When a binary calls a function like `system` (from libc) the `PLT` and `GOT` are used to resolve its address
- The first time a function is called the dynamic linker resolves its address and stores it in the `GOT`.
- The dynamic section of elf contains information used by the dynamic linker to resolve the symbols at runtime.

```sh
readelf -d chall 

Dynamic section at offset 0x2e20 contains 24 entries:
  Tag        Type                         Name/Value
 0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]
 0x000000000000000c (INIT)               0x401000
 0x000000000000000d (FINI)               0x4011e8
 0x0000000000000019 (INIT_ARRAY)         0x403e10
 0x000000000000001b (INIT_ARRAYSZ)       8 (bytes)
 0x000000000000001a (FINI_ARRAY)         0x403e18
 0x000000000000001c (FINI_ARRAYSZ)       8 (bytes)
 0x000000006ffffef5 (GNU_HASH)           0x4003b0
 0x0000000000000005 (STRTAB)             0x4004a0
 0x0000000000000006 (SYMTAB)             0x4003e0
 0x000000000000000a (STRSZ)              99 (bytes)
 0x000000000000000b (SYMENT)             24 (bytes)
 0x0000000000000015 (DEBUG)              0x0
 0x0000000000000003 (PLTGOT)             0x404000
 0x0000000000000002 (PLTRELSZ)           48 (bytes)
 0x0000000000000014 (PLTREL)             RELA
 0x0000000000000017 (JMPREL)             0x4005c0
 0x0000000000000007 (RELA)               0x400548
 0x0000000000000008 (RELASZ)             120 (bytes)
 0x0000000000000009 (RELAENT)            24 (bytes)
 0x000000006ffffffe (VERNEED)            0x400518
 0x000000006fffffff (VERNEEDNUM)         1
 0x000000006ffffff0 (VERSYM)             0x400504
 0x0000000000000000 (NULL)               0x0
```
- This technique focuses on the following:
	- `SYMTAB`
	- `STRTAB`
	- `JMPREL`

#### `STRTAB`
This is just a simple table that stores the strings for symbols names.
#### `JMPRL`
This segment (`.ret.plt`) stores a table called relocation table. which maps each entry to a symbol.

```sh
readelf -r chall 

Relocation section '.rela.dyn' at offset 0x548 contains 5 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000403ff0  000100000006 R_X86_64_GLOB_DAT 0000000000000000 __libc_start_main@GLIBC_2.34 + 0
000000403ff8  000400000006 R_X86_64_GLOB_DAT 0000000000000000 __gmon_start__ + 0
000000404040  000500000005 R_X86_64_COPY     0000000000404040 stdout@GLIBC_2.2.5 + 0
000000404050  000600000005 R_X86_64_COPY     0000000000404050 stdin@GLIBC_2.2.5 + 0
000000404060  000700000005 R_X86_64_COPY     0000000000404060 stderr@GLIBC_2.2.5 + 0

Relocation section '.rela.plt' at offset 0x5c0 contains 2 entries:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000404018  000200000007 R_X86_64_JUMP_SLO 0000000000000000 setbuf@GLIBC_2.2.5 + 0
000000404020  000300000007 R_X86_64_JUMP_SLO 0000000000000000 read@GLIBC_2.2.5 + 0

```

These entries are of type `ELF32_Rel`

```c
typedef uint32_t Elf32_Addr;
typedef uint32_t Elf32_Word;
typedef struct
{
  Elf32_Addr    r_offset;               /* Address */
  Elf32_Word    r_info;                 /* Relocation type and symbol index */
} Elf32_Rel;
/* How to extract and insert information held in the r_info field.  */
#define ELF32_R_SYM(val)                ((val) >> 8)
#define ELF32_R_TYPE(val)               ((val) & 0xff)
```
- The column name corresponds to our symbol name.
- The offset is the GOT entry for our symbol.
- Info stores metadata.

#### `SYMTAB`
This structure holds symbol information. Each entry is a `ELF32_Sym` structure and its size is 16 bytes.

```c
typedef struct 
{ 
   Elf32_Word st_name ; /* Symbol name (string tbl index) */
   Elf32_Addr st_value ; /* Symbol value */ 
   Elf32_Word st_size ; /* Symbol size */ 
   unsigned char st_info ; /* Symbol type and binding */ 
   unsigned char st_other ; /* Symbol visibility under glibc>=2.2 */ 
   Elf32_Section st_shndx ; /* Section index */ 
} Elf32_Sym ;
```

Only the first field `st_name` is relevant to this technique, the field gives the offset in `STRTAB` of the symbol name.
### Lazy Binding
The linker uses the `_dl_runtime_resolve(link_map, reloc_offset)` to resolve symbols.
### Payload Structure

```
--------------------------------------------------------------------------
| buffer fill-up | .plt start | reloc_offset | ret_addr | arg1 | arg2 ...        
--------------------------------------------------------------------------
					^
					|
					- this should overwrite saved return address 
```



### Conditions 
- writable memory (to forge fake structures)
- control over `reloc_arg`




---
Resources

- [Ironstone notes](https://ir0nstone.gitbook.io/notes/binexp/stack/ret2dlresolve)
- [system failure](https://syst3mfailure.io/ret2dl_resolve/)
- [ctfrecipes](https://www.ctfrecipes.com/pwn/stack-exploitation/arbitrary-code-execution/code-reuse-attack/ret2dlresolve)
- [gist github](https://gist.github.com/ricardo2197/8c7f6f5b8950ed6771c1cd3a116f7e62)
