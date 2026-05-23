import { useState } from 'react';
import { ASSETS } from '../assets';
import { AUDIO_ASSETS, playSoundsInOrder } from '../audio';
import { PixelTank } from './PixelTank';

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  const [showTankFallback, setShowTankFallback] = useState(false);

  function handleStart() {
    playSoundsInOrder([AUDIO_ASSETS.intro, AUDIO_ASSETS.startThrow]);
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
        <h1>ПИХТО-ТАНЧИКИ</h1>
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
