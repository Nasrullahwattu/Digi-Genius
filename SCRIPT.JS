/* =========================================================
   Digigenius Academy – Interactions & Effects
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Loader (screen in) ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hide');
    }, 700);
  });

  /* ---------- 2. Typing text in hero ---------- */
  const typedEl = document.getElementById('typed');
  if (typedEl) {
    const words = ['Computer Skills.', 'Amazon & E-commerce.', 'Trading.', 'Artificial Intelligence.', 'Web Development.'];
    let w = 0, c = 0, deleting = false;

    const type = () => {
      const word = words[w];
      typedEl.textContent = word.substring(0, c);
      let delay = deleting ? 45 : 90;

      if (!deleting && c === word.length) {
        delay = 1600;
        deleting = true;
      } else if (deleting && c === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 400;
      }
      c += deleting ? -1 : 1;
      setTimeout(type, delay);
    };

    if (reduceMotion) typedEl.textContent = 'Skills.';
    else setTimeout(type, 1200);
  }

  /* ---------- 3. Scroll reveal (in AND out) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else if (entry.boundingClientRect.top > 0) {
          // element is below the viewport again → reset so it animates in next time
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- 4. Navbar: scrolled state, active link, progress bar ---------- */
  const header = document.getElementById('header');
  const progress = document.getElementById('scrollProgress');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = [...navLinks].map((l) => document.querySelector(l.getAttribute('href')));

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 30);
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    let current = 0;
    sections.forEach((sec, i) => {
      if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.4) current = i;
    });
    navLinks.forEach((l, i) => l.classList.toggle('active', i === current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 5. Particle network background ---------- */
  const bg = document.getElementById('bgCanvas');
  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  if (bg && !reduceMotion) {
    const ctx = bg.getContext('2d');
    let W, H, dpr, particles = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = bg.width = window.innerWidth * dpr;
      H = bg.height = window.innerHeight * dpr;
      bg.style.width = window.innerWidth + 'px';
      bg.style.height = window.innerHeight + 'px';
      const count = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 17000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
        r: (Math.random() * 1.6 + 0.6) * dpr,
        hue: Math.random() > 0.5 ? 255 : 190
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const linkDist = 140 * (window.devicePixelRatio > 1 ? 1.5 : 1);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mx = mouse.x * dpr, my = mouse.y * dpr;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // gentle repel from cursor
        const dx = p.x - mx, dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        const rr = 130 * dpr;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2) || 1;
          const f = (rr - d) / rr;
          p.x += (dx / d) * f * 2.2;
          p.y += (dy / d) * f * 2.2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, 0.85)`;
        ctx.shadowBlur = 10 * dpr;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.9)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const lx = p.x - q.x, ly = p.y - q.y;
          const dist = Math.sqrt(lx * lx + ly * ly);
          if (dist < linkDist * dpr * 0.75) {
            const a = (1 - dist / (linkDist * dpr * 0.75)) * 0.35;
            ctx.strokeStyle = `rgba(139, 123, 255, ${a})`;
            ctx.lineWidth = dpr * 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // connect to cursor
        if (d2 < (200 * dpr) * (200 * dpr)) {
          const a = (1 - Math.sqrt(d2) / (200 * dpr)) * 0.5;
          ctx.strokeStyle = `rgba(34, 211, 238, ${a})`;
          ctx.lineWidth = dpr;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mx, my);
          ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- 6. Futuristic cursor (dot + ring + glowing trail) ---------- */
  if (isFinePointer && !reduceMotion) {
    document.body.classList.add('has-cursor');

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const trail = document.getElementById('trailCanvas');
    const tctx = trail.getContext('2d');
    let tw, th;
    const sparks = [];

    const sizeTrail = () => {
      tw = trail.width = window.innerWidth;
      th = trail.height = window.innerHeight;
    };
    sizeTrail();
    window.addEventListener('resize', sizeTrail);

    let rx = window.innerWidth / 2, ry = window.innerHeight / 2;
    let cx = rx, cy = ry;
    let hue = 190;

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      dot.style.transform = `translate(${cx}px, ${cy}px)`;
      document.body.classList.remove('cursor-hidden');

      // emit glowing sparks
      for (let i = 0; i < 2; i++) {
        hue = (hue + 3) % 360;
        sparks.push({
          x: cx, y: cy,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4,
          life: 1,
          size: Math.random() * 3 + 1.5,
          h: 190 + Math.sin(hue / 20) * 60
        });
      }
    });

    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));
    window.addEventListener('mousedown', () => ring.classList.add('down'));
    window.addEventListener('mouseup', () => ring.classList.remove('down'));

    const hoverables = 'a, button, input, textarea, .course-card, .mentor-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) ring.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) ring.classList.remove('hover');
    });

    const loop = () => {
      // ring follows with smooth lag
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;

      tctx.clearRect(0, 0, tw, th);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy;
        s.life -= 0.035;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        tctx.beginPath();
        tctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        tctx.fillStyle = `hsla(${s.h}, 95%, 65%, ${s.life * 0.8})`;
        tctx.shadowBlur = 14;
        tctx.shadowColor = `hsla(${s.h}, 95%, 60%, 1)`;
        tctx.fill();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- 7. 3D tilt + spotlight on cards ---------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const rotY = ((x / r.width) - 0.5) * 12;
        const rotX = (0.5 - (y / r.height)) * 12;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---------- 8. Magnetic buttons ---------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 9. Click ripple burst ---------- */
  if (!reduceMotion) {
    window.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:fixed; left:${e.clientX}px; top:${e.clientY}px;
        width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%;
        border:2px solid rgba(34,211,238,.9); pointer-events:none; z-index:9997;
        animation: clickRipple .7s ease-out forwards;`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });

    const style = document.createElement('style');
    style.textContent = '@keyframes clickRipple{to{transform:scale(7);opacity:0;}}';
    document.head.appendChild(style);
  }

  /* ---------- 10. Contact form (demo handler) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      status.textContent = '✔ Thank you' + (name ? ', ' + name : '') + '! Your message has been received.';
      form.reset();
      setTimeout(() => { status.textContent = ''; }, 6000);
    });
  }
})();