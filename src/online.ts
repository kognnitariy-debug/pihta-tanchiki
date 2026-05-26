import { createInitialGameState, type GameState, type PlayerId } from './gameLogic';

export type OnlineRoom = {
  id: string;
  state: GameState;
  player1_token: string;
  player2_token: string | null;
  updated_at?: string;
};

export type OnlinePlayer = {
  roomId: string;
  playerId: PlayerId;
  token: string;
};

type SupabaseRoomRow = {
  id: string;
  state: GameState;
  player1_token: string;
  player2_token: string | null;
  updated_at?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const PLAYER_TOKEN_KEY = 'pihta-tanchiki-player-token';

export function isOnlineConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getPlayerToken() {
  const savedToken = window.localStorage.getItem(PLAYER_TOKEN_KEY);

  if (savedToken) {
    return savedToken;
  }

  const token = createToken();
  window.localStorage.setItem(PLAYER_TOKEN_KEY, token);
  return token;
}

export function createRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export async function createOnlineRoom(): Promise<OnlinePlayer> {
  const token = getPlayerToken();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const roomId = createRoomCode();
    const room: SupabaseRoomRow = {
      id: roomId,
      state: createInitialGameState(),
      player1_token: token,
      player2_token: null,
    };

    try {
      await request<SupabaseRoomRow[]>('/rooms', {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(room),
      });

      return { roomId, playerId: 0, token };
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }
    }
  }

  throw new Error('Не удалось создать комнату');
}

export async function joinOnlineRoom(roomId: string): Promise<OnlinePlayer> {
  const token = getPlayerToken();
  const room = await fetchOnlineRoom(roomId);

  if (!room) {
    throw new Error('Комната не найдена');
  }

  if (room.player1_token === token) {
    return { roomId: room.id, playerId: 0, token };
  }

  if (room.player2_token === token) {
    return { roomId: room.id, playerId: 1, token };
  }

  if (room.player2_token) {
    throw new Error('В комнате уже два игрока');
  }

  await request<SupabaseRoomRow[]>(`/rooms?id=eq.${encodeURIComponent(room.id)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ player2_token: token }),
  });

  return { roomId: room.id, playerId: 1, token };
}

export async function fetchOnlineRoom(roomId: string): Promise<OnlineRoom | null> {
  const rows = await request<SupabaseRoomRow[]>(`/rooms?id=eq.${encodeURIComponent(roomId)}&select=*`, {
    method: 'GET',
  });

  return rows[0] ?? null;
}

export async function saveOnlineRoomState(roomId: string, state: GameState) {
  await request<SupabaseRoomRow[]>(`/rooms?id=eq.${encodeURIComponent(roomId)}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      state,
      updated_at: new Date().toISOString(),
    }),
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase не настроен');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

function createToken() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
