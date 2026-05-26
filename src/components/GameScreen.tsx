import { useEffect, useRef, useState, type CSSProperties } from 'react';
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
  type GameState,
  type PlayerId,
} from '../gameLogic';

const RESULT_SOUND_DELAY = 520;
const FIELD_RESULT_DELAY = 520;
const RESULT_CARD_DELAY = 900;
const RESULT_CARD_DURATION = 1500;
const VICTORY_DELAY = 2600;
const VICTORY_DURATION = 4000;

type GameScreenProps = {
  onCredits: () => void;
  gameState?: GameState;
  canPlay?: boolean;
  localPlayerId?: PlayerId;
  onlineMessage?: string;
  remoteEventId?: string;
  roomId?: string;
  onGameStateChange?: (state: GameState) => void;
};

export function GameScreen({
  gameState,
  canPlay = true,
  localPlayerId,
  onlineMessage,
  onCredits,
  onGameStateChange,
  remoteEventId,
  roomId,
}: GameScreenProps) {
  const [localGame, setLocalGame] = useState(createInitialGameState);
  const [resultCard, setResultCard] = useState<{ figure: Figure; id: number } | null>(null);
  const [victoryPlayer, setVictoryPlayer] = useState<PlayerId | null>(null);
  const [isResultPending, setIsResultPending] = useState(false);
  const resultCardTimer = useRef<number | null>(null);
  const resultDelayTimer = useRef<number | null>(null);
  const fieldResultTimer = useRef<number | null>(null);
  const resultSoundTimer = useRef<number | null>(null);
  const victoryTimer = useRef<number | null>(null);
  const creditsTimer = useRef<number | null>(null);
  const handledRemoteEvent = useRef<string | null>(null);
  const game = gameState ?? localGame;
  const isOnlineGame = Boolean(onGameStateChange);
  const canThrowOnline = canPlay && (!isOnlineGame || localPlayerId === game.currentPlayer);
  const fieldFigureImage = game.lastDroppedFigure
    ? FIELD_FIGURE_IMAGES[game.lastDroppedFigure]
    : undefined;
  const fieldFigureStyle = game.lastDropPosition
      ? ({
          '--drop-x': `${game.lastDropPosition.x}%`,
          '--drop-y': `${game.lastDropPosition.y}%`,
        } as CSSProperties)
    : undefined;

  useEffect(() => {
    if (!gameState) {
      return;
    }

    setLocalGame(gameState);
  }, [gameState]);

  useEffect(() => {
    if (!remoteEventId || handledRemoteEvent.current === remoteEventId) {
      return;
    }

    handledRemoteEvent.current = remoteEventId;

    if (game.lastDroppedFigure) {
      const droppedFigure = game.lastDroppedFigure;
      playSound(AUDIO_ASSETS.figureVoices[droppedFigure]);
      setResultCard({ figure: droppedFigure, id: Date.now() });

      if (resultCardTimer.current !== null) {
        window.clearTimeout(resultCardTimer.current);
      }

      resultCardTimer.current = window.setTimeout(() => {
        setResultCard(null);
        resultCardTimer.current = null;
      }, RESULT_CARD_DURATION);
    } else if (game.lastThrowFailed) {
      playSound(AUDIO_ASSETS.failedThrow);
    }
  }, [game.lastDroppedFigure, game.lastThrowFailed, remoteEventId]);

  function handleThrowKnife() {
    if (!canThrowOnline) {
      return;
    }

    playRandomSound(AUDIO_ASSETS.throwSounds);

    const nextGame = throwKnife(game);
    setResultCard(null);
    setIsResultPending(true);

    if (resultCardTimer.current !== null) {
      window.clearTimeout(resultCardTimer.current);
      resultCardTimer.current = null;
    }
    if (resultDelayTimer.current !== null) {
      window.clearTimeout(resultDelayTimer.current);
      resultDelayTimer.current = null;
    }
    if (fieldResultTimer.current !== null) {
      window.clearTimeout(fieldResultTimer.current);
      fieldResultTimer.current = null;
    }
    if (resultSoundTimer.current !== null) {
      window.clearTimeout(resultSoundTimer.current);
      resultSoundTimer.current = null;
    }
    if (victoryTimer.current !== null) {
      window.clearTimeout(victoryTimer.current);
      victoryTimer.current = null;
    }
    if (creditsTimer.current !== null) {
      window.clearTimeout(creditsTimer.current);
      creditsTimer.current = null;
    }

    fieldResultTimer.current = window.setTimeout(() => {
      setLocalGame(nextGame);
      onGameStateChange?.(nextGame);
      fieldResultTimer.current = null;

      if (nextGame.lastDroppedFigure) {
        const droppedFigure = nextGame.lastDroppedFigure;

        resultDelayTimer.current = window.setTimeout(() => {
          playSound(AUDIO_ASSETS.figureVoices[droppedFigure]);
          setResultCard({ figure: droppedFigure, id: Date.now() });
          resultDelayTimer.current = null;

          resultCardTimer.current = window.setTimeout(() => {
            setResultCard(null);
            if (nextGame.winner === null) {
              setIsResultPending(false);
            }
            resultCardTimer.current = null;
          }, RESULT_CARD_DURATION);
        }, RESULT_CARD_DELAY);

        if (nextGame.winner !== null) {
          const winner = nextGame.winner;

          victoryTimer.current = window.setTimeout(() => {
            setResultCard(null);
            setVictoryPlayer(winner);
            victoryTimer.current = null;

            creditsTimer.current = window.setTimeout(() => {
              setIsResultPending(false);
              onCredits();
              creditsTimer.current = null;
            }, VICTORY_DURATION);
          }, VICTORY_DELAY);
        }
      } else if (nextGame.lastThrowFailed) {
        resultSoundTimer.current = window.setTimeout(() => {
          playSound(AUDIO_ASSETS.failedThrow);
          setIsResultPending(false);
          resultSoundTimer.current = null;
        }, RESULT_SOUND_DELAY);
      } else {
        setIsResultPending(false);
      }
    }, FIELD_RESULT_DELAY);
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
          onlineMessage={onlineMessage}
          roomId={roomId}
          winner={game.winner}
        />

        <div className="throw-zone throw-zone-top">
          <button className="primary-button" onClick={handleThrowKnife} disabled={game.winner !== null || isResultPending || !canThrowOnline}>
            {!canPlay ? 'Ждём игрока' : canThrowOnline ? 'Метнуть нож' : 'Ждём ход'}
          </button>
        </div>

        <div className="sand-field" aria-label="Игровое поле">
          {/* Здесь позже появятся линии, зачёркивания и следы ножом по песку. */}
          {game.lastThrowFailed && (
            <img
              className="fallen-knife"
              src={ASSETS.fallenKnife}
              alt="Нож упал на песок"
              decoding="async"
            />
          )}
          {game.lastDroppedFigure && (
            fieldFigureImage ? (
              <img
                className={`field-figure ${isSmallFieldFigure(game.lastDroppedFigure) ? 'field-figure-small' : ''}`}
                src={fieldFigureImage}
                style={fieldFigureStyle}
                alt={`Фигура на песке: ${game.lastDroppedFigure}`}
                decoding="async"
              />
            ) : (
              <span className="field-figure-fallback" style={fieldFigureStyle}>
                {game.lastDroppedFigure}
              </span>
            )
          )}
          {resultCard && (
            <ResultCard
              figure={resultCard.figure}
              key={`${resultCard.figure}-${resultCard.id}`}
            />
          )}
        </div>
      </div>

      <PlayerPanel
        counts={game.players[1]}
        isActive={game.currentPlayer === 1}
        playerId={1}
      />
      {victoryPlayer !== null && <VictoryOverlay playerId={victoryPlayer} />}
    </section>
  );
}

function isSmallFieldFigure(figure: Figure | null): boolean {
  return figure === 'Подвода' || figure === 'Вертолёт';
}

type ResultCardProps = {
  figure: Figure;
};

function ResultCard({ figure }: ResultCardProps) {
  return (
    <div className="result-card" aria-live="polite">
      <img className="result-card-rune" src={RESULT_RUNE_IMAGES[figure]} alt="" decoding="async" />
      <p>{figure}</p>
    </div>
  );
}

type VictoryOverlayProps = {
  playerId: PlayerId;
};

function VictoryOverlay({ playerId }: VictoryOverlayProps) {
  const avatarSrc = playerId === 0 ? ASSETS.playerOne : ASSETS.playerTwo;

  return (
    <div className="victory-overlay" role="status" aria-live="assertive">
      <div className="victory-card">
        <img
          className="victory-avatar"
          src={avatarSrc}
          alt={`Победитель: Игрок ${playerId + 1}`}
          decoding="async"
        />
        <p className="victory-title">Поздравляем!</p>
        <p className="victory-text">Игрок {playerId + 1} собрал Бомбу и победил!</p>
      </div>
    </div>
  );
}

type MessageBoxProps = {
  mergeMessages: string[];
  message: string;
  onlineMessage?: string;
  roomId?: string;
  winner: PlayerId | null;
};

function MessageBox({ mergeMessages, message, onlineMessage, roomId, winner }: MessageBoxProps) {
  const inviteUrl = roomId ? `${window.location.origin}/room/${roomId}` : '';

  async function copyInviteUrl() {
    if (!inviteUrl) {
      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard is not available');
      }

      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      window.prompt('Ссылка на комнату', inviteUrl);
    }
  }

  return (
    <div className="message-box">
      {roomId && <p className="room-code">Комната {roomId}</p>}
      <p className="throw-message">
        {message.startsWith('Нож упал') ? 'Нож упал!' : message}
      </p>
      {onlineMessage && <p className="online-status-message">{onlineMessage}</p>}
      {inviteUrl && (
        <div className="invite-row">
          <p className="invite-link">{inviteUrl}</p>
          <button className="invite-copy-button" type="button" onClick={copyInviteUrl}>
            Копировать
          </button>
        </div>
      )}
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
          decoding="async"
        />
        <h2>Игрок {playerId + 1}</h2>
        <p className="player-score"><span>Очки</span>{score} / {MAX_SCORE}</p>
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
        loading="lazy"
        decoding="async"
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
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
  );
}
