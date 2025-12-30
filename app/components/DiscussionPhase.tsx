"use client";

import { useState } from "react";

interface DiscussionPhaseProps {
  playerCount: number;
  word: string;
  imposterIndex: number;
  onGameEnd: (winner: "imposter" | "players", imposterGuess?: string) => void;
}

export default function DiscussionPhase({
  playerCount,
  word,
  imposterIndex,
  onGameEnd,
}: DiscussionPhaseProps) {
  const [showVoting, setShowVoting] = useState(false);
  const [showGuessing, setShowGuessing] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [guessWord, setGuessWord] = useState("");

  const handleVote = () => {
    if (selectedPlayer === null) {
      alert("Please select a player to vote for");
      return;
    }

    if (selectedPlayer === imposterIndex) {
      onGameEnd("players");
    } else {
      onGameEnd("imposter");
    }
  };

  const handleGuess = () => {
    if (!guessWord.trim()) {
      alert("Please enter a guess");
      return;
    }

    if (guessWord.trim().toLowerCase() === word.toLowerCase()) {
      onGameEnd("imposter", guessWord);
    } else {
      onGameEnd("players", guessWord);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-gray-900 dark:border-gray-100">
          <h1 className="text-5xl font-bold text-center mb-4 text-black dark:text-white">
            Discussion Phase
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-xl mb-8">
            Time to find the imposter!
          </p>

          {/* Game Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-400 dark:border-gray-600">
              <h3 className="font-semibold text-black dark:text-white mb-2">
                👥 Players
              </h3>
              <p className="text-3xl font-bold text-black dark:text-white">
                {playerCount}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-400 dark:border-gray-600">
              <h3 className="font-semibold text-black dark:text-white mb-2">
                🕵️ Imposters
              </h3>
              <p className="text-3xl font-bold text-black dark:text-white">1</p>
            </div>
          </div>

          {/* Discussion Tips */}
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-600 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-black dark:text-white mb-3 text-lg">
              💡 Discussion Tips:
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                • Take turns describing the word without saying it directly
              </li>
              <li>• Pay attention to who seems uncertain or vague</li>
              <li>• The imposter is trying to blend in!</li>
              <li>• Ask questions to catch the imposter</li>
            </ul>
          </div>

          {/* Action Buttons */}
          {!showVoting && !showGuessing && (
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowVoting(true)}
                className="py-6 px-8 bg-black dark:bg-white text-white dark:text-black font-bold text-xl rounded-xl border-2 border-black dark:border-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Vote for Imposter
              </button>
              <button
                onClick={() => setShowGuessing(true)}
                className="py-6 px-8 bg-white dark:bg-black text-black dark:text-white font-bold text-xl rounded-xl border-2 border-gray-900 dark:border-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Imposter: Guess Word
              </button>
            </div>
          )}

          {/* Voting Interface */}
          {showVoting && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Vote for the Imposter
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select which player you think is the imposter:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {Array.from({ length: playerCount }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPlayer(i)}
                    className={`py-4 px-6 rounded-lg font-semibold text-lg transition-all border-2 ${
                      selectedPlayer === i
                        ? "bg-black dark:bg-white text-white dark:text-black shadow-lg scale-105 border-black dark:border-white"
                        : "bg-white dark:bg-black text-black dark:text-white border-gray-400 dark:border-gray-600 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    Player {i + 1}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVote}
                  className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg border-2 border-black dark:border-white hover:shadow-lg transition-all"
                >
                  Confirm Vote
                </button>
                <button
                  onClick={() => {
                    setShowVoting(false);
                    setSelectedPlayer(null);
                  }}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-800 text-black dark:text-white font-semibold rounded-lg border-2 border-gray-400 dark:border-gray-600 hover:border-black dark:hover:border-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Guessing Interface */}
          {showGuessing && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Imposter: Guess the Word
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                If you guess correctly, you win!
              </p>
              <input
                type="text"
                value={guessWord}
                onChange={(e) => setGuessWord(e.target.value)}
                placeholder="Enter your guess..."
                className="w-full py-4 px-6 text-lg bg-white dark:bg-black border-2 border-gray-400 dark:border-gray-600 rounded-lg text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent mb-6"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGuess();
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleGuess}
                  className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg border-2 border-black dark:border-white hover:shadow-lg transition-all"
                >
                  Submit Guess
                </button>
                <button
                  onClick={() => {
                    setShowGuessing(false);
                    setGuessWord("");
                  }}
                  className="px-6 py-4 bg-gray-200 dark:bg-gray-800 text-black dark:text-white font-semibold rounded-lg border-2 border-gray-400 dark:border-gray-600 hover:border-black dark:hover:border-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
