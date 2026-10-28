'use client';

import { useRef, useState } from 'react';

export default function CopyText({ text, label }: { text: string; label: string }) {
  const codeRef = useRef<HTMLElement>(null);
  const [done, setDone] = useState(false);

  const selectText = () => {
    if (!codeRef.current) return;
    const range = document.createRange();
    range.selectNodeContents(codeRef.current);
    const sel = getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const copy = () => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      })
      .catch(selectText) ?? selectText();
  };

  return (
    <div className="copy">
      <code ref={codeRef}>{text}</code>
      <button onClick={copy}>{done ? '복사됨' : label}</button>
    </div>
  );
}
