/* Ikenna Udeani · portfolio interactions. No dependencies. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const TAU = Math.PI * 2;

  const EMAIL = 'ikennaudeani@gmail.com';
  const LINKS = {
    linkedin: 'https://www.linkedin.com/in/ikenna-udeani/',
    github: 'https://github.com/Kenastark',
    medium: 'https://medium.com/@ikennaudeani',
    provenance: 'https://www.provenancel2.com'
  };

  const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
  const darkMQ = matchMedia('(prefers-color-scheme: dark)');
  const hoverMQ = matchMedia('(hover: hover)');
  const reduced = () => reduceMQ.matches;
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hexToRgb(hex) {
    let h = String(hex).trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    if (Number.isNaN(n)) return [128, 128, 128];
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function openExternal(url) { window.open(url, '_blank', 'noopener'); }

  /* ---------------------------------------------------------------- theme */
  const themeBtn = $('#themeToggle');
  const themeListeners = [];
  const theme = () => root.getAttribute('data-theme') || (darkMQ.matches ? 'dark' : 'light');
  function syncThemeUI() {
    if (themeBtn) themeBtn.setAttribute('aria-label', theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeListeners.forEach(fn => fn());
  }
  function toggleTheme() {
    const next = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('iu-theme', next); } catch (e) { /* not persisted */ }
  }
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (darkMQ.addEventListener) darkMQ.addEventListener('change', syncThemeUI);
  new MutationObserver(syncThemeUI).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  syncThemeUI();

  if (!isMac) $$('#modKey, .modkey').forEach(k => { k.textContent = 'Ctrl'; });

  /* ---------------------------------------------------------------- clock */
  const clock = $('#clock');
  if (clock) {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
    const tick = () => { clock.textContent = f.format(new Date()); };
    tick();
    setInterval(tick, 20000);
  }

  /* ---------------------------------------------------------------- nav */
  const nav = $('.nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = $$('.nav__links a');
  const linkFor = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  linkFor.set('toolkit', linkFor.get('log'));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const a = linkFor.get(e.target.id);
        navLinks.forEach(l => l.removeAttribute('aria-current'));
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['work', 'log', 'toolkit', 'writing', 'venture', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  function go(id) {
    const el = id === 'top' ? document.body : document.getElementById(id);
    if (!el) return;
    if (id === 'top') window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    const target = id === 'top' ? $('.brand') : (el.querySelector('[tabindex="-1"]') || el);
    setTimeout(() => target && target.focus({ preventScroll: true }), reduced() ? 0 : 450);
    try { history.replaceState(null, '', id === 'top' ? location.pathname : '#' + id); } catch (e) { /* sandboxed */ }
  }

  /* ---------------------------------------------------------------- toast & email */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add('is-on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-on');
      setTimeout(() => { toastEl.hidden = true; }, 300);
    }, 2000);
  }
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast('Email address copied');
    } catch (e) {
      const el = $('.email');
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
      toast(isMac ? 'Address selected. Press ⌘C to copy.' : 'Address selected. Press Ctrl+C to copy.');
    }
  }
  const copyBtn = $('#copyEmail');
  if (copyBtn) copyBtn.addEventListener('click', copyEmail);

  /* ---------------------------------------------------------------- CV link */
  const cv = $('#cvLink');
  function cvFallback() {
    if (!cv) return;
    cv.href = LINKS.linkedin;
    cv.textContent = 'CV on LinkedIn';
    cv.target = '_blank';
    cv.rel = 'noopener';
  }
  if (cv) {
    if (/^https?:$/.test(location.protocol)) {
      fetch(cv.getAttribute('href'), { method: 'HEAD', cache: 'no-store' })
        .then(r => {
          const type = r.headers.get('content-type') || '';
          if (!r.ok || !/pdf|octet-stream/i.test(type)) cvFallback();
        })
        .catch(cvFallback);
    } else {
      cvFallback();
    }
  }

  /* ---------------------------------------------------------------- waitlist */
  const form = $('#waitlist');
  if (form) {
    const input = $('#wl-email', form), btn = $('#wl-btn', form), status = $('#wl-status', form);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!input.checkValidity()) {
        status.textContent = 'That address looks incomplete. Try the form name@company.com.';
        input.focus();
        return;
      }
      const email = input.value.trim();
      btn.disabled = true;
      status.textContent = 'Adding you to the list…';
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!res.ok) throw new Error(String(res.status));
        form.classList.add('is-done');
        status.textContent = 'You’re on the list. One email at launch.';
        input.value = '';
      } catch (err) {
        status.textContent = '';
        const a = document.createElement('a');
        a.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Launch list') + '&body=' + encodeURIComponent('Please add ' + email + ' to the launch list.');
        a.textContent = 'email me instead';
        status.append('The list isn’t reachable from here. You can ', a, '.');
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------------------------------------------------------------- spotlight on cards */
  $$('.case').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------------------------------------------------------------- redacted venture lines */
  const red = $('#redacted');
  if (red) {
    const bars = $$('.redacted__bar', red);
    const G = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*<>/';
    let busy = false;
    const scramble = () => {
      if (busy || reduced()) return;
      busy = true;
      let frame = 0;
      const id = setInterval(() => {
        frame++;
        bars.forEach(b => {
          const n = +b.dataset.len || 8;
          let s = '';
          for (let i = 0; i < n; i++) s += G[Math.random() * G.length | 0];
          b.textContent = s;
          b.classList.add('is-scrambling');
        });
        if (frame > 16) {
          clearInterval(id);
          bars.forEach(b => { b.textContent = ''; b.classList.remove('is-scrambling'); });
          busy = false;
        }
      }, 55);
    };
    red.addEventListener('pointerenter', scramble);
    red.addEventListener('focus', scramble);
    if ('IntersectionObserver' in window) {
      const once = new IntersectionObserver((es, o) => {
        if (es[0].isIntersecting) { setTimeout(scramble, 350); o.disconnect(); }
      }, { threshold: .6 });
      once.observe(red);
    }
  }

  /* ---------------------------------------------------------------- Provenance chart */
  function buildPV() {
    const box = $('#pvChart');
    if (!box) return;
    const svg = $('svg', box);
    const W = 600, H = 260, T = 18, B = 204, N = 180, YMAX = 170;
    const X = i => i / (N - 1) * W;
    const Y = v => B - (v / YMAX) * (B - T);
    const P0 = 50, P1 = 72, F0 = 126, F1 = 142;
    const r = mulberry32(11);
    const pm10 = [], pm25 = [];
    for (let i = 0; i < N; i++) {
      const base = 31 + 7 * Math.sin(i / 9) + 4 * Math.sin(i / 3.1 + 1) + (r() - .5) * 5;
      const plume = 104 * Math.exp(-((i - 61) ** 2) / (2 * 5.5 * 5.5));
      const v10 = base + plume;
      let v25 = base * .56 + plume * .64 + (r() - .5) * 3;
      if (i >= F0 && i <= F1) v25 = v10 * 1.3 + 4 + (r() - .5) * 3;
      pm10.push(v10);
      pm25.push(v25);
    }
    const path = arr => arr.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join('');
    const ve = 'vector-effect="non-scaling-stroke"';
    let s = '';
    [50, 100, 150].forEach(v => { s += `<line class="pv__grid" x1="0" x2="${W}" y1="${Y(v)}" y2="${Y(v)}" ${ve}/>`; });
    s += `<line class="pv__grid" x1="0" x2="${W}" y1="${B}" y2="${B}" ${ve}/>`;
    s += `<rect class="pv__band--ok" x="${X(P0)}" y="${T}" width="${X(P1) - X(P0)}" height="${B - T}"/>`;
    s += `<rect class="pv__band--bad" x="${X(F0)}" y="${T}" width="${X(F1) - X(F0)}" height="${B - T}"/>`;
    [P0, P1].forEach(i => { s += `<line class="pv__edge--ok" x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${B}" ${ve}/>`; });
    [F0, F1].forEach(i => { s += `<line class="pv__edge--bad" x1="${X(i)}" x2="${X(i)}" y1="${T}" y2="${B}" ${ve}/>`; });
    s += `<path class="pv__pm10" d="${path(pm10)}" ${ve}/>`;
    s += `<path class="pv__pm25" d="${path(pm25)}" ${ve}/>`;
    const cells = 60, cw = W / cells, ty = 228, th = 12;
    for (let c = 0; c < cells; c++) {
      const i0 = c * 3, i1 = i0 + 2;
      let cls = 'pv__cell';
      if (i1 >= P0 && i0 <= P1) cls += ' pv__cell--ok';
      if (i1 >= F0 && i0 <= F1) cls += ' pv__cell--bad';
      s += `<rect class="${cls}" x="${(c * cw + .7).toFixed(1)}" y="${ty}" width="${(cw - 1.4).toFixed(1)}" height="${th}"/>`;
    }
    svg.innerHTML = s;

    const pct = (v, t) => (v / t * 100).toFixed(2) + '%';
    const label = (cls, text, left, top) => {
      const el = document.createElement('span');
      el.className = 'mono ' + cls;
      el.setAttribute('aria-hidden', 'true');
      el.textContent = text;
      if (left != null) el.style.left = left;
      if (top != null) el.style.top = top;
      box.append(el);
    };
    [50, 100, 150].forEach(v => label('pv__y', String(v), null, pct(Y(v), H)));
    label('pv__tag pv__tag--ok', 'R22 · plume corroborated', pct(X(61), W), pct(T, H));
    label('pv__tag pv__tag--bad', 'R09 · PM2.5 > PM10', pct(X(134), W), pct(T, H));
    label('pv__trust', 'trust score', '0', pct(ty, H));
  }

  /* ---------------------------------------------------------------- thesis graph */
  function buildGNN() {
    const host = $('#gnn');
    if (!host) return;
    const L = {
      AK: [1, 1], ME: [11, 1],
      WI: [6, 2], VT: [10, 2], NH: [11, 2],
      WA: [1, 3], ID: [2, 3], MT: [3, 3], ND: [4, 3], MN: [5, 3], IL: [6, 3], MI: [7, 3], NY: [9, 3], MA: [10, 3],
      OR: [1, 4], NV: [2, 4], WY: [3, 4], SD: [4, 4], IA: [5, 4], IN: [6, 4], OH: [7, 4], PA: [8, 4], NJ: [9, 4], CT: [10, 4], RI: [11, 4],
      CA: [1, 5], UT: [2, 5], CO: [3, 5], NE: [4, 5], MO: [5, 5], KY: [6, 5], WV: [7, 5], VA: [8, 5], MD: [9, 5], DE: [10, 5],
      AZ: [2, 6], NM: [3, 6], KS: [4, 6], AR: [5, 6], TN: [6, 6], NC: [7, 6], SC: [8, 6], DC: [9, 6],
      OK: [4, 7], LA: [5, 7], MS: [6, 7], AL: [7, 7], GA: [8, 7],
      HI: [1, 8], TX: [4, 8], FL: [9, 8]
    };
    const SZ = 40, R = 11;
    const ids = Object.keys(L);
    const pos = id => [(L[id][0] - .5) * SZ, (L[id][1] - .5) * SZ];
    const adj = new Map(ids.map(id => [id, []]));
    const edges = [];
    ids.forEach((a, i) => ids.slice(i + 1).forEach(b => {
      const [ca, ra] = L[a], [cb, rb] = L[b];
      if (Math.abs(ca - cb) + Math.abs(ra - rb) === 1) { edges.push([a, b]); adj.get(a).push(b); adj.get(b).push(a); }
    }));
    const arcs = [['CA', 'NY'], ['IL', 'TX'], ['NY', 'FL'], ['WA', 'IL'], ['CA', 'TX'], ['AK', 'WA'], ['HI', 'CA'], ['GA', 'IL']];
    arcs.forEach(([a, b]) => { adj.get(a).push(b); adj.get(b).push(a); });

    const r = mulberry32(5);
    const hot = L.NY, hot2 = L.TX;
    const risk = {};
    ids.forEach(id => {
      const [c, rr] = L[id];
      const d1 = (c - hot[0]) ** 2 + (rr - hot[1]) ** 2;
      const d2 = (c - hot2[0]) ** 2 + (rr - hot2[1]) ** 2;
      risk[id] = Math.min(1, .1 + .72 * Math.exp(-d1 / (2 * 1.7 * 1.7)) + .3 * Math.exp(-d2 / (2 * 1.2 * 1.2)) + r() * .07);
    });
    const hop = { NY: 0 };
    const q = ['NY'];
    while (q.length) {
      const a = q.shift();
      adj.get(a).forEach(b => { if (hop[b] == null) { hop[b] = hop[a] + 1; q.push(b); } });
    }

    const mix = p => `color-mix(in srgb, var(--accent) ${Math.round(p)}%, var(--paper-3))`;
    let s = `<svg viewBox="0 0 ${11 * SZ} ${8 * SZ}" xmlns="http://www.w3.org/2000/svg">`;
    edges.forEach(([a, b]) => {
      const [x1, y1] = pos(a), [x2, y2] = pos(b);
      s += `<line class="gnn__edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    });
    arcs.forEach(([a, b]) => {
      const [x1, y1] = pos(a), [x2, y2] = pos(b);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1, k = Math.min(60, len * .22);
      const cx = mx - dy / len * k, cy = my + dx / len * k;
      s += `<path class="gnn__arc" d="M${x1} ${y1} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}"/>`;
    });
    ids.forEach(id => {
      const [x, y] = pos(id);
      const h = hop[id] == null ? 6 : hop[id];
      const p0 = 6 + risk[id] * 70;
      const p1 = 6 + Math.min(1, risk[id] + .5 * Math.exp(-h / 2.1)) * 84;
      s += `<circle class="gnn__node" cx="${x}" cy="${y}" r="${R}" style="--f0:${mix(p0)};--f1:${mix(p1)};--d:${h * 110}ms"/>`;
      const cls = 'gnn__label' + (p0 > 52 ? ' gnn__label--hot' : '') + (p1 > 52 ? ' gnn__label--hot1' : '');
      s += `<text class="${cls}" x="${x}" y="${y + 3}">${id}</text>`;
    });
    const [hx, hy] = pos('NY');
    s += `<circle class="gnn__pulse" cx="${hx}" cy="${hy}" r="${R + 5}"/>`;
    s += '</svg>';
    host.innerHTML = s;

    if (!hoverMQ.matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (e.isIntersecting) setTimeout(() => host.classList.add('is-on'), 300);
          else host.classList.remove('is-on');
        });
      }, { threshold: .5 });
      io.observe(host);
    }
  }

  /* ---------------------------------------------------------------- git log graph */
  function initGitGraph() {
    const wrap = $('.gitlog');
    const body = $('.gitlog__body');
    const svg = $('#gitGraph');
    if (!wrap || !body || !svg) return;
    const narrowMQ = matchMedia('(max-width: 560px)');
    let pending = 0;
    const draw = () => {
      pending = 0;
      const commits = $$('.commit', body);
      if (!commits.length) return;
      const narrow = narrowMQ.matches;
      const lanes = narrow ? [12, 27, 42] : [16, 36, 56];
      const gw = narrow ? 52 : 72;
      const top = body.getBoundingClientRect().top;
      const H = body.clientHeight;
      const pts = commits.map(li => {
        const meta = $('.commit__meta', li) || li;
        const r = meta.getBoundingClientRect();
        const lane = +li.dataset.lane || 0;
        return { x: lanes[lane], y: Math.round(r.top - top + Math.min(r.height, 22) / 2), lane };
      });
      let s = `<path class="g-line g-line--${pts[0].lane} g-dash" d="M${pts[0].x} 0 V${pts[0].y - 9}"/>`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i], q = pts[i + 1];
        if (p.x === q.x) s += `<path class="g-line g-line--${q.lane}" d="M${p.x} ${p.y} V${q.y}"/>`;
        else {
          const my = (p.y + q.y) / 2;
          s += `<path class="g-line g-line--${q.lane}" d="M${p.x} ${p.y} C${p.x} ${my} ${q.x} ${my} ${q.x} ${q.y}"/>`;
        }
      }
      const last = pts[pts.length - 1];
      s += `<path class="g-line g-line--${last.lane} g-dash" d="M${last.x} ${last.y} V${Math.min(H, last.y + 48)}"/>`;
      pts.forEach((p, i) => {
        s += `<circle class="g-node g-node--${p.lane}${i === 0 ? ' g-node--head' : ''}" cx="${p.x}" cy="${p.y}" r="${i === 0 ? 6 : 5}"/>`;
      });
      svg.setAttribute('viewBox', `0 0 ${gw} ${H}`);
      svg.setAttribute('width', gw);
      svg.setAttribute('height', H);
      svg.innerHTML = s;
      wrap.classList.add('is-drawn');
    };
    const schedule = () => { if (!pending) pending = requestAnimationFrame(draw); };
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(body);
    addEventListener('resize', schedule);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    schedule();
  }

  /* ---------------------------------------------------------------- hero simulation */
  function initSim() {
    const stage = $('#stage'), canvas = $('#net');
    if (!stage || !canvas || !canvas.getContext) return null;
    const ctx = canvas.getContext('2d');
    const tip = $('#netTip'), logEl = $('#log'), tallyEl = $('#tally'), reading = $('#reading');
    const readingVal = reading ? $('.reading__val', reading) : null;
    const windArrow = $('#windArrow'), windText = $('#windText');
    const injectBtn = $('#inject'), pauseBtn = $('#pause'), srStatus = $('#simStatus');
    const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    let W = 0, H = 0, DPR = 1, visible = true, paused = false, raf = 0, last = 0;
    let lastInteract = -1e9, lastAuto = 0, lastWindUI = 0;
    const lastTypes = [];
    const tally = { plume: 1, fault: 1 };
    let C = {};
    let hoverS = null;
    let events = [];
    let th = -.3, spd = 4.1;

    const rng = mulberry32(20260922);
    const S = [];
    let guard = 0;
    while (S.length < 18 && guard++ < 8000) {
      const nx = .07 + rng() * .86, ny = .1 + rng() * .8;
      if (S.every(s => Math.hypot(s.nx - nx, (s.ny - ny) * .9) > .15)) {
        const trust = .88 + rng() * .1;
        S.push({ nx, ny, x: 0, y: 0, id: 'S-' + String(S.length + 1).padStart(2, '0'), base: 22 + rng() * 22, ph: rng() * TAU, trust, trust0: trust, glow: 0, state: null, stateUntil: 0 });
      }
    }
    const edges = [];
    const seen = new Set();
    S.forEach((s, i) => {
      S.map((t, j) => ({ j, d: Math.hypot(t.nx - s.nx, t.ny - s.ny) }))
        .filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3)
        .forEach(o => {
          const a = Math.min(i, o.j), b = Math.max(i, o.j), k = a + '-' + b;
          if (!seen.has(k)) { seen.add(k); edges.push([a, b]); }
        });
    });
    const nbrs = S.map(() => []);
    edges.forEach(([a, b]) => { nbrs[a].push(b); nbrs[b].push(a); });

    const now0 = performance.now();
    if (S[10]) { S[10].state = 'ok'; S[10].stateUntil = now0 + 5200; }
    if (S[3]) { S[3].state = 'bad'; S[3].stateUntil = now0 + 7500; S[3].trust = .28; }
    lastAuto = now0 - 2600;

    function readColors() {
      const cs = getComputedStyle(root);
      const g = n => hexToRgb(cs.getPropertyValue(n));
      C = { ink: g('--ink'), muted: g('--muted'), line: g('--line'), line2: g('--line-2'), paper2: g('--paper-2'), accent: g('--accent'), ok: g('--ok-vivid'), bad: g('--bad-vivid') };
    }
    const col = (k, a = 1) => { const c = C[k] || [128, 128, 128]; return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

    let P = [];
    function spawn(p, anywhere) {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      if (!anywhere) {
        const ux = Math.cos(th), uy = Math.sin(th);
        if (Math.abs(ux) > Math.abs(uy)) p.x = ux > 0 ? -4 : W + 4;
        else p.y = uy > 0 ? -4 : H + 4;
      }
      p.trail = [[p.x, p.y]];
      p.age = Math.random() * 40;
      p.life = 110 + Math.random() * 140;
      return p;
    }
    function stepParticle(p, t, dt) {
      const k = spd * .3 * dt;
      const a = th + .38 * Math.sin(p.y * .013 + t * .0003) + .24 * Math.cos(p.x * .011 - t * .0002);
      p.x += Math.cos(a) * k;
      p.y += Math.sin(a) * k;
      p.trail.push([p.x, p.y]);
      if (p.trail.length > 11) p.trail.shift();
      p.age += dt;
      if (p.age > p.life || p.x < -12 || p.x > W + 12 || p.y < -12 || p.y > H + 12) spawn(p, Math.random() < .55);
    }
    function resize() {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const pad = 28;
      S.forEach(s => { s.x = pad + s.nx * (W - 2 * pad); s.y = pad + s.ny * (H - 2 * pad); });
      const n = Math.max(36, Math.min(110, Math.round(W * H / 4800)));
      P = Array.from({ length: n }, () => spawn({}, true));
      if (reduced()) P.forEach(p => { for (let i = 0; i < 10; i++) stepParticle(p, 0, 1); });
      kick(true);
    }

    function windAt(t) {
      th = -.35 + .55 * Math.sin(t / 11000) + .2 * Math.sin(t / 4300);
      spd = 4 + 1.1 * Math.sin(t / 7300 + 1);
      if (t - lastWindUI > 600) {
        lastWindUI = t;
        const deg = th * 180 / Math.PI;
        const from = ((90 + deg) + 180 + 360) % 360;
        if (windText) windText.textContent = `Wind ${Math.round(from)}° · ${spd.toFixed(1)} m/s`;
        if (windArrow) windArrow.style.transform = `rotate(${deg.toFixed(1)}deg)`;
      }
    }

    function setReading(state, value) {
      if (!reading) return;
      reading.dataset.state = state;
      if (readingVal) readingVal.textContent = value;
    }
    function addLog(e) {
      if (!logEl) return;
      const li = document.createElement('li');
      li.className = 'log__row is-new';
      li.dataset.v = 'pending';
      const cells = [timeFmt.format(new Date()), S[e.i].id, e.value + ' µg/m³', `checking ${e.cands.length} downwind…`];
      cells.forEach((t, k) => { const sp = document.createElement('span'); sp.textContent = t; if (k === 3) sp.className = 'log__verdict'; li.append(sp); });
      logEl.prepend(li);
      while (logEl.children.length > 3) logEl.lastElementChild.remove();
      e.li = li;
    }
    function updateTally() {
      if (tallyEl) tallyEl.textContent = `${tally.plume} plume${tally.plume === 1 ? '' : 's'} · ${tally.fault} fault${tally.fault === 1 ? '' : 's'}`;
    }

    function pickType() {
      const l = lastTypes.slice(-2);
      let t;
      if (l.length === 2 && l[0] === l[1]) t = l[0] === 'plume' ? 'fault' : 'plume';
      else t = Math.random() < .5 ? 'plume' : 'fault';
      lastTypes.push(t);
      if (lastTypes.length > 4) lastTypes.shift();
      return t;
    }

    function inject(i, user) {
      const s = S[i];
      if (!s || !W) return;
      const now = performance.now();
      if (user) lastInteract = now;
      const type = pickType();
      const wx = Math.cos(th), wy = Math.sin(th);
      const pool = new Set();
      nbrs[i].forEach(j => { pool.add(j); nbrs[j].forEach(k => { if (k !== i) pool.add(k); }); });
      const all = [...pool].map(j => {
        const dx = S[j].x - s.x, dy = S[j].y - s.y, d = Math.hypot(dx, dy) || 1;
        return { j, d, al: (dx * wx + dy * wy) / d };
      });
      let down = all.filter(c => c.al > .4 && c.d < Math.max(W, H) * .55).sort((a, b) => a.d - b.d).slice(0, 3);
      if (down.length < 2) down = all.sort((a, b) => b.al - a.al).slice(0, 2);
      const R = reduced();
      const maxD = Math.max(1, ...down.map(c => c.d));
      down.forEach((c, idx) => {
        c.corr = type === 'plume' ? !(down.length === 3 && idx === 2 && Math.random() < .3) : false;
        c.delay = R ? 0 : (type === 'plume' ? 260 + c.d * 5.2 : c.d / .12);
      });
      const verdictAt = R ? 30 : Math.max(1300, type === 'plume'
        ? Math.max(...down.map(c => c.delay)) + 520
        : (maxD + 16) / .12 + 260);
      const e = { i, type, t0: now, value: Math.round(150 + Math.random() * 90), cands: down, maxD, verdictAt, done: false, doneAt: 0, user };
      events.push(e);
      if (events.length > 4) events.shift();
      s.state = null;
      setReading('pending', e.value);
      addLog(e);
      kick(true);
    }
    function injectRandom(user) {
      const busy = new Set(events.filter(e => !e.done).map(e => e.i));
      const lastI = events.length ? events[events.length - 1].i : -1;
      const choices = S.map((_, i) => i).filter(i => !busy.has(i) && i !== lastI);
      if (!choices.length) return;
      inject(choices[Math.random() * choices.length | 0], user);
    }

    function resolve(e, now) {
      e.done = true;
      e.doneAt = now;
      const s = S[e.i];
      const n = e.cands.filter(c => c.corr).length, k = e.cands.length;
      const ok = e.type === 'plume';
      s.state = ok ? 'ok' : 'bad';
      s.stateUntil = now + (ok ? 4200 : 6500);
      s.trust = ok ? Math.min(.99, s.trust0 + .02) : .18 + Math.random() * .2;
      e.cands.forEach(c => { if (c.corr) { S[c.j].state = 'ok'; S[c.j].stateUntil = now + 3200; } });
      tally[ok ? 'plume' : 'fault']++;
      updateTally();
      if (e.li) {
        e.li.dataset.v = ok ? 'ok' : 'bad';
        const v = $('.log__verdict', e.li);
        if (v) v.textContent = ok ? `R22 plume corroborated · ${n}/${k}` : `R17 spatially inconsistent · 0/${k}`;
      }
      if (events[events.length - 1] === e) setReading(ok ? 'ok' : 'bad', e.value);
      if (e.user && srStatus) {
        srStatus.textContent = `${s.id} read ${e.value} micrograms per cubic metre. ` +
          (ok ? `Plume: ${n} of ${k} downwind stations corroborate it.` : `Sensor fault: none of ${k} downwind stations corroborate it.`);
      }
    }

    function update(now, dt) {
      windAt(now);
      if (!paused && !reduced()) P.forEach(p => stepParticle(p, now, dt));
      events.forEach(e => { if (!e.done && now - e.t0 >= e.verdictAt) resolve(e, now); });
      events = events.filter(e => !(e.done && now - e.doneAt > 2600));
      const decay = Math.pow(.9, dt);
      S.forEach(s => {
        if (s.state && now > s.stateUntil) s.state = null;
        if (s.trust < s.trust0 && !s.state) s.trust = Math.min(s.trust0, s.trust + .0012 * dt);
        s.glow *= decay;
      });
      if (!paused && !reduced() && visible && now - lastInteract > 6000 && now - lastAuto > 3600 && !events.some(e => !e.done)) {
        lastAuto = now;
        injectRandom(false);
      }
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
    }

    function drawEvent(e, now) {
      const s = S[e.i];
      const age = Math.max(0, now - e.t0);
      const fade = e.done ? Math.max(0, 1 - (now - e.doneAt) / 2400) : 1;
      const R = reduced();
      const wx = Math.cos(th), wy = Math.sin(th);
      if (!e.done) s.glow = 1;

      if (!R) {
        if (!e.done) {
          for (let k = 0; k < 2; k++) {
            const p = ((age / 1100) + k * .5) % 1;
            ctx.strokeStyle = col('accent', (1 - p) * .55);
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 9 + p * 36, 0, TAU);
            ctx.stroke();
          }
        }
        if (e.type === 'plume') {
          const travel = Math.min(age, e.verdictAt + 1400) * .06;
          const cx = s.x + wx * travel, cy = s.y + wy * travel;
          const rad = 16 + Math.min(age, 2600) * .014;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(th);
          ctx.scale(2.1, 1);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
          g.addColorStop(0, col('accent', .26 * fade));
          g.addColorStop(1, col('accent', 0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, TAU);
          ctx.fill();
          ctx.restore();
        } else if (!e.done) {
          const rad = Math.min(age * .12, e.maxD + 16);
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = col('muted', .7);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, rad, 0, TAU);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      e.cands.forEach(c => {
        if (age < c.delay) return;
        const t = S[c.j];
        if (c.corr) {
          ctx.strokeStyle = col(e.done ? 'ok' : 'accent', .9 * fade);
          ctx.lineWidth = 1.7;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke();
          t.glow = Math.max(t.glow, .85 * fade);
        } else {
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = col('line2', .9 * fade);
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = col('muted', .9 * fade);
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(t.x - 5, t.y - 17); ctx.lineTo(t.x + 5, t.y - 17); ctx.stroke();
        }
      });

      const key = !e.done ? 'accent' : (e.type === 'plume' ? 'ok' : 'bad');
      const txt = e.value + ' µg/m³';
      ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
      const tw = ctx.measureText(txt).width;
      let lx = s.x + 14, ly = s.y + 9;
      if (lx + tw + 12 > W) lx = s.x - 14 - tw - 10;
      if (ly + 20 > H) ly = s.y - 30;
      ctx.fillStyle = col('paper2', .96 * fade);
      roundRect(lx, ly, tw + 10, 19, 3);
      ctx.fill();
      ctx.strokeStyle = col(key, fade);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = col(key, fade);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(txt, lx + 5, ly + 10);
    }

    function drawNode(s) {
      const hover = s === hoverS;
      if (s.glow > .02) {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 28);
        g.addColorStop(0, col('accent', .32 * s.glow));
        g.addColorStop(1, col('accent', 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(s.x, s.y, 28, 0, TAU); ctx.fill();
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = col('line', 1);
      ctx.beginPath(); ctx.arc(s.x, s.y, 10, 0, TAU); ctx.stroke();
      ctx.strokeStyle = s.trust < .5 ? col('bad', .95) : col('muted', .85);
      ctx.beginPath(); ctx.arc(s.x, s.y, 10, -Math.PI / 2, -Math.PI / 2 + TAU * s.trust); ctx.stroke();

      ctx.fillStyle = s.glow > .45 ? col('accent', 1) : col('paper2', 1);
      ctx.strokeStyle = col('ink', 1);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, hover ? 5.6 : 4.3, 0, TAU); ctx.fill(); ctx.stroke();

      if (s.state === 'ok') {
        ctx.strokeStyle = col('ok', 1);
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(s.x, s.y, 15.5, 0, TAU); ctx.stroke();
      } else if (s.state === 'bad') {
        ctx.strokeStyle = col('bad', 1);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - 17); ctx.lineTo(s.x + 17, s.y); ctx.lineTo(s.x, s.y + 17); ctx.lineTo(s.x - 17, s.y);
        ctx.closePath(); ctx.stroke();
      }
      ctx.font = '500 10px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle';
      const strong = hover || s.state;
      ctx.fillStyle = strong ? col('ink', 1) : col('muted', .85);
      if (s.x > W - 56) { ctx.textAlign = 'right'; ctx.fillText(s.id, s.x - 14, s.y - 13); }
      else { ctx.textAlign = 'left'; ctx.fillText(s.id, s.x + 14, s.y - 13); }
      ctx.textAlign = 'left';
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      const wx = Math.cos(th), wy = Math.sin(th);
      ctx.lineWidth = 1;
      edges.forEach(([a, b]) => {
        const A = S[a], B = S[b];
        const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
        const al = Math.abs((dx * wx + dy * wy) / d);
        ctx.strokeStyle = col('line2', .28 + .6 * al * al);
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      });
      P.forEach(p => {
        if (p.trail.length < 2) return;
        const a = Math.sin(Math.PI * Math.min(1, p.age / p.life)) * .5;
        ctx.strokeStyle = col('muted', a);
        ctx.beginPath();
        ctx.moveTo(p.trail[0][0], p.trail[0][1]);
        for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i][0], p.trail[i][1]);
        ctx.stroke();
      });
      events.forEach(e => drawEvent(e, now));
      S.forEach(drawNode);
    }

    function loop(now) {
      raf = 0;
      const dt = last ? Math.min(3, (now - last) / 16.67) : 1;
      last = now;
      update(now, dt);
      draw(now);
      const busy = (!paused && !reduced()) || events.length > 0 || S.some(s => s.glow > .02);
      if (busy && visible && !document.hidden) raf = requestAnimationFrame(loop);
      else last = 0;
    }
    function kick(force) {
      if (raf) return;
      if (!visible && !force) return;
      raf = requestAnimationFrame(loop);
    }

    function hit(px, py, maxD) {
      let best = null, bd = maxD;
      S.forEach(s => { const d = Math.hypot(s.x - px, s.y - py); if (d < bd) { bd = d; best = s; } });
      return best;
    }
    canvas.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const r = canvas.getBoundingClientRect();
      const s = hit(e.clientX - r.left, e.clientY - r.top, 26);
      if (s !== hoverS) { hoverS = s; stage.classList.toggle('is-hot', !!s); kick(); }
      if (s && tip) {
        const v = Math.round(s.base + 3 * Math.sin(performance.now() * .0006 + s.ph));
        tip.textContent = `${s.id} · PM10 ${v} µg/m³ · trust ${s.trust.toFixed(2)}`;
        tip.style.left = Math.max(92, Math.min(W - 92, s.x)) + 'px';
        tip.style.top = s.y + 'px';
        tip.style.transform = s.y < 56 ? 'translate(-50%, 22px)' : '';
        tip.hidden = false;
      } else if (tip) tip.hidden = true;
    });
    canvas.addEventListener('pointerleave', () => {
      hoverS = null;
      if (tip) tip.hidden = true;
      stage.classList.remove('is-hot');
      kick();
    });
    canvas.addEventListener('click', e => {
      const r = canvas.getBoundingClientRect();
      const s = hit(e.clientX - r.left, e.clientY - r.top, Infinity);
      if (s) inject(S.indexOf(s), true);
    });
    if (injectBtn) injectBtn.addEventListener('click', () => injectRandom(true));
    if (pauseBtn) pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      if (!paused) lastInteract = -1e9;
      kick(true);
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }, { threshold: .05 }).observe(stage);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
    themeListeners.push(() => { readColors(); kick(true); });
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', () => kick(true));

    readColors();
    if (reduced()) setReading('ok', 176);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    else addEventListener('resize', resize);
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => kick(true));

    return { injectRandom: () => injectRandom(true) };
  }

  /* ---------------------------------------------------------------- command palette */
  const sim = initSim();
  const dlg = $('#palette'), pInput = $('#paletteInput'), pList = $('#paletteList');
  let items = [], sel = 0, returnFocus = null;

  const commands = () => [
    { label: 'Go to Work', hint: '#work', kw: 'projects case studies provenance linkwork thesis portfolio', run: () => go('work') },
    { label: 'Go to Experience', hint: '#log', kw: 'career cv jobs history chai', run: () => go('log') },
    { label: 'Go to Toolkit', hint: '#toolkit', kw: 'skills stack tools certifications languages', run: () => go('toolkit') },
    { label: 'Go to Writing', hint: '#writing', kw: 'articles publications essays blog papers', run: () => go('writing') },
    { label: 'Go to Venture', hint: '#venture', kw: 'company startup stealth founder', run: () => go('venture') },
    { label: 'Go to Contact', hint: '#contact', kw: 'email hire reach', run: () => go('contact') },
    { label: 'Copy email address', hint: EMAIL, kw: 'mail contact clipboard', run: copyEmail },
    { label: 'Write an email', hint: 'mailto', kw: 'mail contact message', run: () => { location.href = 'mailto:' + EMAIL; } },
    { label: 'Download CV', hint: 'PDF', kw: 'resume curriculum vitae', run: () => { if (cv) cv.click(); } },
    { label: 'Open Provenance', hint: 'provenancel2.com', kw: 'live dashboard sensor project', run: () => openExternal(LINKS.provenance) },
    { label: 'Open GitHub', hint: 'Kenastark', kw: 'code source repositories', run: () => openExternal(LINKS.github) },
    { label: 'Open LinkedIn', hint: 'ikenna-udeani', kw: 'profile network', run: () => openExternal(LINKS.linkedin) },
    { label: 'Open Medium', hint: '@ikennaudeani', kw: 'blog writing', run: () => openExternal(LINKS.medium) },
    { label: 'Inject a spike', hint: 'Hero demo', kw: 'play sensor plume fault simulation', run: () => { go('top'); if (sim) setTimeout(sim.injectRandom, reduced() ? 0 : 400); } },
    { label: theme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', hint: 'Theme', kw: 'dark light mode colour color', run: toggleTheme },
    { label: 'Back to top', hint: '#top', kw: 'home start', run: () => go('top') }
  ];

  function renderPalette() {
    const q = pInput.value.trim().toLowerCase();
    items = commands().filter(c => !q || (c.label + ' ' + c.kw + ' ' + c.hint).toLowerCase().includes(q));
    sel = 0;
    pList.textContent = '';
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'palette__empty';
      li.textContent = 'No matches. Try “email”, “work” or “theme”.';
      pList.append(li);
      pInput.removeAttribute('aria-activedescendant');
      return;
    }
    items.forEach((c, i) => {
      const li = document.createElement('li');
      li.className = 'palette__item';
      li.id = 'cmd-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', i === sel ? 'true' : 'false');
      const a = document.createElement('span');
      a.textContent = c.label;
      const b = document.createElement('span');
      b.className = 'palette__hint';
      b.textContent = c.hint;
      li.append(a, b);
      li.addEventListener('mousemove', () => { if (sel !== i) setSel(i); });
      li.addEventListener('click', () => choose(i));
      pList.append(li);
    });
    pInput.setAttribute('aria-activedescendant', 'cmd-0');
  }
  function setSel(i) {
    sel = i;
    $$('.palette__item', pList).forEach((li, j) => li.setAttribute('aria-selected', j === i ? 'true' : 'false'));
    pInput.setAttribute('aria-activedescendant', 'cmd-' + i);
    const el = document.getElementById('cmd-' + i);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() {
    if (!dlg || dlg.open) return;
    returnFocus = document.activeElement;
    pInput.value = '';
    renderPalette();
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
    pInput.focus();
  }
  function closePalette(restore) {
    if (!dlg || !dlg.open) return;
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
    if (restore && returnFocus && returnFocus.focus) returnFocus.focus();
  }
  function choose(i) {
    const c = items[i];
    if (!c) return;
    closePalette(false);
    setTimeout(c.run, 10);
  }
  if (dlg && pInput && pList) {
    pInput.addEventListener('input', renderPalette);
    pInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (items.length) setSel((sel + 1) % items.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (items.length) setSel((sel - 1 + items.length) % items.length); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
    });
    dlg.addEventListener('click', e => { if (e.target === dlg) closePalette(true); });
    dlg.addEventListener('cancel', e => { e.preventDefault(); closePalette(true); });
    const opener = $('#openPalette');
    if (opener) opener.addEventListener('click', openPalette);
    document.addEventListener('keydown', e => {
      const a = document.activeElement;
      const typing = a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dlg.open) closePalette(true); else openPalette();
      } else if (e.key === '/' && !typing && !dlg.open) {
        e.preventDefault();
        openPalette();
      }
    });
  }

  /* ---------------------------------------------------------------- build visuals */
  buildPV();
  buildGNN();
  initGitGraph();
})();
