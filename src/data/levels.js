export const SEQUENCES = [
  { id: 1, name: "LEVEL 01", description: "Basic pattern recognition. Clear enough tiles to reach the target score.", mode: "conviction", moves: 25, objective: { type: "score", target: 2000 }, difficulty: 1, reward: "Basics Cleared" },
  { id: 2, name: "LEVEL 02", description: "Practice forming larger chains to unlock special items.", mode: "conviction", moves: 20, objective: { type: "score", target: 3500 }, difficulty: 1, reward: "Chain Master" },
  { id: 3, name: "LEVEL 03", description: "Race against the clock in Time Attack mode.", mode: "signal", time: 60, objective: { type: "score", target: 4000 }, difficulty: 2, reward: "Speed Demon" },
  { id: 4, name: "LEVEL 04", description: "Use fewer moves to reach a higher threshold.", mode: "conviction", moves: 30, objective: { type: "score", target: 6000 }, difficulty: 2, reward: "Efficiency" },
  { id: 5, name: "LEVEL 05", description: "The grid state becomes more unpredictable.", mode: "conviction", moves: 18, objective: { type: "score", target: 5500 }, difficulty: 3, reward: "Strategist" },
  { id: 6, name: "LEVEL 06", description: "A faster time attack. Think quickly.", mode: "signal", time: 45, objective: { type: "score", target: 5000 }, difficulty: 3, reward: "Quick Reflexes" },
  { id: 7, name: "LEVEL 07", description: "Longer chains are required to meet this high score.", mode: "conviction", moves: 25, objective: { type: "score", target: 7000 }, difficulty: 3, reward: "Combo King" },
  { id: 8, name: "LEVEL 08", description: "Difficult patterns emerge. Use wildcard tiles strategically.", mode: "conviction", moves: 22, objective: { type: "score", target: 8500 }, difficulty: 4, reward: "Wildcard User" },
  { id: 9, name: "LEVEL 09", description: "Rapid chaining required. Connect multiple combos.", mode: "signal", time: 50, objective: { type: "score", target: 10000 }, difficulty: 4, reward: "Rapid Fire" },
  { id: 10, name: "LEVEL 10", description: "Very limited moves. Every single swap matters.", mode: "conviction", moves: 18, objective: { type: "score", target: 12000 }, difficulty: 4, reward: "Perfectionist" },
  { id: 11, name: "LEVEL 11", description: "Extreme time attack. Don't stop swapping.", mode: "signal", time: 30, objective: { type: "score", target: 15000 }, difficulty: 5, reward: "Time Lord" },
  { id: 12, name: "LEVEL 12", description: "The ultimate challenge. Maximize your match efficiency.", mode: "conviction", moves: 20, objective: { type: "score", target: 20000 }, difficulty: 5, reward: "Grandmaster" }
];
