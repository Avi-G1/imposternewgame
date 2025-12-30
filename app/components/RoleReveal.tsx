"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HintMode {
  showCategory: boolean;
  showHint: boolean;
}

interface RoleRevealProps {
  playerCount: number;
  playerNames: string[];
  currentPlayerIndex: number;
  word: string;
  imposterIndex: number;
  categoryName: string;
  hintMode: HintMode;
  aiHint?: string;
  onNext: () => void;
}


export default function RoleReveal({
  playerCount,
  playerNames,
  currentPlayerIndex,
  word,
  imposterIndex,
  categoryName,
  hintMode,
  aiHint,
  onNext,
}: RoleRevealProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [hasReleased, setHasReleased] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isImposter = currentPlayerIndex === imposterIndex;
  const playerName =
    playerNames[currentPlayerIndex] || `Player ${currentPlayerIndex + 1}`;

  const handleHoldStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Verify the event target is actually the button
    if (e.target !== buttonRef.current && !buttonRef.current?.contains(e.target as Node)) {
      return;
    }
    // Only handle left mouse button (button 0) or touch events
    if ('button' in e.nativeEvent && e.nativeEvent.button !== 0) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsHolding(true);
    setHasReleased(false);
  };

  const handleHoldEnd = (e?: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Only handle left mouse button (button 0) or touch events if event is provided
    if (e) {
      if ('button' in e.nativeEvent && e.nativeEvent.button !== 0) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    }
    // If we were holding, mark as released
    setIsHolding(prev => {
      if (prev) {
        setHasReleased(true);
        return false;
      }
      return prev;
    });
  };

  const handleNext = () => {
    setIsHolding(false);
    setHasReleased(false);
    onNext();
  };

  // Add global mouse up listener to catch releases outside the button
  useEffect(() => {
    if (isHolding) {
      const handleGlobalMouseUp = () => {
        setIsHolding(prev => {
          if (prev) {
            setHasReleased(true);
            return false;
          }
          return prev;
        });
      };
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchend', handleGlobalMouseUp);
      };
    }
  }, [isHolding]);

  // Show initial screen if not holding and not released
  if (!isHolding && !hasReleased) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <h2 className="text-6xl font-bold">{playerName}</h2>
          <p className="text-2xl text-muted-foreground">
            Hold to reveal your role
          </p>
          <Button
            ref={buttonRef}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={(e) => {
              // Only end if we're actually holding and the mouse left the button
              if (isHolding && buttonRef.current && !buttonRef.current.contains(e.relatedTarget as Node)) {
                handleHoldEnd(e as React.MouseEvent<HTMLButtonElement>);
              }
            }}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onContextMenu={(e) => e.preventDefault()}
            size="lg"
            className="text-2xl px-12 py-8 select-none touch-none active:scale-95 transition-transform"
            type="button"
          >
            Hold to Reveal
          </Button>
          <p className="text-muted-foreground text-lg">
            Make sure other players can&apos;t see the screen
          </p>
        </div>
      </div>
    );
  }

  const showCategoryToAll = hintMode.showCategory;
  const showHintToImposter = hintMode.showHint && isImposter;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full space-y-8">
        <div className="text-2xl font-semibold text-muted-foreground">
          {playerName}
          <span className="text-lg block mt-1">
            ({currentPlayerIndex + 1} of {playerCount})
          </span>
        </div>

        {isImposter ? (
          <div className="space-y-8">
            <div className="text-8xl mb-4">🕵️</div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              YOU ARE THE
              <br />
              IMPOSTER
            </h1>

            {showCategoryToAll && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Category:
                  </p>
                  <p className="text-5xl md:text-6xl font-bold">
                    {categoryName}
                  </p>
                </CardContent>
              </Card>
            )}

            {showHintToImposter && aiHint && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Hint:
                  </p>
                  <p className="text-4xl md:text-5xl font-bold">
                    {aiHint}
                  </p>
                </CardContent>
              </Card>
            )}

            {!showCategoryToAll && !showHintToImposter && (
              <p className="text-2xl text-muted-foreground">
                You have no clues. Good luck!
              </p>
            )}

            <p className="text-2xl text-muted-foreground">
              You don&apos;t know the word.
              <br />
              Blend in and try to guess it!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-8xl mb-4">✅</div>
            <h2 className="text-4xl font-bold mb-6">Your Word Is:</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-6xl md:text-7xl font-bold">{word}</p>
              </CardContent>
            </Card>

            {showCategoryToAll && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Category:
                  </p>
                  <p className="text-4xl md:text-5xl font-bold">
                    {categoryName}
                  </p>
                </CardContent>
              </Card>
            )}

            <p className="text-2xl text-muted-foreground">
              Work together to find the imposter!
            </p>
          </div>
        )}

        {hasReleased && (
          <>
            <Button
              onClick={handleNext}
              size="lg"
              className="text-2xl px-12 py-8 mt-8"
            >
              {currentPlayerIndex < playerCount - 1
                ? "Next Player"
                : "All Done"}
            </Button>

            <p className="text-muted-foreground mt-6 text-lg">
              Remember your role and don&apos;t show anyone!
            </p>
          </>
        )}

        {isHolding && !hasReleased && (
          <p className="text-muted-foreground mt-6 text-lg">
            Release to continue
          </p>
        )}
      </div>
    </div>
  );
}
