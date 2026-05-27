import { useEffect, useMemo, useRef, useState } from 'react';
import { CREDITS_AUDIO, CREDITS_FRAMES } from '../creditsData';

const FRAME_DURATION = 5200;
const TYPE_SPEED = 45;

type CreditsScreenProps = {
  isMuted: boolean;
  onPlay: () => void;
};

export function CreditsScreen({ isMuted, onPlay }: CreditsScreenProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frame = CREDITS_FRAMES[frameIndex];
  const typedCaption = useMemo(() => {
    return frame.caption.slice(0, typedLength);
  }, [frame.caption, typedLength]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.muted = isMuted;

    if (isMuted) {
      audio.pause();
      return;
    }

    audio.play().catch(() => {
      // На iOS/Safari музыка может стартовать только после следующего касания.
    });
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || isMuted) {
      return;
    }

    const creditsAudio = audio;

    function tryPlayCreditsAudio() {
      creditsAudio.play().catch(() => {
        // Если браузер всё ещё блокирует autoplay, оставляем игру без падений.
      });
    }

    creditsAudio.currentTime = 0;
    creditsAudio.load();
    tryPlayCreditsAudio();

    window.addEventListener('pointerdown', tryPlayCreditsAudio, { once: true, passive: true });
    window.addEventListener('keydown', tryPlayCreditsAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', tryPlayCreditsAudio);
      window.removeEventListener('keydown', tryPlayCreditsAudio);
      creditsAudio.pause();
    };
  }, [isMuted]);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    const frameTimer = window.setTimeout(() => {
      setFrameIndex((index) => {
        if (index >= CREDITS_FRAMES.length - 1) {
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
      <audio autoPlay muted={isMuted} playsInline preload="auto" ref={audioRef}>
        <source src={CREDITS_AUDIO} type="audio/mpeg" />
      </audio>

      <div className="credits-stage">
        {CREDITS_FRAMES.map((creditsFrame, index) => (
          <img
            className={`credits-frame ${index === frameIndex ? 'credits-frame-active' : ''} ${isFinished && index === frameIndex ? 'credits-frame-finished' : ''}`}
            src={creditsFrame.image}
            alt={index === frameIndex ? `Кадр титров ${frameIndex + 1}` : ''}
            aria-hidden={index !== frameIndex}
            decoding="async"
            loading="eager"
            key={creditsFrame.image}
          />
        ))}
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
