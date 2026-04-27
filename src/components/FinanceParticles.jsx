import React, { useRef, useMemo, useEffect } from 'react';
import styles from './FinanceParticles.module.css';

const TERMS = [
  'ACCA', 'IFRS 9', 'ISA 315', 'Power BI', 'DAX', 'IAS 1', 'SBR', 'AAA',
  'AFM', '68.8%', '77%', 'EBIT', 'WACC', 'NPV', 'DCF', 'P/E', 'ROA',
  'ISA 240', 'SBL', '€ 1,234', 'ISA 700', 'IAS 36', 'IFRS 15', 'ROI',
  'FP&A', 'BI', 'IFRS 16', 'ISA 500', 'Audit', 'Variance',
];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function FinanceParticles() {
  const particles = useMemo(() => TERMS.map((term, i) => ({
    id: i,
    term,
    left: `${randomBetween(2, 95)}%`,
    top: `${randomBetween(5, 90)}%`,
    duration: `${randomBetween(18, 40)}s`,
    delay: `${randomBetween(0, 20)}s`,
    opacity: randomBetween(0.04, 0.1),
    fontSize: `${randomBetween(0.6, 0.85)}rem`,
  })), []);

  return (
    <div className={styles.container} aria-hidden="true">
      {particles.map(p => (
        <span
          key={p.id}
          className={styles.particle}
          style={{
            left: p.left,
            top: p.top,
            '--duration': p.duration,
            '--delay': p.delay,
            '--opacity': p.opacity,
            fontSize: p.fontSize,
          }}
        >
          {p.term}
        </span>
      ))}
    </div>
  );
}
