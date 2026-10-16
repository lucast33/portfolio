/*!
 * space-invaders-hero.js  ·  v1.1
 * A 1-bit, Space Invaders–style hero animation as a drop-in Web Component.
 *
 * Load this file with a deferred script tag (src="space-invaders-hero.js"), then:
 *   <space-invaders-hero name="Lucas Tolman"></space-invaders-hero>
 *
 * The element fills whatever box you give it (min-height 280px by default),
 * so size it with CSS, e.g.  space-invaders-hero { height: 100vh; }
 *
 * Attributes (all optional)
 *   name    text spelled out by the invaders         default "Lucas Tolman"
 *   ink     foreground colour                         default #fff
 *   paper   background colour                         default #000
 *   hud     "off" hides the score bar and ground      default on
 *   speed   animation time-scale (0.5 = half speed)   default 1
 *
 * Method: el.restart()
 * Static: customElements.get('space-invaders-hero').spriteURL('ship', '#fff', frame)
 *         returns a data: URL of a sprite so page UI can reuse the art.
 *
 * No dependencies. Renders crisp at any size / pixel density, pauses itself when
 * off-screen or in a background tab, and shows a still frame for visitors who
 * prefer reduced motion.
 */
(() => {
  'use strict';
  if (typeof window === 'undefined' || !window.customElements || customElements.get('space-invaders-hero')) return;

  /* ───────────────────────── 1-bit art ───────────────────────── */

  const FONT_SRC = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
    C: '.###.|#...#|#....|#....|#....|#...#|.###.', D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..',
    E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
    I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.', J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
    K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
    O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.', P: '####.|#...#|#...#|####.|#....|#....|#....',
    Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
    U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.', V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
    W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
    2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
    4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
    8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
    '-': '.....|.....|.....|#####|.....|.....|.....', '.': '.....|.....|.....|.....|.....|.....|..#..',
    '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..', ':': '.....|..#..|.....|.....|.....|..#..|.....',
    '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.', '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
    "'": '..#..|..#..|.#...|.....|.....|.....|.....', '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
    '/': '....#|...#.|...#.|..#..|.#...|.#...|#....', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  };
  const FONT = {};
  for (const k in FONT_SRC) FONT[k] = FONT_SRC[k].split('|');

  const ART = {
    squid: [
      ['...##...', '..####..', '.######.', '##.##.##', '########', '..#..#..', '.#.##.#.', '#.#..#.#'],
      ['...##...', '..####..', '.######.', '##.##.##', '########', '.#.##.#.', '#......#', '.#....#.'],
    ],
    crab: [
      ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.', '###########', '#.#######.#', '#.#.....#.#', '...##.##...'],
      ['..#.....#..', '#..#...#..#', '#.#######.#', '###.###.###', '###########', '.#########.', '..#.....#..', '.#.......#.'],
    ],
    octo: [
      ['....####....', '.##########.', '############', '###..##..###', '############', '...##..##...', '..##.##.##..', '##........##'],
      ['....####....', '.##########.', '############', '###..##..###', '############', '..###..###..', '.##..##..##.', '..##....##..'],
    ],
    ship: [
      '........#........',
      '........#........',
      '.......###.......',
      '.......###.......',
      '.......#.#.......',
      '.......###.......',
      '...#..#####..#...',
      '...#..#####..#...',
      '...#.###.###.#...',
      '#..#.##.#.##.#..#',
      '#..###.###.###..#',
      '#.####.#.#.####.#',
      '#.#############.#',
      '##.##.#####.##.##',
      '####.#.###.#.####',
      '###.##.###.##.###',
      '##..#..###..#..##',
      '#......#.#......#',
      '.......#.#.......',
    ],
    mini: ['.....#.....', '.....#.....', '....###....', '.#..#.#..#.', '.#.#####.#.', '#.#######.#', '###########', '##..###..##', '#....#....#'],
    ufo: ['.....######.....', '...##########...', '..############..', '.##.##.##.##.##.', '################', '..###..##..###..', '...#........#...'],
    boom: ['....#...#....', '.#...#.#...#.', '..#.......#..', '...#.....#...', '##.........##', '...#.....#...', '..#..#.#..#..', '.#..#...#..#.'],
    shot: ['#..#..#', '.#...#.', '..###..', '.#####.', '..###..', '.#...#.', '#..#..#'],
    splat: ['.#..#.', '#.##.#', '.####.', '######', '.####.', '#.#..#'],
    bomb: [['.#.', '#..', '.#.', '..#', '.#.', '#..', '.#.'], ['.#.', '..#', '.#.', '#..', '.#.', '..#', '.#.']],
    flash: ['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...'],
  };

  const TYPES = { squid: { w: 8, pts: 30 }, crab: { w: 11, pts: 20 }, octo: { w: 12, pts: 10 } };
  const P_X = 14, P_Y = 11;            // alien cell pitch (virtual px)
  const G_W = 5, G_H = 7;              // glyph size (cells)
  const LINE_GAP = 2, WORD_GAP = 3;    // in cells
  const TAU = Math.PI * 2;
  const SHIP_W = 17, SHIP_H = 19, SHIP_HALF = SHIP_W / 2, WING_ROW = 9;
  // game-over timeline (seconds after the last ship is destroyed)
  const OVER = { type: 1.0, perChar: 0.13, coin: 2.5, fly: 4.6, flyDur: 0.6, sweep: 0.7 };
  const BASE_SPEED = 1.25;             // overall pace; a full wave takes ~40s

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  };
  const MAX_SCORE = 999999;
  const fmt = (n) => String(Math.min(MAX_SCORE, Math.max(0, n | 0)));   // "0", "50", ... up to 6 digits

  // the high score is kept in the visitor's browser so it survives reloads
  const HI_KEY = 'space-invaders-hero:hi';
  const loadHi = () => {
    try { return clamp(parseInt(localStorage.getItem(HI_KEY), 10) || 0, 0, MAX_SCORE); } catch (_) { return 0; }
  };
  const saveHi = (n) => { try { localStorage.setItem(HI_KEY, String(n)); } catch (_) { /* storage blocked: session only */ } };

  function paint(rows, ink) {
    const h = rows.length, w = rows[0].length;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const c = cv.getContext('2d');
    c.fillStyle = ink;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rows[y][x] === '#') c.fillRect(x, y, 1, 1);
    return cv;
  }

  /* Lay the name out on an alien grid. split=true tries two lines. Each cell gets a
     stable key (letter index + glyph coords) so layouts can swap without losing state. */
  function buildGrid(name, split) {
    const words = name.split(/\s+/).filter(Boolean);
    if (!words.length) words.push(' ');
    const wordCols = (w) => w.length * (G_W + 1) - 1;
    const lineCols = (ws) => ws.reduce((n, w) => n + wordCols(w), 0) + (ws.length - 1) * WORD_GAP;
    let lines = [words];
    if (split && words.length > 1) {
      let best = null;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i), b = words.slice(i);
        const m = Math.max(lineCols(a), lineCols(b));
        if (!best || m < best.m) best = { m, lines: [a, b] };
      }
      lines = best.lines;
    }
    const widths = lines.map(lineCols);
    const cols = Math.max(...widths);
    const cells = [];
    let k = 0;
    lines.forEach((ws, li) => {
      let cx = Math.floor((cols - widths[li]) / 2);
      for (const w of ws) {
        for (const ch of w) {
          const g = FONT[ch];
          if (g) g.forEach((row, gy) => {
            for (let gx = 0; gx < G_W; gx++) if (row[gx] === '#') {
              cells.push({ key: k + ':' + gx + ':' + gy, col: cx + gx, row: li * (G_H + LINE_GAP) + gy, gy });
            }
          });
          k++;
          cx += G_W + 1;
        }
        cx += WORD_GAP - 1;
      }
    });
    return { cells, cols, rows: lines.length * (G_H + LINE_GAP) - LINE_GAP };
  }

  /* ───────────────────────── game ───────────────────────── */

  class Game {
    constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.ink = '#fff'; this.paper = '#000'; this.hud = true; this.speed = 1; this.name = 'LUCAS TOLMAN';
      this.devW = 0; this.devH = 0; this.dpr = 1; this.s = 1; this.W = 1; this.H = 1;
      this.time = 0; this.hi = loadHi(); this.score = 0; this.lives = 3; this.lostAt = -9;
      this.running = false; this.raf = 0; this.last = 0; this.reduced = false;
      this.builtName = null; this.inkBuilt = null;
      this.aliens = []; this.bullets = []; this.bombs = []; this.booms = []; this.texts = [];
      this.rockets = []; this.sparks = []; this.ufo = null;
      this.ship = { x: 0, v: 0, dead: 0 };
      this.phase = 'intro'; this.pt = 0;
      this.frame = this.frame.bind(this);
    }

    get ready() { return this.devW > 0 && this.devH > 0; }

    configure(o) {
      Object.assign(this, o);
      this.name = String(this.name).toUpperCase();
      if (this.ready) { this.layout(); this.render(); }
    }

    resize(w, h, dpr) {
      if (w === this.devW && h === this.devH && dpr === this.dpr) return;
      this.devW = w; this.devH = h; this.dpr = dpr;
      this.canvas.width = Math.max(1, w); this.canvas.height = Math.max(1, h);
      if (!this.ready) return;
      this.layout();
      this.render();
    }

    buildSprites() {
      const ink = this.ink, S = {};
      for (const t of ['squid', 'crab', 'octo']) S[t] = ART[t].map((f) => paint(f, ink));
      S.bomb = ART.bomb.map((f) => paint(f, ink));
      for (const t of ['ship', 'mini', 'ufo', 'boom', 'shot', 'splat', 'flash']) S[t] = paint(ART[t], ink);
      S.glyph = {};
      for (const ch in FONT) S.glyph[ch] = paint(FONT[ch], ink);
      this.spr = S;
      this.inkBuilt = ink;
    }

    layout() {
      if (this.inkBuilt !== this.ink) this.buildSprites();
      let hudTop = this.hud ? 26 : 6, bottom = this.hud ? 14 : 4;
      const opts = [buildGrid(this.name, false)];
      if (/\S\s+\S/.test(this.name.trim())) opts.push(buildGrid(this.name, true));
      for (const g of opts) {
        g.fw = g.cols * P_X; g.fh = g.rows * P_Y;
        const m = Math.max(28, g.fw * 0.09);
        g.k = Math.min(this.devW / (g.fw + 2 * m), this.devH / (hudTop + 16 + g.fh + 100 + SHIP_H + 2 + bottom));
      }
      let g = opts[0];
      if (opts[1] && opts[1].k > g.k * 1.08) g = opts[1];

      // integer scale on low-density screens keeps every sprite pixel identical;
      // on retina screens fractional scale is invisible and fills the space better.
      let s = g.k;
      if (s >= 1 && this.dpr < 1.75) s = Math.floor(s);
      s = Math.max(s, 0.25);

      const oldW = this.W;
      this.s = s; this.W = this.devW / s; this.H = this.devH / s;
      // keep score text legible (≥ ~7 CSS px tall) on small screens
      const hs = this.hs = Math.max(1, Math.min(3, Math.ceil(6.5 / (7 * s / this.dpr))));
      if (this.hud) { hudTop = 12 + 14 * hs; bottom = 6 + 10 * hs; }
      this.big = Math.max(2, 2 * hs);   // banner text scale
      this.hudTop = hudTop;
      this.groundY = this.H - bottom;
      this.shipY = this.groundY - SHIP_H - 2;
      this.ufoY = hudTop + 3;
      this.fw = g.fw; this.fh = g.fh; this.rows = g.rows; this.cols = g.cols;
      const top = hudTop + 16;
      this.baseX = Math.round((this.W - g.fw) / 2);
      this.baseY = Math.round(top + Math.max(0, this.shipY - 100 - g.fh - top) * 0.32);
      const dist = this.shipY - (this.baseY + g.fh);
      this.bulletV = clamp((this.shipY - hudTop) / 0.45, 300, 1400);
      this.bombV = clamp(dist / 1.05, 90, 900);   // same fall time on every screen shape
      this.shipV = clamp(this.W * 0.28, 140, 230);
      this.fwG = clamp((this.groundY - hudTop) * 0.9, 120, 420);

      const fresh = this.builtName !== this.name;
      if (fresh) this.alienMap = new Map();
      const list = [];
      for (const c of g.cells) {
        let a = this.alienMap.get(c.key);
        if (!a) {
          const type = c.gy <= 1 ? 'squid' : c.gy <= 4 ? 'crab' : 'octo';
          a = { key: c.key, type, w: TYPES[type].w, pts: TYPES[type].pts, alive: true, f: 0 };
          this.alienMap.set(c.key, a);
        }
        a.col = c.col; a.row = c.row;
        a.ax = c.col * P_X + ((P_X - a.w) >> 1);
        a.ay = c.row * P_Y + 1;
        list.push(a);
      }
      this.aliens = list;
      this.total = list.length || 1;
      this.rowOff = new Array(g.rows).fill(0);
      this.rowList = Array.from({ length: g.rows }, () => []);
      for (const a of list) this.rowList[a.row].push(a);
      this.alive = list.filter((a) => a.alive).length;
      this.cyc = []; this.cycI = 0; this.stepAcc = 0; this.expDirty = true;
      this.bullets.length = 0; this.bombs.length = 0;
      this.ship.x = oldW > 1 ? clamp(this.ship.x * this.W / oldW, 10, this.W - 10) : this.W / 2;
      if (this.bot) this.bot.wanderX = clamp(this.bot.wanderX * this.W / Math.max(oldW, 1), 10, this.W - 10);
      this.prepDrop();
      if (fresh) { this.builtName = this.name; this.startWave(true); }
    }

    prepDrop() {
      const span = 1.5 / Math.max(1, this.cols);
      for (const a of this.aliens) {
        a.delay = a.col * span + Math.random() * 0.15;
        a.from = -(this.baseY + a.ay + 10 + Math.random() * 40);
      }
      this.introDur = 1.5 + 0.15 + 0.6;
    }

    // newGame: reset score and ships (first run, or after GAME OVER).
    // Otherwise this is the next stage: score and remaining ships carry over.
    startWave(newGame) {
      for (const a of this.aliens) { a.alive = true; a.f = 0; }
      this.alive = this.aliens.length;
      if (newGame || this.lives <= 0) { this.score = 0; this.lives = 3; this.lostAt = -9; }
      this.rowOff.fill(0);
      this.dir = Math.random() < 0.5 ? 1 : -1;
      this.cyc = []; this.cycI = 0; this.stepAcc = 0; this.expDirty = true;
      this.bullets.length = 0; this.bombs.length = 0; this.booms.length = 0; this.texts.length = 0;
      this.ufo = null; this.ufoT = rand(9, 15); this.bombT = rand(1.4, 2.4);
      this.ship.dead = 0;
      this.bot = {
        key: 0, intent: 0, keyAt: 0, anticip: 0.08, pressTol: 2,
        col: -1, colSince: 0, colKill: 0, aimErr: 0, leadK: 1,
        sweep: Math.random() < 0.5 ? 1 : -1, think: 0, nextFire: 0,
        wanderX: this.W / 2, wanderAt: 0, ufo: false,
      };
      this.prepDrop();
      this.go('intro');
    }

    go(p) { this.phase = p; this.pt = 0; if (p === 'fireworks') this.fwT = 0; }

    /* ── helpers ── */
    ax(a) { return this.baseX + a.ax + this.rowOff[a.row]; }
    cx(a) { return this.ax(a) + a.w / 2; }
    stepInterval() { return 0.055 + 0.6 * this.alive / this.total; }

    exposed() {
      if (!this.expDirty) return this.exp;
      const e = this.exp || [];
      e.length = this.cols; e.fill(null);
      for (const a of this.aliens) if (a.alive && (!e[a.col] || a.row > e[a.col].row)) e[a.col] = a;
      this.exp = e; this.expDirty = false;
      return e;
    }

    aimX(a) {
      const travel = (this.shipY - (this.baseY + a.ay + 8)) / this.bulletV;
      const vAvg = this.dir * 2 / this.stepInterval();
      return this.cx(a) + vAvg * travel * this.bot.leadK;
    }

    columnClear(x) {
      for (const a of this.aliens) {
        if (!a.alive) continue;
        const l = this.ax(a);
        if (x > l - 2 && x < l + a.w + 2) return false;
      }
      return true;
    }

    addScore(n) {
      this.score = Math.min(MAX_SCORE, this.score + n);
      if (this.score > this.hi) { this.hi = this.score; saveHi(this.hi); }
    }

    /* ── simulation ── */
    update(dt) {
      this.time += dt; this.pt += dt; this.expDirty = true;
      switch (this.phase) {
        case 'intro': if (this.pt >= this.introDur) this.go('ready'); break;
        case 'ready': if (this.pt >= 1.8) this.go('play'); break;
        case 'play':
          this.march(dt); this.spawnBombs(dt); this.spawnUfo(dt);
          if (!this.alive) { this.bombs.length = 0; this.go('clear'); }
          break;
        case 'over': {
          // formation holds still; once GAME OVER has had its moment the survivors fly off
          if (this.pt > OVER.fly + OVER.sweep + OVER.flyDur + 0.25) this.startWave(true);
          break;
        }
        case 'clear': if (this.pt >= 1.1) this.go('fireworks'); break;
        case 'fireworks':
          this.launchFireworks(dt);
          if (this.pt > 6.2 && !this.rockets.length && !this.sparks.length) this.startWave(false);
          break;
      }
      this.updBot(); this.updShip(dt); this.updBullets(dt); this.updBombs(dt); this.updUfo(dt); this.updFx(dt);
    }

    // Classic march: rows step one at a time (bottom first), formation speeds up as it thins out.
    march(dt) {
      if (!this.alive) return;
      if (!this.cyc.length) this.newCycle();
      const perRow = this.stepInterval() / this.cyc.length;
      this.stepAcc += dt;
      let guard = 0;
      while (this.stepAcc >= perRow && guard++ < 64) {
        this.stepAcc -= perRow;
        const r = this.cyc[this.cycI++];
        this.rowOff[r] += 2 * this.dir;
        for (const a of this.rowList[r]) a.f ^= 1;
        if (this.cycI >= this.cyc.length) this.newCycle();
      }
    }

    newCycle() {
      let mn = Infinity, mx = -Infinity;
      for (const a of this.aliens) if (a.alive) {
        const x = this.ax(a);
        if (x < mn) mn = x;
        if (x + a.w > mx) mx = x + a.w;
      }
      if (this.dir > 0 && mx + 2 > this.W - 8) this.dir = -1;
      else if (this.dir < 0 && mn - 2 < 8) this.dir = 1;
      this.cyc = [];
      for (let r = this.rows - 1; r >= 0; r--) if (this.rowList[r].some((a) => a.alive)) this.cyc.push(r);
      this.cycI = 0;
    }

    spawnBombs(dt) {
      this.bombT -= dt;
      if (this.bombT > 0) return;
      this.bombT = rand(1.4, 2.8) * (0.6 + 0.4 * this.alive / this.total);
      const max = this.alive > this.total * 0.3 ? 2 : 3;
      if (this.bombs.length >= max || this.ship.dead) return;
      const e = this.exposed().filter(Boolean);
      if (!e.length) return;
      let a;
      if (Math.random() < 0.3) {
        a = e.reduce((b, c) => (Math.abs(this.cx(c) - this.ship.x) < Math.abs(this.cx(b) - this.ship.x) ? c : b));
      } else a = e[(Math.random() * e.length) | 0];
      this.bombs.push({
        x: this.cx(a) - 1.5, y: this.baseY + a.ay + 8, f: 0, ft: 0,
        seenAt: this.time + rand(0.14, 0.38), seen: Math.random() > 0.13, side: 0,   // now and then the "player" just doesn't notice a bomb
      });
    }

    spawnUfo(dt) {
      if (this.ufo || this.alive < 8) return;
      this.ufoT -= dt;
      if (this.ufoT > 0) return;
      const d = Math.random() < 0.5 ? 1 : -1;
      this.ufo = { x: d > 0 ? -16 : this.W, vx: d * clamp(this.W / 7, 60, 200), pts: [50, 100, 150, 300][(Math.random() * 4) | 0] };
      this.bot.ufo = Math.random() < 0.6;
    }

    updUfo(dt) {
      const u = this.ufo;
      if (!u) return;
      u.x += u.vx * dt;
      if (u.x < -20 || u.x > this.W + 4) { this.ufo = null; this.ufoT = rand(14, 24); }
    }

    // A bot that plays like a person: reaction delays, key-press latency, overshoot and
    // correction taps, imperfect leading, sweeping across the formation, dodging bombs.
    updBot() {
      const s = this.ship, b = this.bot, T = this.time;
      if (s.dead) return;
      let goal = null, aiming = false;

      const tHitOf = (m) => (this.shipY + WING_ROW - (m.y + 7)) / this.bombV;
      let threat = null, tMin = 1e9;
      for (const m of this.bombs) {
        if (!m.seen || T < m.seenAt) continue;
        const t = tHitOf(m);
        if (t < -0.02 || t > 0.9) continue;
        const px = s.x + s.v * Math.min(t, 0.12);
        if (Math.abs(m.x + 1.5 - px) < SHIP_HALF + 3 && t < tMin) { tMin = t; threat = m; }
      }
      // once committed to a dodge, stay clear until that bomb has gone past
      const d = b.dodging;
      if (!threat && d && this.bombs.includes(d) && tHitOf(d) > -0.12 && Math.abs(d.x + 1.5 - s.x) < SHIP_HALF + 9) threat = d;
      b.dodging = threat;

      if (threat) {
        if (!threat.side) {
          threat.side = s.x >= threat.x + 1.5 ? 1 : -1;
          if (Math.random() < 0.12) threat.side *= -1;
        }
        let g = threat.x + 1.5 + threat.side * 19;
        if (g < 11 || g > this.W - 11) { threat.side *= -1; g = threat.x + 1.5 + threat.side * 19; }
        goal = g; b.pressTol = 2;
      } else if (this.phase === 'play') {
        if (T >= b.think) {
          const u = this.ufo;
          if (u && b.ufo) {
            const travel = (this.shipY - (this.ufoY + 7)) / this.bulletV;
            const ix = u.x + 8 + u.vx * travel;
            if (ix > 12 && ix < this.W - 12 && this.columnClear(ix)) { goal = ix; aiming = true; }
          }
          if (goal === null) {
            const e = this.exposed();
            const valid = b.col >= 0 && !!e[b.col];
            const stale = valid && T - Math.max(b.colSince, b.colKill) > 2.6;
            if (!valid && b.col >= 0 && Math.random() < 0.12) {
              b.think = T + rand(0.2, 0.65);   // brief "looking for the next one" pause
              b.col = -1;
            } else if (!valid || stale) {
              let best = -1, bc = Infinity, bd = 0;
              for (let c = 0; c < e.length; c++) {
                if (!e[c] || (stale && c === b.col)) continue;
                const d = this.aimX(e[c]) - s.x;
                let cost = Math.abs(d) + gauss() * 12;
                if (Math.abs(d) > 24 && sign(d) !== b.sweep) cost += 90;
                if (cost < bc) { bc = cost; best = c; bd = d; }
              }
              if (best < 0 && valid) best = b.col;
              if (best >= 0) {
                if (Math.abs(bd) > 24 && sign(bd) !== b.sweep) b.sweep = -b.sweep;
                b.col = best; b.colSince = T;
                b.aimErr = gauss() * 1.2; b.leadK = rand(0.5, 1.1);
              }
            }
            if (b.col >= 0 && e[b.col]) {
              goal = this.aimX(e[b.col]) + b.aimErr; aiming = true;
              b.pressTol = e[b.col].w * 0.3;   // close enough is close enough — no fiddling for 1-2px
            }
          }
          // don't walk under a bomb that's about to land — wait for it to pass
          if (goal !== null) {
            const lo = Math.min(s.x, goal) - SHIP_HALF - 3, hi = Math.max(s.x, goal) + SHIP_HALF + 3;
            for (const m of this.bombs) {
              if (!m.seen || T < m.seenAt) continue;
              const t = tHitOf(m);
              if (t > -0.05 && t < 0.6 && m.x + 1.5 > lo && m.x + 1.5 < hi) { goal = null; aiming = false; break; }
            }
          }
        }
      } else {
        if (T > b.wanderAt) { b.wanderX = rand(this.W * 0.2, this.W * 0.8); b.wanderAt = T + rand(1.0, 2.8); }
        goal = b.wanderX; b.pressTol = 3;
      }

      // "keyboard": decide left / right / none, applied after a human motor delay
      const dx = goal === null ? 0 : goal - s.x;
      let want = b.key;
      if (goal === null) want = 0;
      else if (b.key === 0) { if (Math.abs(dx) > b.pressTol) want = sign(dx); }
      else if (sign(dx) !== b.key || Math.abs(dx) <= Math.abs(s.v) * b.anticip) want = 0;
      if (want !== b.intent) {
        b.intent = want;
        b.keyAt = T + rand(0.025, 0.085);
        if (want !== 0) b.anticip = rand(0.03, 0.12);
      }
      if (T >= b.keyAt) b.key = b.intent;

      if (this.phase === 'play' && T >= b.nextFire && this.bullets.length < 4) {
        const tol = (b.pressTol || 3) + 0.6 + Math.min(2, Math.abs(s.v) * 0.01);
        let fire = aiming && Math.abs(goal - s.x) <= tol;
        // like a person mashing fire: take the shot whenever something is lined up overhead
        if (!fire && Math.random() < 0.35) {
          const e = this.exposed();
          for (let c = 0; c < e.length && !fire; c++) if (e[c] && Math.abs(this.aimX(e[c]) - s.x) < e[c].w / 2 - 1) fire = true;
        }
        if (fire) {
          this.bullets.push({ x: Math.round(s.x), y: this.shipY - 3 });
          b.nextFire = T + (Math.random() < 0.06 ? rand(0.25, 0.4) : rand(0.08, 0.15));
        }
      }
    }

    updShip(dt) {
      const s = this.ship, b = this.bot;
      if (s.dead > 0) {
        s.dead -= dt;
        if (s.dead <= 0) {
          s.dead = 0; s.v = 0;
          s.x = this.W * (Math.random() < 0.5 ? 0.12 : 0.88);
          b.key = b.intent = 0;
        }
        return;
      }
      s.v += (b.key * this.shipV - s.v) * (1 - Math.exp(-dt / 0.055));
      s.x += s.v * dt;
      const lim = SHIP_HALF + 2;
      if (s.x < lim) { s.x = lim; s.v = Math.max(0, s.v); }
      if (s.x > this.W - lim) { s.x = this.W - lim; s.v = Math.min(0, s.v); }
    }

    updBullets(dt) {
      const bs = this.bullets;
      for (let i = bs.length - 1; i >= 0; i--) {
        const b = bs[i], y0 = b.y;
        b.y -= this.bulletV * dt;
        const top = b.y, bot = y0 + 4;          // swept so fast shots never tunnel
        let hit = null, hy = -Infinity;
        for (const a of this.aliens) {
          if (!a.alive) continue;
          const ax = this.ax(a);
          if (b.x + 1 <= ax || b.x >= ax + a.w) continue;
          const ay = this.baseY + a.ay;
          if (ay + 8 <= top || ay >= bot) continue;
          if (ay > hy) { hy = ay; hit = a; }
        }
        if (hit) { this.kill(hit); bs.splice(i, 1); continue; }
        const u = this.ufo;
        if (u && b.x + 1 > u.x && b.x < u.x + 16 && this.ufoY + 7 > top && this.ufoY < bot) {
          this.addScore(u.pts);
          this.texts.push({ s: String(u.pts), x: u.x + 8, y: this.ufoY, t: 1.0 });
          this.ufo = null; this.ufoT = rand(14, 24);
          bs.splice(i, 1); continue;
        }
        if (b.y < this.hudTop + 2) { this.booms.push({ k: 'shot', x: b.x - 3, y: this.hudTop + 2, t: 0.18 }); bs.splice(i, 1); }
      }
    }

    kill(a) {
      a.alive = false;
      this.alive--;
      this.expDirty = true;
      this.addScore(a.pts);
      this.booms.push({ k: 'boom', x: this.cx(a) - 6.5, y: this.baseY + a.ay, t: 0.22 });
      if (a.col === this.bot.col) this.bot.colKill = this.time;
    }

    updBombs(dt) {
      const s = this.ship, ms = this.bombs;
      for (let i = ms.length - 1; i >= 0; i--) {
        const m = ms[i];
        m.y += this.bombV * dt;
        m.ft += dt;
        if (m.ft > 0.07) { m.ft = 0; m.f ^= 1; }
        // hitbox follows the sprite: narrow nose, full-width wings
        const rel = m.y + 7 - this.shipY, half = rel < WING_ROW ? 2.5 : SHIP_HALF - 0.5;
        if (!s.dead && rel >= 1 && m.y <= this.shipY + SHIP_H - 1 && Math.abs(m.x + 1.5 - s.x) < half + 1.5) {
          this.shatter();
          s.v = 0;
          this.lives = Math.max(0, this.lives - 1);
          this.lostAt = this.time;
          this.bombs.length = 0;
          if (this.lives === 0 && this.phase === 'play') {
            s.dead = 1e9;          // no respawn; startWave() brings the ship back
            this.go('over');
          } else s.dead = 1.5;
          return;
        }
        if (m.y + 7 >= this.groundY) { this.booms.push({ k: 'splat', x: m.x - 1.5, y: this.groundY - 6, t: 0.2 }); ms.splice(i, 1); }
      }
    }

    // the fighter breaks into its own pixels, which scatter and dither out
    shatter() {
      const rows = ART.ship, x0 = this.ship.x - SHIP_HALF, cy = this.shipY + SHIP_H * 0.55;
      for (let y = 0; y < SHIP_H; y++) for (let x = 0; x < SHIP_W; x++) {
        if (rows[y][x] !== '#') continue;
        const dx = x + 0.5 - SHIP_HALF, dy = y + 0.5 - (cy - this.shipY), k = rand(5, 11);
        const life = rand(0.45, 1.15);
        this.sparks.push({
          x: x0 + x, y: this.shipY + y, vx: dx * k + gauss() * 10, vy: dy * k * 0.8 - rand(25, 70),
          life, max: life, tiny: true, crackle: Math.random() < 0.06,
        });
      }
      this.booms.push({ k: 'flash', x: this.ship.x - 3.5, y: cy - 3.5, t: 0.1 });
    }

    /* ── fireworks ── */
    launchFireworks(dt) {
      if (this.pt > 5.6) return;
      this.fwT -= dt;
      if (this.fwT > 0) return;
      this.launch();
      if (Math.random() < 0.25) this.launch();
      this.fwT = rand(0.3, 0.7);
    }

    launch() {
      const gTop = this.hudTop + 20, gBot = this.groundY;
      const x = rand(this.W * 0.12, this.W * 0.88), y = gBot - 2;
      const ty = rand(gTop, gTop + (gBot - gTop) * 0.45);
      this.rockets.push({ x, y, vx: rand(-10, 10), vy: -Math.sqrt(2 * this.fwG * (y - ty)), tt: 0, trail: [] });
    }

    explode(r) {
      const k = clamp((this.groundY - this.hudTop) / 260, 0.7, 2.4);
      const L = rand(1.1, 1.7);
      const add = (ang, sp, life) => this.sparks.push({
        x: r.x, y: r.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life, max: life, crackle: Math.random() < 0.25,
      });
      switch ((Math.random() * 4) | 0) {
        case 0: { // ring
          const n = 32 + ((Math.random() * 12) | 0), sp = rand(55, 70) * k;
          for (let i = 0; i < n; i++) add(i / n * TAU + rand(-0.04, 0.04), sp * rand(0.96, 1.04), L * rand(0.85, 1.1));
          break;
        }
        case 1: // peony
          for (let i = 0; i < 56; i++) add(rand(0, TAU), Math.sqrt(Math.random()) * 72 * k, L * rand(0.7, 1.1));
          break;
        case 2: { // double ring
          for (let i = 0; i < 28; i++) add(i / 28 * TAU, 68 * k, L);
          const o = rand(0, TAU);
          for (let i = 0; i < 14; i++) add(o + i / 14 * TAU, 32 * k, L * 0.8);
          break;
        }
        default: { // star spokes
          const m = Math.random() < 0.5 ? 8 : 12, o = rand(0, TAU);
          for (let i = 0; i < m; i++) for (let j = 1; j <= 5; j++) add(o + i / m * TAU, 72 * k * j / 5, L * rand(0.85, 1));
        }
      }
      this.booms.push({ k: 'flash', x: r.x - 3.5, y: r.y - 3.5, t: 0.09 });
    }

    updFx(dt) {
      for (let i = this.booms.length - 1; i >= 0; i--) if ((this.booms[i].t -= dt) <= 0) this.booms.splice(i, 1);
      for (let i = this.texts.length - 1; i >= 0; i--) if ((this.texts[i].t -= dt) <= 0) this.texts.splice(i, 1);
      const g = this.fwG;
      for (let i = this.rockets.length - 1; i >= 0; i--) {
        const r = this.rockets[i];
        r.vy += g * dt; r.x += r.vx * dt; r.y += r.vy * dt; r.tt += dt;
        if (r.tt > 0.035) { r.tt = 0; r.trail.push([r.x, r.y]); if (r.trail.length > 7) r.trail.shift(); }
        if (r.vy > -g * 0.06) { this.explode(r); this.rockets.splice(i, 1); }
      }
      const drag = Math.exp(-1.9 * dt);
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const p = this.sparks[i];
        p.vx *= drag; p.vy = p.vy * drag + g * 0.18 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if ((p.life -= dt) <= 0) {
          if (p.crackle) for (let j = 0; j < 3; j++) {
            this.sparks.push({ x: p.x, y: p.y, vx: rand(-14, 14), vy: rand(-14, 14), life: 0.25, max: 0.25, tiny: true });
          }
          this.sparks.splice(i, 1);
        }
      }
    }

    /* ── drawing ── */
    blit(img, x, y, sc = 1) {
      const s = this.s, X = Math.round(x * s), Y = Math.round(y * s);
      this.ctx.drawImage(img, X, Y, Math.round((x + img.width * sc) * s) - X, Math.round((y + img.height * sc) * s) - Y);
    }

    rect(x, y, w, h) {
      const s = this.s, X = Math.round(x * s), Y = Math.round(y * s);
      this.ctx.fillRect(X, Y, Math.max(1, Math.round((x + w) * s) - X), Math.max(1, Math.round((y + h) * s) - Y));
    }

    text(str, x, y, sc = 1, align = 'center') {
      const w = (str.length * 6 - 1) * sc;
      let x0 = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
      for (const ch of str) {
        const g = this.spr.glyph[ch];
        if (g) this.blit(g, x0, y, sc);
        x0 += 6 * sc;
      }
    }

    render() {
      if (!this.ready || !this.spr) return;
      const c = this.ctx, S = this.spr;
      c.imageSmoothingEnabled = false;
      c.fillStyle = this.paper;
      c.fillRect(0, 0, this.devW, this.devH);
      c.fillStyle = this.ink;

      if (this.hud) {
        const L = this.W * 0.25, R = this.W * 0.75, h = this.hs, y2 = 7 + 7 * h;
        this.text('SCORE', L, 4, h); this.text(fmt(this.score), L, y2, h);
        this.text('HI-SCORE', R, 4, h); this.text(fmt(this.hi), R, y2, h);
        this.rect(0, this.groundY, this.W, 1);
        const yb = this.groundY + 3;
        // one icon per remaining ship; the one just lost blinks out
        const since = this.time - this.lostAt;
        const shown = this.lives + (since < 1.2 ? 1 : 0);
        for (let i = 0; i < shown; i++) {
          if (i === this.lives && ((since / 0.15) | 0) % 2) continue;
          this.blit(S.mini, 10 + i * 14 * h, yb, h);
        }
        this.text('CREDIT 00', this.W - 10, yb + h / 2, h, 'right');
      }

      const intro = this.phase === 'intro' && !this.reduced;
      const tog = this.phase === 'play' ? 0 : ((this.time / 0.5) | 0) & 1;
      for (const a of this.aliens) {
        if (!a.alive) continue;
        let y = this.baseY + a.ay;
        if (intro) {
          const p = clamp((this.pt - a.delay) / 0.6, 0, 1);
          y += a.from * Math.pow(1 - p, 3);
        } else if (this.phase === 'over') {
          // each column lifts off as one piece, sweeping left to right, so nothing overlaps
          const p = clamp((this.pt - OVER.fly - OVER.sweep * a.col / Math.max(1, this.cols - 1)) / OVER.flyDur, 0, 1);
          y -= (this.baseY + this.fh + 12) * p * p;
          if (p >= 1) continue;
        }
        this.blit(S[a.type][a.f ^ tog], this.ax(a), Math.round(y));
      }

      if (this.ufo) this.blit(S.ufo, this.ufo.x, this.ufoY);
      for (const b of this.bullets) this.rect(b.x, b.y, 1, 4);
      for (const m of this.bombs) this.blit(S.bomb[m.f], m.x, m.y);
      for (const b of this.booms) this.blit(S[b.k], b.x, b.y);
      for (const t of this.texts) this.text(t.s, t.x, t.y);

      const sh = this.ship;
      if (!sh.dead) this.blit(S.ship, sh.x - SHIP_HALF, this.shipY);

      for (const r of this.rockets) {
        const n = r.trail.length;
        r.trail.forEach(([x, y], i) => { if (Math.random() < (i + 1) / (n + 1)) this.rect(Math.round(x), Math.round(y), 1, 1); });
        this.rect(Math.round(r.x), Math.round(r.y), 1, 2);
      }
      for (const p of this.sparks) {
        const f = p.life / p.max;
        if (f < 0.6 && Math.random() > f / 0.6) continue;   // 1-bit dithered fade
        const sz = p.tiny ? 1 : f > 0.45 ? 2 : 1;
        this.rect(Math.round(p.x / sz) * sz, Math.round(p.y / sz) * sz, sz, sz);
      }

      if (this.phase === 'clear' || this.phase === 'fireworks') {
        const t = this.phase === 'clear' ? this.pt : this.pt + 1.1;
        if (t < 3.6 && (t > 0.9 || ((t * 6) | 0) % 2 === 0)) {
          this.text('STAGE CLEAR', this.W / 2, this.baseY + this.fh / 2 - 3.5 * this.big, this.big);
        }
      }

      if (this.phase === 'over') {
        const t = this.pt, big = this.big;
        const n = clamp(Math.floor((t - OVER.type) / OVER.perChar) + 1, 0, 9);
        const lane = this.baseY + this.fh, y = Math.round(lane + Math.min((this.shipY - lane) * 0.42, 60) - 3.5 * big);
        if (n > 0 && t < OVER.fly + 0.4) {
          // typed out one letter at a time, left-aligned so letters don't shift
          const x0 = this.W / 2 - (9 * 6 - 1) * big / 2;
          this.text('GAME OVER'.slice(0, n), x0, y, big, 'left');
        }
        if (t > OVER.coin && t < OVER.fly + 0.4 && ((t / 0.45) | 0) % 2 === 0) {
          this.text('INSERT COIN', this.W / 2, y + 7 * big + 6 * this.hs, this.hs);
        }
      }
    }

    /* ── loop ── */
    start() {
      if (this.running || !this.ready) return;
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }

    frame(ts) {
      if (!this.running) return;
      this.raf = requestAnimationFrame(this.frame);
      let dt = Math.min(0.1, Math.max(0, (ts - this.last) / 1000)) * this.speed * BASE_SPEED;
      this.last = ts;
      while (dt > 1e-6) { const h = Math.min(dt, 1 / 60); this.update(h); dt -= h; }
      this.render();
    }
  }

  /* ───────────────────────── element ───────────────────────── */

  class SpaceInvadersHero extends HTMLElement {
    static get observedAttributes() { return ['name', 'ink', 'paper', 'hud', 'speed']; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent =
        ':host{display:block;position:relative;width:100%;min-height:280px;overflow:hidden;background:var(--sih-paper,#000);contain:strict}' +
        ':host([hidden]){display:none}' +
        'canvas{position:absolute;inset:0;width:100%;height:100%;display:block;image-rendering:pixelated}';
      this._game = new Game();
      root.append(style, this._game.canvas);
      this._visible = true;
    }

    connectedCallback() {
      if (!this.hasAttribute('role')) this.setAttribute('role', 'img');
      this._mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this._onChange = () => this._update();
      this._mq.addEventListener ? this._mq.addEventListener('change', this._onChange) : this._mq.addListener(this._onChange);
      document.addEventListener('visibilitychange', this._onChange);
      this._sync();

      this._ro = new ResizeObserver((entries) => {
        const e = entries[entries.length - 1], dpr = window.devicePixelRatio || 1;
        let w = Math.round(e.contentRect.width * dpr), h = Math.round(e.contentRect.height * dpr);
        const dp = e.devicePixelContentBoxSize && e.devicePixelContentBoxSize[0];
        // prefer the exact device-pixel box when the browser reports a sane one
        if (dp && Math.abs(dp.inlineSize - w) <= 2 && Math.abs(dp.blockSize - h) <= 2) { w = dp.inlineSize; h = dp.blockSize; }
        this._game.resize(w, h, dpr);
        this._update();
      });
      try { this._ro.observe(this, { box: 'device-pixel-content-box' }); } catch (_) { this._ro.observe(this); }

      this._io = new IntersectionObserver((es) => { this._visible = es[es.length - 1].isIntersecting; this._update(); });
      this._io.observe(this);
    }

    disconnectedCallback() {
      this._game.stop();
      this._ro && this._ro.disconnect();
      this._io && this._io.disconnect();
      document.removeEventListener('visibilitychange', this._onChange);
      if (this._mq) this._mq.removeEventListener ? this._mq.removeEventListener('change', this._onChange) : this._mq.removeListener(this._onChange);
    }

    attributeChangedCallback() { if (this.isConnected && this._mq) this._sync(); }

    _sync() {
      const name = (this.getAttribute('name') || 'Lucas Tolman').trim() || ' ';
      if (!this.hasAttribute('aria-label') || this._autoLabel) { this.setAttribute('aria-label', name); this._autoLabel = true; }
      const ink = this.getAttribute('ink') || '#fff', paper = this.getAttribute('paper') || '#000';
      this.style.setProperty('--sih-paper', paper);
      const speed = parseFloat(this.getAttribute('speed'));
      this._game.configure({
        name, ink, paper,
        hud: (this.getAttribute('hud') || '').toLowerCase() !== 'off',
        speed: isFinite(speed) && speed > 0 ? speed : 1,
      });
      this._update();
    }

    _update() {
      const g = this._game;
      g.reduced = !!(this._mq && this._mq.matches);
      const run = this._visible && !document.hidden && !g.reduced && g.ready;
      if (run) g.start();
      else { g.stop(); g.render(); }
    }

    /** data: URL of one of the built-in sprites (e.g. 'ship', 'mini', 'crab'), for reuse in page UI.
        Animated sprites (squid, crab, octo, bomb) have two frames: pass frame 1 for the second. */
    static spriteURL(name = 'ship', ink = '#fff', frame = 0) {
      const a = ART[name];
      if (!a) return '';
      return paint(Array.isArray(a[0]) ? a[frame ? 1 : 0] : a, ink).toDataURL();
    }

    restart() { if (this._game.ready) { this._game.startWave(true); this._game.render(); } }
  }

  customElements.define('space-invaders-hero', SpaceInvadersHero);
})();
