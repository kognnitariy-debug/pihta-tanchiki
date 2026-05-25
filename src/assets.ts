import type { Figure } from './gameLogic';

export const ASSETS = {
  gameYardBg: '/assets/game-yard-bg.png',
  sandField: '/assets/sand-field.png',
  knife: '/assets/knife-pihta.png',
  startYard: '/assets/start-yard.png',
  tank: '/assets/tank-8bit.png',
  playerOne: '/assets/player1.jpg',
  playerTwo: '/assets/player2.jpg',
  fallenKnife: '/assets/field-knife-fallen.png',
};

// Отдельные картинки фигур, которые выпадают на поле.
// Их можно заменять независимо от symbol-*.png для таблицы игроков.
export const FIELD_FIGURE_IMAGES: Partial<Record<Figure, string>> = {
  Пихта: '/assets/field-pihta.png',
  Танчик: '/assets/field-tank.png',
  Самолёт: '/assets/field-plane.png',
  Подвода: '/assets/field-cart.png',
  Вертолёт: '/assets/field-helicopter.png',
  Корпус: '/assets/field-corps.png',
  Армия: '/assets/field-army.png',
  Бомба: '/assets/field-army.png',
};

// Эти placeholder-файлы потом можно заменить на реальные pixel-art изображения
// с теми же именами в public/assets.
export const FIGURE_IMAGES: Record<Figure, string> = {
  Пихта: '/assets/runes/processed/pichta.png',
  Танчик: '/assets/runes/processed/tanchik.png',
  Самолёт: '/assets/runes/processed/samolet.png',
  Подвода: '/assets/runes/processed/podvoda.png',
  Вертолёт: '/assets/runes/processed/vertolet.png',
  Корпус: '/assets/runes/processed/corpus.png',
  Армия: '/assets/runes/processed/army.png',
  Бомба: '/assets/runes/processed/b.png',
};

// Всплывающая карточка использует те же лёгкие обработанные руны.
// Тяжёлые исходники лежат в source-assets/runes и не попадают в деплой.
export const RESULT_RUNE_IMAGES: Record<Figure, string> = {
  Пихта: '/assets/runes/processed/pichta.png',
  Танчик: '/assets/runes/processed/tanchik.png',
  Самолёт: '/assets/runes/processed/samolet.png',
  Подвода: '/assets/runes/processed/podvoda.png',
  Вертолёт: '/assets/runes/processed/vertolet.png',
  Корпус: '/assets/runes/processed/corpus.png',
  Армия: '/assets/runes/processed/army.png',
  Бомба: '/assets/runes/processed/b.png',
};
