import { useState } from 'react';
import { ASSETS } from '../assets';
import { AUDIO_ASSETS, playSound } from '../audio';
import { PixelTank } from './PixelTank';

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  const [showTankFallback, setShowTankFallback] = useState(false);

  function handleStart() {
    playSound(AUDIO_ASSETS.startThrow);
    onStart();
  }

  return (
    <section className="screen start-screen">
      <div className="title-block">
        <img
          className="start-yard-image"
          src={ASSETS.startYard}
          alt="Пиксельный двор"
        />
        <h1>Пихта-Танчики</h1>
        {showTankFallback ? (
          <PixelTank />
        ) : (
          <img
            className="start-tank-image"
            src={ASSETS.tank}
            alt="Пиксельный танчик"
            onError={() => setShowTankFallback(true)}
          />
        )}
      </div>

      <button className="primary-button" onClick={handleStart}>
        Начать метать
      </button>
    </section>
  );
}
