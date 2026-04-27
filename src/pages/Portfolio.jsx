import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FinancialRain from '../components/FinancialRain';
import NavBar from '../components/NavBar';
import AdminLoginModal from '../components/AdminLoginModal';
import ACCATracker from '../components/ACCATracker';
import CertCard from '../components/CertCard';
import EduCard from '../components/EduCard';
import ProjectModal from '../components/ProjectModal';
import SkillTag, { SkillGroupHeader } from '../components/SkillTag';
import { isAdminAuthenticated } from '../utils/auth';
import styles from './Portfolio.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function Portfolio({ data, onAdminLogin }) {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleAdminClick = () => {
    if (isAdminAuthenticated()) {
      navigate('/admin');
    } else {
      setShowLogin(true);
    }
  };

  if (!data) return null;
  const { hero, skills, experience, acca, projects, education, certifications, contact, customSections } = data;

  return (
    <>
      <FinancialRain />

      <NavBar onAdminClick={handleAdminClick} />

      <main className="wrapper" style={{ paddingTop: '80px' }}>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <div className={styles.heroTag}>
                <span className={styles.pulse} />
                {hero.tagline}
              </div>

              <h1 className={styles.heroName}>
                <span className={styles.nameFirst}>{hero.nameFirst}</span>
                <span className={styles.nameLast}>&nbsp;{hero.nameLast}</span>
              </h1>

              <p className={styles.heroTitle}>{hero.title}</p>

              <div className={styles.summaryBox}>
                <div className={styles.summaryLabel}>Professional Summary</div>
                <p className={styles.summaryText}>{hero.summary}</p>
              </div>

              <div className={styles.heroLinks}>
                {hero.links.map((link, i) => {
                  const isPdf = link.url.endsWith('.pdf');
                  const isExternal = link.url.startsWith('http');
                  return (
                    <a
                      key={i}
                      href={link.url}
                      className={link.primary ? styles.linkPrimary : styles.linkSecondary}
                      target={isPdf || isExternal ? '_blank' : undefined}
                      rel="noreferrer"
                      download={isPdf ? true : undefined}
                    >
                      {link.label}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SKILLS ── */}
        <motion.section id="skills" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>01</span>
            <h2 className={styles.sTitle}>Key Skills</h2>
            <div className={styles.sLine} />
          </div>
          <div className={styles.skillsGrid}>
            {skills.map(group => (
              <div key={group.id} className={styles.skillGroup}>
                <div className={styles.skillGroupTitle}>
                  {group.icon && <SkillGroupHeader icon={group.icon} />}
                  {group.category}
                </div>
                <div className={styles.skillTags}>
                  {group.items.map((skill, i) => <SkillTag key={i} skill={skill} />)}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── EXPERIENCE ── */}
        <motion.section id="experience" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>02</span>
            <h2 className={styles.sTitle}>Work Experience</h2>
            <div className={styles.sLine} />
          </div>
          <div className={styles.timeline}>
            {experience.map(exp => (
              <div key={exp.id} className={styles.expItem}>
                <div className={styles.expDot} />
                <div className={styles.expHeader}>
                  <div>
                    <div className={styles.expRole}>
                      {exp.role}
                      {exp.partTime && <span className={styles.partTimeBadge}>Part-Time</span>}
                    </div>
                    <div className={styles.expCompany}>{exp.company} · {exp.location}</div>
                  </div>
                  <div className={styles.expDate}>{exp.date}</div>
                </div>
                {exp.context && <p className={styles.expContext}>{exp.context}</p>}
                <ul className={styles.expBullets}>
                  {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── ACCA ── */}
        <motion.section id="acca" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>03</span>
            <h2 className={styles.sTitle}>ACCA Qualification</h2>
            <div className={styles.sLine} />
          </div>
          <ACCATracker acca={acca} />
        </motion.section>

        {/* ── PROJECTS ── */}
        <motion.section id="projects" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>04</span>
            <h2 className={styles.sTitle}>Projects</h2>
            <div className={styles.sLine} />
          </div>
          <div className={styles.projectsGrid}>
            {projects.map(proj => (
              <button key={proj.id} className={styles.projectCard} onClick={() => setSelectedProject(proj)}>
                <div className={styles.projTopBar} />
                <div className={styles.projTags}>
                  {proj.tags.map((t, i) => <span key={i} className={styles.projTag}>{t}</span>)}
                </div>
                <div className={styles.projName}>{proj.name}</div>
                <p className={styles.projDesc}>{proj.description}</p>
                <div className={styles.projExplore}>Click to explore ↗</div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── EDUCATION ── */}
        <motion.section id="education" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>05</span>
            <h2 className={styles.sTitle}>Education</h2>
            <div className={styles.sLine} />
          </div>
          <div>
            {education.map(edu => <EduCard key={edu.id} edu={edu} />)}
          </div>
        </motion.section>

        {/* ── CERTIFICATIONS ── */}
        <motion.section id="certifications" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>06</span>
            <h2 className={styles.sTitle}>Certifications</h2>
            <div className={styles.sLine} />
          </div>
          <div className={styles.certList}>
            {certifications.map(cert => <CertCard key={cert.id} cert={cert} />)}
          </div>
        </motion.section>

        {/* ── CUSTOM SECTIONS ── */}
        {customSections && customSections.map((sec, sIdx) => (
          <motion.section key={sec.id || sIdx} className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
            <div className={styles.sectionHeader}>
              <span className={styles.sNum}>0{7 + sIdx}</span>
              <h2 className={styles.sTitle}>{sec.title}</h2>
              <div className={styles.sLine} />
            </div>
            {sec.layout === 'cards' ? (
              <div className={styles.customCardsGrid}>
                {sec.items.map((item, i) => (
                  <div key={i} className={styles.customCard}>
                    <div className={styles.customCardTitle}>{item.title}</div>
                    <p className={styles.customCardDesc}>{item.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <ul className={styles.customBullets}>
                {sec.items.map((item, i) => <li key={i}>{item.text || item}</li>)}
              </ul>
            )}
          </motion.section>
        ))}

        {/* ── CONTACT ── */}
        <motion.section id="contact" className={styles.section} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sNum}>{`0${7 + (customSections?.length || 0)}`}</span>
            <h2 className={styles.sTitle}>Contact</h2>
            <div className={styles.sLine} />
          </div>

          <div className={styles.contactGrid}>
            <a href={`mailto:${contact.email}`} className={styles.contactCard}>
              <span className={styles.contactIcon}>✉</span>
              <div>
                <div className={styles.contactLabel}>Email</div>
                <div className={styles.contactValue}>{contact.email}</div>
              </div>
            </a>
            <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className={styles.contactCard}>
              <span className={styles.contactIcon}>📱</span>
              <div>
                <div className={styles.contactLabel}>Phone</div>
                <div className={styles.contactValue}>{contact.phone}</div>
              </div>
            </a>
            <a href={`https://linkedin.com/in/${contact.linkedin}`} target="_blank" rel="noreferrer" className={styles.contactCard}>
              <span className={styles.contactIcon}>💼</span>
              <div>
                <div className={styles.contactLabel}>LinkedIn</div>
                <div className={styles.contactValue}>{contact.linkedin}</div>
              </div>
            </a>
            <a href={`https://github.com/${contact.github}`} target="_blank" rel="noreferrer" className={styles.contactCard}>
              <span className={styles.contactIcon}>⌨</span>
              <div>
                <div className={styles.contactLabel}>GitHub</div>
                <div className={styles.contactValue}>{contact.github}</div>
              </div>
            </a>
          </div>

          <div className={styles.hireBox}>
            <h3>Open to Opportunities</h3>
            <p>{contact.hireText}</p>
            <a href={`mailto:${contact.email}`} className={styles.hireBtn}>Get in Touch →</a>
          </div>
        </motion.section>

      </main>

      <footer className={styles.footer}>
        <div className="wrapper">
          <div className={styles.footerRelocate}>{hero.relocateText}</div>
          <div className={styles.footerCopy}>
            Ananthakrishnan KJ &nbsp;·&nbsp; India · Open to Relocate &nbsp;·&nbsp; Built with React
          </div>
        </div>
      </footer>

      {showLogin && (
        <AdminLoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            onAdminLogin();        // update App state → triggers re-render → admin route resolves
            setShowLogin(false);
            navigate('/admin');
          }}
        />
      )}

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}
