"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfinityWebAuth } from "@/hooks/useInfinityWebAuth";
import { getRemoteGameState, saveRemoteGameState } from "@/lib/infinity-web-auth";

type Tile = number | null;
type Board = Tile[][];

const emptyBoard = (): Board => Array.from({ length: 4 }, () => Array<Tile>(4).fill(null));

function newGame(): Board {
  const board = emptyBoard();
  addTile(board);
  addTile(board);
  return board;
}

function addTile(board: Board) {
  const open: [number, number][] = [];
  board.forEach((row, r) => row.forEach((tile, c) => tile === null && open.push([r, c])));
  if (!open.length) return;
  const [r, c] = open[Math.floor(Math.random() * open.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row: Tile[]) {
  const values = row.filter((tile): tile is number => tile !== null);
  const next: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      next.push(values[i] * 2);
      i += 1;
    } else next.push(values[i]);
  }
  return [...next, ...Array<Tile>(4 - next.length).fill(null)];
}

function rotate(board: Board): Board {
  return board[0].map((_, c) => board.map(row => row[c]).reverse());
}

function moveBoard(board: Board, direction: "left" | "right" | "up" | "down") {
  let next = board.map(row => [...row]);
  const turns = direction === "up" ? 3 : direction === "right" ? 2 : direction === "down" ? 1 : 0;
  for (let i = 0; i < turns; i += 1) next = rotate(next);
  next = next.map(row => slide(row));
  for (let i = 0; i < (4 - turns) % 4; i += 1) next = rotate(next);
  const changed = JSON.stringify(board) !== JSON.stringify(next);
  if (changed) addTile(next);
  return { board: next, changed };
}

function highest(board: Board) {
  return Math.max(0, ...board.flat().map(tile => tile ?? 0));
}

export default function Home() {
  const [board, setBoard] = useState<Board>(() => newGame());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [history, setHistory] = useState<{ board: Board; score: number }[]>([]);
  const [message, setMessage] = useState("");
  const [remoteReady, setRemoteReady] = useState(false);
  const { user, isLoading: authLoading, login, logout } = useInfinityWebAuth();
  const localStateRef = useRef({ board, score, best });

  useEffect(() => {
    localStateRef.current = { board, score, best };
  }, [board, score, best]);

  useEffect(() => {
    const saved = window.localStorage.getItem("infinity-web-game");
    if (!saved) return;
    const frame = window.requestAnimationFrame(() => {
      try {
        const state = JSON.parse(saved) as { board: Board; score: number; best: number };
        setBoard(state.board);
        setScore(state.score);
        setBest(state.best);
      } catch {
        window.localStorage.removeItem("infinity-web-game");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("infinity-web-game", JSON.stringify({ board, score, best }));
  }, [board, score, best]);

  useEffect(() => {
    if (!user) {
      return;
    }
    let active = true;
    void getRemoteGameState().then(remote => {
      if (!active) return;
      if (remote?.board) {
        setBoard(remote.board);
        setScore(remote.score);
        setBest(remote.best);
      } else {
        void saveRemoteGameState(localStateRef.current);
      }
      setRemoteReady(true);
    }).catch(() => {
      if (active) setMessage("Cloud sync is temporarily unavailable.");
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (user && remoteReady) void saveRemoteGameState({ board, score, best });
  }, [board, score, best, remoteReady, user]);

  const maxTile = useMemo(() => highest(board), [board]);

  function move(direction: "left" | "right" | "up" | "down") {
    const result = moveBoard(board, direction);
    if (!result.changed) return;
    setHistory(previous => [...previous.slice(-19), { board: board.map(row => [...row]), score }]);
    const nextScore = score + result.board.flat().reduce<number>((total, tile, index) => {
      const before = board.flat()[index] ?? 0;
      return total + (tile !== null && tile !== before ? tile : 0);
    }, 0);
    setBoard(result.board);
    setScore(nextScore);
    setBest(previous => Math.max(previous, nextScore));
    setMessage(maxTile >= 2048 ? "You reached 2048. Keep going." : "");
  }

  function restart() {
    setBoard(newGame());
    setScore(0);
    setHistory([]);
    setMessage("");
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setBoard(previous.board);
    setScore(previous.score);
    setHistory(items => items.slice(0, -1));
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      };
      if (keys[event.key]) {
        event.preventDefault();
        move(keys[event.key]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="site-shell">
      <nav className="topbar">
        <a className="brand" href="#play" aria-label="Infinity home">
          <Image src="/infinity-logo.png" alt="" width={42} height={42} priority />
          <span>infinity</span>
        </a>
        <div className="nav-links"><a href="#play">Play</a><a href="#about">About</a><a href="/privacy">Privacy</a></div>
        {user ? <div className="profile-area"><button className="profile-button" onClick={() => void logout()} title="Sign out"><span className="profile-avatar">{user.photoURL ? <Image src={user.photoURL} alt="" width={30} height={30} /> : (user.displayName || user.email || "IN").slice(0, 2).toUpperCase()}</span><span className="profile-label">{user.displayName || user.email}</span><span>↗</span></button></div> : <button className="account-link" onClick={login} disabled={authLoading}>{authLoading ? "Checking..." : "Sign in"} <span>↗</span></button>}
      </nav>

      <section className="hero" id="play">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A calmer kind of challenge</p>
          <h1>Make space<br /><em>for more.</em></h1>
          <p className="lede">A focused number game for the moments between everything else. Slide, combine, and find your next move.</p>
          <div className="hero-actions"><a className="primary-button" href="#board">Start playing <span>↓</span></a><a className="text-link" href="https://play.google.com">Get the app <span>↗</span></a></div>
          <div className="micro-proof"><span className="avatar-stack"><i>IN</i><i>∞</i><i>+</i></span> Built for small daily wins</div>
        </div>

        <div className="game-panel" id="board">
          <div className="game-panel-head"><div><span className="panel-kicker">INFINITY / 2048</span><h2>Keep your rhythm.</h2></div><div className="score-row"><div><small>SCORE</small><strong>{score.toLocaleString()}</strong></div><div><small>BEST</small><strong>{best.toLocaleString()}</strong></div></div></div>
          <div className="board" aria-label="2048 game board">{board.flat().map((tile, index) => <div className={`tile tile-${tile ?? "empty"}`} key={index}>{tile}</div>)}</div>
          <div className="game-controls"><button onClick={undo} disabled={!history.length}>Undo</button><span>{message || `Highest tile ${maxTile}`}</span><button onClick={restart}>New game</button></div>
          <div className="mobile-controls"><button onClick={() => move("up")}>↑</button><div><button onClick={() => move("left")}>←</button><button onClick={() => move("down")}>↓</button><button onClick={() => move("right")}>→</button></div></div>
        </div>
      </section>

      <section className="feature-strip" id="about"><div><span className="feature-number">01</span><h3>Easy to enter.</h3><p>One simple rule. Endless combinations. No account required to begin.</p></div><div><span className="feature-number">02</span><h3>Made to continue.</h3><p>Sign in to keep your progress, achievements, and best runs wherever you go.</p></div><div><span className="feature-number">03</span><h3>Quietly competitive.</h3><p>There is always one more thoughtful move waiting in the grid.</p></div></section>
      <footer><span>© 2026 CheFu Technologies</span><span>Infinity / make room for more</span><a href="/privacy">Privacy policy</a></footer>
    </main>
  );
}
