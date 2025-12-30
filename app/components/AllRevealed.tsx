"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AllRevealedProps {
  word: string;
  categoryName: string;
  imposterIndex: number;
  playerCount: number;
  playerNames: string[];
  onPlayAgain: () => void;
}

export default function AllRevealed({
  word,
  categoryName,
  imposterIndex,
  playerCount,
  playerNames,
  onPlayAgain,
}: AllRevealedProps) {
  const [revealed, setRevealed] = useState(false);
  const imposterName =
    playerNames[imposterIndex] || `Player ${imposterIndex + 1}`;

  if (!revealed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-2xl w-full space-y-8">
          <div className="space-y-6">
            <div className="text-9xl mb-6">✓</div>
            <h1 className="text-5xl md:text-6xl font-bold">
              All Players Have
              <br />
              Seen Their Roles
            </h1>
            <p className="text-2xl text-muted-foreground">
              Time to discuss and find the imposter!
            </p>
          </div>

          <Card>
            <CardContent className="pt-6 pb-6 space-y-4">
              <p className="text-lg text-muted-foreground">
                Discuss among yourselves and try to identify who the imposter
                is.
              </p>
              <p className="text-md text-muted-foreground">
                When you&apos;re ready to see the results, click below.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={() => setRevealed(true)}
            size="lg"
            className="w-full text-2xl py-8"
          >
            Reveal Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full space-y-8">
        <div className="space-y-6">
          <div className="text-9xl mb-6">🎯</div>
          <h1 className="text-5xl md:text-6xl font-bold">Game Results</h1>
          <p className="text-2xl text-muted-foreground">
            Here&apos;s what happened
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-muted-foreground text-lg mb-2">
                The Word Was:
              </h3>
              <p className="text-4xl font-bold">{word}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-muted-foreground text-lg mb-2">Category:</h3>
              <p className="text-3xl font-bold">{categoryName}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-muted-foreground text-lg mb-2">
                The Imposter Was:
              </h3>
              <p className="text-4xl font-bold">{imposterName}</p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-muted-foreground text-lg mb-2">
                Total Players
              </h3>
              <p className="text-3xl font-bold">{playerCount}</p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onPlayAgain}
          size="lg"
          className="w-full text-2xl py-8"
        >
          Play Again
        </Button>

        <p className="text-muted-foreground text-lg">
          Start a new game with different settings
        </p>
      </div>
    </div>
  );
}
