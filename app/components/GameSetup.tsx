"use client";

import { useState, useEffect } from "react";
import { wordCategories, type WordCategory, getRandomWord } from "../data/wordLists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface HintMode {
  showCategory: boolean;
  showHint: boolean;
}

interface GameSetupProps {
  onStartGame: (
    playerCount: number,
    playerNames: string[],
    word: string,
    imposterIndex: number,
    categoryName: string,
    hintMode: HintMode,
    aiHint?: string
  ) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [wordSource, setWordSource] = useState<"preset" | "custom" | "ai">("preset");
  const [selectedCategories, setSelectedCategories] = useState<WordCategory[]>([wordCategories[0]]);
  const [customWord, setCustomWord] = useState("");
  const [customHint, setCustomHint] = useState("");
  const [hintMode, setHintMode] = useState<HintMode>({ showCategory: false, showHint: true });
  
  // AI generation state
  const [aiCategory, setAiCategory] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<{word: string; category: string; hint: string} | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [wordRevealed, setWordRevealed] = useState(false);
  const [previousWords, setPreviousWords] = useState<string[]>([]);
  const [usedWordsHistory, setUsedWordsHistory] = useState<string[]>([]);
  const [manualExcludeWords, setManualExcludeWords] = useState("");
  const [showExcludeWords, setShowExcludeWords] = useState(false);

  // Load player names and word history from localStorage on mount
  useEffect(() => {
    const savedNames = localStorage.getItem("imposterPlayerNames");
    if (savedNames) {
      try {
        const parsed = JSON.parse(savedNames);
        setPlayerNames(parsed);
      } catch (e) {
        console.error("Failed to parse saved player names:", e);
      }
    }

    const savedUsedWords = localStorage.getItem("imposterUsedWords");
    if (savedUsedWords) {
      try {
        const parsed = JSON.parse(savedUsedWords);
        setUsedWordsHistory(parsed);
      } catch (e) {
        console.error("Failed to parse used words history:", e);
      }
    }

    const savedExcludeWords = localStorage.getItem("imposterExcludeWords");
    if (savedExcludeWords) {
      setManualExcludeWords(savedExcludeWords);
    }
  }, []);

  // Update player names array when player count changes
  useEffect(() => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      // Add empty names for new players
      while (newNames.length < playerCount) {
        newNames.push("");
      }
      // Remove excess names
      return newNames.slice(0, playerCount);
    });
  }, [playerCount]);

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    // Save to localStorage
    localStorage.setItem("imposterPlayerNames", JSON.stringify(newNames));
  };

  const handleGenerateAI = async () => {
    if (!aiCategory.trim()) {
      setAiError("Please enter a category or theme");
      return;
    }

    setAiGenerating(true);
    setAiError(null);

    try {
      // Combine session words, history, and manual excludes
      const manualExcludes = manualExcludeWords
        .split(",")
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 0);
      
      const allExcludedWords = [
        ...previousWords,
        ...usedWordsHistory,
        ...manualExcludes
      ];

      const response = await fetch("/api/generate-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          category: aiCategory,
          previousWords: allExcludedWords 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate word");
      }

      const data = await response.json();
      
      // Add the new word to the session history
      setPreviousWords(prev => [...prev, data.word]);
      
      setAiGenerated(data);
      setWordRevealed(false);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Failed to generate word");
    } finally {
      setAiGenerating(false);
    }
  };

  const clearWordHistory = () => {
    setUsedWordsHistory([]);
    localStorage.removeItem("imposterUsedWords");
  };

  const updateExcludeWords = (words: string) => {
    setManualExcludeWords(words);
    localStorage.setItem("imposterExcludeWords", words);
  };

  const handleStartGame = () => {
    if (wordSource === "custom" && !customWord.trim()) {
      alert("Please enter a custom word");
      return;
    }

    if (wordSource === "ai" && !aiGenerated) {
      alert("Please generate a word first");
      return;
    }

    let word: string;
    let categoryName: string;
    let aiHint: string | undefined;

    if (wordSource === "preset") {
      if (selectedCategories.length === 0) {
        alert("Please select at least one category");
        return;
      }
      // Randomly select a category from the selected ones
      const randomCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
      word = getRandomWord(randomCategory);
      categoryName = randomCategory.name;
    } else if (wordSource === "custom") {
      word = customWord.trim();
      categoryName = "Custom";
      aiHint = customHint.trim() || undefined;
    } else {
      word = aiGenerated!.word;
      categoryName = aiGenerated!.category;
      aiHint = aiGenerated!.hint;
    }

    // Add word to used words history
    const newHistory = [...usedWordsHistory, word.toLowerCase()];
    setUsedWordsHistory(newHistory);
    localStorage.setItem("imposterUsedWords", JSON.stringify(newHistory));

    const imposterIndex = Math.floor(Math.random() * playerCount);
    
    // Use custom names or default to "Player 1", "Player 2", etc.
    const finalNames = playerNames.map((name, i) => 
      name.trim() || `Player ${i + 1}`
    );
    
    onStartGame(playerCount, finalNames, word, imposterIndex, categoryName, hintMode, aiHint);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Imposter Game</CardTitle>
          <CardDescription>Pass and play social deduction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Number of Players</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNameEditor(!showNameEditor)}
              >
                {showNameEditor ? "Hide Names" : "Edit Names"}
              </Button>
            </div>
            <Slider
              value={[playerCount]}
              onValueChange={(values) => setPlayerCount(values[0])}
              min={3}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-3xl font-bold">{playerCount}</span>
              <span className="text-muted-foreground ml-2">players</span>
            </div>

            {showNameEditor && (
              <Card className="mt-3">
                <CardContent className="pt-4 space-y-2">
                  {Array.from({ length: playerCount }).map((_, i) => (
                    <div key={i}>
                      <Input
                        value={playerNames[i] || ""}
                        onChange={(e) => updatePlayerName(i, e.target.value)}
                        placeholder={`Player ${i + 1}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Word Source */}
          <div className="space-y-3">
            <Label>Word Source</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={wordSource === "preset" ? "default" : "outline"}
                onClick={() => setWordSource("preset")}
                size="sm"
              >
                Preset
              </Button>
              <Button
                variant={wordSource === "custom" ? "default" : "outline"}
                onClick={() => setWordSource("custom")}
                size="sm"
              >
                Custom
              </Button>
              <Button
                variant={wordSource === "ai" ? "default" : "outline"}
                onClick={() => setWordSource("ai")}
                size="sm"
              >
                AI Generate
              </Button>
            </div>

            {wordSource === "preset" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Select one or more categories (word will be randomly chosen from selected categories)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategories(wordCategories)}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedCategories.length > 1) {
                          setSelectedCategories([wordCategories[0]]);
                        }
                      }}
                      className="h-7 text-xs"
                      disabled={selectedCategories.length <= 1}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-4 max-h-60 overflow-y-auto space-y-2">
                    {wordCategories.map((category) => {
                      const isSelected = selectedCategories.some(cat => cat.name === category.name);
                      return (
                        <div key={category.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`category-${category.name}`}
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                // Don't allow deselecting all categories
                                if (selectedCategories.length > 1) {
                                  setSelectedCategories(selectedCategories.filter(cat => cat.name !== category.name));
                                }
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label
                            htmlFor={`category-${category.name}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {category.name} ({category.words.length} words)
                          </label>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                <div className="text-xs text-muted-foreground">
                  {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
                </div>
              </div>
            )}

            {wordSource === "custom" && (
              <div className="space-y-3">
                <Input
                  value={customWord}
                  onChange={(e) => setCustomWord(e.target.value)}
                  placeholder="Enter your word..."
                />
                <Input
                  value={customHint}
                  onChange={(e) => setCustomHint(e.target.value)}
                  placeholder="Enter hint for imposter (optional)..."
                />
              </div>
            )}

            {wordSource === "ai" && (
              <div className="space-y-3">
                <Input
                  value={aiCategory}
                  onChange={(e) => {
                    setAiCategory(e.target.value);
                    // Reset previous words when category changes
                    setPreviousWords([]);
                    setAiGenerated(null);
                  }}
                  placeholder="Enter category or theme (e.g., Space, Medieval)..."
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerateAI}
                    disabled={aiGenerating}
                    className="flex-1"
                  >
                    {aiGenerating ? "Generating..." : "Generate Word"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowExcludeWords(!showExcludeWords)}
                  >
                    {showExcludeWords ? "Hide" : "Exclude"}
                  </Button>
                </div>

                {showExcludeWords && (
                  <Card>
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <div>
                        <Label className="text-xs">Manually Exclude Words</Label>
                        <Input
                          value={manualExcludeWords}
                          onChange={(e) => updateExcludeWords(e.target.value)}
                          placeholder="e.g., Sledge, Ash, Thermite"
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate words with commas
                        </p>
                      </div>
                      
                      {usedWordsHistory.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs">Used Words History ({usedWordsHistory.length})</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearWordHistory}
                              className="h-6 text-xs"
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto bg-muted p-2 rounded">
                            {usedWordsHistory.slice(-10).join(", ")}
                            {usedWordsHistory.length > 10 && "..."}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {aiError && (
                  <Card className="border-destructive">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-sm text-destructive">✗ {aiError}</p>
                    </CardContent>
                  </Card>
                )}

                {aiGenerated && (
                  <Card>
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <p className="text-sm font-medium">✓ Generated!</p>
                      
                      {!wordRevealed ? (
                        <Button onClick={() => setWordRevealed(true)} className="w-full" variant="outline">
                          Click to Reveal Word
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-lg font-bold">Word: {aiGenerated.word}</p>
                          <p className="text-sm text-muted-foreground">Hint: {aiGenerated.hint}</p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setWordRevealed(false)}
                              variant="ghost"
                              size="sm"
                              className="flex-1"
                            >
                              Hide
                            </Button>
                            <Button
                              onClick={handleGenerateAI}
                              disabled={aiGenerating}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              {aiGenerating ? "..." : "Try Again"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Hint Mode Selection */}
          <div className="space-y-3">
            <Label>Hint Options</Label>
            <div className="space-y-2">
              <Button
                variant={hintMode.showCategory ? "default" : "outline"}
                onClick={() => setHintMode({ ...hintMode, showCategory: !hintMode.showCategory })}
                className="w-full"
                size="sm"
              >
                Show Category
              </Button>
              <Button
                variant={hintMode.showHint ? "default" : "outline"}
                onClick={() => setHintMode({ ...hintMode, showHint: !hintMode.showHint })}
                className="w-full"
                size="sm"
              >
                Give Hint to Imposter
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {hintMode.showCategory && hintMode.showHint
                ? "Everyone sees category, imposter also gets a hint"
                : hintMode.showCategory
                ? "Everyone (including imposter) sees the category"
                : hintMode.showHint
                ? "Regular players see the word, imposter gets a hint"
                : "Regular players see the word, imposter sees nothing"}
            </p>
          </div>

          {/* Start Button */}
          <Button onClick={handleStartGame} className="w-full" size="lg">
            Start Game
          </Button>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How to Play:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pass device to each player to view their role</li>
                <li>• One player is the imposter (doesn&apos;t see the word)</li>
                <li>• Discuss and find the imposter!</li>
                <li>• Imposter can try to guess the word</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
