import { useState } from 'react';
import { ASSETS } from '../assets';
import { AUDIO_ASSETS, playSound } from '../audio';
import { PixelTank } from './PixelTank';

type StartScreenProps = {
  onStart: () => void;
  onOnline: () => void;
};

export function StartScreen({ onOnline, onStart }: StartScreenProps) {
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
          decoding="async"
        />
        <h1>Пихта-Танчики</h1>
        {showTankFallback ? (
          <PixelTank />
        ) : (
          <img
            className="start-tank-image"
            src={ASSETS.tank}
            alt="Пиксельный танчик"
            decoding="async"
            onError={() => setShowTankFallback(true)}
          />
        )}
      </div>

      <div className="start-actions">
        <button className="primary-button" onClick={handleStart}>
          Начать метать
        </button>
        <button className="secondary-button start-online-button" type="button" onClick={onOnline}>
          Сетевая игра
        </button>
      </div>
    </section>
  );
}
