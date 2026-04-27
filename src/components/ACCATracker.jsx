import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ACCATracker.module.css';

const LEVEL_ORDER = ['Knowledge', 'Skills', 'Strategic'];
const STATUS_CONFIG = {
  passed: { label: 'Passed', color: '#4caf82', bg: 'rgba(76,175,130,0.1)' },
  pending: { label: 'Pending', color: '#9090a8', bg: 'rgba(144,144,168,0.1)' },
  upcoming: { label: 'Upcoming', color: '#7c6dfa', bg: 'rgba(124,109,250,0.1)' },
};

// Animated SVG ring
function ProgressRing({ value, size = 120, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent)', lineHeight: 1 }}>{value}%</span>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.55rem', color: 'var(--text3)', letterSpacing: '0.08em', marginTop: 3 }}>COMPLETE</span>
      </div>
    </div>
  );
}

export default function ACCATracker({ acca }) {
  const [expanded, setExpanded] = useState(false);

  const progress = Math.round((acca.totalPassed / acca.totalPapers) * 100);
  const grouped = LEVEL_ORDER.map(level => ({
    level,
    papers: acca.papers.filter(p => p.level === level)
  }));

  return (
    <div className={styles.wrapper}>
      {/* Overview */}
      <div className={styles.overview}>
        <div className={styles.overviewLeft}>
          <h3 className={styles.title}>{acca.title}</h3>
          <p className={styles.subtitle}>{acca.subtitle}</p>
          <div className={styles.facts}>
            <span className={`${styles.fact} ${styles.factHighlight}`}>
              {acca.totalPassed} / {acca.totalPapers} Papers Passed
            </span>
            {acca.allFirstAttempt && <span className={styles.fact}>All First Attempt</span>}
            <span className={styles.fact}>Avg {acca.avgScore}%</span>
            {acca.specialMentions.map(m => (
              <span key={m} className={styles.fact}>{m} ✓</span>
            ))}
          </div>
          <button className={styles.toggleBtn} onClick={() => setExpanded(v => !v)}>
            {expanded ? '↑ Hide paper breakdown' : '↓ Show all 13 papers'}
          </button>
        </div>
        <div className={styles.ring}>
          <ProgressRing value={progress} />
          <div className={styles.ringLabel}>{acca.status}</div>
        </div>
      </div>

      {/* Full paper breakdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.breakdown}>
              {grouped.map(({ level, papers }) => (
                <div key={level} className={styles.levelGroup}>
                  <div className={styles.levelLabel}>{level} Level</div>
                  <div className={styles.paperGrid}>
                    {papers.map(paper => {
                      const cfg = STATUS_CONFIG[paper.status] || STATUS_CONFIG.pending;
                      return (
                        <div key={paper.code} className={styles.paperCard} style={{ '--card-accent': cfg.color }}>
                          <div className={styles.paperCode}>{paper.code}</div>
                          <div className={styles.paperName}>{paper.name}</div>
                          <div className={styles.paperFooter}>
                            <span className={styles.paperStatus} style={{ color: cfg.color, background: cfg.bg }}>
                              {cfg.label}
                            </span>
                            {paper.score && <span className={styles.paperScore}>{paper.score}%</span>}
                            {paper.note && <span className={styles.paperNote}>{paper.note}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
