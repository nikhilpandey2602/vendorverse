/**
 * VendorVerse Cinematic Homepage Animations
 * GSAP + ScrollTrigger powered — Deep Space Aurora Hero + Slides 2 & 3
 */
document.addEventListener('DOMContentLoaded', () => {

  /* ═══ NAVBAR SCROLL SOLID ═══ */
  const navHeader = document.getElementById('header');
  if (navHeader) {
    window.addEventListener('scroll', () => {
      navHeader.classList.toggle('nav-solid', window.scrollY > 50);
    }, { passive: true });
  }

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ═══════════════════════════════════════════
     HERO SLIDER SYSTEM (vanilla JS)
     ═══════════════════════════════════════════ */
  const dsaSlides = document.querySelectorAll('.dsa-slide');
  const dsaDots = document.querySelectorAll('.dsa-dot');
  const dsaGlitch = document.getElementById('dsa-glitch');
  let dsaIdx = 0, dsaTimer;

  function resetSlideAnimations(slide) {
    // Force re-trigger CSS animations by removing/re-adding active class elements
    const animEls = slide.querySelectorAll('.s2-headline,.s2-bottom-left,.s2-cta,.s3-brand,.s3-subtitle,.s3-stats,.s3-bottom-left');
    animEls.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // force reflow
      el.style.animation = '';
    });
  }

  function countUpSlide3() {
    const slide3 = document.querySelector('.dsa-slide-3');
    if (!slide3) return;
    const vals = slide3.querySelectorAll('.s3-stat-val');
    vals.forEach(el => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      el.textContent = prefix + '0';
      let start = performance.now();
      const dur = 1500; // 1.5s
      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.ceil(eased * target);
        el.textContent = prefix + current + (progress >= 1 ? suffix : '');
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + target + suffix;
      }
      requestAnimationFrame(tick);
    });
  }

  function goSlide(idx) {
    if (idx === dsaIdx && dsaSlides[idx]?.classList.contains('active')) return;
    // Glitch flash
    if (dsaGlitch) {
      dsaGlitch.classList.add('flash');
      setTimeout(() => dsaGlitch.classList.remove('flash'), 350);
    }
    dsaSlides.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });
    dsaDots.forEach((d, i) => d.classList.toggle('active', i === idx));

    // Reset enter animations for the new slide
    resetSlideAnimations(dsaSlides[idx]);

    // Count-up for Slide 3
    if (idx === 2) setTimeout(countUpSlide3, 200);

    dsaIdx = idx;
  }

  function nextSlide() { goSlide((dsaIdx + 1) % dsaSlides.length); }
  function startAuto() { dsaTimer = setInterval(nextSlide, 6000); }
  function stopAuto() { clearInterval(dsaTimer); }

  dsaDots.forEach((d, i) => d.addEventListener('click', () => { goSlide(i); stopAuto(); startAuto(); }));
  document.getElementById('dsa-prev')?.addEventListener('click', () => {
    goSlide((dsaIdx - 1 + dsaSlides.length) % dsaSlides.length); stopAuto(); startAuto();
  });
  document.getElementById('dsa-next')?.addEventListener('click', () => { nextSlide(); stopAuto(); startAuto(); });

  if (dsaSlides.length > 0) startAuto();

  /* ═══════════════════════════════════════════
     SCROLL ANIMATIONS
     ═══════════════════════════════════════════ */
  gsap.utils.toArray('.gsap-fade-up').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      opacity: 0, y: 60, duration: 0.9, ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.vv-product-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 88%' },
      opacity: 0, y: 50, scale: 0.95, duration: 0.7, delay: i * 0.08, ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.drop-card').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 90%' },
      opacity: 0, x: i % 2 === 0 ? -40 : 40, duration: 0.8, ease: 'power3.out'
    });
  });

  // Counter animation
  const counters = document.querySelectorAll('.count-up');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = target / 60;
      const update = () => {
        current += step;
        if (current < target) { el.textContent = Math.ceil(current) + suffix; requestAnimationFrame(update); }
        else el.textContent = target + suffix;
      };
      update();
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObs.observe(c));

  /* ═══════════════════════════════════════════
     HERO WORD STAGGER ANIMATION
     ═══════════════════════════════════════════ */
  (function initHeroWordStagger() {
    const headline = document.getElementById('hero-headline');
    if (!headline) return;

    const text = headline.textContent.trim();
    const words = text.split(/\s+/);
    headline.innerHTML = '';

    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'hero-word';
      span.textContent = word;
      span.style.transitionDelay = (i * 60) + 'ms';
      headline.appendChild(span);
      // Add space between words
      if (i < words.length - 1) {
        headline.appendChild(document.createTextNode(' '));
      }
    });

    // Trigger stagger after the parent fade-up finishes (~120ms delay + ~800ms anim)
    setTimeout(() => {
      headline.querySelectorAll('.hero-word').forEach(w => w.classList.add('visible'));
    }, 950);
  })();

  /* ═══════════════════════════════════════════
     STATS BAND — INTERSECTIONOBSERVER + COUNT-UP
     ═══════════════════════════════════════════ */
  (function initStatsBand() {
    const statCards = document.querySelectorAll('.vv-stat-card');
    if (!statCards.length) return;

    function formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
      if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K';
      return num.toString();
    }

    function animateCountUp(el) {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.ceil(eased * target);
        el.textContent = formatNumber(current) + (progress >= 1 ? suffix : '');
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = formatNumber(target) + suffix;
      }
      requestAnimationFrame(tick);
    }

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        card.classList.add('visible');

        const valueEl = card.querySelector('.vv-stat-value');
        if (valueEl) {
          // Small delay so the fade-in plays before counting
          setTimeout(() => animateCountUp(valueEl), 300);
        }
        statsObserver.unobserve(card);
      });
    }, { threshold: 0.2 });

    statCards.forEach(c => statsObserver.observe(c));
  })();

  /* ═══════════════════════════════════════════
     3D TILT EFFECT — PRODUCT CARDS
     ═══════════════════════════════════════════ */
  (function initTiltEffect() {
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cards = document.querySelectorAll('.vv-product-card');
    if (!cards.length) return;

    // Inject shine overlay into each card
    cards.forEach(card => {
      card.style.position = 'relative';
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      card.appendChild(shine);
    });

    if (isTouch) {
      /* ── TOUCH FALLBACK: brief scale-up on tap ── */
      cards.forEach(card => {
        card.addEventListener('touchstart', () => {
          card.classList.add('touch-press');
        }, { passive: true });

        card.addEventListener('touchend', () => {
          setTimeout(() => card.classList.remove('touch-press'), 200);
        }, { passive: true });

        card.addEventListener('touchcancel', () => {
          card.classList.remove('touch-press');
        }, { passive: true });
      });
    } else {
      /* ── DESKTOP: 3D tilt on mousemove ── */
      const MAX_TILT = 8; // degrees

      cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
          card.classList.add('tilt-active');
        });

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Offset from center, normalized to -1..1
          const ratioX = (e.clientX - centerX) / (rect.width / 2);
          const ratioY = (e.clientY - centerY) / (rect.height / 2);

          // rotateY follows X axis, rotateX follows Y axis (inverted)
          const rotateY = ratioX * MAX_TILT;
          const rotateX = -ratioY * MAX_TILT;

          card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

          // Update shine position
          const shineEl = card.querySelector('.tilt-shine');
          if (shineEl) {
            const pctX = ((e.clientX - rect.left) / rect.width) * 100;
            const pctY = ((e.clientY - rect.top) / rect.height) * 100;
            shineEl.style.setProperty('--shine-x', pctX + '%');
            shineEl.style.setProperty('--shine-y', pctY + '%');
          }
        });

        card.addEventListener('mouseleave', () => {
          card.classList.remove('tilt-active');
          card.style.transform = '';
        });
      });
    }
  })();

  /* ═══════════════════════════════════════════
     TESTIMONIAL ROTATOR
     ═══════════════════════════════════════════ */
  const testimonials = document.querySelectorAll('.testi-item');
  let testiIdx = 0;
  function rotateTestimonials() {
    testimonials.forEach((t, i) => t.classList.toggle('active', i === testiIdx));
    testiIdx = (testiIdx + 1) % testimonials.length;
  }
  if (testimonials.length) { rotateTestimonials(); setInterval(rotateTestimonials, 4000); }

  /* ═══════════════════════════════════════════
     PARTICLE CANVAS (global background)
     ═══════════════════════════════════════════ */
  const cvs = document.getElementById('particles-bg');
  if (cvs) {
    const ctx = cvs.getContext('2d');
    let pts = [];
    function resize() { cvs.width = window.innerWidth; cvs.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 60; i++) pts.push({
      x: Math.random() * cvs.width, y: Math.random() * cvs.height,
      r: Math.random() * 1.5 + 0.5, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.4 + 0.1
    });
    function drawParticles() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      pts.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > cvs.width) p.dx *= -1;
        if (p.y < 0 || p.y > cvs.height) p.dy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.o})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }
});
