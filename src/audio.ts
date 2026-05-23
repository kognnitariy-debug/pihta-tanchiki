import type { Figure } from './gameLogic';

export const AUDIO_ASSETS = {
  intro: '/assets/audio/intro-sound.m4a',
  startThrow: '/assets/audio/start-throw.m4a',
  figureVoices: {
    Пихта: '/assets/audio/voice-pihta.m4a',
    Танчик: '/assets/audio/voice-tank.m4a',
  } as Partial<Record<Figure, string>>,
};

export function playSound(src: string | undefined) {
  if (!src) {
    return;
  }

  const audio = new Audio(src);
  audio.currentTime = 0;

  // Браузер может запретить звук без клика пользователя. Для MVP просто молча
  // игнорируем отказ, чтобы игра не ломалась.
  audio.play().catch(() => {});
}

export async function playSoundsInOrder(sources: Array<string | undefined>) {
  for (const src of sources) {
    await playSoundAndWait(src);
  }
}

function playSoundAndWait(src: string | undefined) {
  if (!src) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const audio = new Audio(src);

    audio.addEventListener('ended', () => resolve(), { once: true });
    audio.addEventListener('error', () => resolve(), { once: true });

    audio.play().catch(() => resolve());
  });
}
