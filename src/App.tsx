import { useState } from 'react';
import { GameScreen } from './components/GameScreen';
import { StartScreen } from './components/StartScreen';

type Screen = 'start' | 'game';

export function App() {
  const [screen, setScreen] = useState<Screen>('start');

  return (
    <main className="app">
      {screen === 'start' ? (
        <StartScreen onStart={() => setScreen('game')} />
      ) : (
        <GameScreen />
      )}
    </main>
  );
}
