import { useEffect, useMemo, useRef, useState } from 'react';
import { ASSETS, FIELD_FIGURE_IMAGES, FIGURE_IMAGES } from '../assets';
import { AUDIO_ASSETS, isAudioMuted, playSound } from '../audio';

const debugAssets = [
  ASSETS.startYard,
  ASSETS.gameYardBg,
  ASSETS.sandField,
  ASSETS.fallenKnife,
  ASSETS.playerOne,
  ASSETS.playerTwo,
  ...Object.values(FIELD_FIGURE_IMAGES),
  ...Object.values(FIGURE_IMAGES),
  '/assets/pixelart/000.png',
  '/assets/pixelart/004.JPG',
  '/assets/pixelart/007.jpeg',
];

type AssetStatus = 'pending' | 'ok' | 'error';

type DebugScreenProps = {
  isMuted: boolean;
  onToggleAudio: () => void;
};

export function DebugScreen({ isMuted, onToggleAudio }: DebugScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState(0);
  const [assetResults, setAssetResults] = useState<Record<string, AssetStatus>>({});
  const [audioMessage, setAudioMessage] = useState('Нажмите Audio test');
  const browserInfo = useMemo(() => getBrowserInfo(), []);

  useEffect(() => {
    let frameId = 0;
    let frames = 0;
    let lastTime = performance.now();

    const tick = (time: number) => {
      frames += 1;

      if (time - lastTime >= 1000) {
        setFps(Math.round((frames * 1000) / (time - lastTime)));
        frames = 0;
        lastTime = time;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const width = 240;
    const height = 140;
    const context = canvas.getContext('2d');

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = false;
    context.fillStyle = '#050505';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#ffd447';

    for (let y = 16; y < height - 16; y += 18) {
      for (let x = 16; x < width - 16; x += 18) {
        context.fillRect(x, y, 10, 10);
      }
    }

    context.fillStyle = '#f5f0df';
    context.font = '16px monospace';
    context.fillText(`DPR ${dpr.toFixed(2)}`, 16, height - 12);
  }, []);

  useEffect(() => {
    setAssetResults(
      debugAssets.reduce<Record<string, AssetStatus>>((results, src) => {
        results[src] = 'pending';
        return results;
      }, {}),
    );

    debugAssets.forEach((src) => {
      const image = new Image();

      image.onload = () => {
        setAssetResults((results) => ({ ...results, [src]: 'ok' }));
      };
      image.onerror = () => {
        setAssetResults((results) => ({ ...results, [src]: 'error' }));
      };
      image.src = src;
    });
  }, []);

  function handleAudioTest() {
    if (isMuted || isAudioMuted()) {
      setAudioMessage('Звук выключен');
      return;
    }

    playSound(AUDIO_ASSETS.throwSounds[0]);
    window.setTimeout(() => playSound(AUDIO_ASSETS.figureVoices['Пихта']), 450);
    setAudioMessage('Запущен тест: бросок + голос');
  }

  const failedAssets = Object.values(assetResults).filter((status) => status === 'error').length;
  const loadedAssets = Object.values(assetResults).filter((status) => status === 'ok').length;

  return (
    <main className="debug-screen">
      <header className="debug-header">
        <div>
          <h1>/debug</h1>
          <p>ПИХТА-ТАНЧИКИ cross-browser diagnostics</p>
        </div>
        <a className="debug-link" href="/">
          Назад в игру
        </a>
      </header>

      <section className="debug-grid">
        <article className="debug-panel">
          <h2>Browser info</h2>
          <dl className="debug-list">
            <dt>User agent</dt>
            <dd>{browserInfo.userAgent}</dd>
            <dt>Viewport</dt>
            <dd>{browserInfo.viewport}</dd>
            <dt>Device pixel ratio</dt>
            <dd>{browserInfo.dpr}</dd>
            <dt>Touch</dt>
            <dd>{browserInfo.touch}</dd>
            <dt>Reduced motion</dt>
            <dd>{browserInfo.reducedMotion}</dd>
          </dl>
        </article>

        <article className="debug-panel">
          <h2>Audio test</h2>
          <p>{audioMessage}</p>
          <div className="debug-actions">
            <button className="primary-button" type="button" onClick={handleAudioTest}>
              Audio test
            </button>
            <button className="secondary-button" type="button" onClick={onToggleAudio}>
              {isMuted ? 'Включить звук' : 'Выключить звук'}
            </button>
          </div>
        </article>

        <article className="debug-panel">
          <h2>Asset loading</h2>
          <p>
            OK: {loadedAssets} / {debugAssets.length}; Errors: {failedAssets}
          </p>
          <ul className="debug-assets">
            {debugAssets.map((src) => (
              <li className={`debug-asset debug-asset-${assetResults[src] ?? 'pending'}`} key={src}>
                <span>{assetResults[src] ?? 'pending'}</span>
                <code>{src}</code>
              </li>
            ))}
          </ul>
        </article>

        <article className="debug-panel">
          <h2>Animation / FPS</h2>
          <p className="debug-fps">{fps} FPS</p>
          <div className="debug-animation-box" aria-hidden="true" />
        </article>

        <article className="debug-panel">
          <h2>Canvas / DPR</h2>
          <canvas className="debug-canvas" ref={canvasRef} />
        </article>
      </section>
    </main>
  );
}

function getBrowserInfo() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch =
    navigator.maxTouchPoints > 0 || 'ontouchstart' in window ? `${navigator.maxTouchPoints || 1} point(s)` : 'none';

  return {
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    dpr: String(window.devicePixelRatio || 1),
    touch,
    reducedMotion: reducedMotion ? 'reduce' : 'no preference',
  };
}
