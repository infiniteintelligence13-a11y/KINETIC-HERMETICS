/* ===== KINETIC HERMETICS — PREMIUM EFFECTS ENGINE ===== */

// ── Scroll Progress Bar ──────────────────────────────────
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Parallax Layers ──────────────────────────────────────
function initParallax() {
  const layers = document.querySelectorAll('[data-parallax]');
  if (!layers.length) return;
  const handler = () => {
    const y = window.scrollY;
    layers.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${y * speed}px)`;
    });
  };
  window.addEventListener('scroll', handler, { passive: true });
}

// ── Scroll Reveal ────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-up').forEach(el => observer.observe(el));
}

// ── 3D Card Tilt ─────────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 18}deg) translateZ(16px)`;
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.background = `radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.12), transparent 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateZ(0)';
    });
  });
}

// ── Counter Animation ────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2200;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    if (current >= target) clearInterval(timer);
  }, duration / steps);
}

function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

// ── Floating Particles ───────────────────────────────────
function initParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    const isGold = Math.random() > 0.4;
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      width:${1.5 + Math.random()*3}px; height:${1.5 + Math.random()*3}px;
      background:${isGold ? 'rgba(201,168,76,' : 'rgba(168,85,247,'}${0.3 + Math.random()*0.5});
      animation-delay:${Math.random()*6}s;
      animation-duration:${4 + Math.random()*6}s;
    `;
    container.appendChild(p);
  }
}

// ── Magnetic Buttons ─────────────────────────────────────
function initMagneticButtons() {
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.3;
      btn.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0) scale(1)';
    });
  });
}

// ── Product Image Slider ──────────────────────────────────
function initProductSliders() {
  document.querySelectorAll('.prod-slider').forEach(slider => {
    const slides = slider.querySelectorAll('.prod-slide-img');
    const dotsWrap = slider.querySelector('.slider-dots');
    if (!slides.length || slides.length < 2) return;
    let current = 0;
    const dots = [];
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.onclick = () => goTo(i);
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });
    function goTo(n) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    setInterval(() => goTo(current + 1), 3500);
  });
}

// ── Navbar scroll effect ─────────────────────────────────
function initNavbarScroll() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('navbar-scrolled');
    } else {
      nav.classList.remove('navbar-scrolled');
    }
  }, { passive: true });
}

// ── Sacred Geometry Rotation ─────────────────────────────
function initSacredGeo() {
  document.querySelectorAll('.geo-slow').forEach((el, i) => {
    el.style.animationDuration = (20 + i * 8) + 's';
    el.style.animationDelay = (i * 2) + 's';
  });
}

// ── Stagger children reveal ──────────────────────────────
function initStagger() {
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = parent.children;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          Array.from(children).forEach((child, i) => {
            setTimeout(() => child.classList.add('stagger-visible'), i * 120);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(parent);
  });
}

// ── Smooth hover energy rings ────────────────────────────
function initEnergyRings() {
  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ring = document.createElement('span');
      ring.className = 'click-ring';
      ring.style.left = (e.offsetX) + 'px';
      ring.style.top  = (e.offsetY) + 'px';
      this.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
    });
  });
}

// ── Init All ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initParallax();
  initScrollReveal();
  initTilt();
  initCounters();
  initMagneticButtons();
  initProductSliders();
  initNavbarScroll();
  initSacredGeo();
  initStagger();
  initEnergyRings();
  initParticles('hero-particles');
  initParticles('ceremony-particles');
});
