import { useState, useCallback, useRef } from "react";
import { gameData, Category } from "@/data/gameData";

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

  const startRound = useCallback(() => {
    setState((s) => ({ ...s, showTransition: false }));
  }, []);

  const revealAnswer = useCallback((idx: number) => {
    setState((s) => {
      const round = getCurrentRound(s);
      const ans = round.answers[idx];
      if (!ans || s.revealed[idx]) return s;

      if (s.stealMode && !s.stealDone) {
        // Steal reveal: add points to stealing team, then transfer 60%
        const stealingTeam: 1 | 2 = s.activeTeam === 1 ? 2 : 1;
        const pts = ans.points;
        const newRevealed = { ...s.revealed, [idx]: true };
        const transferPts = Math.round(s.roundTotalAtLock * 0.6);

        let t1 = { ...s.team1 };
        let t2 = { ...s.team2 };

        // Add the revealed answer points to stealing team
        if (stealingTeam === 1) {
          t1 = { ...t1, score: t1.score + pts };
        } else {
          t2 = { ...t2, score: t2.score + pts };
        }

        // Transfer 60% from original team to stealing team
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

      // Normal reveal
      const pts = ans.points;
      const newRevealed = { ...s.revealed, [idx]: true };
      const updatedTeam1 =
        s.activeTeam === 1 ? { ...s.team1, score: s.team1.score + pts } : s.team1;
      const updatedTeam2 =
        s.activeTeam === 2 ? { ...s.team2, score: s.team2.score + pts } : s.team2;
      return { ...s, revealed: newRevealed, team1: updatedTeam1, team2: updatedTeam2 };
    });
  }, []);

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

  // ─── Home screen ─────────────────────────────────────────────────
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

  // ─── Transition screen ───────────────────────────────────────────
  if (state.showTransition) {
    return (
      <div className="ff-board">
        {/* Modals still accessible during transition */}
        {editingTeam && (
          <div className="ff-modal-overlay" onClick={() => setEditingTeam(null)}>
            <div className="ff-modal ff-modal-sm" onClick={(e) => e.stopPropagation()}>
              <h2 className="ff-modal-title">Edit Team Name</h2>
              <input
                className="ff-name-input"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTeamName()}
                autoFocus
                maxLength={20}
              />
              <div className="ff-modal-actions">
                <button className="ff-btn ff-btn-primary" onClick={saveTeamName}>Save</button>
                <button className="ff-btn ff-btn-secondary" onClick={() => setEditingTeam(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Header with scores during transition */}
        <header className="ff-header">
          <div
            className={`ff-header-team ${state.activeTeam === 1 ? "ff-header-team-active" : ""}`}
            onClick={() => startEditTeam(1)}
          >
            <span className="ff-header-team-name">{state.team1.name} ✎</span>
            <span className="ff-header-team-score">{state.team1.score}</span>
          </div>
          <div className="ff-header-center">
            <button className="ff-pill ff-pill-danger" onClick={resetAll}>Reset</button>
          </div>
          <div
            className={`ff-header-team ff-header-team-right ${state.activeTeam === 2 ? "ff-header-team-active" : ""}`}
            onClick={() => startEditTeam(2)}
          >
            <span className="ff-header-team-name">{state.team2.name} ✎</span>
            <span className="ff-header-team-score">{state.team2.score}</span>
          </div>
        </header>

        {/* Transition content */}
        <div className="ff-transition">
          <div className="ff-transition-inner">
            <p className="ff-transition-category">{category.name}</p>
            <h1 className="ff-transition-title" data-half={isRound3}>
              {isRound3 ? (
                <>
                  ROUND 3
                  <span className="ff-transition-subtitle">1.5X POINTS</span>
                </>
              ) : (
                `ROUND ${state.roundIdx + 1}`
              )}
            </h1>
            <button className="ff-btn ff-btn-start" onClick={startRound}>
              START ROUND
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main board ───────────────────────────────────────────────────
  return (
    <div className="ff-board">
      {/* Category picker modal */}
      {showCategoryPicker && (
        <div className="ff-modal-overlay" onClick={() => setShowCategoryPicker(false)}>
          <div className="ff-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ff-modal-title">Select Category</h2>
            <div className="ff-category-list">
              {gameData.map((cat, i) => (
                <button
                  key={i}
                  className={`ff-category-btn ${i === state.categoryIdx ? "active" : ""}`}
                  onClick={() => switchCategory(i)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button className="ff-btn ff-btn-secondary" onClick={() => setShowCategoryPicker(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Team name editor */}
      {editingTeam && (
        <div className="ff-modal-overlay" onClick={() => setEditingTeam(null)}>
          <div className="ff-modal ff-modal-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="ff-modal-title">Edit Team Name</h2>
            <input
              className="ff-name-input"
              value={teamNameInput}
              onChange={(e) => setTeamNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveTeamName()}
              autoFocus
              maxLength={20}
            />
            <div className="ff-modal-actions">
              <button className="ff-btn ff-btn-primary" onClick={saveTeamName}>Save</button>
              <button className="ff-btn ff-btn-secondary" onClick={() => setEditingTeam(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {lastAction && <div className="ff-toast">{lastAction}</div>}

      {/* ═══════════ HEADER ═══════════ */}
      <header className="ff-header">
        <div
          className={`ff-header-team ${state.activeTeam === 1 ? "ff-header-team-active" : ""}`}
          onClick={() => startEditTeam(1)}
          title="Click to rename"
        >
          <span className="ff-header-team-name">{state.team1.name} ✎</span>
          <span className="ff-header-team-score">{state.team1.score}</span>
        </div>

        <div className="ff-header-center">
          <button className="ff-pill" onClick={() => setShowCategoryPicker(true)}>
            {category.name} ▾
          </button>
          <div className="ff-header-meta">
            <span className="ff-game-label">Game {state.gameIdx + 1} of {category.games.length}</span>
            <span className="ff-round-badge" data-half={isRound3}>
              {isRound3 ? (
                <>Round 3 <span className="ff-half-tag">1.5X</span></>
              ) : (
                `Round ${state.roundIdx + 1}`
              )}
            </span>
          </div>
          <button className="ff-pill ff-pill-danger" onClick={resetAll}>Reset</button>
        </div>

        <div
          className={`ff-header-team ff-header-team-right ${state.activeTeam === 2 ? "ff-header-team-active" : ""}`}
          onClick={() => startEditTeam(2)}
          title="Click to rename"
        >
          <span className="ff-header-team-name">{state.team2.name} ✎</span>
          <span className="ff-header-team-score">{state.team2.score}</span>
        </div>
      </header>

      {/* ═══════════ QUESTION ═══════════ */}
      <section className="ff-question-section">
        <p className="ff-question">{round.question}</p>
      </section>

      {/* ═══════════ ANSWER BOARD ═══════════ */}
      <section className="ff-answers-section">
        <div className="ff-answers-grid" data-count={round.answers.length}>
          {round.answers.map((ans, i) => {
            const isRevealed = !!state.revealed[i];
            const isEmpty = ans === null;
            const isStealClickable = state.stealMode && !state.stealDone && ans && !isRevealed;
            const isDisabled = isEmpty || isRevealed || (state.roundLocked && !state.stealMode);

            return (
              <button
                key={i}
                className={`ff-answer-slot ${isEmpty ? "ff-answer-empty" : ""} ${
                  isRevealed ? "ff-answer-revealed" : "ff-answer-hidden"
                } ${isDisabled ? "ff-answer-disabled" : ""} ${
                  isStealClickable ? "ff-answer-steal-target" : ""
                }`}
                onClick={() => revealAnswer(i)}
                disabled={!!isDisabled}
              >
                <span className="ff-answer-num">{i + 1}</span>
                {isRevealed && ans ? (
                  <span className="ff-answer-text">{ans.text}</span>
                ) : null}
                {isRevealed && ans ? (
                  <span className="ff-answer-pts">{ans.points}</span>
                ) : null}
                {!isRevealed && isEmpty ? (
                  <span className="ff-answer-placeholder">—</span>
                ) : null}
                {isStealClickable ? (
                  <span className="ff-steal-hint">STEAL?</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══════════ CONTROLS ═══════════ */}
      <section className="ff-controls">
        {/* Strikes + round total */}
        <div className="ff-strikes-row">
          <span className="ff-strikes-label">Strikes</span>
          <div className="ff-strikes">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`ff-strike-box ${i < state.strikes ? "ff-strike-active" : ""}`}>
                {i < state.strikes ? "✕" : ""}
              </div>
            ))}
          </div>
          {state.roundLocked && (
            <div className="ff-round-total">
              Round Total: <strong>{state.roundTotalAtLock} pts</strong>
              {state.stealMode && (
                <span className="ff-steal-pct">&nbsp;→ Transfer = {Math.round(state.roundTotalAtLock * 0.6)} pts</span>
              )}
            </div>
          )}
          <span className="ff-round-label-small">{roundLabel}</span>
        </div>

        {/* Main control buttons */}
        <div className="ff-btn-row">
          <button
            className="ff-btn ff-btn-strike"
            onClick={addStrike}
            disabled={state.strikes >= 3 || state.roundLocked}
          >
            + Strike
          </button>
          <button
            className="ff-btn ff-btn-end"
            onClick={endRound}
            disabled={state.roundLocked}
          >
            END ROUND
          </button>
          {canSteal && !state.stealMode && (
            <button className="ff-btn ff-btn-steal" onClick={triggerSteal}>
              STEAL MODE
            </button>
          )}
        </div>

        {/* Steal mode controls */}
        {state.stealMode && !state.stealDone && (
          <div className="ff-steal-row">
            <span className="ff-steal-label">
              {stealingTeamName} is guessing — click their answer above, or:
            </span>
            <button className="ff-btn ff-btn-wrong" onClick={stealWrong}>
              Wrong — Add Strike
            </button>
          </div>
        )}

        {/* Bottom row: nav + team switcher */}
        <div className="ff-bottom-row">
          <div className="ff-btn-row">
            <button
              className="ff-btn ff-btn-nav"
              onClick={nextRound}
              disabled={state.roundIdx >= maxRound || !state.roundLocked}
            >
              Next Round →
            </button>
            <button
              className="ff-btn ff-btn-nav"
              onClick={nextGame}
              disabled={state.gameIdx >= maxGame}
            >
              Next Game →→
            </button>
          </div>

          <div className="ff-team-switcher">
            <span className="ff-team-switcher-label">Active Team:</span>
            <button
              className={`ff-team-btn ${state.activeTeam === 1 ? "ff-team-btn-active" : ""}`}
              onClick={() => setState((s) => ({ ...s, activeTeam: 1 }))}
            >
              {state.team1.name}
            </button>
            <button
              className={`ff-team-btn ${state.activeTeam === 2 ? "ff-team-btn-active" : ""}`}
              onClick={() => setState((s) => ({ ...s, activeTeam: 2 }))}
            >
              {state.team2.name}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
