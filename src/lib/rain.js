const GRAVITY = 900; // px/s²
const MAX_PARTICLES = 500;
const THROW_RATE = 40; // bills per second while holding down
const JACKPOT_RATE = 90;
const SPRITE_SIZE = 96;

const CASH = [
  { emoji: '💵', weight: 10 },
  { emoji: '💸', weight: 4 },
  { emoji: '🪙', weight: 4 },
  { emoji: '💰', weight: 1 },
];

const JACKPOT = [
  { emoji: '💰', weight: 5 },
  { emoji: '👑', weight: 2 },
  { emoji: '💎', weight: 2 },
  { emoji: '💵', weight: 3 },
];

const random = (min, max) => min + Math.random() * (max - min);

function pick(table) {
  const total = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  return table.find((entry) => {
    roll -= entry.weight;
    return roll <= 0;
  }) ?? table[0];
}

// drawing emoji text every frame is slow, so render each one once
const sprites = new Map();
function sprite(emoji) {
  if (!sprites.has(emoji)) {
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.font = `${SPRITE_SIZE * 0.8}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, SPRITE_SIZE / 2, SPRITE_SIZE * 0.55);
    sprites.set(emoji, canvas);
  }
  return sprites.get(emoji);
}

export class Rain {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.drizzle = 5; // bills per second per 1000px of screen width
    this.thrower = null;
    this.jackpotUntil = 0;
    this.carry = 0;
    this.throwCarry = 0;

    this.resize = this.resize.bind(this);
    this.frame = this.frame.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
  }

  spawn(x, y, vx, vy, table = CASH) {
    if (this.particles.length >= MAX_PARTICLES) return;
    const type = pick(table);
    this.particles.push({
      x,
      y,
      vx,
      vy,
      size: random(28, 48) * (type.emoji === '🪙' ? 0.75 : 1),
      sprite: sprite(type.emoji),
      rotation: random(-0.6, 0.6),
      spin: random(-2, 2),
      sway: random(20, 70),
      swaySpeed: random(1.5, 3.5),
      flipSpeed: random(1, 5),
      phase: random(0, Math.PI * 2),
      terminal: random(110, 260),
      age: 0,
    });
  }

  burst(x, y, count = 24) {
    for (let i = 0; i < count; i += 1) {
      this.spawn(x, y, random(-380, 380), random(-800, -250));
    }
  }

  startThrow(x, y) {
    this.thrower = { x, y };
  }

  moveThrow(x, y) {
    if (this.thrower) this.thrower = { x, y };
  }

  stopThrow() {
    this.thrower = null;
  }

  jackpot(duration) {
    this.jackpotUntil = performance.now() + duration;
  }

  frame(now) {
    // clamp so a backgrounded tab doesn't teleport everything on return
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.emit(now, dt);
    this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  }

  emit(now, dt) {
    const jackpot = now < this.jackpotUntil;
    this.carry += (jackpot ? JACKPOT_RATE : this.drizzle * (this.width / 1000)) * dt;
    while (this.carry >= 1) {
      this.carry -= 1;
      this.spawn(random(0, this.width), -40, random(-20, 20), random(40, 160), jackpot ? JACKPOT : CASH);
    }

    if (!this.thrower) return;
    this.throwCarry += THROW_RATE * dt;
    while (this.throwCarry >= 1) {
      this.throwCarry -= 1;
      this.spawn(this.thrower.x, this.thrower.y, random(-320, 320), random(-950, -400));
    }
  }

  update(dt) {
    const { particles } = this;
    let alive = 0;
    for (const p of particles) {
      p.age += dt;
      p.vy += GRAVITY * dt;
      if (p.vy > p.terminal) p.vy += (p.terminal - p.vy) * Math.min(1, 3 * dt);
      p.vx *= 1 - Math.min(1, 1.2 * dt);
      p.x += (p.vx + Math.sin(p.age * p.swaySpeed + p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;

      const offscreen = p.y - p.size > this.height || p.x < -200 || p.x > this.width + 200;
      if (!offscreen) particles[alive++] = p;
    }
    particles.length = alive;
  }

  draw() {
    const { ctx, dpr } = this;
    if (!this.particles.length && this.clean) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.clean = !this.particles.length;

    for (const p of this.particles) {
      // squash horizontally over time to fake the bill tumbling in 3D
      const flip = Math.cos(p.age * p.flipSpeed + p.phase);
      const cos = Math.cos(p.rotation);
      const sin = Math.sin(p.rotation);
      ctx.setTransform(cos * flip * dpr, sin * flip * dpr, -sin * dpr, cos * dpr, p.x * dpr, p.y * dpr);
      ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
    }
  }
}
