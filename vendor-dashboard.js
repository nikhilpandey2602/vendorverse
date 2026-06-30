/**
 * VendorVerse — Premium Vendor Dashboard
 * Vanilla JS — Revenue chart, date, nav switching
 */
document.addEventListener('DOMContentLoaded', () => {

  /* ═══ DATE ═══ */
  const dateEl = document.getElementById('vd-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* ═══ SIDEBAR NAV ═══ */
  const navLinks = document.querySelectorAll('.vd-sb-link');
  const pageTitle = document.querySelector('.vd-topbar-title');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      if (pageTitle) {
        const text = link.textContent.trim();
        // Remove emoji prefix
        pageTitle.textContent = text.replace(/^.{1,2}\s/, '');
      }
    });
  });

  /* ═══ CHART TABS ═══ */
  const tabs = document.querySelectorAll('.vd-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      drawChart(); // redraw with new "range"
    });
  });

  /* ═══ REVENUE AREA CHART (Canvas) ═══ */
  const canvas = document.getElementById('vd-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // High-DPI support
  function setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 48; // account for panel padding
    canvas.width = w * dpr;
    canvas.height = 260 * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = '260px';
    ctx.scale(dpr, dpr);
    return { w, h: 260 };
  }

  // Generate realistic revenue data
  function generateData(points) {
    const data = [];
    let base = 5000 + Math.random() * 3000;
    for (let i = 0; i < points; i++) {
      base += (Math.random() - 0.4) * 1200;
      if (base < 2000) base = 2000 + Math.random() * 1000;
      if (base > 15000) base = 13000 - Math.random() * 1000;
      data.push(Math.round(base));
    }
    return data;
  }

  let chartData = generateData(30);
  let animProgress = 0;
  let animFrame;

  function drawChart() {
    chartData = generateData(30);
    animProgress = 0;
    cancelAnimationFrame(animFrame);
    animateChart();
  }

  function animateChart() {
    animProgress += 0.025;
    if (animProgress > 1) animProgress = 1;
    renderChart(animProgress);
    if (animProgress < 1) animFrame = requestAnimationFrame(animateChart);
  }

  function renderChart(progress) {
    const { w, h } = setupCanvas();
    ctx.clearRect(0, 0, w, h);

    const pad = { top: 20, bottom: 36, left: 50, right: 16 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const visibleCount = Math.floor(chartData.length * progress);
    if (visibleCount < 2) return;

    const data = chartData.slice(0, visibleCount);
    const max = Math.max(...chartData) * 1.15;
    const min = Math.min(...chartData) * 0.85;
    const range = max - min;

    // Y-axis labels
    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = min + (range / 4) * (4 - i);
      const y = pad.top + (chartH / 4) * i;
      ctx.fillText('₹' + Math.round(val / 1000) + 'K', pad.left - 8, y + 4);
      // Grid line
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    // Build path points
    const pts = data.map((v, i) => ({
      x: pad.left + (chartW / (chartData.length - 1)) * i,
      y: pad.top + chartH - ((v - min) / range) * chartH
    }));

    // Smooth bezier curve
    function bezier(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
        const cp1y = pts[i].y;
        const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
        const cp2y = pts[i + 1].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[i + 1].x, pts[i + 1].y);
      }
    }

    // Area fill
    bezier(pts);
    ctx.lineTo(pts[pts.length - 1].x, pad.top + chartH);
    ctx.lineTo(pts[0].x, pad.top + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, 'rgba(124,58,237,0.3)');
    grad.addColorStop(1, 'rgba(124,58,237,0)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    bezier(pts);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glowing dot at end
    if (pts.length > 0) {
      const last = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#7c3aed';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.2)';
      ctx.fill();
    }

    // X-axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'center';
    ctx.font = '10px Inter, sans-serif';
    const today = new Date();
    for (let i = 0; i < chartData.length; i += 5) {
      const x = pad.left + (chartW / (chartData.length - 1)) * i;
      const d = new Date(today);
      d.setDate(d.getDate() - (chartData.length - 1 - i));
      ctx.fillText(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), x, h - 8);
    }
  }

  // Initial draw
  drawChart();

  // Redraw on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { animProgress = 1; renderChart(1); }, 200);
  });
});
