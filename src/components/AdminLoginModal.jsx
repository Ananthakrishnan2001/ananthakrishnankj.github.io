import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPassword, setAdminSession } from '../utils/auth';
import styles from './AdminLoginModal.module.css';

export default function AdminLoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const valid = await verifyPassword(password);
    if (valid) {
      setAdminSession();
      onSuccess();
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ y: -40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.lockIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>

          <h2 className={styles.title}>Admin Access</h2>
          <p className={styles.sub}>Enter your admin password to continue</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            {error && <div className={styles.error}>{error}</div>}
            <button type="submit" className={styles.btn} disabled={loading || !password}>
              {loading ? 'Verifying...' : 'Enter Dashboard →'}
            </button>
          </form>

          <button className={styles.closeBtn} onClick={onClose}>Cancel</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
