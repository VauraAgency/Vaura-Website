/* VAURA site script: shared by every page. Each block checks that its elements exist. */
(() => {
  const rm = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- hero video ---------- */
  const v = $('#heroVideo');
  const btn = $('#vtoggle');
  const icon = $('#vicon');
  if (v) {
    const PAUSE = '<rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/>';
    const PLAY = '<path d="M3 1.5v11l9.5-5.5z"/>';
    let userPaused = false;
    const small = Math.min(screen.width, innerWidth) <= 820 || (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType || '')));
    const mp4 = v.canPlayType('video/mp4; codecs="avc1.640028"');
    const size = v.dataset.size || (small ? 720 : 1080);
    v.src = `${v.dataset.base}-${size}.${mp4 ? 'mp4' : 'webm'}`;
    v.muted = true; v.defaultMuted = true;
    const setUI = playing => {
      if (!btn) return;
      icon.innerHTML = playing ? PAUSE : PLAY;
      btn.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
      btn.setAttribute('aria-pressed', String(!playing));
    };
    const tryPlay = () => { v.preload = 'auto'; const p = v.play(); if (p) p.then(() => setUI(true)).catch(() => setUI(false)); };
    if (rm.matches) setUI(false); else tryPlay();
    v.addEventListener('playing', () => { const p = v.previousElementSibling; if (p) p.style.opacity = 0; });
    if (btn) btn.addEventListener('click', () => { if (v.paused) { userPaused = false; tryPlay(); } else { userPaused = true; v.pause(); setUI(false); } });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting) v.pause(); else if (!userPaused && !rm.matches) v.play().catch(() => {}); }).observe(v);
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  if (menuBtn && menu) {
    const setMenu = open => { menu.classList.toggle('visible', open); menuBtn.setAttribute('aria-expanded', String(open)); };
    menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(!menu.classList.contains('visible')); });
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', e => { if (!menu.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); } });
  }

  /* ---------- nav state, call bar, parallax ---------- */
  const nav = $('#nav'), bar = $('#callbar'), floater = $('.floating-logo');
  const layers = $$('[data-depth]');
  const fade = $('[data-fade]');
  let ticking = false;
  const frame = () => {
    const y = scrollY, vh = innerHeight;
    if (nav) nav.classList.toggle('solid', y > 40);
    if (bar) bar.classList.toggle('show', y > vh * .5);
    if (floater) floater.classList.toggle('show', y > vh * .5);
    if (!rm.matches) {
      for (const el of layers) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        const d = parseFloat(el.dataset.depth);
        const off = el.parentElement.classList.contains('hero') ? -r.top * d : (r.top + r.height / 2 - vh / 2) * -d;
        el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
      }
      if (fade) fade.style.opacity = Math.max(0, 1 - y / (vh * .75)).toFixed(3);
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();

  /* ---------- mobile carousel dots (any .snap[data-dots]) ---------- */
  window.vauraDots = track => {
    if (track._dots) return;
    const items = [...track.children];
    const dots = document.createElement('div');
    dots.className = 'dots'; dots.setAttribute('role', 'group'); dots.setAttribute('aria-label', 'Carousel position');
    items.forEach((it, i) => {
      const b = document.createElement('button'); b.type = 'button';
      b.setAttribute('aria-label', `Go to card ${i + 1} of ${items.length}`);
      b.addEventListener('click', () => track.scrollTo({ left: it.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0), behavior: rm.matches ? 'auto' : 'smooth' }));
      dots.appendChild(b);
    });
    track.after(dots); track._dots = dots;
    const mark = () => {
      const x = track.scrollLeft + track.clientWidth * .3;
      let idx = 0; items.forEach((it, i) => { if (it.offsetLeft - track.offsetLeft <= x) idx = i; });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) idx = items.length - 1;
      [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true }); mark();
  };
  $$('[data-dots]').forEach(window.vauraDots);

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
})();
