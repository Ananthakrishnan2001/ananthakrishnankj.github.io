import React, { useRef, useEffect } from 'react';

// ── Character pools ───────────────────────────────────────────
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

// ── RainColumn ────────────────────────────────────────────────
class RainColumn {
  constructor(x, colW, fontSize, canvasHeight) {
    this.x = x;
    this.colW = colW;
    this.rowH = fontSize + 6;
    this.fontSize = fontSize;
    this.maxRows = Math.ceil(canvasHeight / this.rowH) + 20;
    this.reset(true, canvasHeight);
  }

  reset(initial = false, canvasHeight = 0) {
    this.streamLen = 6 + Math.floor(Math.random() * 14);
    this.speed     = 0.25 + Math.random() * 0.85;
    this.stream    = Array.from({ length: this.streamLen }, () => pickChar());
    this.family    = Math.random() < 0.72 ? 'gold' : 'purple';

    if (initial) {
      // 65% of columns start mid-screen so it's never blank
      if (Math.random() < 0.65) {
        this.headY = Math.random() * (canvasHeight * 0.9);
      } else {
        // The rest stagger above the canvas
        this.headY = -Math.random() * this.streamLen * this.rowH * 3;
      }
    } else {
      // Normal reset: just off the top
      this.headY = -(this.streamLen + 3) * this.rowH;
    }
  }

  update(dt) {
    this.headY += this.speed * dt * 60;
    if (Math.random() < 0.04) {
      const i = Math.floor(Math.random() * this.streamLen);
      this.stream[i] = pickChar();
    }
    if (this.headY > (this.maxRows + this.streamLen) * this.rowH) {
      this.reset();
    }
  }

  draw(ctx, canvasHeight) {
    for (let i = 0; i < this.streamLen; i++) {
      const y = this.headY - i * this.rowH;
      if (y < -this.rowH || y > canvasHeight + this.rowH) continue;
      const ratio = i / this.streamLen;
      let color;
      if (i === 0) {
        color = `rgba(255, 252, 240, 0.95)`;
      } else if (i <= 2) {
        const a = 0.88 - i * 0.15;
        color = `rgba(212, 184, 120, ${a.toFixed(2)})`;
      } else if (this.family === 'gold') {
        const a = Math.max(0, 0.55 - ratio * 0.58);
        color = `rgba(200, 169, 110, ${a.toFixed(2)})`;
      } else {
        const a = Math.max(0, 0.5 - ratio * 0.52);
        color = `rgba(140, 120, 240, ${a.toFixed(2)})`;
      }
      ctx.fillStyle = color;
      const char = this.stream[i];
      const charWidth = ctx.measureText(char).width;
      const drawX = charWidth < this.colW ? this.x + (this.colW - charWidth) / 2 : this.x;
      ctx.fillText(char, drawX, y);
    }
  }
}

// ── Galaxy star layer ─────────────────────────────────────────
class GalaxyStar {
  constructor(w, h) {
    this.reset(w, h, true);
  }
  reset(w, h, initial = false) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = Math.random() * 1.2 + 0.3;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.4 + Math.random() * 1.2;
    // Color: white-blue, gold, or purple
    const t = Math.random();
    if (t < 0.55)      this.color = [200, 215, 255];
    else if (t < 0.78) this.color = [200, 169, 110];
    else               this.color = [130, 110, 240];
  }
  draw(ctx, time) {
    const alpha = 0.2 + 0.45 * (0.5 + 0.5 * Math.sin(time * this.speed + this.phase));
    const [r, g, b] = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    ctx.fill();
  }
}

// ── React component ───────────────────────────────────────────
export default function FinancialRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const FONT_SIZE = 13;
    const COL_W     = 28;

    let cols  = [];
    let stars = [];
    let rafId;
    let lastTime = performance.now();
    let elapsed = 0;

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = `${FONT_SIZE}px "DM Mono", "Courier New", monospace`;

      const numCols = Math.floor(canvas.width / COL_W);
      cols = Array.from({ length: numCols }, (_, i) =>
        new RainColumn(i * COL_W, COL_W, FONT_SIZE, canvas.height)
      );

      // Galaxy stars — scale count to screen area
      const starCount = Math.floor((canvas.width * canvas.height) / 6000);
      stars = Array.from({ length: starCount }, () => new GalaxyStar(canvas.width, canvas.height));

      // Pre-fill canvas dark so first frame isn't white
      ctx.fillStyle = 'rgba(8, 8, 14, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      // Fade trail
      ctx.fillStyle = 'rgba(8, 8, 14, 0.13)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw galaxy stars beneath rain
      for (const star of stars) {
        star.draw(ctx, elapsed);
      }

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
        top: 0, left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
