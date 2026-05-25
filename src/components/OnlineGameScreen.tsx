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

const POLL_INTERVAL = 1400;

type OnlineGameScreenProps = {
  initialPlayer: OnlinePlayer;
  onCredits: () => void;
};

export function OnlineGameScreen({ initialPlayer, onCredits }: OnlineGameScreenProps) {
  const [player] = useState(initialPlayer);
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [game, setGame] = useState<GameState>(createInitialGameState);
  const [message, setMessage] = useState('Подключаемся к комнате...');
  const lastSavedState = useRef<string>('');

  useEffect(() => {
    let isMounted = true;

    async function syncRoom() {
      try {
        const nextRoom = await fetchOnlineRoom(player.roomId);

        if (!isMounted || !nextRoom) {
          return;
        }

        setRoom(nextRoom);
        setGame(nextRoom.state);
        lastSavedState.current = JSON.stringify(nextRoom.state);
        setMessage(getRoomMessage(nextRoom));
      } catch {
        if (isMounted) {
          setMessage('Связь с комнатой прервалась. Пробую снова...');
        }
      }
    }

    syncRoom();
    const interval = window.setInterval(syncRoom, POLL_INTERVAL);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
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

    try {
      await saveOnlineRoomState(player.roomId, nextGame);
      const nextRoom = await fetchOnlineRoom(player.roomId);

      if (nextRoom) {
        setRoom(nextRoom);
        setMessage(getRoomMessage(nextRoom));
      }
    } catch {
      setMessage('Не удалось отправить ход. Проверь интернет.');
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
