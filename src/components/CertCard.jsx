import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CertCard.module.css';

export default function CertCard({ cert }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
      <button className={styles.header} onClick={() => setOpen(v => !v)}>
        <div className={styles.headerLeft}>
          <div className={styles.name}>{cert.name}</div>
          <div className={styles.issuer}>{cert.issuer}</div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.date}>{cert.date}</span>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>↓</span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.body}>
              <div className={styles.bodyLabel}>Key Learnings & Benefits</div>
              <ul className={styles.learnings}>
                {cert.learnings.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
