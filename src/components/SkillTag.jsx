import React from 'react';
import {
  BarChart2, TrendingUp, Shield, FileText, Code2, Globe,
  BookOpen, Award
} from 'lucide-react';
import styles from './SkillTag.module.css';

// Map icon name strings (stored in data.json) to Lucide components
const ICON_MAP = {
  BarChart2,
  TrendingUp,
  Shield,
  FileText,
  Code2,
  Globe,
  BookOpen,
  Award,
};

export default function SkillTag({ skill }) {
  return <span className={styles.tag}>{skill}</span>;
}

export function SkillGroupHeader({ icon }) {
  const Icon = icon ? ICON_MAP[icon] : null;
  if (!Icon) return null;
  return <Icon size={14} color="var(--accent)" style={{ opacity: 0.8, flexShrink: 0 }} />;
}
