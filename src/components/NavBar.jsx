import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';

const NAV_ITEMS = [
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'ACCA', href: '#acca' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];

export default function NavBar({ onAdminClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.navInner}>
        <div className={styles.brand}>
          <span className={styles.brandFirst}>Ananthakrishnan</span>
          <span className={styles.brandLast}>&nbsp;KJ</span>
        </div>

        {/* Desktop Nav */}
        <ul className={styles.navLinks}>
          {NAV_ITEMS.map(item => (
            <li key={item.label}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
          <li>
            <button className={styles.adminBtn} onClick={onAdminClick}>
              Admin
            </button>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        {NAV_ITEMS.map(item => (
          <a key={item.label} href={item.href} className={styles.mobileLink} onClick={handleNavClick}>
            {item.label}
          </a>
        ))}
        <button className={styles.mobileAdminBtn} onClick={() => { handleNavClick(); onAdminClick(); }}>
          Admin Panel
        </button>
      </div>
    </nav>
  );
}
