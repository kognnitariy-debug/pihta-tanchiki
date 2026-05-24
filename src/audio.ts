import type { Figure } from './gameLogic';

let audioMuted = false;

export const AUDIO_ASSETS = {
  intro: '/assets/audio/intro-sound.m4a',
  startThrow: '/assets/audio/start-throw.m4a',
  throwSounds: [
    '/assets/audio/throw-2.m4a',
    '/assets/audio/throw-3.m4a',
  ],
  failedThrow: '/assets/audio/Stratil2.m4a',
  figureVoices: {
    Пихта: '/assets/audio/voice-pihta.m4a',
    Танчик: '/assets/audio/voice-tank.m4a',
    Самолёт: '/assets/audio/voice-plane.m4a',
    Подвода: '/assets/audio/voice-cart.m4a',
    Вертолёт: '/assets/audio/voice-helicopter.m4a',
    Корпус: '/assets/audio/voice-corps.m4a',
    Армия: '/assets/audio/voice-army.m4a',
    Бомба: '/assets/audio/voice-bomb.m4a',
  } as Partial<Record<Figure, string>>,
};

export function setAudioMuted(isMuted: boolean) {
  audioMuted = isMuted;
}

export function playRandomSound(sources: string[]) {
  if (audioMuted || sources.length === 0) {
    return;
  }

  const index = Math.floor(Math.random() * sources.length);
  playSound(sources[index]);
}

export function playSound(src: string | undefined) {
  if (audioMuted || !src) {
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
  if (audioMuted || !src) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const audio = new Audio(src);

    audio.addEventListener('ended', () => resolve(), { once: true });
    audio.addEventListener('error', () => resolve(), { once: true });

    audio.play().catch(() => resolve());
  });
}
