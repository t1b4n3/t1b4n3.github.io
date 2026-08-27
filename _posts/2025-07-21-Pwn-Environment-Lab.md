---
layout: post
title: " Pwn & Reverse Engineering Lab with Docker"
date: 2025-07-23
categories:
  - writeup
tag: pwn-env
---
## Building a Reproducible Pwn & Reverse Engineering Lab with Docker

Spinning up a reliable workspace for **reverse engineering** and **binary exploitation** on modern machines can be tricky. Old challenges expect **legacy libc**, **glibc quirks**, and tools that no longer compile cleanly.

By containerizing the environment, you get **isolation**, **repeatability**, and an easy way to share your setup. This post walks through building a **Docker-based pwn lab** with:

- **Ubuntu 16.04** (classic CTF baseline)
- **GDB + GEF** for debugging
- **Pwntools** for exploit scripting
- **Radare2** for reverse engineering

---

## Why Docker?

- **Consistency** – the same toolchain everywhere
- **Isolation** – no host pollution    
- **Reproducibility** – identical lab on any machine
- **Legacy Support** – easily run older glibc/libc builds

---

## Step 1 – Base Image & Core Tools

Start from Ubuntu 16.04 and pull in common build dependencies:

```Dockerfile
FROM ubuntu:16.04 
ENV DEBIAN_FRONTEND=noninteractive  
# Core build tools & basic utilities 
RUN apt-get update && apt-get install -y \     
	build-essential wget curl git vim sudo \     
	gcc-multilib g++-multilib make socat \     
	strace ltrace patchelf file \     
	&& rm -rf /var/lib/apt/lists/*

```

> **Why Ubuntu 16.04?** Many older challenges and tutorials assume its glibc layout, which differs from newer releases.

---

## Step 2 – Python & Pwntools

Most exploit scripts are Python-based. Build a modern Python and install pwntools:

```Dockerfile
# Build Python 3.10 
RUN wget https://www.python.org/ftp/python/3.10.13/Python-3.10.13.tgz \    
	&& tar xzf Python-3.10.13.tgz \     
	&& cd Python-3.10.13 && ./configure --enable-optimizations \   
	&& make -j$(nproc) && make altinstall  
	
# Install pwntools & friends 
RUN python3.10 -m pip install --no-cache-dir --upgrade pip \     
	&& pip install pwntools ROPgadget one_gadget

```

---

## Step 3 – Debugging & Reverse Engineering

Add **GDB + GEF** and **Radare2**:

```Dockerfile
# Build GDB & add GEF 
RUN wget https://ftp.gnu.org/gnu/gdb/gdb-14.2.tar.gz \     
	&& tar -xzf gdb-14.2.tar.gz && cd gdb-14.2 \     
	&& ./configure --with-python=python3 && make -j$(nproc) && make install 
	
RUN wget -q -O ~/.gdbinit-gef.py https://gef.blah.cat/py \     
	&& echo "source ~/.gdbinit-gef.py" >> ~/.gdbinit  
	
# Radare2 RUN git clone https://github.com/radareorg/radare2.git /opt/radare2 \     && cd /opt/radare2 && ./sys/install.sh
```

> These give you a modern GDB with Python scripting plus Radare2 for static/dynamic analysis.

---

## Step 4 – Convenience Tweaks

Create a **non-root** user, mount a workspace, and set a sensible default command:

```Dockerfile
# Non-root user for safety 
RUN useradd -m pwn && echo "pwnr ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER pwn WORKDIR /home/pwn/workspace  CMD ["/bin/bash"]
```

---

## Step 5 – Build & Run

```sh
# Build the image 
docker build -t pwn-env . 

# Run with debugging privileges 
docker run -it --rm --cap-add=SYS_PTRACE --security-opt seccomp=unconfined \   -v "$(pwd)":/home/hacker/workspace pwn-env
```

---

## Wrap-Up

This approach gives you a **clean, reproducible lab** tailored for **binary exploitation** and **reverse engineering**:

- **Legacy-friendly** glibc from Ubuntu 16.04
- **Modern scripting** via Python & pwntools
- **Robust debugging** with GDB + GEF
- **Reverse engineering** with Radare2

You can extend the image with extras (Android tools, QEMU for embedded work, etc.) as your research grows—just keep each section modular so you understand what you’re adding.

---