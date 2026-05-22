import { useState, useCallback, useRef } from "react";
import { gameData, Category } from "./gameData";

type RevealedMap = Record<number, boolean>;

interface TeamScore {
  name: string;
  score: number;
}

interface GameState {
  screen: "home" | "game";
  categoryIdx: number;
  gameIdx: number;
  roundIdx: number;
  revealed: RevealedMap;
  strikes: number;
  roundLocked: boolean;
  stealMode: boolean;
  stealDone: boolean;
  roundTotalAtLock: number;
  team1: TeamScore;
  team2: TeamScore;
  activeTeam: 1 | 2;
  showTransition: boolean;
}

function getCategory(state: GameState): Category {
  return gameData[state.categoryIdx];
}

function getCurrentRound(state: GameState) {
  return getCategory(state).games[state.gameIdx].rounds[state.roundIdx];
}

function getRoundLabel(roundIdx: number): string {
  if (roundIdx === 2) return "ROUND 3 — 1.5X POINTS";
  return `ROUND ${roundIdx + 1}`;
}

function calcRoundTotal(revealed: RevealedMap, state: GameState): number {
  const round = getCurrentRound(state);
  return round.answers.reduce((sum, ans, i) => {
    if (ans && revealed[i]) return sum + ans.points;
    return sum;
  }, 0);
}

const CATEGORY_ICONS: Record<string, string> = {
  Sports: "🏆",
  Food: "🍕",
  Justin: "🎤",
  "Family Feud": "📺",
  "Common Knowledge": "🧠",
};

const initState = (): GameState => ({
  screen: "home",
  categoryIdx: 0,
  gameIdx: 0,
  roundIdx: 0,
  revealed: {},
  strikes: 0,
  roundLocked: false,
  stealMode: false,
  stealDone: false,
  roundTotalAtLock: 0,
  team1: { name: "Team 1", score: 0 },
  team2: { name: "Team 2", score: 0 },
  activeTeam: 1,
  showTransition: true,
});

export default function GameBoard() {
  const [state, setState] = useState<GameState>(initState);
  const [editingTeam, setEditingTeam] = useState<null | 1 | 2>(null);
  const [teamNameInput, setTeamNameInput] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (msg: string) => {
    setLastAction(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setLastAction(null), 2200);
  };

  // ... (rest of your component code remains exactly the same)
  const startRound = useCallback(() => {
    setState((s) => ({ ...s, showTransition: false }));
  }, []);

  const revealAnswer = useCallback((idx: number) => {
    setState((s) => {
      const round = getCurrentRound(s);
      const ans = round.answers[idx];
      if (!ans || s.revealed[idx]) return s;

      if (s.stealMode && !s.stealDone) {
        const stealingTeam: 1 | 2 = s.activeTeam === 1 ? 2 : 1;
        const pts = ans.points;
        const newRevealed = { ...s.revealed, [idx]: true };
        const transferPts = Math.round(s.roundTotalAtLock * 0.6);
        let t1 = { ...s.team1 };
        let t2 = { ...s.team2 };

        if (stealingTeam === 1) t1 = { ...t1, score: t1.score + pts };
        else t2 = { ...t2, score: t2.score + pts };

        if (stealingTeam === 2) {
          t1 = { ...t1, score: Math.max(0, t1.score - transferPts) };
          t2 = { ...t2, score: t2.score + transferPts };
        } else {
          t2 = { ...t2, score: Math.max(0, t2.score - transferPts) };
          t1 = { ...t1, score: t1.score + transferPts };
        }

        return {
          ...s,
          revealed: newRevealed,
          team1: t1,
          team2: t2,
          stealMode: false,
          stealDone: true,
        };
      }

      if (s.roundLocked) return s;

      const pts = ans.points;
      const newRevealed = { ...s.revealed, [idx]: true };
      const updatedTeam1 =
        s.activeTeam === 1 ? { ...s.team1, score: s.team1.score + pts } : s.team1;
      const updatedTeam2 =
        s.activeTeam === 2 ? { ...s.team2, score: s.team2.score + pts } : s.team2;

      return { ...s, revealed: newRevealed, team1: updatedTeam1, team2: updatedTeam2 };
    });
  }, []);

  // ... (All the rest of your functions and return statement remain unchanged)
  const addStrike = useCallback(() => {
    setState((s) => {
      if (s.strikes >= 3 || s.roundLocked) return s;
      return { ...s, strikes: s.strikes + 1 };
    });
    flash("Strike added!");
  }, []);

  const triggerSteal = useCallback(() => {
    setState((s) => {
      if (s.strikes < 3 || s.roundLocked) return s;
      const total = calcRoundTotal(s.revealed, s);
      return { ...s, stealMode: true, roundLocked: true, roundTotalAtLock: total };
    });
    flash("STEAL MODE — click the correct answer slot, or click WRONG if they miss!");
  }, []);

  const endRound = useCallback(() => {
    setState((s) => {
      if (s.roundLocked) return s;
      const total = calcRoundTotal(s.revealed, s);
      return { ...s, roundLocked: true, roundTotalAtLock: total };
    });
    flash("Round locked!");
  }, []);

  const stealWrong = useCallback(() => {
    setState((s) => {
      if (!s.stealMode) return s;
      return { ...s, stealMode: false, stealDone: true, strikes: Math.min(s.strikes + 1, 3) };
    });
    flash("Steal FAILED! Strike added. Original team keeps points.");
  }, []);

  const nextRound = useCallback(() => {
    setState((s) => {
      const maxRound = getCategory(s).games[s.gameIdx].rounds.length - 1;
      if (s.roundIdx >= maxRound) return s;
      return {
        ...s,
        roundIdx: s.roundIdx + 1,
        revealed: {},
        strikes: 0,
        roundLocked: false,
        stealMode: false,
        stealDone: false,
        roundTotalAtLock: 0,
        showTransition: true,
      };
    });
  }, []);

  const nextGame = useCallback(() => {
    setState((s) => {
      const maxGame = getCategory(s).games.length - 1;
      if (s.gameIdx >= maxGame) return s;
      return {
        ...s,
        gameIdx: s.gameIdx + 1,
        roundIdx: 0,
        revealed: {},
        strikes: 0,
        roundLocked: false,
        stealMode: false,
        stealDone: false,
        roundTotalAtLock: 0,
        showTransition: true,
      };
    });
  }, []);

  const selectCategory = useCallback((idx: number) => {
    setState((s) => ({
      ...s,
      screen: "game",
      categoryIdx: idx,
      gameIdx: 0,
      roundIdx: 0,
      revealed: {},
      strikes: 0,
      roundLocked: false,
      stealMode: false,
      stealDone: false,
      roundTotalAtLock: 0,
      showTransition: true,
    }));
  }, []);

  const switchCategory = useCallback((idx: number) => {
    setState((s) => ({
      ...s,
      screen: "game",
      categoryIdx: idx,
      gameIdx: 0,
      roundIdx: 0,
      revealed: {},
      strikes: 0,
      roundLocked: false,
      stealMode: false,
      stealDone: false,
      roundTotalAtLock: 0,
      showTransition: true,
    }));
    setShowCategoryPicker(false);
    flash(`Category: ${gameData[idx].name}`);
  }, []);

  const resetAll = useCallback(() => {
    setState(initState());
  }, []);

  const startEditTeam = (team: 1 | 2) => {
    setEditingTeam(team);
    setTeamNameInput(team === 1 ? state.team1.name : state.team2.name);
  };

  const saveTeamName = () => {
    if (!editingTeam) return;
    const name = teamNameInput.trim() || (editingTeam === 1 ? "Team 1" : "Team 2");
    setState((s) => ({
      ...s,
      team1: editingTeam === 1 ? { ...s.team1, name } : s.team1,
      team2: editingTeam === 2 ? { ...s.team2, name } : s.team2,
    }));
    setEditingTeam(null);
  };

  const category = getCategory(state);
  const round = getCurrentRound(state);
  const roundLabel = getRoundLabel(state.roundIdx);
  const isRound3 = state.roundIdx === 2;
  const roundTotal = calcRoundTotal(state.revealed, state);
  const canSteal = state.strikes >= 3 && !state.roundLocked && !state.stealDone;
  const maxRound = category.games[state.gameIdx].rounds.length - 1;
  const maxGame = category.games.length - 1;
  const stealingTeamName = state.activeTeam === 1 ? state.team2.name : state.team1.name;

  // Rest of your component (return statements) remains exactly the same
  if (state.screen === "home") {
    return (
      <div className="ff-board">
        <div className="ff-home">
          <h1 className="ff-home-title">Family Feud<br />Game Night</h1>
          <p className="ff-home-subtitle">Select a category to begin</p>
          <div className="ff-home-grid">
            {gameData.map((cat, i) => (
              <button
                key={i}
                className="ff-home-card"
                onClick={() => selectCategory(i)}
              >
                <span className="ff-home-card-icon">
                  {CATEGORY_ICONS[cat.name] ?? "🎯"}
                </span>
                <span className="ff-home-card-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ... (the rest of your return statement stays unchanged)
  // Please keep everything from here down exactly as you had it
