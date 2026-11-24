// zContact Official Website: header state, reveal-on-scroll, counters and the
// hero animation of a worldwide network. No network requests, no tracking.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Header ----------
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const toggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------- Reveal on scroll ----------
  const revealIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          revealIo.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll('.reveal').forEach((el) => revealIo.observe(el));

  // ---------- Counters (the page shows the final numbers without JavaScript) ----------
  const countIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        countIo.unobserve(el);
        if (reduceMotion) {
          el.textContent = String(target);
          return;
        }
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min(1, (now - start) / 1400);
          el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 },
  );
  document.querySelectorAll('[data-count]').forEach((el) => countIo.observe(el));

  // ---------- Hero network ----------
  const canvas = document.getElementById('network-canvas');
  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');
  const nodesEl = document.getElementById('netNodes');
  let W = 0;
  let H = 0;

  // Points of a worldwide network (decorative: places, not servers we name).
  const PLACES = [
    [40.7, -74.0], [37.7, -122.4], [43.6, -79.4], [19.4, -99.1], [-23.5, -46.6], [-34.6, -58.4],
    [51.5, -0.1], [48.8, 2.3], [50.85, 4.35], [52.5, 13.4], [59.3, 18.1], [47.4, 8.5],
    [41.0, 28.9], [30.0, 31.2], [6.5, 3.4], [-1.3, 36.8], [-26.2, 28.0], [25.2, 55.3],
    [19.1, 72.9], [28.6, 77.2], [1.35, 103.8], [13.75, 100.5], [-6.2, 106.8], [22.3, 114.2],
    [31.2, 121.5], [37.6, 127.0], [35.7, 139.7], [-33.9, 151.2], [-36.85, 174.75],
  ];
  const REGIONS = [
    { latMin: 15, latMax: 60, lonMin: -128, lonMax: -65, n: 46 },
    { latMin: -55, latMax: 12, lonMin: -80, lonMax: -35, n: 26 },
    { latMin: 36, latMax: 60, lonMin: -9, lonMax: 38, n: 34 },
    { latMin: -34, latMax: 34, lonMin: -17, lonMax: 50, n: 40 },
    { latMin: 6, latMax: 55, lonMin: 44, lonMax: 140, n: 52 },
    { latMin: -39, latMax: -11, lonMin: 113, lonMax: 154, n: 10 },
  ];
  const rand = (a, b) => a + Math.random() * (b - a);
  const project = (lat, lon) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
  let nodes = [];
  let dots = [];
  let links = [];

  function build() {
    nodesEl.textContent = '';
    nodes = PLACES.map(([lat, lon]) => {
      const [x, y] = project(lat, lon);
      const el = document.createElement('div');
      el.className = 'net-node';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      for (const cls of ['pulse p1', 'pulse p2', 'ring']) {
        const s = document.createElement('span');
        s.className = cls;
        el.appendChild(s);
      }
      nodesEl.appendChild(el);
      return { x, y, el, twinkle: Math.random() * Math.PI * 2, timer: 0 };
    });
    dots = [];
    REGIONS.forEach((r) => {
      for (let i = 0; i < r.n; i++) {
        const [x, y] = project(rand(r.latMin, r.latMax), rand(r.lonMin, r.lonMax));
        dots.push({ x, y, o: rand(0.06, 0.22), phase: Math.random() * Math.PI * 2, sp: rand(0.4, 1.1) });
      }
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  window.addEventListener('resize', resize);
  resize();

  function flash(n, ms) {
    n.el.classList.add('active');
    clearTimeout(n.timer);
    n.timer = setTimeout(() => n.el.classList.remove('active'), ms);
  }

  function spawnLink() {
    const a = Math.floor(Math.random() * nodes.length);
    let b = Math.floor(Math.random() * nodes.length);
    while (b === a) b = Math.floor(Math.random() * nodes.length);
    const dur = rand(180, 420);
    links.push({ a: nodes[a], b: nodes[b], start: performance.now(), dur });
    flash(nodes[a], dur + rand(250, 500));
    flash(nodes[b], dur + rand(250, 500));
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(214, 196, 255, ${d.o * (0.6 + 0.4 * Math.sin(now * 0.001 * d.sp + d.phase))})`;
      ctx.fill();
    }
    links = links.filter((l) => now - l.start < l.dur);
    for (const l of links) {
      const t = (now - l.start) / l.dur;
      const alpha = Math.max(0, Math.min(1, t < 0.12 ? t / 0.12 : t > 0.55 ? 1 - (t - 0.55) / 0.2 : 1));
      const g = ctx.createLinearGradient(l.a.x, l.a.y, l.b.x, l.b.y);
      g.addColorStop(0, `rgba(224, 122, 149, ${alpha})`);
      g.addColorStop(0.5, `rgba(168, 69, 200, ${alpha})`);
      g.addColorStop(1, `rgba(108, 92, 231, ${alpha})`);
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(l.b.x, l.b.y);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.3;
      ctx.shadowColor = 'rgba(168, 69, 200, 0.9)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // The message, travelling along the link.
      const p = Math.max(0, Math.min(1, t * 1.2));
      ctx.beginPath();
      ctx.arc(l.a.x + (l.b.x - l.a.x) * p, l.a.y + (l.b.y - l.a.y) * p, 3.2, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(alpha, t < 0.9 ? 0.9 : 0)})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    for (const n of nodes) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.0015 + n.twinkle);
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
      glow.addColorStop(0, `rgba(196, 140, 255, ${0.35 + 0.25 * pulse})`);
      glow.addColorStop(1, 'rgba(196, 140, 255, 0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2 + pulse * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(246, 240, 255, 0.95)';
      ctx.fill();
    }
  }

  if (reduceMotion) {
    draw(0);
    return;
  }
  setInterval(() => nodes.length && flash(nodes[Math.floor(Math.random() * nodes.length)], rand(900, 1700)), 260);
  let lastSpawn = 0;
  const frame = (now) => {
    draw(now);
    if (now - lastSpawn > rand(90, 260) && links.length < 9) {
      spawnLink();
      if (Math.random() < 0.3 && links.length < 9) spawnLink();
      lastSpawn = now;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
