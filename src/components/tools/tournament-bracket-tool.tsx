"use client";

import { Plus, RotateCcw, Swords, Trash2, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

type TournamentMode = "single" | "double";

type Player = {
  id: string;
  name: string;
};

type MatchView = {
  id: string;
  playerA: Player | null;
  playerB: Player | null;
  winner: Player | null;
};

type RoundView = {
  id: string;
  title: string;
  matches: MatchView[];
};

type FinalMatchView = {
  id: string;
  playerA: Player;
  playerB: Player;
  winner: Player | null;
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

function buildBracket(players: Player[], winners: Record<string, string>, prefix: string): { champion: Player | null; rounds: RoundView[] } {
  if (players.length === 0) {
    return { champion: null, rounds: [] };
  }

  const bracketSize = nextPowerOfTwo(Math.max(2, players.length));
  let slots: Array<Player | null> = [...players, ...Array.from({ length: bracketSize - players.length }, () => null)];
  const rounds: RoundView[] = [];
  let roundIndex = 0;

  while (slots.length > 1) {
    const matches: MatchView[] = [];
    const nextSlots: Array<Player | null> = [];

    for (let index = 0; index < slots.length; index += 2) {
      const playerA = slots[index] ?? null;
      const playerB = slots[index + 1] ?? null;
      const matchId = `${prefix}-${roundIndex}-${index / 2}`;
      const selectedWinnerId = winners[matchId];
      const selectedWinner =
        playerA?.id === selectedWinnerId ? playerA : playerB?.id === selectedWinnerId ? playerB : null;
      const autoWinner = playerA && !playerB ? playerA : !playerA && playerB ? playerB : null;
      const winner = selectedWinner ?? autoWinner;

      matches.push({
        id: matchId,
        playerA,
        playerB,
        winner
      });
      nextSlots.push(winner);
    }

    rounds.push({
      id: `${prefix}-round-${roundIndex}`,
      title: roundIndex === 0 ? "Старт" : `Раунд ${roundIndex + 1}`,
      matches
    });

    slots = nextSlots;
    roundIndex += 1;
  }

  return { champion: slots[0] ?? null, rounds };
}

function collectLosers(rounds: RoundView[]) {
  const losers: Player[] = [];

  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.playerA || !match.playerB || !match.winner) {
        continue;
      }

      losers.push(match.winner.id === match.playerA.id ? match.playerB : match.playerA);
    }
  }

  return losers;
}

type BracketBoardProps = {
  emptyText: string;
  onSelectWinner: (matchId: string, winnerId: string) => void;
  rounds: RoundView[];
  title: string;
  winsRequired: number;
};

function BracketBoard({ emptyText, onSelectWinner, rounds, title, winsRequired }: BracketBoardProps) {
  return (
    <section className="rounded-[18px] border border-relic/18 bg-black/24 p-4">
      <div className="mb-4 flex items-center gap-2 text-white">
        <Swords size={18} className="text-relic" />
        <h3 className="font-black">{title}</h3>
      </div>

      {rounds.length ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {rounds.map((round) => (
            <div key={round.id} className="w-[250px] shrink-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-relic">{round.title}</p>
              <div className="grid gap-3">
                {round.matches.map((match) => {
                  const canPickWinner = Boolean(match.playerA && match.playerB);

                  return (
                    <div key={match.id} className="rounded-[16px] border border-white/10 bg-[#060b13]/80 p-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                        До {winsRequired} побед
                      </p>
                      {[match.playerA, match.playerB].map((player, index) => {
                        const active = Boolean(player && match.winner?.id === player.id);

                        return (
                          <button
                            key={`${match.id}-${index}`}
                            type="button"
                            disabled={!player || !canPickWinner}
                            onClick={() => player && onSelectWinner(match.id, player.id)}
                            className={`mb-2 flex min-h-11 w-full items-center justify-between rounded-[12px] border px-3 py-2 text-left transition ${
                              active
                                ? "border-relic/70 bg-relic/18 text-white"
                                : "border-white/10 bg-black/25 text-zinc-300 hover:border-relic/35 hover:text-white"
                            } disabled:cursor-default disabled:opacity-65`}
                          >
                            <span className="truncate font-bold">{player?.name ?? "BYE"}</span>
                            {active ? <Trophy size={15} className="text-relic" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-[14px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">{emptyText}</p>
      )}
    </section>
  );
}

export function TournamentBracketTool() {
  const [mode, setMode] = useState<TournamentMode>("single");
  const [winsRequired, setWinsRequired] = useState(1);
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [upperWinners, setUpperWinners] = useState<Record<string, string>>({});
  const [lowerWinners, setLowerWinners] = useState<Record<string, string>>({});
  const [finalWinnerId, setFinalWinnerId] = useState("");

  const upperBracket = useMemo(() => buildBracket(players, upperWinners, "upper"), [players, upperWinners]);
  const lowerPlayers = useMemo(() => collectLosers(upperBracket.rounds), [upperBracket.rounds]);
  const lowerBracket = useMemo(() => buildBracket(lowerPlayers, lowerWinners, "lower"), [lowerPlayers, lowerWinners]);
  const finalPlayers = useMemo(
    () => [upperBracket.champion, mode === "double" ? lowerBracket.champion : null].filter(Boolean) as Player[],
    [lowerBracket.champion, mode, upperBracket.champion]
  );
  const finalMatch: FinalMatchView | null =
    finalPlayers.length === 2
      ? {
          id: "grand-final",
          playerA: finalPlayers[0]!,
          playerB: finalPlayers[1]!,
          winner: finalPlayers.find((player) => player.id === finalWinnerId) ?? null
        }
      : null;
  const champion = mode === "double" ? finalMatch?.winner ?? null : upperBracket.champion;

  function addPlayer() {
    const name = playerName.trim();

    if (!name) {
      return;
    }

    setPlayers((current) => [...current, { id: makeId(), name }]);
    setPlayerName("");
  }

  function removePlayer(playerId: string) {
    setPlayers((current) => current.filter((player) => player.id !== playerId));
    resetWinners();
  }

  function resetWinners() {
    setUpperWinners({});
    setLowerWinners({});
    setFinalWinnerId("");
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

      <div className="grid gap-3 lg:grid-cols-2">
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
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-relic">Серия</span>
          <select
            value={winsRequired}
            onChange={(event) => setWinsRequired(Number(event.target.value))}
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
        onSelectWinner={(matchId, winnerId) => setUpperWinners((current) => ({ ...current, [matchId]: winnerId }))}
        rounds={upperBracket.rounds}
        title={mode === "double" ? "Верхняя сетка" : "Турнирная сетка"}
        winsRequired={winsRequired}
      />

      {mode === "double" ? (
        <BracketBoard
          emptyText="Проигравшие из верхней сетки появятся здесь после выбора победителей."
          onSelectWinner={(matchId, winnerId) => setLowerWinners((current) => ({ ...current, [matchId]: winnerId }))}
          rounds={lowerBracket.rounds}
          title="Нижняя сетка"
          winsRequired={winsRequired}
        />
      ) : null}

      {finalMatch ? (
        <section className="rounded-[18px] border border-relic/28 bg-relic/[0.08] p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Trophy size={18} className="text-relic" />
            <h3 className="font-black">Гранд-финал</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[finalMatch.playerA, finalMatch.playerB].map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => setFinalWinnerId(player.id)}
                className={`rounded-[14px] border px-4 py-3 text-left font-black transition ${
                  finalWinnerId === player.id ? "border-relic/70 bg-relic/18 text-white" : "border-white/10 bg-black/25 text-zinc-300 hover:border-relic/35"
                }`}
              >
                {player.name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="rounded-[18px] border border-relic/18 bg-black/24 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Победитель</p>
        <p className="mt-2 text-2xl font-black text-white">{champion?.name ?? "Пока не определен"}</p>
      </div>
    </div>
  );
}
