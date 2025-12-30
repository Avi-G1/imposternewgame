"use client";

interface GameEndProps {
  winner: "imposter" | "players";
  word: string;
  imposterIndex: number;
  playerCount: number;
  imposterGuess?: string;
  onPlayAgain: () => void;
}

export default function GameEnd({
  winner,
  word,
  imposterIndex,
  playerCount,
  imposterGuess,
  onPlayAgain,
}: GameEndProps) {
  const imposterWon = winner === "imposter";

  return (
    <div className="min-h-screen bg-black dark:bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Winner Announcement */}
        <div className="mb-12">
          <div className="text-9xl mb-6">{imposterWon ? "🕵️" : "🎉"}</div>
          <h1 className="text-6xl md:text-7xl font-bold text-white dark:text-black mb-4">
            {imposterWon ? "Imposter Wins!" : "Players Win!"}
          </h1>
          <p className="text-2xl md:text-3xl text-white/80 dark:text-black/80">
            {imposterWon
              ? "The imposter fooled everyone!"
              : "The players caught the imposter!"}
          </p>
        </div>

        {/* Game Details */}
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border-2 border-white/30 dark:border-black/30 rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-white/70 dark:text-black/70 text-lg mb-2">
                The Word Was:
              </h3>
              <p className="text-5xl font-bold text-white dark:text-black">
                {word}
              </p>
            </div>

            <div className="border-t border-white/20 dark:border-black/20 pt-6">
              <h3 className="text-white/70 dark:text-black/70 text-lg mb-2">
                The Imposter Was:
              </h3>
              <p className="text-4xl font-bold text-white dark:text-black">
                Player {imposterIndex + 1}
              </p>
            </div>

            {imposterGuess && (
              <div className="border-t border-white/20 dark:border-black/20 pt-6">
                <h3 className="text-white/70 dark:text-black/70 text-lg mb-2">
                  Imposter Guessed:
                </h3>
                <p className="text-3xl font-bold text-white dark:text-black">
                  &quot;{imposterGuess}&quot;
                </p>
                {imposterGuess.toLowerCase() === word.toLowerCase() ? (
                  <p className="text-white dark:text-black mt-2 text-lg">
                    ✓ Correct!
                  </p>
                ) : (
                  <p className="text-white/60 dark:text-black/60 mt-2 text-lg">
                    ✗ Incorrect
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border-2 border-white/30 dark:border-black/30 rounded-xl p-6">
            <h4 className="text-white/70 dark:text-black/70 mb-2">
              Total Players
            </h4>
            <p className="text-3xl font-bold text-white dark:text-black">
              {playerCount}
            </p>
          </div>
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border-2 border-white/30 dark:border-black/30 rounded-xl p-6">
            <h4 className="text-white/70 dark:text-black/70 mb-2">Imposters</h4>
            <p className="text-3xl font-bold text-white dark:text-black">1</p>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-6 px-12 bg-white dark:bg-black text-black dark:text-white font-bold text-2xl rounded-xl border-2 border-white dark:border-black shadow-2xl hover:shadow-lg transform hover:scale-105 transition-all"
        >
          Play Again
        </button>

        <p className="text-white/50 dark:text-black/50 mt-6 text-lg">
          Start a new game with different settings
        </p>
      </div>
    </div>
  );
}
