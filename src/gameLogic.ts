export const FIGURES = [
  'Пихта',
  'Танчик',
  'Самолёт',
  'Подвода',
  'Вертолёт',
  'Корпус',
  'Армия',
  'Бомба',
] as const;

export type Figure = (typeof FIGURES)[number];
export type PlayerId = 0 | 1;
export type FigureCounts = Record<Figure, number>;
export type DropPosition = {
  x: number;
  y: number;
};

export type GameState = {
  currentPlayer: PlayerId;
  players: [FigureCounts, FigureCounts];
  message: string;
  mergeMessages: string[];
  lastDroppedFigure: Figure | null;
  lastDropPosition: DropPosition | null;
  lastThrowFailed: boolean;
  winner: PlayerId | null;
};

type RollResult = Figure | 'Ноль';

export const FIGURE_SCORE_VALUES: Record<Figure, number> = {
  Пихта: 1,
  Танчик: 4,
  Самолёт: 16,
  Подвода: 64,
  Вертолёт: 256,
  Корпус: 1024,
  Армия: 4096,
  Бомба: 16384,
};

export const MAX_SCORE = FIGURE_SCORE_VALUES['Бомба'];

const FIGURE_SYMBOLS: Record<Figure, string> = {
  Пихта: '|',
  Танчик: '|-|',
  Самолёт: '>--',
  Подвода: '[=]',
  Вертолёт: '-O-',
  Корпус: '[#]',
  Армия: 'XXX',
  Бомба: '*',
};

const ROLL_TABLE: Array<{ result: RollResult; chance: number }> = [
  { result: 'Ноль', chance: 25 },
  { result: 'Пихта', chance: 35 },
  { result: 'Танчик', chance: 20 },
  { result: 'Самолёт', chance: 10 },
  { result: 'Подвода', chance: 5 },
  { result: 'Вертолёт', chance: 3 },
  { result: 'Корпус', chance: 2 },
];

export function createInitialGameState(): GameState {
  return {
    currentPlayer: 0,
    players: [createEmptyCounts(), createEmptyCounts()],
    message: 'Ходит Игрок 1',
    mergeMessages: [],
    lastDroppedFigure: null,
    lastDropPosition: null,
    lastThrowFailed: false,
    winner: null,
  };
}

export function throwKnife(state: GameState): GameState {
  if (state.winner !== null) {
    return state;
  }

  const result = rollKnife();

  if (result === 'Ноль') {
    const nextPlayer = switchPlayer(state.currentPlayer);

    return {
      ...state,
      currentPlayer: nextPlayer,
      message: 'Нож упал! Ход переходит другому игроку',
      mergeMessages: [],
      lastDroppedFigure: null,
      lastDropPosition: null,
      lastThrowFailed: true,
    };
  }

  const players: [FigureCounts, FigureCounts] = [
    { ...state.players[0] },
    { ...state.players[1] },
  ];
  const currentCounts = players[state.currentPlayer];

  currentCounts[result] += 1;
  const mergeMessages = mergeFigures(currentCounts);
  const winner = currentCounts['Бомба'] >= 1 ? state.currentPlayer : null;

  return {
    ...state,
    players,
    message:
      winner === null
        ? `Выпало: ${result}. Можно метать ещё.`
        : `Игрок ${state.currentPlayer + 1} собрал Бомбу и победил!`,
    mergeMessages,
    lastDroppedFigure: result,
    lastDropPosition: createDropPosition(),
    lastThrowFailed: false,
    winner,
  };
}

export function passTurn(state: GameState): GameState {
  if (state.winner !== null) {
    return state;
  }

  const nextPlayer = switchPlayer(state.currentPlayer);

  return {
    ...state,
    currentPlayer: nextPlayer,
    message: `Ход передан. Теперь ходит Игрок ${nextPlayer + 1}`,
    mergeMessages: [],
    lastDroppedFigure: null,
    lastDropPosition: null,
    lastThrowFailed: false,
  };
}

export function getFigureSymbol(figure: Figure): string {
  // Здесь позже можно заменить текстовые символы рисунками ножом на песке.
  return FIGURE_SYMBOLS[figure];
}

export function calculateScore(counts: FigureCounts): number {
  return FIGURES.reduce((score, figure) => {
    return score + counts[figure] * FIGURE_SCORE_VALUES[figure];
  }, 0);
}

function createEmptyCounts(): FigureCounts {
  return FIGURES.reduce((counts, figure) => {
    counts[figure] = 0;
    return counts;
  }, {} as FigureCounts);
}

function rollKnife(): RollResult {
  const roll = Math.random() * 100;
  let border = 0;

  for (const item of ROLL_TABLE) {
    border += item.chance;

    if (roll < border) {
      return item.result;
    }
  }

  return 'Ноль';
}

function createDropPosition(): DropPosition {
  const gridSize = 5;
  const cell = 100 / gridSize;
  const column = Math.floor(Math.random() * gridSize);
  const row = Math.floor(Math.random() * gridSize);
  const jitter = () => Math.random() * 8 - 4;

  return {
    x: Math.min(82, Math.max(18, column * cell + cell / 2 + jitter())),
    y: Math.min(82, Math.max(18, row * cell + cell / 2 + jitter())),
  };
}

function mergeFigures(counts: FigureCounts): string[] {
  const messages: string[] = [];

  for (let index = 0; index < FIGURES.length - 1; index += 1) {
    const figure = FIGURES[index];
    const nextFigure = FIGURES[index + 1];

    while (counts[figure] >= 3) {
      counts[figure] -= 3;
      counts[nextFigure] += 1;
      messages.push(`3 ${getPluralFigureName(figure)} → ${nextFigure}`);
    }
  }

  return messages;
}

function switchPlayer(player: PlayerId): PlayerId {
  return player === 0 ? 1 : 0;
}

function getPluralFigureName(figure: Figure): string {
  const names: Record<Figure, string> = {
    Пихта: 'Пихты',
    Танчик: 'Танчика',
    Самолёт: 'Самолёта',
    Подвода: 'Подводы',
    Вертолёт: 'Вертолёта',
    Корпус: 'Корпуса',
    Армия: 'Армии',
    Бомба: 'Бомбы',
  };

  return names[figure];
}
