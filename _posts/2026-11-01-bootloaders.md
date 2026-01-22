---
layout: post
title: "33"
description: "33"
date: 2026-11-01
categories:
  - Guide
tags:
  - Data-Structures
  - gambling
---
## Bootloader

A bootloader is a low-level software program that initialises minimal hardware, loads the OS kernel into memory and transfers control to it when computer is turned on.

During bootloader's execution, the processor operates in 16 bit mode (real mode), meaning the bootloader can only use 16 bit registers in its code.
## Master Boot Record

The first 512 bytes of a disk are known as the **Master Boot Record (MBR)** or **Bootsector**. The MBR is is reserved for booting purposes. The MBR is considered valid when the last word of the sector contains the signature `0xAA55`, if it is valid they BIOS treats it as bootable.

The MBR is stored in computer memory at location `0x7c00`

The bootsector is only required only for BIOS-based systems.
## The boot process

The way a bootloader is initiallized depends on the system's firmware, primarily either `BIOS` or modern `UEFI`.

### BIOS

BIOS boot process is a legacy boot process.
The `BIOS` (Basic Input/Output System) is stored in flash memory on the motherboard.

1. **Hardware initialization:**  When the power button is pressed, the Power on Self Test (POST) is performed by the BIOS. The BIOS collects hardware data and creates a list of available drives.
2. **Boot Device Search:** The firmware goes through the found data carries and searches for a bootloader using special signatures `e.g. 0xAA55`
3. **Bootloader Location:** The BIOS attemps to find a bootable device.
4. **Loading and Execution**: When a bootable disk is found, the BIOS executes INTERRUPT `0x19`, which reads the first sector (boot sector/MBR) and loads it into memory at address `0x7c00`. The BIOS then transfers control to the address and bootloader begins execution.
5. **CPU mode**: During the bootloader's execution the processor operates in 16-bit real mode.

### UEFI

UEFI (Unified Extensible Firmware Interface) is a modern replacement for BIOS in modern systems.

1. UEFI boots from a specified boot device and searches for the EFI System Partition (ESP)
2. The ESP is typically a FAT file system containing pre-boot applications and possibly a bootloader
3. Technically



#### Advantages of working with UEFI instead of BIOS.

1. The ability to work in 32/64 mode allows you to  access more processor functionalities, while BIOS works in 16 bit mode only.
2. No boot size limitations allow you to use any disk to boot the system.
3. Writing code directly in C.
4. Secure boot.



## GNU GRUB

The `GRand Unified Bootloader` supports the flexible `multiboot` boot protocol. This protocol aims to simplify the boot process by providing a single, flexible protocol for booting a variety of operating systems.

GRUB is practically a small OS, it can read file systems and thus lets you specify a kernel image by filename as well as a separate module files that the kernel may make use of. Command line arguments can be passed to the kernel as well - this is a nice way of starting an OS in maintenance mode, safe mode or VGA graphics. GRUB can provide a menu for the user to select as well allowing custom loading parameters to be entred.

GRUB cannot fit in 512 bytes, and this is way it is split between two or three stages:
- Stage 1: This is a 512 byte block that the location of staget 1.5 or stage 22 hardcoded into it. It loads the next stage.
- Stage 1.5: An optional stage which understands the filesystem and where stage 2 resides.
- Stage 2: This is a larger image that has all GRUB functionality.

## BIOS interrupts


```sh

```