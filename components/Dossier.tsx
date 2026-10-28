'use client';

import { useState } from 'react';
import { STAGES } from '@/lib/stages';
import CopyText from './CopyText';

const pad = (n: number) => String(n).padStart(2, '0');

export default function Dossier({ stage }: { stage: number }) {
  // phones show only the header until the driver opens it
  const [collapsed, setCollapsed] = useState(true);
  const st = stage >= 0 ? STAGES[stage] : null;

  return (
    <aside key={stage} className={`dossier card${collapsed ? ' collapsed' : ''}`} aria-live="polite">
      <div className="d-head">
        <span className="d-stage">{st ? `Stage ${pad(stage + 1)} · ${st.kicker}` : 'Start'}</span>
        <button className="d-toggle" onClick={() => setCollapsed((c) => !c)}>
          {collapsed ? '자세히' : '접기'}
        </button>
      </div>
      <h2>{st ? st.title : '출발선'}</h2>
      <div className="d-meta">{st ? st.meta : '↑ 가속 · Shift 부스터 · Space 점프 (길게 누르면 더 높이)'}</div>

      <div className="d-body">
        {st ? (
          <>
            {st.groups.map((g) => (
              <div className="d-group" key={g.h}>
                <h3>{g.h}</h3>
                <ul>
                  {g.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
            {st.email && <CopyText text={st.email} label="복사" />}
            {st.links && (
              <div className="links">
                {st.links.map(([label, href]) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                    {label} ↗
                  </a>
                ))}
              </div>
            )}
            {st.tech.length > 0 && (
              <div className="chips">
                {st.tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="d-group">
            <h3>COURSE</h3>
            <ul>
              {STAGES.map((s, k) => (
                <li key={s.title}>
                  {pad(k + 1)} {s.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
