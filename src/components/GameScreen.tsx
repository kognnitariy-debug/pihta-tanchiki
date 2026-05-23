import { useState, type CSSProperties } from 'react';
import { FIELD_FIGURE_IMAGES, FIGURE_IMAGES } from '../assets';
import { AUDIO_ASSETS, playSound } from '../audio';
import {
  FIGURES,
  createInitialGameState,
  getFigureSymbol,
  passTurn,
  throwKnife,
  type Figure,
  type FigureCounts,
  type PlayerId,
} from '../gameLogic';

export function GameScreen() {
  const [game, setGame] = useState(createInitialGameState);
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
    const nextGame = throwKnife(game);
    setGame(nextGame);

    if (nextGame.lastDroppedFigure) {
      playSound(AUDIO_ASSETS.figureVoices[nextGame.lastDroppedFigure]);
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
        <div className="turn-label">Сейчас ходит Игрок {game.currentPlayer + 1}</div>

        <div className="sand-field" aria-label="Игровое поле">
          {/* Здесь позже появятся линии, зачёркивания и следы ножом по песку. */}
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

        <div className="throw-zone">
          <button className="primary-button" onClick={handleThrowKnife} disabled={game.winner !== null}>
            Метнуть нож
          </button>
          <button className="secondary-button" onClick={() => setGame(passTurn)} disabled={game.winner !== null}>
            Передать ход
          </button>

          <div className="message-box">
            <p className="throw-message">
              {game.message.startsWith('Нож упал') ? 'Нож упал!' : game.message}
            </p>
            {game.mergeMessages.map((message, index) => (
              <p className="merge-message" key={`${message}-${index}`}>
                {message}
              </p>
            ))}
            {game.winner !== null && (
              <p className="win-message">Игрок {game.winner + 1} собрал Бога и победил!</p>
            )}
          </div>
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

type PlayerPanelProps = {
  counts: FigureCounts;
  isActive: boolean;
  playerId: PlayerId;
};

function PlayerPanel({ counts, isActive, playerId }: PlayerPanelProps) {
  const decorationSide = playerId === 0 ? 'left' : 'right';

  return (
    <aside className={`player-panel ${isActive ? 'player-panel-active' : ''}`}>
      <img
        className={`player-decoration player-decoration-${decorationSide}`}
        src={FIELD_FIGURE_IMAGES['Самолёт']}
        alt=""
      />
      <h2>Игрок {playerId + 1}</h2>
      <ul className="figure-table">
        {FIGURES.map((figure) => (
          <li className="figure-row" key={figure}>
            <FigureIcon figure={figure} />
            <span className="figure-name">{figure}</span>
            <span className="figure-count">{counts[figure]}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

type FigureIconProps = {
  figure: Figure;
};

function FigureIcon({ figure }: FigureIconProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return <span className="figure-symbol">{getFigureSymbol(figure)}</span>;
  }

  return (
    <img
      className="figure-icon"
      src={FIGURE_IMAGES[figure]}
      alt=""
      onError={() => setImageFailed(true)}
    />
  );
}
