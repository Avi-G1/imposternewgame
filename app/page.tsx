"use client";

import { useState, useEffect } from "react";
import GameSetup from "./components/GameSetup";
import RoleReveal from "./components/RoleReveal";
import AllRevealed from "./components/AllRevealed";

type GamePhase = "setup" | "roleReveal" | "allRevealed";

interface HintMode {
  showCategory: boolean;
  showHint: boolean;
}

interface GameState {
  phase: GamePhase;
  playerCount: number;
  playerNames: string[];
  word: string;
  imposterIndex: number;
  currentPlayerIndex: number;
  categoryName: string;
  hintMode: HintMode;
  aiHint?: string;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    phase: "setup",
    playerCount: 0,
    playerNames: [],
    word: "",
    imposterIndex: 0,
    currentPlayerIndex: 0,
    categoryName: "",
    hintMode: { showCategory: false, showHint: true },
  });

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("imposterGameState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setGameState(parsed);
      } catch (e) {
        console.error("Failed to parse saved game state:", e);
      }
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState.phase !== "setup") {
      localStorage.setItem("imposterGameState", JSON.stringify(gameState));
    }
  }, [gameState]);

  const handleStartGame = (
    playerCount: number,
    playerNames: string[],
    word: string,
    imposterIndex: number,
    categoryName: string,
    hintMode: HintMode,
    aiHint?: string
  ) => {
    setGameState({
      phase: "roleReveal",
      playerCount,
      playerNames,
      word,
      imposterIndex,
      currentPlayerIndex: 0,
      categoryName,
      hintMode,
      aiHint,
    });
  };

  const handleNextPlayer = () => {
    if (gameState.currentPlayerIndex < gameState.playerCount - 1) {
      setGameState({
        ...gameState,
        currentPlayerIndex: gameState.currentPlayerIndex + 1,
      });
    } else {
      setGameState({
        ...gameState,
        phase: "allRevealed",
      });
    }
  };

  const handlePlayAgain = () => {
    localStorage.removeItem("imposterGameState");
    setGameState({
      phase: "setup",
      playerCount: 0,
      playerNames: [],
      word: "",
      imposterIndex: 0,
      currentPlayerIndex: 0,
      categoryName: "",
      hintMode: { showCategory: false, showHint: true },
    });
  };

  // Render the appropriate component based on game phase
  switch (gameState.phase) {
    case "setup":
      return <GameSetup onStartGame={handleStartGame} />;

    case "roleReveal":
      return (
        <RoleReveal
          playerCount={gameState.playerCount}
          playerNames={gameState.playerNames}
          currentPlayerIndex={gameState.currentPlayerIndex}
          word={gameState.word}
          imposterIndex={gameState.imposterIndex}
          categoryName={gameState.categoryName}
          hintMode={gameState.hintMode}
          aiHint={gameState.aiHint}
          onNext={handleNextPlayer}
        />
      );

    case "allRevealed":
      return (
        <AllRevealed
          word={gameState.word}
          categoryName={gameState.categoryName}
          imposterIndex={gameState.imposterIndex}
          playerCount={gameState.playerCount}
          playerNames={gameState.playerNames}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return <GameSetup onStartGame={handleStartGame} />;
  }
}
