/*!
 * stage.js · behaviour shared by the stage pages (about / experience / contact)
 *
 *  - sprites borrowed from space-invaders-hero.js, shuffling on the formation's beat
 *  - typewriter: every [data-tw] block types itself out when it scrolls into view
 *      data-speed="human|title|slow|out|fast"   how fast an element's text types
 *      data-pause="ms"                          wait before the element appears
 *      data-run="portrait"                      start a handler when the typing reaches it
 *      data-live                                element is shown but its text isn't typed
 *      data-leaders                             pad dt / .k labels with dot leaders
 *  - SCORE / HI-SCORE (the hi-score is shared with the hero), shootable invaders, a passing UFO
 *  - stage select dropdown in the HUD (Esc opens it), arcade-style link flash, Space/Enter skip the typing
 *  - page bits: dithered portrait, live Boston clock
 *
 * Load after space-invaders-hero.js, both deferred.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // storage can be missing or throw (private mode, blocked site data): everything degrades to session-only
  const storage = (name) => { try { return window[name]; } catch (_) { return null; } };
  const LS = storage('localStorage'), SS = storage('sessionStorage');
  const load = (s, k) => { try { return s ? s.getItem(k) : null; } catch (_) { return null; } };
  const save = (s, k, v) => { try { if (s) s.setItem(k, String(v)); } catch (_) { /* session only */ } };

  /* ───────────── sprites ───────────── */

  const Hero = customElements.get('space-invaders-hero');
  if (Hero && Hero.spriteURL) {
    const set = (name, f = 0) => root.style.setProperty(`--${name}-${f}`, `url(${Hero.spriteURL(name, '#fff', f)})`);
    for (const n of ['squid', 'crab', 'octo']) { set(n, 0); set(n, 1); }
    for (const n of ['ufo', 'mini', 'boom']) set(n);
    root.style.setProperty('--cursor', `url(${Hero.spriteURL('ship')})`);
  }
  if (!reduced) setInterval(() => root.classList.toggle('f1'), 500);

  /* ───────────── score ───────────── */

  const HI_KEY = 'space-invaders-hero:hi', SCORE_KEY = 'stage:score', MAX = 999999;
  let score = Math.min(MAX, parseInt(load(SS, SCORE_KEY), 10) || 0);
  let hi = Math.max(Math.min(MAX, parseInt(load(LS, HI_KEY), 10) || 0), score);
  const drawScore = () => {
    $$('[data-score]').forEach((el) => { el.textContent = score; });
    $$('[data-hi]').forEach((el) => { el.textContent = hi; });
  };
  const addScore = (n) => {
    score = Math.min(MAX, score + n);
    save(SS, SCORE_KEY, score);
    if (score > hi) { hi = score; save(LS, HI_KEY, hi); }
    drawScore();
  };
  drawScore();

  /* ───────────── shootable invaders ───────────── */

  const popPoints = (text, r) => {
    const el = document.createElement('span');
    el.className = 'pts';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    el.style.left = `${r.left + r.width / 2 + scrollX}px`;
    el.style.top = `${r.top + r.height / 2 + scrollY}px`;
    document.body.append(el);
    setTimeout(() => el.remove(), 950);
  };

  // returns false if it was already down
  const burst = (sp, pts) => {
    if (sp.classList.contains('is-hit') || sp.classList.contains('is-gone')) return false;
    addScore(pts);
    popPoints(String(pts), sp.getBoundingClientRect());
    sp.classList.add('is-hit');
    setTimeout(() => sp.classList.replace('is-hit', 'is-gone'), 220);
    return true;
  };

  document.addEventListener('pointerdown', (e) => {
    const sp = e.target.closest && e.target.closest('.sprite[data-pts]');
    if (!sp || !burst(sp, +sp.dataset.pts || 10)) return;
    setTimeout(() => {
      sp.classList.remove('is-gone');
      if (!reduced) sp.animate(
        [{ transform: 'translateY(-24px)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: 'none', opacity: 1 }],
        { duration: 500, easing: 'steps(5, end)' },
      );
    }, 4200);
  });

  // the mystery ship crosses the top of the screen now and then
  const lane = $('.ufo-lane');
  if (lane && !reduced) {
    const ufo = document.createElement('span');
    ufo.className = 'sprite ufo is-gone';
    lane.append(ufo);
    let flight = null;
    const schedule = (sec) => setTimeout(() => (document.hidden ? schedule(5) : fly()), sec * 1000);
    const fly = () => {
      const W = lane.clientWidth, w = ufo.offsetWidth, dir = Math.random() < 0.5 ? 1 : -1;
      ufo.classList.remove('is-hit', 'is-gone');
      flight = ufo.animate(
        [{ transform: `translateX(${dir > 0 ? -w : W}px)` }, { transform: `translateX(${dir > 0 ? W : -w}px)` }],
        { duration: ((W + 2 * w) / 120) * 1000, easing: 'linear' },
      );
      flight.onfinish = () => { flight = null; ufo.classList.add('is-gone'); schedule(rand(24, 42)); };
    };
    ufo.addEventListener('pointerdown', () => {
      if (!flight) return;
      flight.pause();
      flight.onfinish = null;
      burst(ufo, [50, 100, 150, 300][(Math.random() * 4) | 0]);
      setTimeout(() => { flight.cancel(); flight = null; schedule(rand(24, 42)); }, 260);
    });
    schedule(rand(7, 13));
  }

  /* ───────────── navigation ───────────── */

  const go = (a) => {
    if (!a || a.classList.contains('is-chosen')) return;
    a.classList.add('is-chosen');
    setTimeout(() => { location.href = a.href; }, reduced ? 0 : 450);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-nav]');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;  // let new-tab clicks through
    e.preventDefault();
    go(a);
  });

  // coming back via the browser's back button: buttons stop flashing
  addEventListener('pageshow', (e) => { if (e.persisted) $$('.is-chosen').forEach((a) => a.classList.remove('is-chosen')); });

  /* ───────────── stage select dropdown ───────────── */

  const toggle = $('.stage-toggle');
  const menu = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
  if (menu) {
    const items = $$('a', menu);
    const here = items.find((a) => a.getAttribute('aria-current') === 'page');
    const isOpen = () => !menu.hidden;

    // the fighter marks one row at a time, like the home page's menu
    const activate = (a) => {
      items.forEach((l) => l.classList.toggle('is-active', l === a));
      if (a && document.activeElement !== a) a.focus({ preventScroll: true });
    };
    const open = () => {
      if (isOpen()) return;
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      activate(here || items[0]);
    };
    const close = (refocus) => {
      if (!isOpen()) return;
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      items.forEach((l) => l.classList.remove('is-active', 'is-chosen'));
      if (refocus) toggle.focus();
    };

    toggle.addEventListener('click', () => (isOpen() ? close(false) : open()));
    toggle.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); } });

    items.forEach((a) => {
      a.addEventListener('focus', () => activate(a));
      a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(a); });
    });
    // choosing the stage you're already on just closes the menu
    if (here) here.addEventListener('click', (e) => { e.preventDefault(); close(true); });

    menu.addEventListener('keydown', (e) => {
      const i = items.indexOf(document.activeElement);
      const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (step) {
        e.preventDefault();
        activate(items[(Math.max(i, 0) + step + items.length) % items.length]);
      } else if (e.key === ' ' && i >= 0) {
        e.preventDefault();
        items[i].click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    });

    // clicking or tabbing anywhere else closes it
    document.addEventListener('pointerdown', (e) => { if (isOpen() && !e.target.closest('.stage-nav')) close(false); });
    document.addEventListener('focusin', (e) => { if (isOpen() && !e.target.closest('.stage-nav')) close(false); });

    // Esc anywhere opens stage select, like pausing a game, and closes it again
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      if (isOpen()) close(true);
      else open();
    });

    addEventListener('pageshow', (e) => { if (e.persisted) close(false); });
  }

  /* ───────────── page bits ───────────── */

  const RUN = {};   // data-run handlers, called when the typing reaches the element

  // about: the 1-bit portrait loads in like an old game, coarse blocks first
  RUN.portrait = (cv) => {
    const P = window.PORTRAIT;
    if (!P || !cv.getContext) return;
    const { w, h } = P;
    cv.width = w;
    cv.height = h;
    const c = cv.getContext('2d');
    const raw = atob(P.bits), px = new Uint8Array(w * h);
    for (let i = 0; i < px.length; i++) px[i] = (raw.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const draw = (b) => {
      c.fillStyle = '#000';
      c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff';
      for (let by = 0, j = 0; by < h; by += b, j++) {
        for (let bx = 0, i = 0; bx < w; bx += b, i++) {
          let on = 0, n = 0;
          for (let y = by; y < Math.min(by + b, h); y++) for (let x = bx; x < Math.min(bx + b, w); x++) { on += px[y * w + x]; n++; }
          // bigger blocks get ordered dithering so every step stays strictly 1-bit
          const t = b === 1 ? 0.5 : (BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16;
          if (on / n > t) c.fillRect(bx, by, b, b);
        }
      }
    };
    if (reduced) return draw(1);
    [10, 5, 2, 1].forEach((b, k) => setTimeout(() => draw(b), k * 260));
  };

  // contact: the time in Boston, ticking
  const clock = $('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', timeZoneName: 'short',
    });
    const awake = $('[data-awake]');
    const tick = () => {
      const p = {};
      for (const part of fmt.formatToParts(new Date())) p[part.type] = part.value;
      clock.textContent = `${p.hour}:${p.minute}:${p.second} ${p.timeZoneName || ''}`.trim();
      if (awake) awake.textContent = +p.hour >= 8 ? 'PROBABLY AWAKE' : 'PROBABLY ASLEEP';
    };
    tick();
    setInterval(tick, 1000);
  }

  // contact: the channel list works like a game menu, the fighter marks the row you're on
  const chans = $$('.channel-link');
  if (chans.length) {
    const mark = (a) => chans.forEach((l) => l.classList.toggle('is-active', l === a));
    chans.forEach((a, i) => {
      a.addEventListener('focus', () => mark(a));
      a.addEventListener('blur', () => mark(null));
      a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') mark(a); });
      a.addEventListener('pointerleave', () => { if (document.activeElement !== a) mark(null); });
      a.addEventListener('keydown', (e) => {
        const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        chans[(i + step + chans.length) % chans.length].focus();
      });
    });
  }

  /* ───────────── typewriter ───────────── */

  // dot leaders for the settings rows: NAME ........ VALUE
  $$('[data-leaders]').forEach((list) => {
    const labels = $$('dt, .k', list);
    const width = Math.max(...labels.map((l) => l.textContent.trim().length)) + 4;
    for (const l of labels) {
      const dots = document.createElement('span');
      dots.className = 'dots';
      dots.setAttribute('aria-hidden', 'true');
      dots.textContent = ' ' + '.'.repeat(width - l.textContent.trim().length - 1);
      l.append(dots);
    }
  });

  const SPEED = {                                  // ms per character
    human: (ch) => (ch === ' ' ? rand(70, 130) : rand(28, 80)),    // someone at a keyboard
    title: () => 85,                               // the attract screen's steady typing
    slow: () => 110,
    out: () => 4,                                  // a computer printing
    fast: () => 2,
  };
  const BEAT = 'p, li, h2, h3, dd, figcaption';   // a short pause after each of these
  const WS = /\s/;

  class Block {
    constructor(el, i) {
      this.el = el;
      this.i = i;
      this.ops = [];
      this.k = 0;
      this.done = false;
      this.inView = false;
      this.build(el, el.dataset.speed || 'out');
      el.classList.add('tw-armed');
      el.setAttribute('aria-busy', 'true');
    }

    // flatten the block into a queue: show this element, type this text, wait this long
    build(node, speed) {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === Node.TEXT_NODE) {
          if (!n.data.trim()) continue;
          const on = document.createTextNode(''), cur = document.createElement('span'), off = document.createElement('span');
          cur.className = 'tw-cur';
          off.className = 'tw-off';
          off.textContent = n.data;
          n.replaceWith(on, cur, off);
          this.ops.push({ kind: 'text', on, cur, off, s: n.data, i: -1, speed });
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          const sp = n.dataset.speed || speed;
          if (n.dataset.pause) this.ops.push({ kind: 'pause', ms: +n.dataset.pause });
          this.ops.push({ kind: 'el', el: n });
          if (!n.hasAttribute('data-live') && !n.matches('canvas, svg, img')) this.build(n, sp);
          if (n.matches('.cmd')) {
            // the command "runs": the cursor sits at the end of the line for a moment
            const cur = document.createElement('span');
            cur.className = 'tw-cur';
            n.append(cur);
            this.ops.push({ kind: 'enter', cur, state: 0 });
          } else if (n.matches(BEAT)) this.ops.push({ kind: 'pause', ms: 60 });
        }
      }
    }

    paint(op) {
      const { s, i } = op;
      op.on.data = s.slice(0, i);
      op.cur.textContent = s.slice(i, i + 1);
      op.off.textContent = s.slice(i + 1);
    }

    // do the next thing; returns ms until the one after, or -1 when the block is finished
    step() {
      while (this.k < this.ops.length) {
        const op = this.ops[this.k];
        if (op.kind === 'el') {
          op.el.classList.add('tw-in');
          const run = op.el.dataset.run;
          if (run && RUN[run]) RUN[run](op.el);
          this.k++;
          continue;
        }
        if (op.kind === 'pause') {
          this.k++;
          return op.ms;
        }
        if (op.kind === 'enter') {
          if (op.state === 0) { op.state = 1; op.cur.textContent = '\u00a0'; return rand(240, 340); }
          op.cur.textContent = '';
          this.k++;
          return 120;
        }
        // text
        const s = op.s;
        if (op.i < 0) {
          op.i = 0;
          this.paint(op);
          if (op.speed === 'human') return rand(220, 340);   // a beat before they start typing
        }
        let i = op.i + 1;
        while (i < s.length && WS.test(s[i - 1]) && WS.test(s[i])) i++;   // a run of whitespace is one keystroke
        op.i = i;
        this.paint(op);
        if (i >= s.length) this.k++;
        return SPEED[op.speed] ? SPEED[op.speed](s[i - 1]) : 4;
      }
      return -1;
    }

    finish() {
      if (this.done) return;
      for (let k = this.k; k < this.ops.length; k++) {
        const op = this.ops[k];
        if (op.kind === 'el') {
          op.el.classList.add('tw-in');
          const run = op.el.dataset.run;
          if (run && RUN[run]) RUN[run](op.el);
        } else if (op.kind === 'text') {
          op.i = op.s.length;
          this.paint(op);
        } else if (op.kind === 'enter') op.cur.textContent = '';
      }
      this.k = this.ops.length;
      this.done = true;
      this.el.classList.add('tw-done');
      this.el.removeAttribute('aria-busy');
    }
  }

  const blockEls = $$('[data-tw]');
  if (reduced || !('IntersectionObserver' in window)) {
    // no typing: everything is simply there
    blockEls.forEach((el) => el.classList.add('tw-armed', 'tw-done'));
    $$('[data-run]').forEach((el) => RUN[el.dataset.run] && RUN[el.dataset.run](el));
  } else if (blockEls.length) {
    const B = blockEls.map((el, i) => new Block(el, i));
    const startAt = performance.now() + 550;      // let the screen power on and the title flash first
    let cur = null, next = 0, at = startAt, raf = 0;

    // the next block to type: the first unfinished one that's on screen right now.
    // Anything before it was scrolled straight past, so it's simply filled in.
    const pick = () => {
      let j = -1;
      for (let i = next; i < B.length; i++) if (!B[i].done && B[i].inView) { j = i; break; }
      if (j < 0) return null;
      for (let i = next; i < j; i++) B[i].finish();
      next = j + 1;
      return B[j];
    };

    const tick = (now) => {
      raf = 0;
      if (now < startAt) { raf = requestAnimationFrame(tick); return; }
      if (at < now - 250) at = now - 250;          // after a background tab, don't machine-gun
      let guard = 0;
      while (now >= at && guard++ < 600) {
        if (!cur) { cur = pick(); if (!cur) break; }
        const d = cur.step();
        if (d < 0) { cur.finish(); cur = null; at += 140; continue; }
        at += d;
      }
      if (cur || B.some((b) => b.inView && !b.done)) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf) return;
      at = Math.max(at, performance.now());
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const b = B[blockEls.indexOf(e.target)];
        b.inView = e.isIntersecting;
      }
      // the block being typed has scrolled away while a later one is on screen: finish it now
      if (cur && !cur.inView && B.some((b) => b.i > cur.i && b.inView)) { cur.finish(); cur = null; }
      wake();
    }, { rootMargin: '0px 0px -6% 0px' });
    B.forEach((b) => io.observe(b.el));

    const skipAll = () => {
      if (B.every((b) => b.done)) return false;
      B.forEach((b) => b.finish());
      cur = null;
      next = B.length;
      return true;
    };
    B.forEach((b) => b.el.addEventListener('click', () => { if (!b.done) skipAll(); }));

    // tabbing into a block that hasn't typed yet: fill in everything up to it
    document.addEventListener('focusin', (e) => {
      const b = B.find((x) => x.el.contains(e.target));
      if (!b || b.done) return;
      for (const x of B) if (x.i <= b.i) x.finish();
      if (cur && cur.done) cur = null;
      next = Math.max(next, b.i + 1);
    });

    document.addEventListener('keydown', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === ' ' || e.key === 'Enter') && !e.target.closest('a, button, input, textarea, select')) {
        if (skipAll()) e.preventDefault();
      }
    });
  }
})();
