import { useEffect, useMemo, useState } from 'react';

const FRAME_DURATION = 5200;
const TYPE_SPEED = 45;

const creditsFrames = [
  { image: '/assets/pixelart/000.png', caption: 'Городу детства посвящается…' },
  { image: '/assets/pixelart/001.jpeg', caption: 'Наш двор мкрн «Самоцветы».' },
  { image: '/assets/pixelart/002.png', caption: 'Вид из лоджии на море и завод.' },
  { image: '/assets/pixelart/003.png', caption: 'Величественный и индустриальный.' },
  { image: '/assets/pixelart/004.JPG', caption: 'Дворовая команда: Серега, Костя, Стас, Жека и Славик.' },
  { image: '/assets/pixelart/005.png', caption: 'Черепашки на денди.' },
  { image: '/assets/pixelart/006.png', caption: 'Вид на комбинат и ДК Металлургов.' },
  { image: '/assets/pixelart/007.jpeg', caption: '- Continue?\n- Yes!..' },
];

type CreditsScreenProps = {
  isMuted: boolean;
  onPlay: () => void;
};

export function CreditsScreen({ isMuted, onPlay }: CreditsScreenProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const frame = creditsFrames[frameIndex];
  const typedCaption = useMemo(() => {
    return frame.caption.slice(0, typedLength);
  }, [frame.caption, typedLength]);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const frameTimer = window.setTimeout(() => {
      setFrameIndex((index) => {
        if (index >= creditsFrames.length - 1) {
          setIsFinished(true);
          return index;
        }

        return index + 1;
      });
    }, FRAME_DURATION);

    return () => window.clearTimeout(frameTimer);
  }, [frameIndex, isFinished]);

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
      <audio autoPlay muted={isMuted}>
        <source src="/assets/pixelart/Soviet Courtyard Continue-2.mp3" type="audio/mpeg" />
      </audio>

      <div className="credits-stage">
        <img
          className={`credits-frame ${isFinished ? 'credits-frame-finished' : ''}`}
          src={frame.image}
          alt={`Кадр титров ${frameIndex + 1}`}
          decoding="async"
        />
      </div>

      <p className={`credits-caption ${frameIndex === 5 ? 'credits-caption-lower' : ''}`}>
        {typedCaption}
        <span className="credits-caret" aria-hidden="true">_</span>
      </p>

      {isFinished && (
        <div className="credits-end">
          <button className="primary-button" type="button" onClick={onPlay}>
            Метать!
          </button>
        </div>
      )}
    </section>
  );
}
