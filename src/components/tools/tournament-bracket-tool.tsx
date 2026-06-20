"use client";

import { Plus, RotateCcw, Swords, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

type TournamentMode = "single" | "double";
type BracketSide = "upper" | "lower" | "final";
type MatchSlot = "A" | "B";

type Player = {
  id: string;
  name: string;
};

type MatchResult = {
  playerAId?: string;
  playerBId?: string;
  scoreA: number;
  scoreB: number;
  winnerId?: string;
};

type MatchView = {
  id: string;
  playerA: Player | null;
  playerB: Player | null;
  scoreA: number;
  scoreB: number;
  winner: Player | null;
  autoWinner: Player | null;
};

type RoundView = {
  id: string;
  title: string;
  matches: MatchView[];
};

const emptyResult: MatchResult = {
  scoreA: 0,
  scoreB: 0
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextPowerOfTwo(value: number) {
  let size = 2;

  while (size < value) {
    size *= 2;
  }

  return size;
}

function roundTitle(matchCount: number, roundIndex: number, isLastRound: boolean) {
  if (isLastRound) {
    return "Финал";
  }

  if (matchCount >= 2) {
    return `1/${matchCount}`;
  }

  return `Раунд ${roundIndex + 1}`;
}

function resultBelongsToMatch(result: MatchResult | undefined, playerA: Player | null, playerB: Player | null) {
  if (!result) {
    return false;
  }

  return result.playerAId === playerA?.id && result.playerBId === playerB?.id;
}

function makeMatchView(
  id: string,
  playerA: Player | null,
  playerB: Player | null,
  results: Record<string, MatchResult>,
  options: { autoAdvance?: boolean } = {}
): MatchView {
  const rawResult = results[id];
  const result = resultBelongsToMatch(rawResult, playerA, playerB) ? rawResult : emptyResult;
  const manualWinner =
    playerA?.id === result.winnerId ? playerA : playerB?.id === result.winnerId ? playerB : null;
  const autoWinner =
    options.autoAdvance === false ? null : playerA && !playerB ? playerA : !playerA && playerB ? playerB : null;

  return {
    id,
    playerA,
    playerB,
    scoreA: result.scoreA ?? 0,
    scoreB: result.scoreB ?? 0,
    winner: manualWinner ?? autoWinner,
    autoWinner
  };
}

function buildBracket(players: Player[], results: Record<string, MatchResult>, prefix: BracketSide) {
  if (players.length === 0) {
    return { champion: null as Player | null, rounds: [] as RoundView[] };
  }

  const bracketSize = nextPowerOfTwo(Math.max(2, players.length));
  let slots: Array<Player | null> = [...players, ...Array.from({ length: bracketSize - players.length }, () => null)];
  const rounds: RoundView[] = [];
  let roundIndex = 0;

  while (slots.length > 1) {
    const matches: MatchView[] = [];
    const nextSlots: Array<Player | null> = [];
    const isLastRound = slots.length === 2;

    for (let index = 0; index < slots.length; index += 2) {
      const match = makeMatchView(`${prefix}-${roundIndex}-${index / 2}`, slots[index] ?? null, slots[index + 1] ?? null, results);

      matches.push(match);
      nextSlots.push(match.winner);
    }

    rounds.push({
      id: `${prefix}-round-${roundIndex}`,
      title: roundTitle(matches.length, roundIndex, isLastRound),
      matches
    });

    slots = nextSlots;
    roundIndex += 1;
  }

  return { champion: slots[0] ?? null, rounds };
}

type BracketBoardProps = {
  accent?: "purple" | "green";
  emptyText: string;
  getMatchWinsRequired?: (roundIndex: number, roundCount: number, match: MatchView) => number;
  metaLabel?: string;
  onPickWinner: (match: MatchView, winnerId: string, winsRequired: number) => void;
  onScoreChange: (match: MatchView, slot: MatchSlot, score: number, winsRequired: number) => void;
  rounds: RoundView[];
  title: string;
  winsRequired: number;
};

function scoreOptions(winsRequired: number) {
  return Array.from({ length: winsRequired + 1 }, (_, index) => index);
}

function matchLoser(match: MatchView) {
  if (!match.playerA || !match.playerB || !match.winner || match.autoWinner) {
    return null;
  }

  return match.winner.id === match.playerA.id ? match.playerB : match.playerA;
}

function isPlayer(player: Player | null): player is Player {
  return Boolean(player);
}

function getRoundLosers(round: RoundView | undefined) {
  if (!round) {
    return [];
  }

  return round.matches.map(matchLoser).filter(isPlayer);
}

function mergeLowerWinnersWithUpperLosers(lowerWinners: Player[], upperLosers: Player[]) {
  const slots: Player[] = [];
  const length = Math.max(lowerWinners.length, upperLosers.length);

  for (let index = 0; index < length; index += 1) {
    if (lowerWinners[index]) {
      slots.push(lowerWinners[index]);
    }

    if (upperLosers[index]) {
      slots.push(upperLosers[index]);
    }
  }

  return slots;
}

function buildLowerRound(roundIndex: number, slots: Player[], results: Record<string, MatchResult>) {
  const matches: MatchView[] = [];
  const winners: Player[] = [];

  for (let index = 0; index < slots.length; index += 2) {
    const playerA = slots[index] ?? null;
    const playerB = slots[index + 1] ?? null;

    if (playerA && !playerB) {
      winners.push(playerA);
      continue;
    }

    if (!playerA && !playerB) {
      continue;
    }

    const match = makeMatchView(`lower-${roundIndex}-${matches.length}`, playerA, playerB, results);

    matches.push(match);

    if (match.winner) {
      winners.push(match.winner);
    }
  }

  return {
    isComplete: winners.length === Math.ceil(slots.length / 2),
    round: matches.length
      ? {
          id: `lower-round-${roundIndex}`,
          title: `L${roundIndex + 1}`,
          matches
        }
      : null,
    winners
  };
}

function buildLowerBracket(upperRounds: RoundView[], results: Record<string, MatchResult>) {
  const upperLosersByRound = upperRounds.map(getRoundLosers);
  const rounds: RoundView[] = [];
  let lowerRoundIndex = 0;
  let carry: Player[] = [];

  if (!upperLosersByRound.some((losers) => losers.length > 0)) {
    return { champion: null as Player | null, rounds };
  }

  const firstRound = buildLowerRound(lowerRoundIndex, upperLosersByRound[0] ?? [], results);

  if (firstRound.round) {
    rounds.push(firstRound.round);
    lowerRoundIndex += 1;
  }

  if (!firstRound.isComplete) {
    return { champion: null as Player | null, rounds };
  }

  carry = firstRound.winners;

  for (let upperRoundIndex = 1; upperRoundIndex < upperRounds.length; upperRoundIndex += 1) {
    const upperLosers = upperLosersByRound[upperRoundIndex] ?? [];

    if (!upperLosers.length) {
      return { champion: null as Player | null, rounds };
    }

    const dropRound = buildLowerRound(lowerRoundIndex, mergeLowerWinnersWithUpperLosers(carry, upperLosers), results);

    if (dropRound.round) {
      rounds.push(dropRound.round);
      lowerRoundIndex += 1;
    }

    if (!dropRound.isComplete) {
      return { champion: null as Player | null, rounds };
    }

    carry = dropRound.winners;

    const upperFinalLoserDropped = upperRoundIndex === upperRounds.length - 1;

    if (upperFinalLoserDropped) {
      break;
    }

    if (carry.length > 1) {
      const consolidationRound = buildLowerRound(lowerRoundIndex, carry, results);

      if (consolidationRound.round) {
        rounds.push(consolidationRound.round);
        lowerRoundIndex += 1;
      }

      if (!consolidationRound.isComplete) {
        return { champion: null as Player | null, rounds };
      }

      carry = consolidationRound.winners;
    }
  }

  return { champion: carry.length === 1 ? carry[0] : null, rounds };
}

function BracketBoard({
  accent = "purple",
  emptyText,
  getMatchWinsRequired,
  metaLabel,
  onPickWinner,
  onScoreChange,
  rounds,
  title,
  winsRequired
}: BracketBoardProps) {
  const resolvedCardClass = accent === "green" ? "tournament-match-card-grand" : "tournament-match-card-resolved";
  const maxMatches = Math.max(1, ...rounds.map((round) => round.matches.length));
  const matchHeight = 104;
  const bracketHeight = Math.max(matchHeight, maxMatches * 126);

  return (
    <section className="tournament-bracket-board rounded-[18px] border border-[#7c3cff]/18 bg-[radial-gradient(circle_at_20%_0%,rgba(124,60,255,0.18),transparent_32%),rgba(2,5,12,0.7)] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <Swords size={18} className="text-[#9d67ff]" />
          <h3 className="tournament-bracket-title font-black">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-zinc-400">
          {metaLabel ?? `До ${winsRequired} побед`}
        </span>
      </div>

      {rounds.length ? (
        <div className="overflow-x-auto pb-2">
          <div className="grid w-max auto-cols-[230px] grid-flow-col gap-8">
            {rounds.map((round, roundIndex) => (
              <div key={round.id} className="min-w-0">
                <p className="tournament-round-title text-2xl font-black italic text-white">{round.title}</p>
                <div className="relative mt-3" style={{ height: `${bracketHeight}px` }}>
                  {round.matches.map((match, matchIndex) => {
                    const isPlayable = Boolean(match.playerA && match.playerB);
                    const hasNextRound = roundIndex < rounds.length - 1;
                    const matchWinsRequired = getMatchWinsRequired?.(roundIndex, rounds.length, match) ?? winsRequired;
                    const laneHeight = bracketHeight / Math.max(1, round.matches.length);
                    const matchTop = matchIndex * laneHeight + (laneHeight - matchHeight) / 2;

                    return (
                      <div
                        key={match.id}
                        style={{ top: `${Math.max(0, matchTop)}px` }}
                        className={`tournament-match-card absolute left-0 right-0 min-h-[96px] rounded-[14px] border p-2 ${
                          hasNextRound
                            ? "after:absolute after:left-full after:top-1/2 after:hidden after:h-px after:w-9 after:bg-[#cfd7ff]/35 xl:after:block"
                            : ""
                        } ${match.winner ? resolvedCardClass : "border-[#7c3cff]/35 bg-[#120b2c]/70"}`}
                      >
                        <div className="grid gap-1.5">
                          {[
                            { player: match.playerA, score: match.scoreA, slot: "A" as const },
                            { player: match.playerB, score: match.scoreB, slot: "B" as const }
                          ].map(({ player, score, slot }) => {
                            const isWinner = Boolean(player && match.winner?.id === player.id);
                            const isLoser = Boolean(player && match.winner && match.winner.id !== player.id);
                            const playerStateClass = isWinner
                              ? "tournament-player-winner"
                              : isLoser
                                ? "tournament-player-loser"
                                : "tournament-player-pending";

                            return (
                              <div key={`${match.id}-${slot}`} className="grid grid-cols-[1fr_48px] gap-2">
                                <button
                                  type="button"
                                  disabled={!player || !isPlayable}
                                  onClick={() => player && onPickWinner(match, player.id, matchWinsRequired)}
                                  className={`tournament-player-row ${playerStateClass} min-h-9 rounded-md border px-3 text-left text-sm font-black transition disabled:cursor-default`}
                                >
                                  <span className="block truncate">{player?.name ?? (match.autoWinner ? "BYE" : "Ожидается")}</span>
                                </button>
                                <select
                                  value={score}
                                  disabled={!player || !isPlayable}
                                  onChange={(event) => onScoreChange(match, slot, Number(event.target.value), matchWinsRequired)}
                                  className={`tournament-score-select ${playerStateClass} h-9 rounded-md border px-2 text-center text-sm font-black disabled:cursor-default`}
                                  aria-label={`Счет ${player?.name ?? "BYE"}`}
                                >
                                  {scoreOptions(matchWinsRequired).map((value) => (
                                    <option key={value} value={value}>
                                      {value}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                        {match.autoWinner ? (
                          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">Автопроход</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-[14px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">{emptyText}</p>
      )}
    </section>
  );
}

export function TournamentBracketTool() {
  const [mode, setMode] = useState<TournamentMode>("single");
  const [upperWinsRequired, setUpperWinsRequired] = useState(2);
  const [lowerWinsRequired, setLowerWinsRequired] = useState(1);
  const [finalWinsRequired, setFinalWinsRequired] = useState(2);
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [upperResults, setUpperResults] = useState<Record<string, MatchResult>>({});
  const [lowerResults, setLowerResults] = useState<Record<string, MatchResult>>({});
  const [finalResults, setFinalResults] = useState<Record<string, MatchResult>>({});

  const upperBracket = useMemo(() => buildBracket(players, upperResults, "upper"), [players, upperResults]);
  const lowerBracket = useMemo(() => buildLowerBracket(upperBracket.rounds, lowerResults), [lowerResults, upperBracket.rounds]);
  const grandFinalRounds = useMemo(() => {
    if (mode !== "double" || upperBracket.rounds.length === 0) {
      return [] as RoundView[];
    }

    return [
      {
        id: "grand-final-round",
        title: "Гранд-финал",
        matches: [
          makeMatchView(
            "final-0-0",
            upperBracket.champion,
            lowerBracket.champion,
            finalResults,
            { autoAdvance: false }
          )
        ]
      }
    ];
  }, [finalResults, lowerBracket.champion, mode, upperBracket.champion, upperBracket.rounds.length]);
  const upperDisplayRounds = useMemo(
    () => (mode === "double" ? [...upperBracket.rounds, ...grandFinalRounds] : upperBracket.rounds),
    [grandFinalRounds, mode, upperBracket.rounds]
  );
  const finalChampion = grandFinalRounds[0]?.matches[0]?.winner ?? null;
  const champion = mode === "double" ? finalChampion : upperBracket.champion;

  function addPlayer() {
    const name = playerName.trim();

    if (!name) {
      return;
    }

    setPlayers((current) => [...current, { id: makeId(), name }]);
    setPlayerName("");
    resetWinners();
  }

  function removePlayer(playerId: string) {
    setPlayers((current) => current.filter((player) => player.id !== playerId));
    resetWinners();
  }

  function resetWinners() {
    setUpperResults({});
    setLowerResults({});
    setFinalResults({});
  }

  function updateMatchResult(
    side: BracketSide,
    match: MatchView,
    updater: (current: MatchResult) => MatchResult
  ) {
    const setResults = side === "upper" ? setUpperResults : side === "lower" ? setLowerResults : setFinalResults;

    setResults((current) => {
      const validCurrent = resultBelongsToMatch(current[match.id], match.playerA, match.playerB) ? current[match.id]! : emptyResult;
      const nextResult = updater(validCurrent);

      return {
        ...current,
        [match.id]: {
          ...nextResult,
          playerAId: match.playerA?.id,
          playerBId: match.playerB?.id
        }
      };
    });
  }

  function pickWinner(side: BracketSide, match: MatchView, winnerId: string, winsRequired: number) {
    updateMatchResult(side, match, (current) => {
      const winnerIsA = winnerId === match.playerA?.id;

      return {
        ...current,
        scoreA: winnerIsA ? winsRequired : Math.min(current.scoreA ?? 0, Math.max(0, winsRequired - 1)),
        scoreB: !winnerIsA ? winsRequired : Math.min(current.scoreB ?? 0, Math.max(0, winsRequired - 1)),
        winnerId
      };
    });
  }

  function changeScore(side: BracketSide, match: MatchView, slot: MatchSlot, score: number) {
    updateMatchResult(side, match, (current) => {
      const nextScoreA = slot === "A" ? score : current.scoreA ?? 0;
      const nextScoreB = slot === "B" ? score : current.scoreB ?? 0;

      return {
        scoreA: nextScoreA,
        scoreB: nextScoreB,
        winnerId: current.winnerId
      };
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-relic">Участник</span>
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addPlayer();
              }
            }}
            placeholder="Имя игрока или команды"
            className="w-full rounded-[14px] border border-relic/18 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
        </label>
        <button type="button" onClick={addPlayer} className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-relic px-4 py-3 font-black text-black">
          <Plus size={18} />
          Добавить
        </button>
        <button type="button" onClick={resetWinners} className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-relic/20 px-4 py-3 font-black text-relic">
          <RotateCcw size={18} />
          Сбросить сетку
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-relic">Формат</span>
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as TournamentMode);
              resetWinners();
            }}
            className="w-full rounded-[14px] border border-relic/18 bg-black/30 text-white focus:border-relic focus:ring-relic"
          >
            <option value="single">Обычная сетка</option>
            <option value="double">Double elimination</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-relic">Верхняя</span>
          <select
            value={upperWinsRequired}
            onChange={(event) => {
              setUpperWinsRequired(Number(event.target.value));
              setUpperResults({});
            }}
            className="w-full rounded-[14px] border border-relic/18 bg-black/30 text-white focus:border-relic focus:ring-relic"
          >
            <option value={1}>До 1 победы</option>
            <option value={2}>До 2 побед</option>
            <option value={3}>До 3 побед</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-relic">Нижняя</span>
          <select
            value={lowerWinsRequired}
            disabled={mode !== "double"}
            onChange={(event) => {
              setLowerWinsRequired(Number(event.target.value));
              setLowerResults({});
            }}
            className="w-full rounded-[14px] border border-relic/18 bg-black/30 text-white focus:border-relic focus:ring-relic disabled:opacity-45"
          >
            <option value={1}>До 1 победы</option>
            <option value={2}>До 2 побед</option>
            <option value={3}>До 3 побед</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-relic">
            {mode === "double" ? "Гранд-финал" : "Финал"}
          </span>
          <select
            value={finalWinsRequired}
            onChange={(event) => {
              setFinalWinsRequired(Number(event.target.value));
              if (mode === "single") {
                setUpperResults((current) => {
                  const upperFinalRound = upperBracket.rounds[upperBracket.rounds.length - 1];
                  const upperFinalMatchId = upperFinalRound?.matches[0]?.id;

                  if (!upperFinalMatchId || !current[upperFinalMatchId]) {
                    return current;
                  }

                  const nextResults = { ...current };
                  delete nextResults[upperFinalMatchId];
                  return nextResults;
                });
              }
              setFinalResults({});
            }}
            className="w-full rounded-[14px] border border-relic/18 bg-black/30 text-white focus:border-relic focus:ring-relic"
          >
            <option value={1}>До 1 победы</option>
            <option value={2}>До 2 побед</option>
            <option value={3}>До 3 побед</option>
          </select>
        </label>
      </div>

      <div className="rounded-[18px] border border-relic/16 bg-black/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Список участников</p>
          <span className="text-xs text-zinc-500">{players.length} игроков</span>
        </div>
        {players.length ? (
          <div className="flex flex-wrap gap-2">
            {players.map((player) => (
              <span key={player.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white">
                {player.name}
                <button type="button" onClick={() => removePlayer(player.id)} className="text-zinc-500 transition hover:text-ember" aria-label={`Удалить ${player.name}`}>
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Добавь минимум двух участников, чтобы начать сетку.</p>
        )}
      </div>

      <BracketBoard
        emptyText="Добавь участников, чтобы увидеть верхнюю сетку."
        getMatchWinsRequired={(roundIndex, roundCount, match) => {
          if (match.id.startsWith("final-")) {
            return finalWinsRequired;
          }

          if (mode === "single" && roundIndex === roundCount - 1) {
            return finalWinsRequired;
          }

          return upperWinsRequired;
        }}
        metaLabel={
          mode === "double"
            ? `Верхняя: до ${upperWinsRequired}, гранд-финал: до ${finalWinsRequired}`
            : `Раунды: до ${upperWinsRequired}, финал: до ${finalWinsRequired}`
        }
        onPickWinner={(match, winnerId, winsRequired) =>
          pickWinner(match.id.startsWith("final-") ? "final" : "upper", match, winnerId, winsRequired)
        }
        onScoreChange={(match, slot, score) =>
          changeScore(match.id.startsWith("final-") ? "final" : "upper", match, slot, score)
        }
        rounds={upperDisplayRounds}
        title={mode === "double" ? "Верхняя сетка" : "Турнирная сетка"}
        winsRequired={upperWinsRequired}
      />

      {mode === "double" ? (
        <BracketBoard
          emptyText="Проигравшие из верхней сетки появятся здесь после выбора победителей."
          onPickWinner={(match, winnerId, winsRequired) => pickWinner("lower", match, winnerId, winsRequired)}
          onScoreChange={(match, slot, score) => changeScore("lower", match, slot, score)}
          rounds={lowerBracket.rounds}
          title="Нижняя сетка"
          winsRequired={lowerWinsRequired}
        />
      ) : null}

      <div className="rounded-[18px] border border-relic/18 bg-black/24 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Победитель</p>
        <p className="mt-2 text-2xl font-black text-white">{champion?.name ?? "Пока не определен"}</p>
      </div>
    </div>
  );
}
