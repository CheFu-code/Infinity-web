export type InfinityWebUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  roles?: string[];
};

type SessionResponse = { user?: InfinityWebUser };

type WebGameState = {
  board: (number | null)[][];
  score: number;
  best: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.chefu.co.za";
const ACCOUNT_BASE = process.env.NEXT_PUBLIC_ACCOUNT_APP_URL || "https://myaccount.chefu.co.za";

export function accountLoginUrl() {
  const returnTo = `${window.location.origin}${window.location.pathname}`;
  return `${ACCOUNT_BASE}/login?app=infinity&returnTo=${encodeURIComponent(returnTo)}`;
}

export function accountLogoutUrl() {
  const returnTo = `${window.location.origin}${window.location.pathname}`;
  return `${ACCOUNT_BASE}/logout?app=infinity&returnTo=${encodeURIComponent(returnTo)}`;
}

export async function getInfinitySession() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
    headers: { "x-chefu-app": "infinity" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = await response.json() as SessionResponse;
  return payload.user ?? null;
}

export async function clearInfinitySession() {
  await fetch(`${API_BASE}/auth/session`, {
    method: "DELETE",
    credentials: "include",
    headers: { "x-chefu-app": "infinity" },
  });
}

export async function getRemoteGameState(): Promise<WebGameState | null> {
  const response = await fetch(`${API_BASE}/infinity/history`, {
    credentials: "include",
    headers: { "x-chefu-app": "infinity" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not load your saved progress.");
  const payload = await response.json() as { state?: { game?: WebGameState } | null };
  return payload.state?.game ?? null;
}

export async function saveRemoteGameState(state: WebGameState) {
  const response = await fetch(`${API_BASE}/infinity/history`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json", "x-chefu-app": "infinity" },
    body: JSON.stringify({
      state: {
        game: { ...state, history: [], won: state.score >= 2048, over: false, keepPlaying: false, moveCount: 0, maxTile: Math.max(0, ...state.board.flat().map(tile => tile ?? 0)), achievements: [], status: "playing" },
        settings: { soundEnabled: true, vibrationEnabled: false, theme: "light" },
      },
    }),
  });
  if (!response.ok) throw new Error("Could not save your progress.");
}
