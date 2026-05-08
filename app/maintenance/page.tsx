"use client";

import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Handshake,
  LucideIcon,
  RefreshCw,
  Search,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo, useState } from "react";

type CardSymbol = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type MemoryCard = CardSymbol & {
  id: string;
  matched: boolean;
};

const symbols: CardSymbol[] = [
  { key: "resume", label: "Resume", icon: FileText },
  { key: "role", label: "Role", icon: Briefcase },
  { key: "company", label: "Company", icon: Building2 },
  { key: "student", label: "Student", icon: GraduationCap },
  { key: "match", label: "Match", icon: Handshake },
  { key: "search", label: "Search", icon: Search },
];

const createDeck = () =>
  [...symbols, ...symbols]
    .map((symbol, index) => ({
      ...symbol,
      id: `${symbol.key}-${index}`,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5);

export default function MaintenancePage() {
  return (
    <Suspense>
      <MaintenanceContent />
    </Suspense>
  );
}

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const [deck, setDeck] = useState<MemoryCard[]>(createDeck);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const matchedPairs = useMemo(
    () => deck.filter((card) => card.matched).length / 2,
    [deck],
  );
  const isComplete = matchedPairs === symbols.length;

  const resetGame = useCallback(() => {
    setDeck(createDeck());
    setSelectedIds([]);
    setMoves(0);
    setIsChecking(false);
  }, []);

  const nextRound = useCallback(() => {
    setRounds((current) => current + 1);
    resetGame();
  }, [resetGame]);

  const handleTryAgain = useCallback(() => {
    const fromParam = searchParams.get("from");
    const storedPath = window.sessionStorage.getItem("maintenanceReturnPath");
    const returnPath = fromParam || storedPath || "/";

    window.sessionStorage.removeItem("maintenanceReturnPath");
    window.location.assign(returnPath.startsWith("/") ? returnPath : "/");
  }, [searchParams]);

  const handleCardClick = (card: MemoryCard) => {
    if (isChecking || card.matched || selectedIds.includes(card.id)) return;

    const nextSelectedIds = [...selectedIds, card.id];
    setSelectedIds(nextSelectedIds);

    if (nextSelectedIds.length !== 2) return;

    setMoves((current) => current + 1);
    setIsChecking(true);

    const [firstCard, secondCard] = nextSelectedIds.map(
      (id) => deck.find((deckCard) => deckCard.id === id)!,
    );

    window.setTimeout(
      () => {
        if (firstCard.key === secondCard.key) {
          setDeck((currentDeck) => {
            const nextDeck = currentDeck.map((deckCard) =>
              nextSelectedIds.includes(deckCard.id)
                ? { ...deckCard, matched: true }
                : deckCard,
            );
            const nextMatchedPairs =
              nextDeck.filter((deckCard) => deckCard.matched).length / 2;

            if (nextMatchedPairs === symbols.length) {
              const finalMoves = moves + 1;
              setBestMoves((currentBest) =>
                currentBest === null
                  ? finalMoves
                  : Math.min(currentBest, finalMoves),
              );
            }

            return nextDeck;
          });
        }

        setSelectedIds([]);
        setIsChecking(false);
      },
      firstCard.key === secondCard.key ? 280 : 760,
    );
  };

  return (
    <main className="flex-1 text-slate-950">
      <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full flex-1 flex-col justify-center gap-7">
          <div className="mx-auto w-full space-y-5 text-center ">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-5xl">
                BetterInternship is under maintenance
              </h1>
              <p className="mx-auto text-base leading-7 text-slate-600">
                We are tuning things up and should be back shortly. You can try
                refreshing, or play a quick round while you wait.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                size="md"
                onClick={handleTryAgain}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Internship Match
                </h2>
                <p className="text-sm text-slate-500">
                  Match the pairs before the servers come back.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span className="rounded-md bg-primary/10 px-2.5 py-1 text-primary">
                  Moves {moves}
                </span>
                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-emerald-700">
                  Pairs {matchedPairs}/{symbols.length}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-600">
                  Best {bestMoves ?? "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
              {deck.map((card) => {
                const Icon = card.icon;
                const isFaceUp =
                  card.matched || selectedIds.includes(card.id) || isComplete;
                const cardStateClass = card.matched
                  ? "border-amber-300 bg-amber-100 text-amber-800 shadow-sm"
                  : isFaceUp
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100";

                return (
                  <button
                    key={card.id}
                    type="button"
                    className="aspect-[4/3] rounded-lg border text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30"
                    onClick={() => handleCardClick(card)}
                    disabled={isChecking || card.matched}
                  >
                    <div
                      className={`flex h-full w-full flex-col items-center justify-center gap-2 rounded-[inherit] border p-2 text-center transition ${cardStateClass}`}
                    >
                      {isFaceUp ? (
                        <>
                          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                          <span className="text-xs font-semibold sm:text-sm">
                            {card.label}
                          </span>
                        </>
                      ) : (
                        <Sparkles className="h-6 w-6" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Flip two cards. Clear the board, then reshuffle.</span>
              <div className="flex items-center gap-2">
                {isComplete && (
                  <span className="font-medium text-primary">
                    Round {rounds + 1} complete
                  </span>
                )}
                <Button
                  size="sm"
                  variant={isComplete ? "default" : "outline"}
                  onClick={isComplete ? nextRound : resetGame}
                >
                  <RefreshCw className="h-4 w-4" />
                  {isComplete ? "Next round" : "Shuffle"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
