import { useEffect, useRef, useState } from 'react';
import { createInitialGameState, type GameState } from '../gameLogic';
import {
  fetchOnlineRoom,
  joinOnlineRoom,
  saveOnlineRoomState,
  type OnlinePlayer,
  type OnlineRoom,
} from '../online';
import { GameScreen } from './GameScreen';

const POLL_INTERVAL = 800;

type OnlineGameScreenProps = {
  initialPlayer: OnlinePlayer;
  onCredits: () => void;
};

export function OnlineGameScreen({ initialPlayer, onCredits }: OnlineGameScreenProps) {
  const [player] = useState(initialPlayer);
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [game, setGame] = useState<GameState>(createInitialGameState);
  const [message, setMessage] = useState('Подключаемся к комнате...');
  const [remoteEventId, setRemoteEventId] = useState('');
  const lastSavedState = useRef<string>('');
  const lastRoomStamp = useRef('');
  const ignoreNextStamp = useRef('');
  const isSyncing = useRef(false);
  const isSaving = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function syncRoom() {
      if (isSyncing.current || isSaving.current) {
        return;
      }

      isSyncing.current = true;

      try {
        const nextRoom = await fetchOnlineRoom(player.roomId);

        if (!isMounted || !nextRoom) {
          return;
        }

        const nextSerializedState = JSON.stringify(nextRoom.state);

        setRoom(nextRoom);
        setGame(nextRoom.state);
        lastSavedState.current = nextSerializedState;
        setMessage(getRoomMessage(nextRoom));

        const nextStamp = nextRoom.updated_at ?? '';
        if (nextStamp && nextStamp !== lastRoomStamp.current) {
          lastRoomStamp.current = nextStamp;

          if (ignoreNextStamp.current === nextStamp) {
            ignoreNextStamp.current = '';
          } else {
            setRemoteEventId(nextStamp);
          }
        }
      } catch {
        if (isMounted) {
          setMessage('Связь с комнатой прервалась. Пробую снова...');
        }
      } finally {
        isSyncing.current = false;
      }
    }

    syncRoom();
    const interval = window.setInterval(syncRoom, POLL_INTERVAL);
    window.addEventListener('focus', syncRoom);
    document.addEventListener('visibilitychange', syncRoom);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', syncRoom);
      document.removeEventListener('visibilitychange', syncRoom);
    };
  }, [player.roomId]);

  async function handleGameStateChange(nextGame: GameState) {
    const serializedState = JSON.stringify(nextGame);
    setGame(nextGame);

    if (serializedState === lastSavedState.current) {
      return;
    }

    lastSavedState.current = serializedState;
    setMessage('Отправляю ход второму игроку...');
    isSaving.current = true;

    try {
      const nextRoom = await saveOnlineRoomState(player.roomId, nextGame);

      if (nextRoom) {
        setRoom(nextRoom);
        setGame(nextRoom.state);
        setMessage(getRoomMessage(nextRoom));
        ignoreNextStamp.current = nextRoom.updated_at ?? '';
        lastRoomStamp.current = nextRoom.updated_at ?? lastRoomStamp.current;
      }
    } catch {
      setMessage('Не удалось отправить ход. Проверь интернет.');
    } finally {
      isSaving.current = false;
    }
  }

  return (
    <GameScreen
      canPlay={Boolean(room?.player2_token)}
      gameState={game}
      localPlayerId={player.playerId}
      onlineMessage={message}
      onCredits={onCredits}
      onGameStateChange={handleGameStateChange}
      remoteEventId={remoteEventId}
      roomId={player.roomId}
    />
  );
}

export async function connectToRoom(roomId: string) {
  return joinOnlineRoom(roomId.trim().toUpperCase());
}

function getRoomMessage(room: OnlineRoom) {
  if (!room.player2_token) {
    return 'Ждём второго игрока. Отправь ему ссылку комнаты.';
  }

  return 'Игроки в сборе. Играем по очереди.';
}
