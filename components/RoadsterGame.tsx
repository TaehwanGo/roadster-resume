'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createGame, type ControlKey, type FinishResult, type GameApi } from '@/lib/engine';
import { EMAIL, RESUME_URL, STAGES } from '@/lib/stages';
import CopyText from './CopyText';
import Dossier from './Dossier';

type Mode = 'loading' | 'intro' | 'drive' | 'finish';

const TOUCH_LEFT: [ControlKey, string, string][] = [
  ['left', '◀', '왼쪽'],
  ['right', '▶', '오른쪽'],
];
const TOUCH_RIGHT: [ControlKey, string][] = [
  ['boost', 'BOOST'],
  ['jump', 'JUMP'],
  ['down', 'BRAKE'],
  ['up', 'GAS'],
];

function cssFont(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

export default function RoadsterGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kmhRef = useRef<HTMLSpanElement>(null);
  const boostBarRef = useRef<HTMLDivElement>(null);
  const boostFillRef = useRef<HTMLElement>(null);
  const orbsRef = useRef<HTMLElement>(null);
  const zeroRef = useRef<HTMLElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [mode, setMode] = useState<Mode>('loading');
  const [stage, setStage] = useState(-1);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [toast, setToast] = useState({ msg: '', show: false });
  const [result, setResult] = useState<FinishResult | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 900);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current!;
    createGame(
      canvas,
      {
        kmh: kmhRef.current!,
        boostBar: boostBarRef.current!,
        boostFill: boostFillRef.current!,
        orbs: orbsRef.current!,
        zero: zeroRef.current!,
      },
      {
        onStage: (i) => {
          setStage(i);
          if (i >= 0) setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
        },
        onToast: showToast,
        onFinish: (r) => {
          setResult(r);
          setMode('finish');
        },
        onIntro: () => {
          setSeen(new Set());
          setMode('intro');
        },
      },
      {
        body: cssFont('--font-body', '"Apple SD Gothic Neo", sans-serif'),
        mono: cssFont('--font-mono', 'monospace'),
        display: cssFont('--font-display', 'sans-serif'),
      },
    ).then((api) => {
      if (cancelled) {
        api.dispose();
        return;
      }
      apiRef.current = api;
      setMode('intro');
    });
    return () => {
      cancelled = true;
      apiRef.current?.dispose();
      apiRef.current = null;
      clearTimeout(toastTimer.current);
    };
  }, [showToast]);

  const start = () => {
    apiRef.current?.start();
    setMode('drive');
  };
  const toIntro = () => {
    apiRef.current?.toIntro();
    setSeen(new Set());
    setResult(null);
    setMode('intro');
  };
  const jumpTo = (i: number) => {
    apiRef.current?.jumpTo(i);
    setMode('drive');
  };

  const touchHandlers = (k: ControlKey) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.classList.add('on');
      apiRef.current?.setKey(k, true);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.classList.remove('on');
      apiRef.current?.setKey(k, false);
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.classList.remove('on');
      apiRef.current?.setKey(k, false);
    },
    onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.classList.remove('on');
      apiRef.current?.setKey(k, false);
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <>
      <canvas ref={canvasRef} className="scene" aria-label="테슬라 로드스터를 몰며 고태환의 이력을 보는 3D 주행 게임" />

      <div className="hud">
        <section className="tele card" aria-label="주행 정보">
          <div className="tele-top">
            <span className="tele-name">고태환 · Roadster Run</span>
            <button className="home" onClick={toIntro} title="첫 화면으로 (R)">
              처음 화면
            </button>
          </div>
          <div className="speed">
            <span ref={kmhRef}>0</span>
            <small>KM/H</small>
          </div>
          <div className="boost" ref={boostBarRef} title="부스터 에너지">
            <i ref={boostFillRef} />
          </div>
          <dl className="stats">
            <div>
              <dt>0–100</dt>
              <dd ref={zeroRef}>—</dd>
            </div>
            <div>
              <dt>ORB</dt>
              <dd ref={orbsRef}>0</dd>
            </div>
            <div>
              <dt>STAGE</dt>
              <dd>
                {Math.max(stage + 1, 0)}/{STAGES.length}
              </dd>
            </div>
          </dl>
          <nav className="strip" aria-label="스테이지로 이동">
            {STAGES.map((s, i) => (
              <button
                key={s.title}
                className={i === stage ? 'on' : seen.has(i) ? 'seen' : undefined}
                title={`${i + 1}. ${s.title}`}
                aria-label={`${i + 1}번 스테이지 ${s.title}로 이동`}
                onClick={(e) => {
                  jumpTo(i);
                  e.currentTarget.blur();
                }}
              />
            ))}
          </nav>
          <div className="strip-label">칸을 누르면 그 스테이지로 이동</div>
        </section>

        <Dossier stage={stage} />

        <div className="keys">
          <span>
            <kbd>↑</kbd>가속
          </span>
          <span>
            <kbd>↓</kbd>브레이크
          </span>
          <span>
            <kbd>← →</kbd>조향 · 공중에서 배럴 롤
          </span>
          <span>
            <kbd>Shift</kbd>부스터
          </span>
          <span>
            <kbd>Space</kbd>점프 · 길게 누르면 더 높이
          </span>
          <span>
            <kbd>R</kbd>첫 화면
          </span>
        </div>

        <div className="touch">
          <div className="pad">
            {TOUCH_LEFT.map(([k, txt, label]) => (
              <button key={k} className="tb" aria-label={label} {...touchHandlers(k)}>
                {txt}
              </button>
            ))}
          </div>
          <div className="pad right">
            {TOUCH_RIGHT.map(([k, txt]) => (
              <button key={k} className={`tb${k === 'boost' ? ' boost' : ''}`} {...touchHandlers(k)}>
                {txt}
              </button>
            ))}
          </div>
        </div>

        <div className={`toast${toast.show ? ' show' : ''}`}>{toast.msg}</div>
      </div>

      {(mode === 'intro' || mode === 'loading') && (
        <div className="overlay">
          <div className="sheet">
            <div className="kicker">Tesla Roadster 컨셉 · 이력서 주행</div>
            <h1>
              ROADSTER <em>RUN</em>
            </h1>
            <div className="who">고태환 · Forward Deployed Engineer</div>
            <p className="lede">
              해질녘 테스트 트랙을 달리며 15개 스테이지에서 경력과 프로젝트를 확인하세요. 표지판에 다가가면 상세 내용이
              열립니다. 길 위의 파란 오브는 부스터를 채워 줍니다.
            </p>
            <dl className="ctrl">
              <dt>↑ / W</dt>
              <dd>가속</dd>
              <dt>↓ / S</dt>
              <dd>브레이크 · 후진</dd>
              <dt>← → / A D</dt>
              <dd>조향, 공중에서는 스러스터로 배럴 롤</dd>
              <dt>Shift</dt>
              <dd>로켓 스러스터 부스터</dd>
              <dt>Space</dt>
              <dd>점프, 길게 누르면 최대 1초까지 더 높이</dd>
              <dt>R</dt>
              <dd>첫 화면으로</dd>
            </dl>
            <div className="row">
              <button className="go" onClick={start} disabled={mode === 'loading'} autoFocus>
                {mode === 'loading' ? '준비 중' : '출발'}
              </button>
              <a className="ghost" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
                이력서를 문서로 보기
              </a>
            </div>
          </div>
        </div>
      )}

      {mode === 'finish' && result && (
        <div className="overlay">
          <div className="sheet">
            <div className="kicker">Finish</div>
            <h1 className="ko">완주했습니다</h1>
            <p className="lede">끝까지 달려 주셔서 감사합니다. 함께 일할 이야기가 있다면 아래로 연락 주세요.</p>
            <dl className="result">
              <div>
                <dt>TIME</dt>
                <dd>{result.time.toFixed(1)}s</dd>
              </div>
              <div>
                <dt>ORB</dt>
                <dd>{result.orbs}</dd>
              </div>
              <div>
                <dt>BEST 0–100</dt>
                <dd>{result.zeroBest ? `${result.zeroBest.toFixed(2)}s` : '—'}</dd>
              </div>
            </dl>
            <CopyText text={EMAIL} label="이메일 복사" />
            <div className="row">
              <button className="go" onClick={toIntro}>
                처음부터
              </button>
              <button
                className="ghost"
                onClick={() => {
                  apiRef.current?.resume();
                  setMode('drive');
                }}
              >
                계속 달리기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
