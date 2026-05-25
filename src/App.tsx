import { useEffect, useMemo, useState } from 'react';
import { AUDIO_ASSETS, preloadAudio, setAudioMuted } from './audio';
import { CreditsScreen } from './components/CreditsScreen';
import { DebugScreen } from './components/DebugScreen';
import { GameScreen } from './components/GameScreen';
import { StartScreen } from './components/StartScreen';
import { preloadGameAssets, type PreloadProgress } from './preload';

type Screen = 'start' | 'game' | 'credits';

export function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return window.location.pathname === '/debug' ? 'game' : 'start';
  });
  const [isMuted, setIsMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState<PreloadProgress>({ loaded: 0, total: 1 });
  const isDebugRoute = window.location.pathname === '/debug';
  const audioSources = useMemo(() => {
    return [
      AUDIO_ASSETS.startThrow,
      AUDIO_ASSETS.failedThrow,
      ...AUDIO_ASSETS.throwSounds,
      ...Object.values(AUDIO_ASSETS.figureVoices),
    ];
  }, []);

  useEffect(() => {
    const warmAudio = () => preloadAudio(audioSources);

    window.addEventListener('pointerdown', warmAudio, { once: true, passive: true });
    window.addEventListener('keydown', warmAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', warmAudio);
      window.removeEventListener('keydown', warmAudio);
    };
  }, [audioSources]);

  useEffect(() => {
    if (isDebugRoute) {
      setIsPreloaded(true);
      return;
    }

    let isMounted = true;

    preloadGameAssets((progress) => {
      if (isMounted) {
        setPreloadProgress(progress);
      }
    }).finally(() => {
      if (isMounted) {
        setIsPreloaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isDebugRoute]);

  if (isDebugRoute) {
    return <DebugScreen isMuted={isMuted} onToggleAudio={toggleAudio} />;
  }

  function toggleAudio() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setAudioMuted(nextMuted);
  }

  return (
    <main className="app">
      <div className="app-brand">
        <span>ПИХТА-ТАНЧИКИ ONLINE</span>
        <span>BUILD 1.0</span>
      </div>
      <button
        className={`audio-toggle ${isMuted ? 'audio-toggle-muted' : ''}`}
        type="button"
        onClick={toggleAudio}
        aria-label={isMuted ? 'Включить звук' : 'Отключить звук'}
        title={isMuted ? 'Включить звук' : 'Отключить звук'}
      >
        {isMuted ? 'ЗВУК ВЫКЛ' : 'ЗВУК ВКЛ'}
      </button>
      {isPreloaded && screen !== 'credits' && (
        <div className="top-actions">
          <button
            className="top-action-button"
            type="button"
            onClick={() => setShowRules(true)}
          >
            Правила
          </button>
          <button
            className="top-action-button"
            type="button"
            onClick={() => setScreen('credits')}
          >
            Титры
          </button>
        </div>
      )}
      {!isPreloaded ? (
        <LoadingScreen progress={preloadProgress} />
      ) : screen === 'start' ? (
        <StartScreen onStart={() => setScreen('game')} />
      ) : screen === 'game' ? (
        <GameScreen onCredits={() => setScreen('credits')} />
      ) : (
        <CreditsScreen isMuted={isMuted} onPlay={() => setScreen('game')} />
      )}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      <footer className="app-footer">Стас Сладковский 2026 (C)</footer>
    </main>
  );
}

type LoadingScreenProps = {
  progress: PreloadProgress;
};

function LoadingScreen({ progress }: LoadingScreenProps) {
  const percent = Math.round((progress.loaded / Math.max(progress.total, 1)) * 100);

  return (
    <section className="screen loading-screen" aria-live="polite">
      <div className="loading-panel">
        <p className="loading-title">Пихта-Танчики</p>
        <div className="loading-bar" aria-label={`Загрузка ${percent}%`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="loading-text">Загрузка двора... {percent}%</p>
      </div>
    </section>
  );
}

type RulesModalProps = {
  onClose: () => void;
};

function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="rules-overlay" role="dialog" aria-modal="true" aria-label="Правила игры">
      <div className="rules-panel">
        <h2>Правила</h2>
        <p>Игроки метают нож по очереди. Если нож упал, ход переходит другому игроку.</p>
        <p>Если выпала фигура, она добавляется игроку, а ход можно продолжать.</p>
        <p>Каждые 3 одинаковые фигуры превращаются в следующую. Побеждает тот, кто соберёт Бомбу.</p>
        <button className="primary-button rules-close-button" type="button" onClick={onClose}>
          Понятно
        </button>
      </div>
    </div>
  );
}
