import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAdminSession } from '../utils/auth';
import { Home, LogOut, Save, Download, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './AdminDashboard.module.css';

const TABS = ['Hero','Skills','Experience','ACCA','Projects','Education','Certifications','Contact','Custom Sections'];

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.collapsible}>
      <button className={styles.collapsibleHeader} onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {open && <div className={styles.collapsibleBody}>{children}</div>}
    </div>
  );
}

function F({ label, children }) {
  return <div className={styles.field}><label>{label}</label>{children}</div>;
}

// Deep clone helper
const clone = d => JSON.parse(JSON.stringify(d));

export default function AdminDashboard({ data, setData, onLogout }) {
  const navigate = useNavigate();
  const [fd, setFd] = useState(data);
  const [tab, setTab] = useState('Hero');
  const [saved, setSaved] = useState(false);

  const upd = (path, val) => {
    setFd(prev => {
      const next = clone(prev);
      const keys = path.split('.');
      let o = next;
      for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
      o[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const save = () => { setData(fd); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(fd, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const logout = () => { onLogout(); navigate('/'); };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span>Admin</span><span style={{color:'var(--accent)'}}>&nbsp;Panel</span></div>
        <nav className={styles.nav}>
          {TABS.map(t => <button key={t} className={`${styles.navItem} ${tab===t?styles.navActive:''}`} onClick={() => setTab(t)}>{t}</button>)}
        </nav>
        <div className={styles.sideActions}>
          <button className={styles.sideBtn} onClick={() => navigate('/')}><Home size={14}/> View Site</button>
          <button className={styles.sideBtn} onClick={save}><Save size={14}/> {saved ? '✓ Saved!' : 'Save'}</button>
          <button className={`${styles.sideBtn} ${styles.sideBtnPrimary}`} onClick={exportJson}><Download size={14}/> Export JSON</button>
          <button className={`${styles.sideBtn} ${styles.sideBtnDanger}`} onClick={logout}><LogOut size={14}/> Logout</button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <h1>{tab}</h1>
          <p>Changes are live. Export JSON to deploy permanently.</p>
        </div>

        {tab === 'Hero' && (
          <div className={styles.panel}>
            <F label="First Name"><input className={styles.inp} value={fd.hero.nameFirst} onChange={e => upd('hero.nameFirst', e.target.value)}/></F>
            <F label="Last Name"><input className={styles.inp} value={fd.hero.nameLast} onChange={e => upd('hero.nameLast', e.target.value)}/></F>
            <F label="Availability Tag"><input className={styles.inp} value={fd.hero.tagline} onChange={e => upd('hero.tagline', e.target.value)}/></F>
            <F label="Sub-title"><input className={styles.inp} value={fd.hero.title} onChange={e => upd('hero.title', e.target.value)}/></F>
            <F label="Professional Summary"><textarea className={styles.ta} value={fd.hero.summary} onChange={e => upd('hero.summary', e.target.value)}/></F>
            <F label="Relocate/Remote Text (footer)"><input className={styles.inp} value={fd.hero.relocateText} onChange={e => upd('hero.relocateText', e.target.value)}/></F>

            {/* ── Hero Buttons (Hire Me, LinkedIn, GitHub, Download CV) ── */}
            <div className={styles.fieldLabel} style={{ marginTop: '1.2rem' }}>Hero Buttons</div>
            <p className={styles.hint} style={{ marginBottom: '1rem' }}>
              Edit the label and URL for each button. "Hire Me" uses mailto: — update the email here when it changes.
            </p>
            {(fd.hero.links || []).map((link, li) => (
              <div key={li} className={styles.collapsible} style={{ marginBottom: '0.7rem' }}>
                <div className={styles.collapsibleHeader} style={{ cursor: 'default' }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem' }}>
                    {link.primary ? '★ ' : ''}{link.label || `Button ${li + 1}`}
                  </span>
                  <button
                    className={`${styles.add} ${styles.addDanger}`}
                    style={{ margin: 0 }}
                    onClick={() => {
                      const links = clone(fd.hero.links);
                      links.splice(li, 1);
                      setFd(p => ({ ...p, hero: { ...p.hero, links } }));
                    }}
                  >
                    <Trash2 size={13}/> Remove
                  </button>
                </div>
                <div className={styles.collapsibleBody}>
                  <F label="Button Label">
                    <input
                      className={styles.inp}
                      value={link.label}
                      onChange={e => {
                        const links = clone(fd.hero.links);
                        links[li].label = e.target.value;
                        setFd(p => ({ ...p, hero: { ...p.hero, links } }));
                      }}
                    />
                  </F>
                  <F label="URL (use mailto: for email, /path for files, https:// for external)">
                    <input
                      className={styles.inp}
                      value={link.url}
                      placeholder="mailto:you@email.com  or  https://linkedin.com/in/..."
                      onChange={e => {
                        const links = clone(fd.hero.links);
                        links[li].url = e.target.value;
                        setFd(p => ({ ...p, hero: { ...p.hero, links } }));
                      }}
                    />
                  </F>
                  <F label="Style">
                    <select
                      className={styles.sel}
                      value={link.primary ? 'primary' : 'secondary'}
                      onChange={e => {
                        const links = clone(fd.hero.links);
                        links[li].primary = e.target.value === 'primary';
                        setFd(p => ({ ...p, hero: { ...p.hero, links } }));
                      }}
                    >
                      <option value="primary">Gold (Primary)</option>
                      <option value="secondary">Outline (Secondary)</option>
                    </select>
                  </F>
                </div>
              </div>
            ))}
            <button
              className={styles.addSection}
              onClick={() => {
                const links = clone(fd.hero.links || []);
                links.push({ label: 'New Button', url: '', primary: false });
                setFd(p => ({ ...p, hero: { ...p.hero, links } }));
              }}
            >
              <Plus size={14}/> Add Button
            </button>
          </div>
        )}

        {tab === 'Skills' && (
          <div className={styles.panel}>
            {fd.skills.map((g, gi) => (
              <Section key={g.id} title={g.category} defaultOpen={gi===0}>
                <F label="Category Name"><input className={styles.inp} value={g.category} onChange={e => { const s=clone(fd.skills); s[gi].category=e.target.value; setFd(p=>({...p,skills:s})); }}/></F>
                <div className={styles.fieldLabel}>Skills</div>
                {g.items.map((item, ii) => (
                  <div key={ii} className={styles.row}>
                    <input className={styles.inpSm} value={item} onChange={e => { const s=clone(fd.skills); s[gi].items[ii]=e.target.value; setFd(p=>({...p,skills:s})); }}/>
                    <button className={styles.del} onClick={() => { const s=clone(fd.skills); s[gi].items.splice(ii,1); setFd(p=>({...p,skills:s})); }}><Trash2 size={13}/></button>
                  </div>
                ))}
                <button className={styles.add} onClick={() => { const s=clone(fd.skills); s[gi].items.push('New Skill'); setFd(p=>({...p,skills:s})); }}><Plus size={13}/> Add Skill</button>
                <button className={`${styles.add} ${styles.addDanger}`} onClick={() => setFd(p=>({...p,skills:p.skills.filter((_,i)=>i!==gi)}))}><Trash2 size={13}/> Delete Group</button>
              </Section>
            ))}
            <button className={styles.addSection} onClick={() => setFd(p=>({...p,skills:[...p.skills,{id:`sk-${Date.now()}`,category:'New Category',icon:null,items:[]}]}))}><Plus size={14}/> Add Skill Group</button>
          </div>
        )}

        {tab === 'Experience' && (
          <div className={styles.panel}>
            {fd.experience.map((exp, ei) => (
              <Section key={exp.id} title={exp.role} defaultOpen={ei===0}>
                {['role','company','location','date','context'].map(field => (
                  <F key={field} label={field.charAt(0).toUpperCase()+field.slice(1)}>
                    <input className={styles.inp} value={exp[field]||''} onChange={e => { const ex=clone(fd.experience); ex[ei][field]=e.target.value; setFd(p=>({...p,experience:ex})); }}/>
                  </F>
                ))}
                <div className={styles.fieldLabel}>Bullet Points</div>
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className={styles.row}>
                    <textarea className={styles.inpSm} style={{height:'60px'}} value={b} onChange={e => { const ex=clone(fd.experience); ex[ei].bullets[bi]=e.target.value; setFd(p=>({...p,experience:ex})); }}/>
                    <button className={styles.del} onClick={() => { const ex=clone(fd.experience); ex[ei].bullets.splice(bi,1); setFd(p=>({...p,experience:ex})); }}><Trash2 size={13}/></button>
                  </div>
                ))}
                <button className={styles.add} onClick={() => { const ex=clone(fd.experience); ex[ei].bullets.push('New bullet'); setFd(p=>({...p,experience:ex})); }}><Plus size={13}/> Add Bullet</button>
              </Section>
            ))}
            <button className={styles.addSection} onClick={() => setFd(p=>({...p,experience:[...p.experience,{id:`exp-${Date.now()}`,role:'New Role',company:'',location:'',date:'',partTime:false,context:'',bullets:[]}]}))}><Plus size={14}/> Add Experience</button>
          </div>
        )}

        {tab === 'ACCA' && (
          <div className={styles.panel}>
            <F label="Title"><input className={styles.inp} value={fd.acca.title} onChange={e => upd('acca.title',e.target.value)}/></F>
            <F label="Subtitle"><input className={styles.inp} value={fd.acca.subtitle} onChange={e => upd('acca.subtitle',e.target.value)}/></F>
            <F label="Papers Passed"><input className={styles.inp} type="number" value={fd.acca.totalPassed} onChange={e => upd('acca.totalPassed',parseInt(e.target.value))}/></F>
            <F label="Average Score (%)"><input className={styles.inp} type="number" value={fd.acca.avgScore} onChange={e => upd('acca.avgScore',parseFloat(e.target.value))}/></F>
            <F label="Status Label"><input className={styles.inp} value={fd.acca.status} onChange={e => upd('acca.status',e.target.value)}/></F>
            <div className={styles.fieldLabel} style={{marginTop:'1.5rem'}}>Paper Breakdown</div>
            {fd.acca.papers.map((paper, pi) => (
              <div key={paper.code} className={styles.paperRow}>
                <span className={styles.paperCode}>{paper.code}</span>
                <span className={styles.paperNameSmall}>{paper.name}</span>
                <select className={styles.sel} value={paper.status} onChange={e => { const p=clone(fd.acca); p.papers[pi].status=e.target.value; setFd(prev=>({...prev,acca:p})); }}>
                  <option value="passed">Passed</option>
                  <option value="pending">Pending</option>
                  <option value="upcoming">Upcoming</option>
                </select>
                <input className={styles.inpXs} type="number" placeholder="Score" value={paper.score||''} onChange={e => { const p=clone(fd.acca); p.papers[pi].score=e.target.value?parseInt(e.target.value):null; setFd(prev=>({...prev,acca:p})); }}/>
                <input className={styles.inpXs} placeholder="Note" value={paper.note||''} onChange={e => { const p=clone(fd.acca); p.papers[pi].note=e.target.value; setFd(prev=>({...prev,acca:p})); }}/>
              </div>
            ))}
          </div>
        )}

        {tab === 'Projects' && (
          <div className={styles.panel}>
            {fd.projects.map((proj, pi) => (
              <Section key={proj.id} title={proj.name} defaultOpen={pi===0}>
                <F label="Name"><input className={styles.inp} value={proj.name} onChange={e => { const p=clone(fd.projects); p[pi].name=e.target.value; setFd(prev=>({...prev,projects:p})); }}/></F>
                <F label="Tags (comma-separated)"><input className={styles.inp} value={proj.tags.join(', ')} onChange={e => { const p=clone(fd.projects); p[pi].tags=e.target.value.split(',').map(t=>t.trim()); setFd(prev=>({...prev,projects:p})); }}/></F>
                <F label="Short Description"><textarea className={styles.ta} style={{minHeight:'70px'}} value={proj.description} onChange={e => { const p=clone(fd.projects); p[pi].description=e.target.value; setFd(prev=>({...prev,projects:p})); }}/></F>
                <F label="Detailed Explanation (shown in modal)"><textarea className={styles.ta} value={proj.details} onChange={e => { const p=clone(fd.projects); p[pi].details=e.target.value; setFd(prev=>({...prev,projects:p})); }}/></F>
                <F label="Embed URL (Power BI / iframe)"><input className={styles.inp} value={proj.embedUrl} placeholder="https://..." onChange={e => { const p=clone(fd.projects); p[pi].embedUrl=e.target.value; setFd(prev=>({...prev,projects:p})); }}/></F>
                <F label="File Path (for PDF/Image)"><input className={styles.inp} value={proj.fileUrl} placeholder="/projects/file.pdf" onChange={e => { const p=clone(fd.projects); p[pi].fileUrl=e.target.value; setFd(prev=>({...prev,projects:p})); }}/></F>
                <F label="File Type"><select className={styles.sel} value={proj.fileType||''} onChange={e => { const p=clone(fd.projects); p[pi].fileType=e.target.value; setFd(prev=>({...prev,projects:p})); }}><option value="">—</option><option value="pdf">PDF</option><option value="image">Image</option></select></F>
                <button className={`${styles.add} ${styles.addDanger}`} onClick={() => setFd(p=>({...p,projects:p.projects.filter((_,i)=>i!==pi)}))}><Trash2 size={13}/> Delete</button>
              </Section>
            ))}
            <button className={styles.addSection} onClick={() => setFd(p=>({...p,projects:[...p.projects,{id:`proj-${Date.now()}`,name:'New Project',tags:[],description:'',details:'',embedUrl:'',embedType:'powerbi',fileUrl:'',fileType:''}]}))}><Plus size={14}/> Add Project</button>
          </div>
        )}

        {tab === 'Education' && (
          <div className={styles.panel}>
            {fd.education.map((edu, ei) => (
              <Section key={edu.id} title={edu.degree} defaultOpen={ei===0}>
                {['degree','institution','date','status','description'].map(field => (
                  <F key={field} label={field.charAt(0).toUpperCase()+field.slice(1)}>
                    {field==='description'
                      ? <textarea className={styles.ta} style={{minHeight:'70px'}} value={edu[field]||''} onChange={e => { const ed=clone(fd.education); ed[ei][field]=e.target.value; setFd(p=>({...p,education:ed})); }}/>
                      : <input className={styles.inp} value={edu[field]||''} onChange={e => { const ed=clone(fd.education); ed[ei][field]=e.target.value; setFd(p=>({...p,education:ed})); }}/>}
                  </F>
                ))}
                <div className={styles.fieldLabel}>Modules</div>
                {edu.modules.map((m, mi) => (
                  <div key={mi} className={styles.row}>
                    <input className={styles.inpSm} value={m} onChange={e => { const ed=clone(fd.education); ed[ei].modules[mi]=e.target.value; setFd(p=>({...p,education:ed})); }}/>
                    <button className={styles.del} onClick={() => { const ed=clone(fd.education); ed[ei].modules.splice(mi,1); setFd(p=>({...p,education:ed})); }}><Trash2 size={13}/></button>
                  </div>
                ))}
                <button className={styles.add} onClick={() => { const ed=clone(fd.education); ed[ei].modules.push('Module'); setFd(p=>({...p,education:ed})); }}><Plus size={13}/> Add Module</button>
                <button className={`${styles.add} ${styles.addDanger}`} onClick={() => setFd(p=>({...p,education:p.education.filter((_,i)=>i!==ei)}))}><Trash2 size={13}/> Delete</button>
              </Section>
            ))}
            <button className={styles.addSection} onClick={() => setFd(p=>({...p,education:[...p.education,{id:`edu-${Date.now()}`,degree:'New Qualification',institution:'',date:'',status:'',description:'',modules:[]}]}))}><Plus size={14}/> Add Education</button>
          </div>
        )}

        {tab === 'Certifications' && (
          <div className={styles.panel}>
            {fd.certifications.map((cert, ci) => (
              <Section key={cert.id} title={cert.name} defaultOpen={ci===0}>
                <F label="Name"><input className={styles.inp} value={cert.name} onChange={e => { const c=clone(fd.certifications); c[ci].name=e.target.value; setFd(p=>({...p,certifications:c})); }}/></F>
                <F label="Issuer"><input className={styles.inp} value={cert.issuer} onChange={e => { const c=clone(fd.certifications); c[ci].issuer=e.target.value; setFd(p=>({...p,certifications:c})); }}/></F>
                <F label="Date"><input className={styles.inp} value={cert.date} onChange={e => { const c=clone(fd.certifications); c[ci].date=e.target.value; setFd(p=>({...p,certifications:c})); }}/></F>
                <div className={styles.fieldLabel}>Key Learnings</div>
                {cert.learnings.map((l, li) => (
                  <div key={li} className={styles.row}>
                    <input className={styles.inpSm} value={l} onChange={e => { const c=clone(fd.certifications); c[ci].learnings[li]=e.target.value; setFd(p=>({...p,certifications:c})); }}/>
                    <button className={styles.del} onClick={() => { const c=clone(fd.certifications); c[ci].learnings.splice(li,1); setFd(p=>({...p,certifications:c})); }}><Trash2 size={13}/></button>
                  </div>
                ))}
                <button className={styles.add} onClick={() => { const c=clone(fd.certifications); c[ci].learnings.push('New learning'); setFd(p=>({...p,certifications:c})); }}><Plus size={13}/> Add Learning</button>
              </Section>
            ))}
            <button className={styles.addSection} onClick={() => setFd(p=>({...p,certifications:[...p.certifications,{id:`cert-${Date.now()}`,name:'New Certificate',issuer:'',date:'',learnings:[]}]}))}><Plus size={14}/> Add Certificate</button>
          </div>
        )}

        {tab === 'Contact' && (
          <div className={styles.panel}>
            {['email','phone','linkedin','github','location'].map(f => (
              <F key={f} label={f.charAt(0).toUpperCase()+f.slice(1)}><input className={styles.inp} value={fd.contact[f]||''} onChange={e => upd(`contact.${f}`,e.target.value)}/></F>
            ))}
            <F label="Hire Box Text"><textarea className={styles.ta} style={{minHeight:'70px'}} value={fd.contact.hireText} onChange={e => upd('contact.hireText',e.target.value)}/></F>
          </div>
        )}

        {tab === 'Custom Sections' && (
          <div className={styles.panel}>
            <p className={styles.hint}>Add custom sections (e.g. "Achievements") that appear between Certifications and Contact.</p>
            {(fd.customSections||[]).map((sec, si) => (
              <Section key={sec.id||si} title={sec.title||'New Section'} defaultOpen={si===0}>
                <F label="Section Title"><input className={styles.inp} value={sec.title} onChange={e => { const cs=clone(fd.customSections); cs[si].title=e.target.value; setFd(p=>({...p,customSections:cs})); }}/></F>
                <F label="Layout">
                  <select className={styles.sel} value={sec.layout} onChange={e => { const cs=clone(fd.customSections); cs[si].layout=e.target.value; setFd(p=>({...p,customSections:cs})); }}>
                    <option value="cards">Cards (Title + Description)</option>
                    <option value="bullets">Bullet List</option>
                  </select>
                </F>
                <div className={styles.fieldLabel}>Items</div>
                {(sec.items||[]).map((item, ii) => (
                  <div key={ii} className={styles.row}>
                    {sec.layout==='cards'
                      ? <div style={{flex:1,display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                          <input className={styles.inpSm} placeholder="Title" value={item.title||''} onChange={e => { const cs=clone(fd.customSections); cs[si].items[ii].title=e.target.value; setFd(p=>({...p,customSections:cs})); }}/>
                          <textarea className={styles.inpSm} placeholder="Description" style={{height:'55px'}} value={item.description||''} onChange={e => { const cs=clone(fd.customSections); cs[si].items[ii].description=e.target.value; setFd(p=>({...p,customSections:cs})); }}/>
                        </div>
                      : <input className={styles.inpSm} placeholder="Bullet text" value={item.text||''} onChange={e => { const cs=clone(fd.customSections); cs[si].items[ii]={text:e.target.value}; setFd(p=>({...p,customSections:cs})); }}/>
                    }
                    <button className={styles.del} onClick={() => { const cs=clone(fd.customSections); cs[si].items.splice(ii,1); setFd(p=>({...p,customSections:cs})); }}><Trash2 size={13}/></button>
                  </div>
                ))}
                <button className={styles.add} onClick={() => { const cs=clone(fd.customSections); cs[si].items=[...(cs[si].items||[])]; cs[si].items.push(sec.layout==='cards'?{title:'',description:''}:{text:''}); setFd(p=>({...p,customSections:cs})); }}><Plus size={13}/> Add Item</button>
                <button className={`${styles.add} ${styles.addDanger}`} onClick={() => setFd(p=>({...p,customSections:p.customSections.filter((_,i)=>i!==si)}))}><Trash2 size={13}/> Delete Section</button>
              </Section>
            ))}
            <button className={styles.addSection} onClick={() => setFd(p=>({...p,customSections:[...(p.customSections||[]),{id:`cs-${Date.now()}`,title:'New Section',layout:'cards',items:[]}]}))}><Plus size={14}/> Add Custom Section</button>
          </div>
        )}
      </main>
    </div>
  );
}
