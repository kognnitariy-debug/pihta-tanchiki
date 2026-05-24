import { useRef, useState, type CSSProperties } from 'react';
import { ASSETS, FIELD_FIGURE_IMAGES, FIGURE_IMAGES, RESULT_RUNE_IMAGES } from '../assets';
import { AUDIO_ASSETS, playRandomSound, playSound } from '../audio';
import {
  FIGURES,
  MAX_SCORE,
  calculateScore,
  createInitialGameState,
  getFigureSymbol,
  throwKnife,
  type Figure,
  type FigureCounts,
  type PlayerId,
} from '../gameLogic';

export function GameScreen() {
  const [game, setGame] = useState(createInitialGameState);
  const [resultCard, setResultCard] = useState<{ figure: Figure; id: number } | null>(null);
  const resultCardTimer = useRef<number | null>(null);
  const fieldFigureImage = game.lastDroppedFigure
    ? FIELD_FIGURE_IMAGES[game.lastDroppedFigure]
    : undefined;
  const fieldFigureStyle = game.lastDropPosition
      ? ({
          '--drop-x': `${game.lastDropPosition.x}%`,
          '--drop-y': `${game.lastDropPosition.y}%`,
        } as CSSProperties)
    : undefined;

  function handleThrowKnife() {
    playRandomSound(AUDIO_ASSETS.throwSounds);

    const nextGame = throwKnife(game);
    setGame(nextGame);

    if (resultCardTimer.current !== null) {
      window.clearTimeout(resultCardTimer.current);
      resultCardTimer.current = null;
    }

    if (nextGame.lastDroppedFigure) {
      setResultCard({ figure: nextGame.lastDroppedFigure, id: Date.now() });
      resultCardTimer.current = window.setTimeout(() => {
        setResultCard(null);
        resultCardTimer.current = null;
      }, 1500);
      playSound(AUDIO_ASSETS.figureVoices[nextGame.lastDroppedFigure]);
    } else if (nextGame.lastThrowFailed) {
      setResultCard(null);
      playSound(AUDIO_ASSETS.failedThrow);
    }
  }

  return (
    <section className="screen game-screen">
      <PlayerPanel
        counts={game.players[0]}
        isActive={game.currentPlayer === 0}
        playerId={0}
      />

      <div className="game-center">
        <MessageBox
          mergeMessages={game.mergeMessages}
          message={game.message}
          winner={game.winner}
        />

        <div className="throw-zone throw-zone-top">
          <button className="primary-button" onClick={handleThrowKnife} disabled={game.winner !== null || resultCard !== null}>
            Метнуть нож
          </button>
          {resultCard && (
            <ResultCard
              figure={resultCard.figure}
              key={`${resultCard.figure}-${resultCard.id}`}
            />
          )}
        </div>

        <div className="sand-field" aria-label="Игровое поле">
          {/* Здесь позже появятся линии, зачёркивания и следы ножом по песку. */}
          {game.lastThrowFailed && (
            <img
              className="fallen-knife"
              src={ASSETS.fallenKnife}
              alt="Нож упал на песок"
            />
          )}
          {game.lastDroppedFigure && (
            fieldFigureImage ? (
              <img
                className="field-figure"
                src={fieldFigureImage}
                style={fieldFigureStyle}
                alt={`Фигура на песке: ${game.lastDroppedFigure}`}
              />
            ) : (
              <span className="field-figure-fallback" style={fieldFigureStyle}>
                {game.lastDroppedFigure}
              </span>
            )
          )}
        </div>
      </div>

      <PlayerPanel
        counts={game.players[1]}
        isActive={game.currentPlayer === 1}
        playerId={1}
      />
    </section>
  );
}

type ResultCardProps = {
  figure: Figure;
};

function ResultCard({ figure }: ResultCardProps) {
  return (
    <div className="result-card" aria-live="polite">
      <img className="result-card-rune" src={RESULT_RUNE_IMAGES[figure]} alt="" />
      <p>{figure}</p>
    </div>
  );
}

type MessageBoxProps = {
  mergeMessages: string[];
  message: string;
  winner: PlayerId | null;
};

function MessageBox({ mergeMessages, message, winner }: MessageBoxProps) {
  return (
    <div className="message-box">
      <p className="throw-message">
        {message.startsWith('Нож упал') ? 'Нож упал!' : message}
      </p>
      {mergeMessages.map((mergeMessage, index) => (
        <p className="merge-message" key={`${mergeMessage}-${index}`}>
          {mergeMessage}
        </p>
      ))}
      {winner !== null && (
        <p className="win-message">Игрок {winner + 1} собрал Бомбу и победил!</p>
      )}
    </div>
  );
}

type PlayerPanelProps = {
  counts: FigureCounts;
  isActive: boolean;
  playerId: PlayerId;
};

function PlayerPanel({ counts, isActive, playerId }: PlayerPanelProps) {
  const decorationSide = playerId === 0 ? 'left' : 'right';
  const avatarSrc = playerId === 0 ? ASSETS.playerOne : ASSETS.playerTwo;
  const score = calculateScore(counts);

  return (
    <aside className={`player-panel ${isActive ? 'player-panel-active' : ''}`}>
      <div className="player-card">
        <img
          className="player-avatar"
          src={avatarSrc}
          alt={`Аватар игрока ${playerId + 1}`}
        />
        <h2>Игрок {playerId + 1}</h2>
        <p className="player-score">{score} / {MAX_SCORE}</p>
      </div>

      <div className="player-sand-board" aria-label={`Фигуры игрока ${playerId + 1}`}>
        {FIGURES.map((figure) => (
          <FigureRow count={counts[figure]} figure={figure} key={figure} />
        ))}
      </div>

      <img
        className={`player-decoration player-decoration-${decorationSide}`}
        src={FIELD_FIGURE_IMAGES['Самолёт']}
        alt=""
      />
    </aside>
  );
}

type FigureRowProps = {
  figure: Figure;
  count: number;
};

function FigureRow({ count, figure }: FigureRowProps) {
  return (
    <div className="sand-rune-row" title={figure}>
      {/* Позже здесь можно заменить symbol-*.png на настоящие следы ножом в песке. */}
      {Array.from({ length: count }, (_, index) => (
        <FigureMark figure={figure} key={`${figure}-${index}`} />
      ))}
    </div>
  );
}

type FigureMarkProps = {
  figure: Figure;
};

function FigureMark({ figure }: FigureMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return <span className="figure-symbol">{getFigureSymbol(figure)}</span>;
  }

  return (
    <img
      className="figure-mark"
      src={FIGURE_IMAGES[figure]}
      alt=""
      onError={() => setImageFailed(true)}
    />
  );
}
