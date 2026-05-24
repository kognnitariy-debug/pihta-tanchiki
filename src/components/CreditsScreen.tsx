import { useEffect, useMemo, useState } from 'react';

const FRAME_DURATION = 5200;
const TYPE_SPEED = 45;

const creditsFrames = [
  { image: '/assets/pixelart/000.png', caption: '1997 год. Городу детства посвящается...' },
  { image: '/assets/pixelart/001.jpeg', caption: 'Двор мкр «Самоцветы».' },
  { image: '/assets/pixelart/002.png', caption: 'Вид с лоджии на море в дымке и завод.' },
  { image: '/assets/pixelart/003.png', caption: 'Величественный индустриальный завод.' },
  { image: '/assets/pixelart/004.jpeg', caption: 'Дворовая команда: Серега, Костя, Стас, Жека и Славик.' },
  { image: '/assets/pixelart/005.png', caption: 'Черепашки на Денди.' },
  { image: '/assets/pixelart/006.png', caption: 'Вид на комбинат и ДК Металлургов.' },
  { image: '/assets/pixelart/007.jpeg', caption: '- Continue? - Yes!..' },
];

type CreditsScreenProps = {
  isMuted: boolean;
  onBack: () => void;
};

export function CreditsScreen({ isMuted, onBack }: CreditsScreenProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const frame = creditsFrames[frameIndex];
  const typedCaption = useMemo(() => {
    return frame.caption.slice(0, typedLength);
  }, [frame.caption, typedLength]);

  useEffect(() => {
    const frameTimer = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % creditsFrames.length);
    }, FRAME_DURATION);

    return () => window.clearInterval(frameTimer);
  }, []);

  useEffect(() => {
    setTypedLength(0);

    if (frame.caption.length === 0) {
      return;
    }

    const typingTimer = window.setInterval(() => {
      setTypedLength((length) => {
        if (length >= frame.caption.length) {
          window.clearInterval(typingTimer);
          return length;
        }

        return length + 1;
      });
    }, TYPE_SPEED);

    return () => window.clearInterval(typingTimer);
  }, [frame.caption, frameIndex]);

  return (
    <section className="screen credits-screen">
      <audio autoPlay loop muted={isMuted}>
        <source src="/assets/pixelart/Soviet Courtyard Continue-2.mp3" type="audio/mpeg" />
        <source src="/assets/pixelart/Soviet Courtyard Continue.mp3" type="audio/mpeg" />
      </audio>

      <button className="credits-back-button" type="button" onClick={onBack}>
        Назад
      </button>

      <div className="credits-stage">
        <img
          className="credits-frame"
          src={frame.image}
          alt={`Кадр титров ${frameIndex + 1}`}
        />
      </div>

      <p className="credits-caption">
        {typedCaption}
        <span className="credits-caret" aria-hidden="true">_</span>
      </p>
    </section>
  );
}
