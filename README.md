# Product Price Sorter: Selection Sort Visualizer

An interactive, educational single-page web application designed for online shopping price sorting using the **Selection Sort** algorithm. Built entirely with plain HTML5, CSS3, and vanilla JavaScript (no build step, no frameworks, no external runtime dependencies).

Created by **Team 8** for Data Structures & Algorithms.

---

## 🚀 Live Demo & Project Highlights

- **Direct Execution**: Works out-of-the-box by double-clicking `index.html` directly in any web browser (`file://`), or via any static web server.
- **GitHub Pages Ready**: Zero build steps or package installs required; simply push to GitHub and enable GitHub Pages.
- **Unified Workstation (Zero-Scroll Playback)**: Play/Pause, step controls, speed slider, live variables, and bar chart are consolidated into a single unified workstation. No scrolling is required to find or click Play.
- **Execution Input-Blocking Protection**: While the sorting simulation is playing, dataset input fields and presets are automatically locked and covered with a clear indicator to prevent race conditions or state corruption.
- **E-Commerce Context**: Sorts product prices (in ₹ INR) with customizable product names (e.g., T-Shirt, Mouse, Earbuds, Cable, Watch).
- **Two-way Step Navigation**: Precomputes every algorithm step snapshot upfront so users can step forward, step backward, jump to start, or jump to end with 100% deterministic state.
- **Live Trace & Metrics**: Displays live comparisons count vs theoretical $n(n-1)/2$, swaps vs max $n-1$, outer pass counters, chronological audit log, and a dynamic pass-by-pass trace table.
- **C Implementation**: Includes a complete C program with syntax highlighting, copy-to-clipboard functionality, and sample stdin/stdout blocks.
- **Comprehensive Theory**: Interactive partition diagram, detailed complexity table, proof of why Selection Sort is **not stable**, and memory write analysis.
- **Modern UI**: Light/Dark mode toggle (persisted via `localStorage` and respects system preferences), responsive layout, and accessible contrast.

---

## 📂 Project Structure

```text
dsa-visual/
├── index.html        # Semantic HTML5 single-page structure & sections
├── styles.css        # CSS3 variables, responsive grid/flexbox, animations & dark mode
├── script.js         # Modular vanilla JS (Step Generator, Renderer, Controls, Trace)
└── README.md         # Documentation & deployment guide
```

### Script Architecture (`script.js`)
`script.js` is partitioned into clean, self-contained sections:
1. **State & Constants**: Dataset defaults, visualizer state, DOM element caching.
2. **Step Generator**: Pure algorithmic simulation engine that precomputes snapshots (`initial`, `start_pass`, `compare`, `new_min`, `swap`, `skip_swap`, `pass_done`, `finished`).
3. **Visual Renderer**: Scaled bar chart generation, status tags, pointer indicators ($i, j, \text{min}$), and transform-based swap animations.
4. **Controls**: Play/Pause engine, step traversal, speed slider (100ms–1500ms), keyboard shortcuts (`Space`, `←`, `→`, `R`).
5. **Trace Table & Metrics**: Pass-by-pass summary table, live comparison widget vs theoretical bounds, chronological step log with jump-to-step support, and sorted catalog showcase.
6. **Syntax Highlighter & Utilities**: Offline C code tokenization, clipboard copying, and light/dark theme persistence.
7. **Dataset Loader & Event Wiring**: Validation (2–15 items, positive integers) and preset buttons.

---

## 💻 How to Run Locally

### Option 1: Direct File Opening (No Server Required)
Simply double-click `index.html` or open it with your browser:
- **Windows**: Double-click `index.html` or right-click -> *Open with* -> Chrome / Edge / Firefox.
- **Command Line**:
  ```powershell
  Start-Process index.html
  ```

### Option 2: Local HTTP Server (Optional)
If you prefer running through a local development server:

- **Using Python 3**:
  ```bash
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

- **Using Node.js (`npx serve`)**:
  ```bash
  npx serve .
  ```

- **Using VS Code Live Server**:
  Right-click `index.html` and click **"Open with Live Server"**.

---

## 🌐 How to Deploy to GitHub Pages

1. **Initialize Git Repository** (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Product Price Sorter Selection Sort Visualizer"
   ```

2. **Push to GitHub**:
   - Create a new public repository on [GitHub](https://github.com/new) (e.g., `selection-sort-visualizer`).
   - Link the remote and push:
     ```bash
     git remote add origin https://github.com/<your-username>/selection-sort-visualizer.git
     git branch -M main
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** (tab at the top).
   - In the left sidebar, click **Pages** (under "Code and automation").
   - Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`, then click **Save**.
   - Within 1–2 minutes, your website will be live at:
     ```
     https://<your-username>.github.io/selection-sort-visualizer/
     ```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Play / Pause animation |
| <kbd>→</kbd> (Right Arrow) | Step forward to next step |
| <kbd>←</kbd> (Left Arrow) | Step backward to previous step |
| <kbd>R</kbd> | Reset visualizer to initial state |

---

## 🧪 Edge Cases Tested

- **Default Worked Example**: `[799, 349, 1299, 149, 599]` ($n = 5$, 10 comparisons, 2 swaps).
- **Already Sorted Input**: `[149, 349, 599, 799, 1299]` (Executes 0 swaps, triggers "No swap needed" alerts on every pass).
- **Reverse Sorted Input**: `[1499, 999, 799, 499, 199]` (Executes max $n-1 = 4$ swaps).
- **Duplicate Elements**: `[499, 199, 499, 899, 299]` (Demonstrates why Selection Sort is not a stable sort).
- **Minimum Elements ($n = 2$)**: `[599, 199]` (1 pass, 1 comparison, 1 swap).
- **Maximum Elements ($n = 15$)**: Scaled bar widths, smooth horizontal scrolling for mobile devices.

---

## 👥 Credits

**Team 8** &bull; Data Structures & Algorithms Course Project
All source code and documentation licensed under the MIT License.
