import { ASSETS, FIELD_FIGURE_IMAGES, FIGURE_IMAGES, RESULT_RUNE_IMAGES } from './assets';
import { AUDIO_ASSETS, preloadAudio } from './audio';
import { CREDITS_AUDIO, CREDITS_FRAMES } from './creditsData';

const imageSources = Array.from(new Set([
  ...Object.values(ASSETS),
  ...Object.values(FIELD_FIGURE_IMAGES),
  ...Object.values(FIGURE_IMAGES),
  ...Object.values(RESULT_RUNE_IMAGES),
  ...CREDITS_FRAMES.map((frame) => frame.image),
].filter(Boolean)));

const audioSources = [
  AUDIO_ASSETS.startThrow,
  AUDIO_ASSETS.failedThrow,
  ...AUDIO_ASSETS.throwSounds,
  ...Object.values(AUDIO_ASSETS.figureVoices),
  CREDITS_AUDIO,
];

export type PreloadProgress = {
  loaded: number;
  total: number;
};

export function preloadGameAssets(onProgress: (progress: PreloadProgress) => void) {
  const total = imageSources.length + audioSources.length;
  let loaded = 0;

  function markLoaded() {
    loaded += 1;
    onProgress({ loaded, total });
  }

  preloadAudio(audioSources);

  const imageTasks = imageSources.map((src) => preloadImage(src, markLoaded));
  const audioTasks = audioSources.map((src) => preloadAudioFile(src, markLoaded));

  onProgress({ loaded, total });

  return Promise.all([...imageTasks, ...audioTasks]).then(() => undefined);
}

function preloadImage(src: string | undefined, markLoaded: () => void) {
  if (!src || typeof Image === 'undefined') {
    markLoaded();
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const image = new Image();

    image.onload = () => {
      markLoaded();
      resolve();
    };
    image.onerror = () => {
      markLoaded();
      resolve();
    };
    image.decoding = 'async';
    image.src = src;
  });
}

function preloadAudioFile(src: string | undefined, markLoaded: () => void) {
  if (!src || typeof Audio === 'undefined') {
    markLoaded();
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const audio = new Audio(src);
    let isDone = false;

    function done() {
      if (isDone) {
        return;
      }

      isDone = true;
      markLoaded();
      resolve();
    }

    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', done, { once: true });
    audio.addEventListener('loadeddata', done, { once: true });
    audio.addEventListener('error', done, { once: true });
    audio.load();

    window.setTimeout(done, 3500);
  });
}
