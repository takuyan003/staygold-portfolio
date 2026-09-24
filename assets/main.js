/* STAYGOLD — interactions. No dependencies. */
(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const wide = matchMedia('(min-width: 900px)');
  const isRich = () => finePointer.matches && wide.matches && !reduce.matches;
  root.classList.toggle('is-rich', isRich());

  /* ---------- JST clock ---------- */
  const clock = $('.clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick(); setInterval(tick, 15000);
  }

  /* ---------- Reveal on view ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv').forEach((el) => revealIO.observe(el));

  /* ---------- Page colour follows the section in view ---------- */
  const themed = $$('[data-bg]');
  const themeIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      root.style.setProperty('--bg', e.target.dataset.bg);
      root.style.setProperty('--fg', e.target.dataset.fg);
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  themed.forEach((el) => themeIO.observe(el));

  /* ---------- Intro: characters light up as you read ---------- */
  const splitEl = $('[data-split]');
  let chars = [];
  if (splitEl && !reduce.matches) {
    const text = splitEl.textContent;
    splitEl.setAttribute('aria-label', text);
    splitEl.textContent = '';
    const frag = document.createDocumentFragment();
    [...text].forEach((c) => {
      const s = document.createElement('span');
      s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
      frag.appendChild(s);
    });
    splitEl.appendChild(frag);
    chars = $$('.ch', splitEl);
  }

  /* ---------- Count-up numbers ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, to = +el.dataset.count, suffix = el.dataset.suffix || '';
      const dur = 1400, t0 = performance.now();
      const step = (t) => {
        const p = clamp((t - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(to * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  if (!reduce.matches) $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Scroll-linked effects (one rAF loop) ---------- */
  const stages = $$('.stage');
  const hero = $('.hero');
  const heroTitle = $('.hero-title');
  const hx = $('.hxa-x');
  const process = $('.process');
  let scrollQueued = false;

  const onScroll = () => {
    const vh = innerHeight;
    const rich = isRich();

    // intro characters
    if (chars.length) {
      const r = splitEl.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const n = Math.floor(p * chars.length);
      for (let i = 0; i < chars.length; i++) chars[i].classList.toggle('on', i < n);
    }

    if (reduce.matches) return;

    // hero drifts away
    if (hero && heroTitle) {
      const y = scrollY;
      if (y < vh * 1.2) {
        const f = clamp(1 - y / (vh * 0.6), 0, 1);
        heroTitle.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
        heroTitle.style.opacity = f;
        hero.style.setProperty('--hf', f);
      }
    }

    // HUMAN × AI rotation + process line
    if (hx) {
      const r = hx.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh * 0.6), 0, 1);
      hx.style.setProperty('--rot', `${(1 - p) * -90}deg`);
    }
    if (process) {
      const r = process.getBoundingClientRect();
      process.style.setProperty('--pp', clamp((vh * 0.85 - r.top) / (r.height + vh * 0.2), 0, 1).toFixed(3));
    }

    // project stages: grow in + inner parallax (desktop only)
    if (!rich) return;
    stages.forEach((st) => {
      const r = st.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const pIn = clamp((vh - r.top) / (vh * 0.75), 0, 1);
      st.style.setProperty('--s', (0.88 + 0.12 * (1 - Math.pow(1 - pIn, 3))).toFixed(4));
      const center = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      $$('[data-depth]', st).forEach((el) => {
        el.style.transform = `translate3d(0, ${center * +el.dataset.depth}px, 0)`;
      });
    });
  };
  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  };
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', () => {
    root.classList.toggle('is-rich', isRich());
    if (!isRich()) stages.forEach((st) => { st.style.removeProperty('--s'); $$('[data-depth]', st).forEach((el) => { el.style.transform = ''; }); });
    queueScroll();
  });
  onScroll();

  /* ---------- Contact: address is built on demand, never written in the page ---------- */
  const dialog = $('.contact-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    const address = () => ['wire04japan', ['gmail', 'com'].join('.')].join('@');
    const subject = encodeURIComponent('ご相談');
    const copyBtn = $('.cd-copy', dialog);
    const close = () => dialog.close();
    $$('[data-contact]').forEach((el) => el.addEventListener('click', (e) => {
      e.preventDefault();
      const a = address();
      $('.cd-mail', dialog).href = `mailto:${a}?subject=${subject}`;
      copyBtn.textContent = 'アドレスをコピー'; copyBtn.classList.remove('is-done');
      root.classList.add('dialog-open');
      dialog.showModal();
    }));
    dialog.addEventListener('close', () => root.classList.remove('dialog-open'));
    $('.cd-close', dialog).addEventListener('click', close);
    dialog.addEventListener('click', (e) => { // backdrop only, not the dialog's own padding
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    });
    copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(address()); }
      catch { // older browsers / non-secure contexts
        const ta = document.createElement('textarea');
        ta.value = address(); ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
        dialog.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      copyBtn.textContent = 'コピーしました'; copyBtn.classList.add('is-done');
    });
  }

  /* ---------- Desktop-only pointer interactions ---------- */
  if (!isRich()) return;

  const cursor = $('.cursor');
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  const preview = $('.preview');
  const previewImg = $('img', preview);
  const heroLines = $$('.hero-line');
  const ctaSection = $('.cta');

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my, px = mx, py = my;
  let running = true;

  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.classList.remove('is-hidden');

    // hero: grid/glow follow + lines drift
    if (hero && e.clientY < hero.getBoundingClientRect().bottom) {
      hero.style.setProperty('--mx', `${(mx / innerWidth) * 100}%`);
      hero.style.setProperty('--my', `${(my / innerHeight) * 100}%`);
      const nx = mx / innerWidth - 0.5, ny = my / innerHeight - 0.5;
      heroLines.forEach((l) => {
        const d = +l.dataset.depth;
        l.style.transform = `translate3d(${nx * d}px, ${ny * d * 0.5}px, 0)`;
      });
    }
    // CTA glow follows
    if (ctaSection) {
      const r = ctaSection.getBoundingClientRect();
      if (my > r.top && my < r.bottom) {
        ctaSection.style.setProperty('--cx', `${mx - r.left}px`);
        ctaSection.style.setProperty('--cy', `${my - r.top}px`);
      }
    }
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));

  // cursor states
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('a, button, [tabindex], [data-cursor]');
    cursor.classList.toggle('is-view', !!(t && t.dataset.cursor === 'view'));
    cursor.classList.toggle('is-link', !!(t && t.dataset.cursor !== 'view'));
  });

  // work index hover preview
  $$('.work-index a').forEach((a) => {
    const src = a.dataset.preview;
    const img = new Image(); img.src = src; // warm cache
    a.addEventListener('pointerenter', () => {
      previewImg.src = src;
      preview.classList.toggle('is-tall', /-420\./.test(src));
      preview.classList.add('is-on');
    });
    a.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
  });

  // magnetic elements
  $$('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.25;
    el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // cursor + preview follow loop (pauses when tab hidden)
  const loop = () => {
    if (!running) return;
    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    px = lerp(px, mx, 0.12); py = lerp(py, my, 0.12);
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    preview.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${preview.classList.contains('is-on') ? 1 : 0.85})`;
    requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });
  requestAnimationFrame(loop);
})();
