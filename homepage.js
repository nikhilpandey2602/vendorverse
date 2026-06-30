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
