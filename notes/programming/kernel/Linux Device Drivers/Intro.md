


## Process management
- The kernel is in charge of creating, and destroying processes and handling their connection (input and output). 
- Communication with different process (through pipes, signals, or inter-process communication primitives. )
- The scheduler which controls how processes share the CPU is part of process management.

## Memory Management
- The kernel builds up a virtual addressing space, for any and all processes on top of the limited available resources. 
- The different parts of the kernel interact with the memory-management subsystem through a set of function calls.

## File systems 
- Almost everything in unix can be treated as a file.
- The kernel builds a  structured filesystem on top of  unstructured hardware
- Linux supports multiple filesystem types.

## Device control
- All device control operations are performed by code that is specific to the device being addressed. The code is called a device driver.
- The kernel must have embedded in it a device driver  for every peripheral present on a system.

## Networking 
- Networking must be managed by the operating system, because most network operations are not specific to a process.
- The packets must be collected, identified, and dispatched before a process takes care of them.

## Loadable Modules
Linux has the ability to extend at runtime the features provided by the kernel.
This means that you can add functionality to the kernel and remove functionality as well while the system is running.

- Each piece of code that can be added to the kernel at runtime is called a module.
- The linux kernel offers support for different types (classes) of modules.
- Each module is made up of object code.
	- can by dynamically linked to the running kernel by using the `insmod`program
	- unlinked by running the `rmmod` program


## Classes of Devices and Modules
Three fundamental devices:
- network module
- char module
- block module

### Character Devices
- A char device is one that can be accessed as a stream of bytes. 
- They are simple and are used for devices where you don't need random access. 
- e.g. `/dev/tty`, `/dev/random`, `/dev/zero`

Detecting device type in `/dev` directory

```sh
ls -l /dev/tty
crw-rw-rw- 1 root tty 5, 0 Sep  4 17:43 /dev/tty
```

The symbol C in the beginning means that this is a character device


### Block devices
- Block devices are devices that read/write data in fixed-size blocks
- Typically used for storage devices: `/dev/sda`, `/dev/loop0`, `/dev/mmcblk0`

```sh
 ls -l /dev/sda
brw-rw---- 1 root disk 8, 0 Sep  4 17:43 /dev/sda
```

The symbol B in the beginning means that this is a block device
### Network Devices
- Network devices handle packet-based communication, like Ethernet cards or virtual interfaces.


## Kernel Modules v. Applications

