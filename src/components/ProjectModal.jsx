import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, FileText, BarChart2, Image, GitBranch } from 'lucide-react';
import styles from './ProjectModal.module.css';

const TYPE_ICONS = {
  powerbi: BarChart2,
  pdf: FileText,
  image: Image,
  github: GitBranch,
  excel: FileText,
};

const TYPE_LABELS = {
  powerbi: 'Power BI Dashboard',
  pdf: 'PDF Document',
  image: 'Image Preview',
  github: 'GitHub Repository',
  excel: 'Excel Spreadsheet',
};

function EmbedArea({ project }) {
  if (project.embedUrl) {
    return (
      <div className={styles.embedWrapper}>
        <iframe
          title={project.name}
          src={project.embedUrl}
          frameBorder="0"
          allowFullScreen
          className={styles.iframe}
          onContextMenu={e => e.preventDefault()}
        />
      </div>
    );
  }

  if (project.fileUrl && project.fileType === 'pdf') {
    return (
      <div className={styles.embedWrapper}>
        <iframe
          title={project.name}
          src={`${project.fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          frameBorder="0"
          className={styles.iframe}
          onContextMenu={e => e.preventDefault()}
        />
      </div>
    );
  }

  if (project.fileUrl && project.fileType === 'image') {
    return (
      <div className={styles.imageWrapper} onContextMenu={e => e.preventDefault()}>
        <img src={project.fileUrl} alt={project.name} className={styles.image} draggable={false} />
      </div>
    );
  }

  // Placeholder
  const Icon = TYPE_ICONS[project.embedType] || BarChart2;
  const label = TYPE_LABELS[project.embedType] || 'Project Preview';
  return (
    <div className={styles.placeholder}>
      <Icon size={32} color="var(--accent)" style={{ opacity: 0.5 }} />
      <span className={styles.placeholderTitle}>{label} — Coming Soon</span>
      <p className={styles.placeholderSub}>
        The interactive {label.toLowerCase()} will be embedded here once published. Add the embed URL in the Admin Dashboard.
      </p>
    </div>
  );
}

export default function ProjectModal({ project, onClose }) {
  if (!project) return null;

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
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>

          {/* Top gradient bar */}
          <div className={styles.gradientBar} />

          <div className={styles.header}>
            <div className={styles.tags}>
              {project.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>{tag}</span>
              ))}
            </div>
            <h2 className={styles.title}>{project.name}</h2>
          </div>

          <div className={styles.body}>
            <p className={styles.details}>{project.details || project.description}</p>

            <EmbedArea project={project} />

            {project.link && project.link !== '#' && (
              <a href={project.link} target="_blank" rel="noreferrer" className={styles.extLink}>
                {project.linkText || 'View Project'} <ExternalLink size={14} />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
