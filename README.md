# React Match-3 Engine 🧩

A high-performance algorithmic Match-3 Puzzle Engine built from the ground up using **React** and **Vite**. 

Rather than relying on heavy monolithic engines like Unity or Godot, this project demonstrates a deep understanding of state machines, grid mathematics, and JavaScript performance optimization by implementing complex multi-directional pattern recognition algorithms natively in React.

## 🚀 Technical Highlights

- **Custom State Machine**: Handles recursive cascading matches where falling blocks can trigger subsequent autonomous chain reactions.
- **Advanced Pattern Recognition**: Utilizes multi-axis array traversal to identify intersections, 'cross' matches (L-shape/T-shape), and sets larger than 3 to automatically spawn special Wildcard objects.
- **Performant Animations**: Leverages **Framer Motion** physics-based springs (stiffness/damping) applied to dynamic CSS Grid layouts to ensure 60fps tile dropping without jitter.
- **Universal Input Layout**: Fluid control schemes seamlessly supporting:
  - Desktop-native drag and drop
  - Mobile touch swipe gestures
  - Click-to-swap selection
- **Pure CSS Geometrics**: Drops heavy `<img>` dependencies for mathematically rendered CSS polygon clip-paths, reducing bundle sizes and improving loading metrics.

## 🛠️ Stack & Architecture

- **Core Framework**: React 18+ (Hooks, Context, Memoization)
- **Tooling**: Vite (Lightning-fast HMR and optimized builds)
- **Styling**: Vanilla CSS (Custom properties, CSS Grid, Advanced Clip-Paths)
- **Database (Optional)**: Initialized for high-score persisting via Supabase. 

## 🏁 Getting Started

1. **Clone the repository**
2. **Setup Environment Variables**:
   Copy the example file and add your Supabase keys (if using the leaderboard module):
   ```bash
   cp .env.example .env
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🧠 Algorithmic Execution Flow
1. **Interaction**: Player swaps two coordinates.
2. **Detection**: `findMatchGroups()` scans horizontal/vertical axes for sequence lengths ≥ 3.
3. **Evaluation**: Matches apply scoring algorithms. If sequence ≥ 4, special tile generated at intersection.
4. **Gravity Loop**: `applyGravity()` filters `null` values down grids recursively, spawning new randomized top tiles.
5. **Recursion**: Evaluate loop triggers again until grid reaches stable state.
