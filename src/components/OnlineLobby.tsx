import { useEffect, useState } from 'react';
import {
  createOnlineRoom,
  isOnlineConfigured,
  joinOnlineRoom,
  type OnlinePlayer,
} from '../online';

type OnlineLobbyProps = {
  initialRoomCode?: string;
  onBack: () => void;
  onReady: (player: OnlinePlayer) => void;
};

export function OnlineLobby({ initialRoomCode = '', onBack, onReady }: OnlineLobbyProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const isConfigured = isOnlineConfigured();

  useEffect(() => {
    if (!initialRoomCode || !isConfigured) {
      return;
    }

    handleJoinRoom();
    // Автовход нужен только при первом открытии ссылки комнаты.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateRoom() {
    setIsBusy(true);
    setMessage('Создаю комнату...');

    try {
      const player = await createOnlineRoom();
      onReady(player);
      window.history.pushState(null, '', `/room/${player.roomId}`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoinRoom() {
    const normalizedRoomCode = roomCode.trim().toUpperCase();

    if (!normalizedRoomCode) {
      setMessage('Введи код комнаты');
      return;
    }

    setIsBusy(true);
    setMessage('Подключаюсь...');

    try {
      const player = await joinOnlineRoom(normalizedRoomCode);
      onReady(player);
      window.history.pushState(null, '', `/room/${player.roomId}`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="screen online-lobby-screen">
      <div className="online-lobby-panel">
        <h1>Build 2 Online</h1>
        <p className="online-lobby-text">
          Создай комнату и отправь ссылку второму игроку. Ходить сможет только активный игрок.
        </p>

        {!isConfigured && (
          <p className="online-warning">
            Сетевой режим ждёт настройки Supabase. Завтра добавим ключи в Vercel и он оживёт.
          </p>
        )}

        <button className="primary-button" type="button" onClick={handleCreateRoom} disabled={!isConfigured || isBusy}>
          Создать комнату
        </button>

        <div className="join-room-box">
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
            placeholder="Код комнаты"
            maxLength={8}
            disabled={!isConfigured || isBusy}
          />
          <button className="secondary-button" type="button" onClick={handleJoinRoom} disabled={!isConfigured || isBusy}>
            Войти
          </button>
        </div>

        {message && <p className="online-lobby-message">{message}</p>}

        <button className="top-action-button online-back-button" type="button" onClick={onBack}>
          Назад
        </button>
      </div>
    </section>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Что-то пошло не так';
}
