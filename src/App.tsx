import { useState } from 'react';
import { setAudioMuted } from './audio';
import { CreditsScreen } from './components/CreditsScreen';
import { GameScreen } from './components/GameScreen';
import { StartScreen } from './components/StartScreen';

type Screen = 'start' | 'game' | 'credits';

export function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [isMuted, setIsMuted] = useState(false);

  function toggleAudio() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setAudioMuted(nextMuted);
  }

  return (
    <main className="app">
      <button
        className={`audio-toggle ${isMuted ? 'audio-toggle-muted' : ''}`}
        type="button"
        onClick={toggleAudio}
        aria-label={isMuted ? 'Включить звук' : 'Отключить звук'}
        title={isMuted ? 'Включить звук' : 'Отключить звук'}
      >
        {isMuted ? 'ЗВУК ВЫКЛ' : 'ЗВУК ВКЛ'}
      </button>
      {screen !== 'credits' && (
        <button
          className="credits-toggle"
          type="button"
          onClick={() => setScreen('credits')}
        >
          Титры
        </button>
      )}
      {screen === 'start' ? (
        <StartScreen onStart={() => setScreen('game')} />
      ) : screen === 'game' ? (
        <GameScreen />
      ) : (
        <CreditsScreen isMuted={isMuted} onBack={() => setScreen('game')} />
      )}
    </main>
  );
}
