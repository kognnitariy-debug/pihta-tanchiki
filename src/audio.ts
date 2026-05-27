import type { Figure } from './gameLogic';

let audioMuted = false;
let audioUnlocked = false;
const audioCache = new Map<string, HTMLAudioElement>();

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

export function isAudioMuted() {
  return audioMuted;
}

export function preloadAudio(sources: Array<string | undefined>) {
  if (typeof Audio === 'undefined') {
    return;
  }

  sources.forEach((src) => {
    if (!src || audioCache.has(src)) {
      return;
    }

    audioCache.set(src, createAudioElement(src));
  });
}

export function unlockAudio(sources: Array<string | undefined>) {
  if (typeof Audio === 'undefined') {
    return;
  }

  preloadAudio(sources);
  audioUnlocked = true;

  sources.forEach((src) => {
    if (!src) {
      return;
    }

    const audio = getAudioElement(src);
    const previousMuted = audio.muted;
    const previousVolume = audio.volume;

    audio.muted = true;
    audio.volume = 0;

    const playAttempt = audio.play();

    if (!playAttempt) {
      restoreAudio(audio, previousMuted, previousVolume);
      return;
    }

    playAttempt
      .then(() => {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch {
          // Некоторые мобильные браузеры не дают менять currentTime до загрузки.
        }
        restoreAudio(audio, previousMuted, previousVolume);
      })
      .catch(() => restoreAudio(audio, previousMuted, previousVolume));
  });
}

export function playRandomSound(sources: string[]) {
  if (audioMuted || sources.length === 0) {
    return;
  }

  const index = Math.floor(Math.random() * sources.length);
  playSound(sources[index]);
}

export function playSound(src: string | undefined) {
  if (audioMuted || !src || typeof Audio === 'undefined') {
    return;
  }

  const audio = getPlayableAudio(src);

  try {
    audio.currentTime = 0;
  } catch {
    // Safari может бросить ошибку, если файл ещё не готов. Просто играем с начала загрузки.
  }

  if (audio.readyState === 0) {
    audio.load();
  }

  // Браузер может запретить звук без клика пользователя. Для MVP просто молча
  // игнорируем отказ, чтобы игра не ломалась.
  audio.play().catch(() => {
    if (!audioUnlocked) {
      preloadAudio([src]);
    }
  });
}

export async function playSoundsInOrder(sources: Array<string | undefined>) {
  for (const src of sources) {
    await playSoundAndWait(src);
  }
}

function playSoundAndWait(src: string | undefined) {
  if (audioMuted || !src || typeof Audio === 'undefined') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const audio = getPlayableAudio(src);

    try {
      audio.currentTime = 0;
    } catch {
      // Оставляем браузеру текущую позицию, если он ещё не готов перемотать.
    }

    audio.addEventListener('ended', () => resolve(), { once: true });
    audio.addEventListener('error', () => resolve(), { once: true });

    audio.play().catch(() => resolve());
  });
}

function getAudioElement(src: string) {
  const cachedAudio = audioCache.get(src);

  if (cachedAudio) {
    return cachedAudio;
  }

  const audio = createAudioElement(src);
  audioCache.set(src, audio);
  return audio;
}

function getPlayableAudio(src: string) {
  const cachedAudio = getAudioElement(src);

  if (cachedAudio.paused || cachedAudio.ended) {
    return cachedAudio;
  }

  return createAudioElement(src);
}

function createAudioElement(src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.setAttribute('playsinline', 'true');
  audio.load();
  return audio;
}

function restoreAudio(audio: HTMLAudioElement, muted: boolean, volume: number) {
  audio.muted = muted;
  audio.volume = volume;
}
