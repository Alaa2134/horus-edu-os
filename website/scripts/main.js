// Horus Edu OS — Website JavaScript
'use strict';

// ─── Language Toggle ──────────────────────────────────────────
let currentLang = 'ar';

function toggleLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  const isEn = currentLang === 'en';

  document.documentElement.lang = currentLang;
  document.documentElement.dir  = isEn ? 'ltr' : 'rtl';
  document.body.classList.toggle('ltr', isEn);

  document.querySelector('.btn-lang').textContent = isEn ? 'ع' : 'EN';

  document.querySelectorAll('[data-ar][data-en]').forEach(el => {
    el.textContent = el.dataset[currentLang];
  });
}

// ─── Navbar Scroll ────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── Mobile Nav ───────────────────────────────────────────────
function toggleMobileNav() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ─── Download Info ────────────────────────────────────────────
function showDownloadInfo(e) {
  e.preventDefault();
  const info = document.getElementById('downloadInfo');
  info.classList.toggle('show');
}

// ─── Reveal on Scroll ─────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ─── Particle Canvas ─────────────────────────────────────────
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');

let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });

function randomRange(min, max) { return Math.random() * (max - min) + min; }

function createParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    vx: randomRange(-0.3, 0.3),
    vy: randomRange(-0.3, 0.3),
    r: randomRange(0.5, 2),
    alpha: randomRange(0.1, 0.5),
    color: Math.random() > 0.5 ? '99,102,241' : '201,162,39'
  };
}

for (let i = 0; i < 80; i++) {
  particles.push(createParticle());
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;
    if (p.y < -10) p.y = H + 10;
    if (p.y > H + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
    ctx.fill();
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

drawParticles();

// ─── Smooth Active Nav ────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--primary-l)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── AI Chat Typing Demo ──────────────────────────────────────
const typingMsg = document.querySelector('.msg.typing');
let typingVisible = false;

if (typingMsg) {
  setInterval(() => {
    typingVisible = !typingVisible;
    typingMsg.style.display = typingVisible ? 'flex' : 'none';
    if (!typingVisible) {
      const chatMessages = typingMsg.parentElement;
      const codeReply = document.createElement('div');
      codeReply.className = 'msg msg-ai';
      codeReply.innerHTML = `
        <strong>مثال في Python — O(n²)</strong>:<br/>
        <code style="display:block;background:rgba(0,0,0,0.3);padding:10px;border-radius:6px;margin-top:8px;font-family:monospace;font-size:0.8em">
def bubble_sort(arr):<br/>
&nbsp;&nbsp;for i in range(len(arr)):<br/>
&nbsp;&nbsp;&nbsp;&nbsp;for j in range(len(arr)-1):<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if arr[j] > arr[j+1]:<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;arr[j], arr[j+1] = arr[j+1], arr[j]
        </code>`;
      chatMessages.appendChild(codeReply);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      setTimeout(() => {
        codeReply.remove();
        typingVisible = true;
        typingMsg.style.display = 'flex';
      }, 4000);
    }
  }, 5000);
}

// ─── Close mobile menu on outside click ──────────────────────
document.addEventListener('click', (e) => {
  const menu   = document.getElementById('mobileMenu');
  const toggle = document.querySelector('.nav-toggle');
  if (!menu.contains(e.target) && !toggle.contains(e.target)) {
    menu.classList.remove('open');
  }
});
