---
title: Projects
icon: fas fa-code
order: 3
---
<style>
:root {
  --accent-color: #6c63ff;
  --accent-hover: #5548c8;
  --card-bg: #1e1e2e;
  --border-color: #2a2a3a;
  --tag-bg: #2a2a3a;
  --tag-hover-bg: #3a3a4a;
  --tag-text: #e0e0e0;
  --text-muted: #b0b0b0;
}

.tags {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.tag {
  display: inline-block;
  background: var(--tag-bg);
  color: var(--tag-text);
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-right: 5px;
  margin-bottom: 5px;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: 'Fira Code', monospace;
}

.tag:hover {
  background: var(--tag-hover-bg);
  transform: translateY(-1px);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.project-card {
  background-color: var(--card-bg);
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 280px;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.15);
  border-color: var(--accent-color);
}

.project-card h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.project-card h3 a {
  color: inherit;
  text-decoration: none;
  background-image: linear-gradient(var(--accent-color), var(--accent-color));
  background-position: 0% 100%;
  background-repeat: no-repeat;
  background-size: 0% 2px;
  transition: background-size 0.3s ease;
  padding-bottom: 2px;
}

.project-card h3 a:hover {
  background-size: 100% 2px;
}

.project-card p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.project-card ul {
  padding-left: 1rem;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.project-card ul li {
  margin-bottom: 0.35rem;
  position: relative;
  line-height: 1.4;
}

.project-card ul li::before {
  content: "▹";
  position: absolute;
  left: -0.8rem;
  color: var(--accent-color);
  font-size: 0.8rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  margin-top: auto;
  color: #fff;
  background: var(--accent-color);
  padding: 7px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  align-self: flex-start;
  gap: 5px;
}

.btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn::after {
  content: "→";
  transition: transform 0.2s ease;
  font-size: 0.9rem;
}

.btn:hover::after {
  transform: translateX(2px);
}

.project-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.feature-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .project-card {
    padding: 1rem;
    min-height: 260px;
  }
  
  .project-image {
    height: 120px;
    margin-bottom: 0.75rem;
  }


}

.star-badge {
  display: inline-flex;
  align-items: center;
  background: var(--tag-bg);
  color: var(--tag-text);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  margin-left: 8px;
  vertical-align: middle;
  gap: 4px;
}

.star-count {
  font-weight: 600;
  font-family: 'Fira Code', monospace;
}
</style>

<div class="project-grid">

<!-- TibaneC2 Project -->
<div class="project-card">
  <img src="/assets/images/tibaneC2.png" alt="TibaneC2 Framework" class="project-image">
  
  <h3>
  <a href="https://github.com/t1b4n3/TibaneC2" target="_blank">TibaneC2 Framework</a>
      <span class="star-badge">
    <img src="https://img.shields.io/github/stars/t1b4n3/TibaneC2?style=flat-square&color=6c63ff" alt="GitHub stars">
  </span>
  </h3>
  <p>A modular Command and Control framework designed for red team operations and security research, built with operational security and extensibility in mind.</p>

  <div class="feature-title">Key Components</div>
  <ul>
    <li><strong>Core Server:</strong> Multi-threaded C2 server with encrypted communications and session management</li>
    <li><strong>Lightweight Implant:</strong> Configurable agent with sandbox evasion and multiple persistence mechanisms</li>
    <li>CLI interface: </li>
  </ul>
  
  <div class="tags">
    <span class="tag">C/C++</span>
    <span class="tag">Red Teaming</span>
    <span class="tag">C2 Framework</span>
    <span class="tag">Malware Dev</span>
    <span class="tag">Security Research</span>
  </div>
  <a class="btn" href="https://github.com/t1b4n3/TibaneC2" target="_blank">View Project</a>
</div>

<!-- Project -->
<div class="project-card">
<img src="/assets/images/pwntrace.png" alt="Project Image" class="project-image">


  <h3>
  <a href="https://github.com/t1b4n3/pwntrace" target="_blank">pwntrace</a>
    <span class="star-badge">
    <img src="https://img.shields.io/github/stars/t1b4n3/pwntrace?style=flat-square&color=6c63ff" alt="GitHub stars">
  </span>
  </h3>
  <p>Trace and control syscalls to accelerate exploit development, reverse engineering, and malware analysis. Intercept, log, and optionally modify system calls so you can safely emulate environments, stub problematic syscalls, and produce replayable traces.</p>
    <div class="feature-title">Key Components</div>
  <ul>
    <li>Active control over system calls</li>
    <li>Timeless syscall debugging (still under development)</li>
    <li>Branch Exploration (still under development</li>
  </ul>
  <div class="tags">
    <span class="tag">C++</span>
    <span class="tag">Exploit Development</span>
    <span class="tag">Reverse Engineering</span>
    <span class="tag">Trace System Calls</span>
	    
  </div>
  <a class="btn" href="https://github.com/t1b4n3/pwntrace" target="_blank">View Repository</a>
</div>

<!-- CTF Binary Exploitation
<div class="project-card">
  <img src="/assets/images/ctf-pwn.jpeg" alt="CTF Binary Exploitation" class="project-image">
  
  <h3><a href="https://github.com/t1b4n3/ctf-pwn" target="_blank">CTF Binary Exploitation</a></h3>
  <p>Collection of solved CTF challenges covering fundamental to advanced binary exploitation techniques with detailed write-ups.</p>

  <div class="feature-title">Techniques Covered</div>
  <ul>
    <li><strong>Basic Exploits:</strong> Stack overflows, format strings, ret2libc</li>
    <li><strong>Heap Exploitation:</strong> malloc internals, tcache poisoning, unlink attacks</li>
    <li><strong>Advanced ROP:</strong> Stack pivoting, SIGROP, blind ROP</li>
    <li><strong>Custom Tooling:</strong> Automated exploit templates and debugging helpers</li>
    <li><strong>Challenge Categories:</strong> Reverse engineering, cryptography, sandbox escapes</li>
  </ul>
  
  <div class="tags">
    <span class="tag">CTF Solutions</span>
    <span class="tag">Pwntools</span>
    <span class="tag">ROP Chains</span>
    <span class="tag">Heap Exploitation</span>
    <span class="tag">Python</span>
    <span class="tag">GDB</span>
  </div>
  <a class="btn" href="https://github.com/t1b4n3/ctf-pwn" target="_blank">View Challenges</a>
</div>
 -->


<!-- Real-World Exploit Development
<div class="project-card">
  <img src="/assets/images/expdev.png" alt="Real-World Exploit Development" class="project-image">
  
  <h3><a href="https://github.com/tibane0/exploit-dev" target="_blank">Real-World Exploit Research</a></h3>
  <p>Analysis and proof-of-concept exploits for real-world vulnerabilities (CVEs) across operating systems, browsers, and software applications.</p>

  <div class="feature-title">Research Focus</div>
  <ul>
    <li><strong>Vulnerability Analysis:</strong> Deep dives into published CVEs with PoC development</li>
    <li><strong>Kernel Exploitation:</strong> Windows/Linux kernel privilege escalation research</li>
    <li><strong>Browser Security:</strong> Chrome/Firefox renderer and sandbox escapes</li>
    <li><strong>Mitigation Bypasses:</strong> Advanced techniques against modern protections (CFG, CET, etc.)</li>
    <li><strong>Exploit Primitive Development:</strong> Reliable techniques for RCE and LPE</li>
  </ul>
  
  <div class="tags">
    <span class="tag">CVE Analysis</span>
    <span class="tag">Kernel Exploitation</span>
    <span class="tag">Browser Security</span>
    <span class="tag">Mitigation Bypass</span>
    <span class="tag">C/C++</span>
    <span class="tag">Exploit Development</span>
  </div>
  <a class="btn" href="https://github.com/tibane0/exploit-dev" target="_blank">View Research</a>
</div>

</div>
 -->