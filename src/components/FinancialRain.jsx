import React, { useRef, useEffect } from 'react';

// ── Character pools — CV-themed ──────────────────────────────────────────────
const FINANCE_TERMS = [
  'ACCA','IFRS','ISA','DAX','ROI','EBIT','WACC','NPV','DCF','P/E',
  'ROA','SBR','AAA','AFM','SBL','IAS','EPS','NAV','IRR','FRS',
  'IFRS 9','ISA 315','IAS 36','ISA 240','ISA 700','IFRS 15','IFRS 16',
  'Audit','Assurance','Baker Tilly','Power BI','Variance','Ledger',
  '68.8%','77%','56','10/13','€1,234','15.2%','IFRIC',
];
const NUMBERS = ['0','1','2','3','4','5','6','7','8','9','%','$','€','£','+','.'];

function pickChar(termFreq = 0.35) {
  return Math.random() < termFreq
    ? FINANCE_TERMS[Math.floor(Math.random() * FINANCE_TERMS.length)]
    : NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
}

// ── Column class — each column manages its OWN stream independently ──────────
class RainColumn {
  constructor(x, colW, fontSize, canvasHeight) {
    this.x = x;
    this.colW = colW;
    this.rowH = fontSize + 6;
    this.fontSize = fontSize;
    this.maxRows = Math.ceil(canvasHeight / this.rowH) + 20;
    this.reset(true);
  }

  reset(initial = false) {
    this.streamLen = 6 + Math.floor(Math.random() * 14);      // 6–20 chars
    this.speed     = 0.25 + Math.random() * 0.85;             // rows/sec
    // Start off-screen or random for initial
    this.headY     = initial
      ? -Math.random() * this.maxRows * this.rowH
      : -(this.streamLen + 3) * this.rowH;
    // Fix stable chars for this stream — only head updates occasionally
    this.stream    = Array.from({ length: this.streamLen }, () => pickChar());
    // Each column biased toward a color family for variety
    this.family    = Math.random() < 0.72 ? 'gold' : 'purple';
  }

  update(dt) {
    this.headY += this.speed * dt * 60;   // dt in seconds, target 60fps rows

    // Randomly mutate one char in the stream (occasional flicker is fine, mass flicker is not)
    if (Math.random() < 0.04) {
      const i = Math.floor(Math.random() * this.streamLen);
      this.stream[i] = pickChar();
    }

    // Reset when whole stream has left the bottom of the canvas
    if (this.headY > (this.maxRows + this.streamLen) * this.rowH) {
      this.reset();
    }
  }

  draw(ctx, canvasHeight) {
    for (let i = 0; i < this.streamLen; i++) {
      const y = this.headY - i * this.rowH;
      if (y < -this.rowH || y > canvasHeight + this.rowH) continue;

      const ratio = i / this.streamLen; // 0 = head, 1 = tail

      let color;
      if (i === 0) {
        // Bright near-white head
        color = `rgba(255, 252, 240, 0.95)`;
      } else if (i <= 2) {
        // Hot gold near the head
        const a = 0.88 - i * 0.15;
        color = `rgba(212, 184, 120, ${a.toFixed(2)})`;
      } else if (this.family === 'gold') {
        // Gold fading to near-transparent
        const a = Math.max(0, 0.55 - ratio * 0.58);
        color = `rgba(200, 169, 110, ${a.toFixed(2)})`;
      } else {
        // Purple accent column
        const a = Math.max(0, 0.5 - ratio * 0.52);
        color = `rgba(140, 120, 240, ${a.toFixed(2)})`;
      }

      ctx.fillStyle = color;

      const char = this.stream[i];
      // Center short single chars, left-align terms
      const charWidth = ctx.measureText(char).width;
      const drawX = charWidth < this.colW
        ? this.x + (this.colW - charWidth) / 2
        : this.x;

      ctx.fillText(char, drawX, y);
    }
  }
}

// ── React component ───────────────────────────────────────────────────────────
export default function FinancialRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const FONT_SIZE = 13;
    const COL_W     = 28;        // wider columns = less crowded, more elegant

    let cols = [];
    let rafId;
    let lastTime = performance.now();

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = `${FONT_SIZE}px "DM Mono", "Courier New", monospace`;

      const numCols = Math.floor(canvas.width / COL_W);
      cols = Array.from({ length: numCols }, (_, i) =>
        new RainColumn(i * COL_W, COL_W, FONT_SIZE, canvas.height)
      );

      // Pre-clear canvas to solid dark
      ctx.fillStyle = 'rgba(8, 8, 14, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Slight fade per frame — creates clean trailing glow
      ctx.fillStyle = 'rgba(8, 8, 14, 0.13)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px "DM Mono", "Courier New", monospace`;

      for (const col of cols) {
        col.update(dt);
        col.draw(ctx, canvas.height);
      }

      rafId = requestAnimationFrame(draw);
    };

    init();
    window.addEventListener('resize', init);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        /* No CSS opacity — colors are controlled precisely inside canvas */
      }}
      aria-hidden="true"
    />
  );
}
