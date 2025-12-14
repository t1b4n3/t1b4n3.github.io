---
title: About Me
icon: fas fa-info-circle
order: 2
---

<!-- Font Awesome CDN for icons -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">


<style>
.profile-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2rem;
}

.profile-left {
  flex: 1;
  max-width: 320px;
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #333;
}

.profile-left img {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.profile-left h2 {
  margin: 0;
}

.profile-left .roles {
  text-align: left;
  margin-top: 1rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.profile-right {
  flex: 2;
  min-width: 300px;
}

.skills {
  margin-top: 1rem;
}

.skills span {
  display: inline-block;
  background: var(--tag-bg, #3a3a3a);
  color: var(--tag-text, #fff);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin: 5px 5px 0 0;
}

.disclaimer {
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #865dff;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  font-size: 0.9rem;
}

.quote {
  text-align: center;
  margin-top: 2rem;
  font-weight: bold;
  font-size: 0.95rem;
}


</style>


  <div class="profile-container">

  <div class="profile-left">
    <img src="/assets/images/me.jpeg" alt="Profile Image">
    <p><code>$ whoami</code></p>
    <h2>Nkateko Tibane</h2>
    <p>IT student</p>


    <div class="social-icons">
      <a href="https://github.com/t1b4n3" target="_blank" title="GitHub"><i class="fab fa-github"></i></a> |
      <a href="https://twitter.com/t1b4n3" target="_blank" title="Twitter"><i class="fab fa-twitter"></i></a> |
      <a href="mailto:nkatekotibane101@gmail.com" title="Email"><i class="fas fa-envelope"></i></a> |
      <a href="https://www.linkedin.com/in/nkatekotibane" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a> 
    </div>

    <div class="roles">
      <p><code>$ what-do-i-do</code></p>
      <p>&gt; Exploit Development</p>
       <p>&gt; Reverse Engineering</p>
	  <p>&gt; Systems Development</p>
    </div>
  </div>




  <div class="profile-right">
    Hello 

    I'm Nkateko,a, cybersecurity enthusiast focused on low-level exploit and systems development.
    <p>
    This blog is where i will post CTF writeups and real world research that i do. 
    </p>
    <p>
	 I'm currently learning low level vulnerability research and exploit development via CTFs. Next on my list is to get into kernel exploitation. 
	</p>
	
	<p>
	 During weekdays, I study exploit techniques using past ctf challenges and writeups and  also using security papers, articles, etc. On the weekend, I play active CTFs solo. (Looking for a team to join)
        </p>
	<div class="skills">
      <h4>My Toolkit Includes:</h4>
      <span>C/C++</span>
      <span>Python</span>
      <span>Assembly</span>
      <span>PHP</span>
      <span>Reverse Engineering</span>
      <span>Exploit Development</span>
    </div>

  <div class="disclaimer">
      <strong>Open to Work</strong><br>
	You can contact me if you have a decent opportunity for me related to security jobs.
    </div>

    <div class="disclaimer">
      <strong>Legal Disclaimer:</strong><br>
      Everything you find here — code, blog posts, or techniques — is for educational purposes only.  
      I do not promote or condone the misuse of any tools or scripts for unethical hacking or real-world attacks.
    </div>

    <div class="quote">
      
    </div>
  </div>
</div>




<!--
## Certifications  

### Completed

#### N/A

---

### Currently Pursuing

<div class="cert-blocks">
  <div class="cert-card">
    <img src="/assets/images/cert/crta.png" alt="CRTA" class="cert-img">
    <h3>CRTA</h3>
    <p><a href="https://cyberwarfare.live/product/red-team-analyst-crta/" target="_blank">Certified Red Team Analyst</a></p>
    <p><strong>Status:</strong> Currently Pursuing</p>
  </div>
</div>

---

### Future Goals

<div class="cert-blocks">
  <div class="cert-card">
    <img src="/assets/images/cert/oscp.png" alt="OSCP" class="cert-img">
    <h3>OSCP</h3>
    <p>Offensive Security Certified Professional</p>
    <p><strong>Status:</strong> Goal</p>
  </div>

  <div class="cert-card">
    <img src="/assets/images/cert/crto.jpeg" alt="CRTO" class="cert-img">
    <h3>CRTO</h3>
    <p>Certified Red Team Operator</p>
    <p><strong>Status:</strong> Goal</p>
  </div>

  <div class="cert-card">
    <img src="/assets/images/cert/osed.jpeg" alt="OSED" class="cert-img">
    <h3>OSED</h3>
    <p>Offensive Security Exploit Developer</p>
    <p><strong>Status:</strong> Goal</p>
  </div>



<style>
.cert-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.cert-card {
  flex: 1 1 250px;
  max-width: 300px;
  padding: 1rem;
  background-color: var(--card-bg, #fff);
  border: 2px solid #b266ff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  text-align: center;
}

.cert-card:hover {
  transform: scale(1.02);
  border-color: #9333ea;
}

.cert-card h3 {
  color: #b266ff;
  margin-top: 0;
}

.cert-card p {
  margin: 0.4rem 0;
}

.cert-card a {
  color: #b266ff;
  text-decoration: none;
}

.cert-card a:hover {
  text-decoration: underline;
}

.cert-img {
  max-width: 100px;
  max-height: 100px;
  margin-bottom: 1rem;
  object-fit: contain;
}
</style>

---
## Learning Paths / Training

<style>
.trainings-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
}

.training-card {
  flex: 1 1 250px;
  max-width: 300px;
  padding: 1rem;
  border: 2px solid rgb(211, 47, 211);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgb(99, 5, 94);
  transition: transform 0.2s ease;
  text-align: center;
}

.training-card:hover {
  transform: scale(1.02);
  border-color: #9333ea;
}

.training-card h3 {
  color: #b266ff; /* Fixed syntax error (removed extra colon) */
  margin-top: 0;
}

.training-card p {
  margin: 0.4rem 0;
  font-size: 0.95rem;
  color: #444;
}

.training-card a {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
}

.training-card a:hover {
  text-decoration: underline;
}

.training-img {
  max-width: 80px;
  max-height: 80px;
  margin-bottom: 1rem;
  object-fit: contain;
  border-radius: 6px;
}
</style>

<div class="trainings-blocks">
	  <div class="training-card">
    <img src="/assets/images/endpoint_sec.png" class="training-img" alt="Course Icon" />
    <h3>Endpoint Security </h3>
    <p>Cisco Networking Academy</p>
    <a href="https://www.credly.com/badges/04258199-4029-4933-80ed-2de980d43fe9/public_url" target="_blank">view badge</a>
  </div>


  <div class="training-card">
    <img src="/assets/images/net_basics.png" class="training-img" alt="Course Icon" />
    <h3>Networking Basics</h3>
    <p>Cisco Networking Academy</p>
    <a href="#">view badge</a>
  </div>
    
  <div class="training-card">
    <img src="/assets/images/ethical_hacker.png" class="training-img" alt="Course Icon" />
    <h3>Ethical hacker</h3>
    <p>Cisco Networking Academy</p>
    <a href="https://www.credly.com/badges/102b3947-3c16-4d09-afa2-eb067efa50ad/public_url">view badge</a>
  </div>

  <div class="training-card">
    <img src="/assets/images/netcad.png" class="training-img" alt="Course Icon" />
    <h3>Introduction to Cybersecurity</h3>
    <p>Cisco Networking Academy</p>
    <a href="#">view badge</a>
  </div>

</div>
---

Feel free to connect, share your thoughts, and let's learn and grow together in the exciting realm of cybersecurity!


--> 