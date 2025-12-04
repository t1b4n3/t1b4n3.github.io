
# The bare basics

## Memory

## Boot Process 

- The BIOS is executed directly from `ROM`
- The BIOS loads the bootloader into address `0x7c00`
- The bootloader loads the kernel

### What is a bootloader?
A small program responsible for loading the kernel of an operating system.
## BIOS
- The CPU executes instructions directly from the BIOS's ROM.
- The BIOS generally loads its self into RAM then continues execution from RAM
- The BIOS will initialise essential hardware
- The BIOS looks for a bootloader to boot by searching all storage mediums for the boot signature `0x55AA`
- The BIOS loads the bootloader into RAM at absolute address `0x7c00`
- The BIOS instructs the process to perform a jump at absolute address `0x7c00` and begin executing the operating systems bootloader
- The BIOS contains routines to assist the bootloader in booting our kernel
- THE BIOS is 16 bit code which means only 16 bit code can execute it properly
- THE BIOS routines are generic and a standard

