import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EduCard.module.css';

export default function EduCard({ edu }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
      <button className={styles.header} onClick={() => setOpen(v => !v)}>
        <div className={styles.headerLeft}>
          <div className={styles.degree}>{edu.degree}</div>
          <div className={styles.institution}>{edu.institution}</div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.date}>{edu.date}</span>
          {edu.status && <span className={styles.status}>{edu.status}</span>}
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>↓</span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.body}>
              {edu.description && <p className={styles.desc}>{edu.description}</p>}
              {edu.modules && edu.modules.length > 0 && (
                <>
                  <div className={styles.modulesLabel}>Core Modules</div>
                  <div className={styles.modules}>
                    {edu.modules.map((m, i) => <span key={i} className={styles.module}>{m}</span>)}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
