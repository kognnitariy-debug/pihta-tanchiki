import type { Figure } from './gameLogic';

export const ASSETS = {
  sandField: '/assets/sand-field.png',
  knife: '/assets/knife-pihta.png',
  startYard: '/assets/start-yard.png',
  tank: '/assets/tank-8bit.png',
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
};

// Эти placeholder-файлы потом можно заменить на реальные pixel-art изображения
// с теми же именами в public/assets.
export const FIGURE_IMAGES: Record<Figure, string> = {
  Пихта: '/assets/symbol-pihta.png',
  Танчик: '/assets/symbol-tank.png',
  Самолёт: '/assets/symbol-plane.png',
  Подвода: '/assets/symbol-cart.png',
  Вертолёт: '/assets/symbol-helicopter.png',
  Корпус: '/assets/symbol-corps.png',
  Армия: '/assets/symbol-army.png',
  Бог: '/assets/symbol-god.png',
};
