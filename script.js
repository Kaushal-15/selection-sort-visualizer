/**
 * ============================================================================
 * PRODUCT PRICE SORTER: SELECTION SORT VISUALIZER
 * Script: Step Generator, Visual Renderer, Control Engine, Trace & Metrics
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     SECTION 1: STATE & CONSTANTS
     ========================================================================== */

  // Default dataset matching the worked example
  const DEFAULT_PRICES = [799, 349, 1299, 149, 599];
  const DEFAULT_NAMES = ['T-Shirt', 'Mouse', 'Earbuds', 'Cable', 'Watch'];

  // Global visualizer state object
  const state = {
    items: [],                // Array of { id, val, name, originalIndex }
    steps: [],                // Array of precomputed step snapshots
    currentStepIndex: 0,      // Pointer to active step
    isPlaying: false,         // Auto-play state
    playIntervalId: null,     // Playback timer handle
    speedMs: 600,             // Delay between steps in ms
  };

  // DOM Elements cache
  const DOM = {
    // Inputs & Presets
    priceInput: document.getElementById('priceInput'),
    productNamesInput: document.getElementById('productNamesInput'),
    inputErrorMsg: document.getElementById('inputErrorMsg'),
    btnApplyInput: document.getElementById('btnApplyInput'),
    btnClearInput: document.getElementById('btnClearInput'),
    btnPresetDefault: document.getElementById('btnPresetDefault'),
    btnPresetRandom: document.getElementById('btnPresetRandom'),
    btnPresetSorted: document.getElementById('btnPresetSorted'),
    btnPresetReversed: document.getElementById('btnPresetReversed'),
    btnPresetDuplicates: document.getElementById('btnPresetDuplicates'),
    btnLoadWorkedExample: document.getElementById('btnLoadWorkedExample'),
    btnToggleInputDrawer: document.getElementById('btnToggleInputDrawer'),
    toggleInputBtnText: document.getElementById('toggleInputBtnText'),
    inputDrawer: document.getElementById('inputDrawer'),
    inputBlockOverlay: document.getElementById('inputBlockOverlay'),

    // Visual Stage
    chartStage: document.getElementById('chartStage'),
    pointersStage: document.getElementById('pointersStage'),
    partitionTrackerBar: document.getElementById('partitionTrackerBar'),
    trackerSortedSegment: document.getElementById('trackerSortedSegment'),
    trackerSortedCount: document.getElementById('trackerSortedCount'),
    trackerUnsortedSegment: document.getElementById('trackerUnsortedSegment'),
    trackerUnsortedCount: document.getElementById('trackerUnsortedCount'),
    noSwapToast: document.getElementById('noSwapToast'),
    noSwapIndex: document.getElementById('noSwapIndex'),

    // Controls
    btnPlayPause: document.getElementById('btnPlayPause'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    playPauseText: document.getElementById('playPauseText'),
    btnPrevStep: document.getElementById('btnPrevStep'),
    btnNextStep: document.getElementById('btnNextStep'),
    btnJumpStart: document.getElementById('btnJumpStart'),
    btnJumpEnd: document.getElementById('btnJumpEnd'),
    btnResetVisualizer: document.getElementById('btnResetVisualizer'),
    speedSlider: document.getElementById('speedSlider'),
    speedValueLabel: document.getElementById('speedValueLabel'),
    stepCounterBadge: document.getElementById('stepCounterBadge'),
    stepPercentLabel: document.getElementById('stepPercentLabel'),
    progressBarFill: document.getElementById('progressBarFill'),
    progressBarTrack: document.getElementById('progressBarTrack'),

    // Current Step & Metrics
    stepStatusPill: document.getElementById('stepStatusPill'),
    valCurrentPass: document.getElementById('valCurrentPass'),
    valCurrentJ: document.getElementById('valCurrentJ'),
    valCurrentMinIdx: document.getElementById('valCurrentMinIdx'),
    valCurrentMinVal: document.getElementById('valCurrentMinVal'),
    stepDescriptionText: document.getElementById('stepDescriptionText'),
    metricComparisons: document.getElementById('metricComparisons'),
    metricTheoreticalComp: document.getElementById('metricTheoreticalComp'),
    metricSwaps: document.getElementById('metricSwaps'),
    metricMaxSwaps: document.getElementById('metricMaxSwaps'),
    metricPasses: document.getElementById('metricPasses'),
    metricTotalPasses: document.getElementById('metricTotalPasses'),
    metricSortedCount: document.getElementById('metricSortedCount'),
    metricTotalItems: document.getElementById('metricTotalItems'),

    // Step Log & Pass Table
    stepLogList: document.getElementById('stepLogList'),
    passTraceTableBody: document.getElementById('passTraceTableBody'),
    passTableCountBadge: document.getElementById('passTableCountBadge'),
    sortedProductsCard: document.getElementById('sortedProductsCard'),
    sortedProductsGrid: document.getElementById('sortedProductsGrid'),
    btnRestartShowcase: document.getElementById('btnRestartShowcase'),

    // Complexity Live Stats
    compArraySize: document.getElementById('compArraySize'),
    theoCompVal: document.getElementById('theoCompVal'),
    actualCompVal: document.getElementById('actualCompVal'),
    compVerdict: document.getElementById('compVerdict'),
    theoMaxSwapVal: document.getElementById('theoMaxSwapVal'),
    actualSwapVal: document.getElementById('actualSwapVal'),
    swapVerdict: document.getElementById('swapVerdict'),
    theoPassVal: document.getElementById('theoPassVal'),
    actualPassVal: document.getElementById('actualPassVal'),
    passVerdict: document.getElementById('passVerdict'),

    // Utilities
    themeToggle: document.getElementById('themeToggle'),
    btnCopyCode: document.getElementById('btnCopyCode'),
    copyBtnText: document.getElementById('copyBtnText'),
    cCodeBlock: document.getElementById('cCodeBlock'),
    appToast: document.getElementById('appToast'),
  };

  /**
   * Helper: Show transient toast alert
   */
  function showToast(message, duration = 2400) {
    if (!DOM.appToast) return;
    DOM.appToast.textContent = message;
    DOM.appToast.classList.add('show');
    clearTimeout(DOM.appToast._timeout);
    DOM.appToast._timeout = setTimeout(() => {
      DOM.appToast.classList.remove('show');
    }, duration);
  }

  /**
   * Helper: Format number with Indian Rupee symbol
   */
  function formatRupee(num) {
    return `₹${num.toLocaleString('en-IN')}`;
  }


  /* ==========================================================================
     SECTION 2: STEP GENERATOR (ALGORITHM ENGINE)
     Precomputes all algorithm snapshots before animation starts
     ========================================================================== */

  const StepGenerator = {
    /**
     * Generate complete sequence of immutable step snapshots
     * @param {Array} initialItems - array of { id, val, name, originalIndex }
     * @returns {Array} List of step objects
     */
    generateSteps(initialItems) {
      const steps = [];
      const n = initialItems.length;

      // Deep clone items array for working simulation
      let arr = initialItems.map(item => ({ ...item }));

      let comparisons = 0;
      let swaps = 0;

      // STEP 0: Initial State
      steps.push({
        stepType: 'initial',
        stepLabel: 'Dataset Loaded',
        arrayState: arr.map(item => ({ ...item })),
        pass: null,
        scanningIndex: null,
        minIndex: null,
        sortedBoundary: 0,
        comparisons: 0,
        swaps: 0,
        swapIndices: null,
        noSwap: false,
        passSummary: null,
        description: `Loaded ${n} product prices. Selection sort will perform ${n - 1} passes to place elements into ascending order.`
      });

      // SELECTION SORT OUTER LOOP: Passes i = 0 to n - 2
      for (let i = 0; i < n - 1; i++) {
        let minIndex = i;

        // Step: Start Pass (i is target position)
        steps.push({
          stepType: 'start_pass',
          stepLabel: `Pass ${i + 1} Start`,
          arrayState: arr.map(item => ({ ...item })),
          pass: i,
          scanningIndex: null,
          minIndex: i,
          sortedBoundary: i,
          comparisons,
          swaps,
          swapIndices: null,
          noSwap: false,
          passSummary: null,
          description: `Pass ${i + 1}: Starting search in unsorted sublist (index ${i} to ${n - 1}). Current minimum candidate is ${formatRupee(arr[i].val)} at index ${i}.`
        });

        // INNER LOOP: Scanning j = i + 1 to n - 1
        for (let j = i + 1; j < n; j++) {
          comparisons++;

          // Step: Compare arr[j] with arr[minIndex]
          steps.push({
            stepType: 'compare',
            stepLabel: `Pass ${i + 1} Compare`,
            arrayState: arr.map(item => ({ ...item })),
            pass: i,
            scanningIndex: j,
            minIndex: minIndex,
            sortedBoundary: i,
            comparisons,
            swaps,
            swapIndices: null,
            noSwap: false,
            passSummary: null,
            description: `Pass ${i + 1}: Comparing price at index ${j} (${formatRupee(arr[j].val)}) with current minimum candidate at index ${minIndex} (${formatRupee(arr[minIndex].val)}).`
          });

          // Check if new minimum found
          if (arr[j].val < arr[minIndex].val) {
            const prevMin = minIndex;
            minIndex = j;

            // Step: New Minimum Found
            steps.push({
              stepType: 'new_min',
              stepLabel: `Pass ${i + 1} New Min`,
              arrayState: arr.map(item => ({ ...item })),
              pass: i,
              scanningIndex: j,
              minIndex: minIndex,
              sortedBoundary: i,
              comparisons,
              swaps,
              swapIndices: null,
              noSwap: false,
              passSummary: null,
              description: `Pass ${i + 1}: Found lower price! ${formatRupee(arr[j].val)} at index ${j} is cheaper than ${formatRupee(arr[prevMin].val)} at index ${prevMin}. Updating minimum index to ${j}.`
            });
          }
        }

        // AFTER SCAN: Swap or Skip Swap
        const didSwap = (minIndex !== i);

        if (didSwap) {
          swaps++;

          // Step: Swap preparation / animation
          steps.push({
            stepType: 'swap',
            stepLabel: `Pass ${i + 1} Swap`,
            arrayState: arr.map(item => ({ ...item })),
            pass: i,
            scanningIndex: null,
            minIndex: minIndex,
            sortedBoundary: i,
            comparisons,
            swaps,
            swapIndices: [i, minIndex],
            noSwap: false,
            passSummary: null,
            description: `Pass ${i + 1}: Scan complete. Minimum price found is ${formatRupee(arr[minIndex].val)} at index ${minIndex}. Swapping it into target slot index ${i} (${formatRupee(arr[i].val)}).`
          });

          // Perform actual swap in simulation array
          const temp = arr[i];
          arr[i] = arr[minIndex];
          arr[minIndex] = temp;
        } else {
          // Step: Skip Swap (Already in place)
          steps.push({
            stepType: 'skip_swap',
            stepLabel: `Pass ${i + 1} No Swap`,
            arrayState: arr.map(item => ({ ...item })),
            pass: i,
            scanningIndex: null,
            minIndex: minIndex,
            sortedBoundary: i,
            comparisons,
            swaps,
            swapIndices: null,
            noSwap: true,
            passSummary: null,
            description: `Pass ${i + 1}: Minimum price (${formatRupee(arr[i].val)}) is already at index ${i}. No swap needed!`
          });
        }

        // Pass summary object for the trace table
        const passSummaryObj = {
          passNumber: i + 1,
          unsortedRange: `Indices ${i} to ${n - 1}`,
          minFoundVal: arr[i].val,
          minFoundIdx: minIndex,
          swapPerformed: didSwap
            ? `a[${i}] ↔ a[${minIndex}]`
            : `None (a[${i}] == min)`,
          isNoSwap: !didSwap,
          arrayAfter: arr.map(item => ({ ...item })),
          swappedIndices: didSwap ? [i, minIndex] : [],
          sortedIndex: i
        };

        // Step: Pass Done (Element at i is now officially sorted)
        steps.push({
          stepType: 'pass_done',
          stepLabel: `Pass ${i + 1} Done`,
          arrayState: arr.map(item => ({ ...item })),
          pass: i,
          scanningIndex: null,
          minIndex: null,
          sortedBoundary: i + 1,
          comparisons,
          swaps,
          swapIndices: null,
          noSwap: false,
          passSummary: passSummaryObj,
          description: `Pass ${i + 1} Complete: ${formatRupee(arr[i].val)} is now locked into sorted position at index ${i}.`
        });
      }

      // FINAL STEP: All n elements sorted
      steps.push({
        stepType: 'finished',
        stepLabel: 'Finished',
        arrayState: arr.map(item => ({ ...item })),
        pass: n - 1,
        scanningIndex: null,
        minIndex: null,
        sortedBoundary: n,
        comparisons,
        swaps,
        swapIndices: null,
        noSwap: false,
        passSummary: null,
        description: `Selection Sort complete! All ${n} product prices are arranged in ascending order with ${comparisons} comparisons and ${swaps} swaps.`
      });

      return steps;
    }
  };


  /* ==========================================================================
     SECTION 3: VISUAL RENDERER
     Renders bars, heights, status badges, pointers, and animations
     ========================================================================== */

  const VisualRenderer = {
    /**
     * Compute maximum price in current dataset for relative height scaling
     */
    getMaxPrice(items) {
      return items.reduce((max, item) => Math.max(max, item.val), 0) || 1;
    },

    /**
     * Initial one-time render of DOM bar wrappers into chartStage
     */
    setupChartStage(items) {
      DOM.chartStage.innerHTML = '';
      DOM.pointersStage.innerHTML = '';

      const maxPrice = this.getMaxPrice(items);
      const minBarHeight = 56;
      const maxBarHeight = 270;

      items.forEach((item, index) => {
        // Bar Wrapper
        const barWrap = document.createElement('div');
        barWrap.className = 'bar-wrapper state-default';
        barWrap.id = `bar-wrap-${index}`;
        barWrap.dataset.index = index;

        // Proportional height
        const heightPx = Math.round(minBarHeight + (item.val / maxPrice) * (maxBarHeight - minBarHeight));

        barWrap.innerHTML = `
          <div class="bar-element" id="bar-elem-${index}" style="height: ${heightPx}px;">
            <div class="bar-price" id="bar-price-${index}">${formatRupee(item.val)}</div>
            <div class="bar-status-tag" id="bar-tag-${index}"></div>
          </div>
          <div class="bar-footer">
            <span class="bar-index">[${index}]</span>
            <span class="bar-product-name" title="${item.name}">${item.name}</span>
          </div>
        `;

        DOM.chartStage.appendChild(barWrap);

        // Pointer slot below each bar
        const pointerSlot = document.createElement('div');
        pointerSlot.className = 'pointer-slot';
        pointerSlot.id = `pointer-slot-${index}`;
        DOM.pointersStage.appendChild(pointerSlot);
      });
    },

    /**
     * Render a specific snapshot onto the DOM elements
     * @param {Object} snapshot - Current step snapshot
     * @param {number} stepIndex - Current step index
     * @param {number} totalSteps - Total steps
     */
    renderSnapshot(snapshot, stepIndex, totalSteps) {
      const arr = snapshot.arrayState;
      const n = arr.length;
      const maxPrice = this.getMaxPrice(arr);
      const minBarHeight = 56;
      const maxBarHeight = 270;

      // 1. Calculate bar total width for physical swap transform animation
      const firstBar = DOM.chartStage.querySelector('.bar-wrapper');
      let barStride = 0;
      if (firstBar) {
        const nextBar = firstBar.nextElementSibling;
        if (nextBar) {
          barStride = nextBar.offsetLeft - firstBar.offsetLeft;
        } else {
          barStride = firstBar.offsetWidth + 14;
        }
      }

      // 2. Update each bar element according to current snapshot
      for (let k = 0; k < n; k++) {
        const item = arr[k];
        const barWrap = document.getElementById(`bar-wrap-${k}`);
        const barElem = document.getElementById(`bar-elem-${k}`);
        const barPrice = document.getElementById(`bar-price-${k}`);
        const barTag = document.getElementById(`bar-tag-${k}`);
        const footerName = barWrap.querySelector('.bar-product-name');

        if (!barWrap || !barElem) continue;

        // Reset transform
        barWrap.style.transform = 'translate(0px, 0px)';

        // Update height and values
        const heightPx = Math.round(minBarHeight + (item.val / maxPrice) * (maxBarHeight - minBarHeight));
        barElem.style.height = `${heightPx}px`;
        barPrice.textContent = formatRupee(item.val);
        footerName.textContent = item.name;
        footerName.title = item.name;

        // Determine state class and status tag
        let stateClass = 'state-default';
        let tagText = '';

        if (k < snapshot.sortedBoundary) {
          stateClass = 'state-sorted';
          tagText = 'Sorted';
        } else if (snapshot.swapIndices && (k === snapshot.swapIndices[0] || k === snapshot.swapIndices[1])) {
          stateClass = 'state-swapping';
          tagText = 'Swap';

          // Apply physical horizontal swap transform animation
          if (snapshot.stepType === 'swap' && barStride > 0) {
            const [idxA, idxB] = snapshot.swapIndices;
            if (k === idxA) {
              const deltaX = (idxB - idxA) * barStride;
              barWrap.style.transform = `translate(${deltaX}px, -14px)`;
            } else if (k === idxB) {
              const deltaX = (idxB - idxA) * barStride;
              barWrap.style.transform = `translate(${-deltaX}px, 14px)`;
            }
          }
        } else if (k === snapshot.minIndex && snapshot.stepType !== 'initial' && snapshot.stepType !== 'finished') {
          stateClass = 'state-min';
          tagText = 'Min';
        } else if (k === snapshot.scanningIndex) {
          stateClass = 'state-scanning';
          tagText = 'Scan';
        } else if (k === snapshot.pass && snapshot.stepType !== 'initial' && snapshot.stepType !== 'finished') {
          stateClass = 'state-target';
          tagText = 'Target (i)';
        }

        // Apply class
        barWrap.className = `bar-wrapper ${stateClass}`;
        barTag.textContent = tagText;
        barTag.style.display = tagText ? 'inline-block' : 'none';
      }

      // 3. Render Pointers below bars (i, j, min)
      for (let k = 0; k < n; k++) {
        const slot = document.getElementById(`pointer-slot-${k}`);
        if (!slot) continue;
        slot.innerHTML = '';

        // Pointer for Target slot i
        if (snapshot.pass === k && snapshot.stepType !== 'initial' && snapshot.stepType !== 'finished') {
          const pI = document.createElement('span');
          pI.className = 'pointer-badge pointer-i';
          pI.textContent = 'i (target)';
          slot.appendChild(pI);
        }

        // Pointer for Scanning j
        if (snapshot.scanningIndex === k) {
          const pJ = document.createElement('span');
          pJ.className = 'pointer-badge pointer-j';
          pJ.textContent = 'j (scan)';
          slot.appendChild(pJ);
        }

        // Pointer for Minimum Candidate (only if distinct from i and j)
        if (snapshot.minIndex === k && snapshot.minIndex !== snapshot.pass && snapshot.minIndex !== snapshot.scanningIndex) {
          const pMin = document.createElement('span');
          pMin.className = 'pointer-badge pointer-min';
          pMin.textContent = 'min';
          slot.appendChild(pMin);
        }
      }

      // 4. Update Partition Tracker Bar
      const sortedCount = snapshot.sortedBoundary;
      const unsortedCount = n - sortedCount;
      DOM.trackerSortedSegment.style.flex = sortedCount > 0 ? sortedCount : '0.001';
      DOM.trackerUnsortedSegment.style.flex = unsortedCount > 0 ? unsortedCount : '0.001';
      DOM.trackerSortedCount.textContent = sortedCount;
      DOM.trackerUnsortedCount.textContent = unsortedCount;

      // 5. "No Swap Needed" alert
      if (snapshot.noSwap) {
        DOM.noSwapIndex.textContent = snapshot.pass !== null ? `[${snapshot.pass}]` : 'i';
        DOM.noSwapToast.classList.add('is-visible');
      } else {
        DOM.noSwapToast.classList.remove('is-visible');
      }

      // 6. Update Progress and Playback Controls UI
      const percent = totalSteps > 1 ? Math.round((stepIndex / (totalSteps - 1)) * 100) : 0;
      DOM.stepCounterBadge.textContent = `Step ${stepIndex + 1} of ${totalSteps}`;
      DOM.stepPercentLabel.textContent = `${percent}%`;
      DOM.progressBarFill.style.width = `${percent}%`;
      DOM.progressBarTrack.setAttribute('aria-valuenow', percent);

      // Disable/enable navigation buttons at boundaries
      DOM.btnPrevStep.disabled = (stepIndex <= 0);
      DOM.btnJumpStart.disabled = (stepIndex <= 0);
      DOM.btnNextStep.disabled = (stepIndex >= totalSteps - 1);
      DOM.btnJumpEnd.disabled = (stepIndex >= totalSteps - 1);
    }
  };


  /* ==========================================================================
     SECTION 4: CONTROLS
     Play, pause, stepping, speed slider, keyboard shortcuts
     ========================================================================== */

  const Controls = {
    /**
     * Block/unblock dataset inputs during active playback
     */
    setInputsBlocked(blocked) {
      if (DOM.inputBlockOverlay) {
        DOM.inputBlockOverlay.style.display = blocked ? 'flex' : 'none';
      }
      if (DOM.priceInput) DOM.priceInput.disabled = blocked;
      if (DOM.productNamesInput) DOM.productNamesInput.disabled = blocked;
      if (DOM.btnApplyInput) DOM.btnApplyInput.disabled = blocked;
      if (DOM.btnClearInput) DOM.btnClearInput.disabled = blocked;
      if (DOM.btnPresetDefault) DOM.btnPresetDefault.disabled = blocked;
      if (DOM.btnPresetRandom) DOM.btnPresetRandom.disabled = blocked;
      if (DOM.btnPresetSorted) DOM.btnPresetSorted.disabled = blocked;
      if (DOM.btnPresetReversed) DOM.btnPresetReversed.disabled = blocked;
      if (DOM.btnPresetDuplicates) DOM.btnPresetDuplicates.disabled = blocked;
    },

    /**
     * Toggle the collapsible dataset customization drawer
     */
    toggleInputDrawer(forceOpen) {
      if (!DOM.inputDrawer) return;
      const isHidden = (DOM.inputDrawer.style.display === 'none');
      const shouldOpen = (forceOpen !== undefined) ? forceOpen : isHidden;

      DOM.inputDrawer.style.display = shouldOpen ? 'block' : 'none';
      DOM.inputDrawer.setAttribute('aria-hidden', !shouldOpen);

      if (DOM.btnToggleInputDrawer) {
        DOM.btnToggleInputDrawer.setAttribute('aria-expanded', shouldOpen);
      }
      if (DOM.toggleInputBtnText) {
        DOM.toggleInputBtnText.textContent = shouldOpen ? 'Close Editor' : 'Edit Prices';
      }
    },

    /**
     * Start automatic step playback
     */
    play() {
      if (state.isPlaying) return;

      // If at end, loop back to start
      if (state.currentStepIndex >= state.steps.length - 1) {
        this.jumpTo(0);
      }

      state.isPlaying = true;
      this.setInputsBlocked(true);

      DOM.playIcon.style.display = 'none';
      DOM.pauseIcon.style.display = 'inline-block';
      DOM.playPauseText.textContent = 'Pause';
      DOM.btnPlayPause.setAttribute('aria-label', 'Pause simulation');

      this.scheduleNextTick();
    },

    /**
     * Pause playback
     */
    pause() {
      state.isPlaying = false;
      this.setInputsBlocked(false);

      clearTimeout(state.playIntervalId);
      state.playIntervalId = null;

      DOM.playIcon.style.display = 'inline-block';
      DOM.pauseIcon.style.display = 'none';
      DOM.playPauseText.textContent = 'Play';
      DOM.btnPlayPause.setAttribute('aria-label', 'Play simulation');
    },

    /**
     * Toggle play / pause
     */
    togglePlay() {
      if (state.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    },

    /**
     * Internal playback ticker
     */
    scheduleNextTick() {
      clearTimeout(state.playIntervalId);
      if (!state.isPlaying) return;

      state.playIntervalId = setTimeout(() => {
        if (!state.isPlaying) return;

        if (state.currentStepIndex < state.steps.length - 1) {
          this.nextStep();
          this.scheduleNextTick();
        } else {
          this.pause();
        }
      }, state.speedMs);
    },

    /**
     * Advance one step
     */
    nextStep() {
      if (state.currentStepIndex < state.steps.length - 1) {
        this.jumpTo(state.currentStepIndex + 1);
      }
    },

    /**
     * Step backward one step
     */
    prevStep() {
      if (state.currentStepIndex > 0) {
        this.jumpTo(state.currentStepIndex - 1);
      }
    },

    /**
     * Jump to specific step index
     */
    jumpTo(index) {
      if (index < 0) index = 0;
      if (index >= state.steps.length) index = state.steps.length - 1;

      state.currentStepIndex = index;
      const snapshot = state.steps[index];

      // Render chart
      VisualRenderer.renderSnapshot(snapshot, index, state.steps.length);

      // Update trace panels and tables
      TraceManager.updateTracePanels(snapshot, index, state.steps);

      // Auto scroll step log
      TraceManager.highlightLogItem(index);
    },

    /**
     * Reset to step 0
     */
    reset() {
      this.pause();
      this.jumpTo(0);
      showToast('Visualizer reset to initial state.');
    },

    /**
     * Set playback speed
     */
    setSpeed(speedVal) {
      state.speedMs = parseInt(speedVal, 10) || 600;
      let label = 'Normal';
      if (state.speedMs <= 250) label = 'Very Fast';
      else if (state.speedMs <= 450) label = 'Fast';
      else if (state.speedMs <= 800) label = 'Medium';
      else if (state.speedMs <= 1100) label = 'Slow';
      else label = 'Very Slow';

      DOM.speedValueLabel.textContent = `${label} (${state.speedMs}ms)`;
    }
  };


  /* ==========================================================================
     SECTION 5: TRACE TABLE & METRICS
     Live step details, pass-by-pass table, action log, complexity statistics
     ========================================================================== */

  const TraceManager = {
    /**
     * Build the initial action log list DOM
     */
    buildStepLog(steps) {
      DOM.stepLogList.innerHTML = '';

      steps.forEach((step, idx) => {
        const item = document.createElement('div');
        item.className = 'log-entry';
        item.id = `log-entry-${idx}`;
        item.setAttribute('role', 'article');
        item.tabIndex = 0;

        item.innerHTML = `
          <span class="log-step-badge">#${idx + 1}</span>
          <span class="log-text">${step.description}</span>
        `;

        item.addEventListener('click', () => {
          Controls.pause();
          Controls.jumpTo(idx);
        });

        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            Controls.pause();
            Controls.jumpTo(idx);
          }
        });

        DOM.stepLogList.appendChild(item);
      });
    },

    /**
     * Highlight active log entry and scroll into view smoothly
     */
    highlightLogItem(index) {
      const active = DOM.stepLogList.querySelector('.log-entry.active-step');
      if (active) active.classList.remove('active-step');

      const current = document.getElementById(`log-entry-${index}`);
      if (current) {
        current.classList.add('active-step');
        current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    },

    /**
     * Update all live trace cards, pass table, and metrics
     */
    updateTracePanels(snapshot, stepIndex, steps) {
      const n = snapshot.arrayState.length;

      // 1. Current Step Card
      DOM.stepStatusPill.textContent = snapshot.stepLabel;
      DOM.valCurrentPass.textContent = snapshot.pass !== null ? `${snapshot.pass + 1} / ${n - 1}` : '-';
      DOM.valCurrentJ.textContent = snapshot.scanningIndex !== null ? `[${snapshot.scanningIndex}]` : '-';
      DOM.valCurrentMinIdx.textContent = snapshot.minIndex !== null ? `[${snapshot.minIndex}]` : '-';
      
      if (snapshot.minIndex !== null && snapshot.arrayState[snapshot.minIndex]) {
        DOM.valCurrentMinVal.textContent = formatRupee(snapshot.arrayState[snapshot.minIndex].val);
      } else {
        DOM.valCurrentMinVal.textContent = '-';
      }

      DOM.stepDescriptionText.textContent = snapshot.description;

      // 2. Metrics Counters
      DOM.metricComparisons.textContent = snapshot.comparisons;
      const theoreticalComp = (n * (n - 1)) / 2;
      DOM.metricTheoreticalComp.textContent = `/ ${theoreticalComp}`;

      DOM.metricSwaps.textContent = snapshot.swaps;
      DOM.metricMaxSwaps.textContent = `/ max ${n - 1}`;

      const completedPasses = Math.min(snapshot.sortedBoundary, n - 1);
      DOM.metricPasses.textContent = completedPasses;
      DOM.metricTotalPasses.textContent = `/ ${n - 1}`;

      DOM.metricSortedCount.textContent = snapshot.sortedBoundary;
      DOM.metricTotalItems.textContent = `/ ${n}`;

      // 3. Pass-by-Pass Trace Table
      this.renderPassTable(stepIndex, steps);

      // 4. Complexity Real-time Comparison Card
      this.updateComplexityWidget(n, snapshot, theoreticalComp, completedPasses);

      // 5. Sorted Product Showcase (on completion)
      if (snapshot.stepType === 'finished' || stepIndex === steps.length - 1) {
        this.renderSortedProductShowcase(snapshot.arrayState);
        DOM.sortedProductsCard.style.display = 'block';
      } else {
        DOM.sortedProductsCard.style.display = 'none';
      }
    },

    /**
     * Populate the pass-by-pass trace table based on passes completed up to stepIndex
     */
    renderPassTable(stepIndex, steps) {
      // Collect all passSummary objects from steps 0 .. stepIndex
      const summaries = [];
      for (let i = 0; i <= stepIndex; i++) {
        if (steps[i].passSummary) {
          summaries.push(steps[i].passSummary);
        }
      }

      DOM.passTableCountBadge.textContent = `${summaries.length} / ${state.items.length - 1} Passes Recorded`;

      if (summaries.length === 0) {
        DOM.passTraceTableBody.innerHTML = `
          <tr class="empty-row">
            <td colspan="5">No passes completed yet. Run the visualizer to populate the trace table.</td>
          </tr>
        `;
        return;
      }

      DOM.passTraceTableBody.innerHTML = '';

      summaries.forEach((sum) => {
        const row = document.createElement('tr');

        // Form array cell badges
        const arrayCellsHtml = sum.arrayAfter.map((item, idx) => {
          let cellClass = 'cell-tag';
          if (idx <= sum.sortedIndex) {
            cellClass += ' tag-sorted';
          } else if (sum.swappedIndices.includes(idx)) {
            cellClass += ' tag-swapped';
          }
          return `<span class="${cellClass}">${item.val}</span>`;
        }).join('');

        const swapBadgeClass = sum.isNoSwap ? 'swap-action-badge badge-neutral' : 'swap-action-badge';

        row.innerHTML = `
          <td><strong class="pass-badge">Pass ${sum.passNumber}</strong></td>
          <td>
            <span class="range-pill">${sum.unsortedRange}</span>
          </td>
          <td>
            <div class="min-found-badge">
              <strong>${formatRupee(sum.minFoundVal)}</strong> at index <code>[${sum.minFoundIdx}]</code>
            </div>
          </td>
          <td>
            <div class="${swapBadgeClass}">
              <code>${sum.swapPerformed}</code>
            </div>
          </td>
          <td>
            <div class="array-state-cells">${arrayCellsHtml}</div>
          </td>
        `;

        DOM.passTraceTableBody.appendChild(row);
      });
    },

    /**
     * Update the live vs theoretical complexity stats card
     */
    updateComplexityWidget(n, snapshot, theoreticalComp, completedPasses) {
      DOM.compArraySize.textContent = n;
      DOM.theoCompVal.textContent = theoreticalComp;
      DOM.actualCompVal.textContent = snapshot.comparisons;

      if (snapshot.comparisons === theoreticalComp) {
        DOM.compVerdict.textContent = `Matches theoretical n(n-1)/2 bound (${theoreticalComp})!`;
        DOM.compVerdict.className = 'cstat-verdict text-emerald';
      } else {
        DOM.compVerdict.textContent = `Progressing: ${snapshot.comparisons} of ${theoreticalComp} comparisons`;
        DOM.compVerdict.className = 'cstat-verdict text-indigo';
      }

      DOM.theoMaxSwapVal.textContent = n - 1;
      DOM.actualSwapVal.textContent = snapshot.swaps;
      if (snapshot.swaps <= n - 1) {
        DOM.swapVerdict.textContent = `Within theoretical bound (≤ ${n - 1})`;
        DOM.swapVerdict.className = 'cstat-verdict text-emerald';
      }

      DOM.theoPassVal.textContent = n - 1;
      DOM.actualPassVal.textContent = completedPasses;
      if (completedPasses === n - 1) {
        DOM.passVerdict.textContent = 'All n-1 passes completed!';
        DOM.passVerdict.className = 'cstat-verdict text-emerald';
      } else {
        DOM.passVerdict.textContent = `${completedPasses} of ${n - 1} passes completed`;
        DOM.passVerdict.className = 'cstat-verdict text-teal';
      }
    },

    /**
     * Render the final sorted product card catalog
     */
    renderSortedProductShowcase(sortedArray) {
      DOM.sortedProductsGrid.innerHTML = '';

      sortedArray.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'sorted-product-card';

        const isCheapest = (index === 0);
        const cheapestBadge = isCheapest ? '<span class="cheapest-badge">Cheapest Pick</span>' : '';

        card.innerHTML = `
          ${cheapestBadge}
          <span class="card-rank">Rank #${index + 1}</span>
          <h4 class="card-pname">${item.name}</h4>
          <div class="card-price">${formatRupee(item.val)}</div>
        `;

        DOM.sortedProductsGrid.appendChild(card);
      });
    }
  };


  /* ==========================================================================
     SECTION 6: SYNTAX HIGHLIGHTER, THEME & UTILITIES
     C syntax highlighter, copy button, presets, and theme toggle
     ========================================================================== */

  const Utilities = {
    /**
     * Hand-rolled syntax highlighter for C code snippet
     */
    highlightCCode() {
      if (!DOM.cCodeBlock) return;
      let raw = DOM.cCodeBlock.textContent;

      // Escape HTML entities
      let safe = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Tokenize with Regex
      // 1. Comments
      safe = safe.replace(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, '<span class="c-comment">$1</span>');

      // 2. Preprocessor directives
      safe = safe.replace(/(#include\s+&lt;[^&]+&gt;)/g, '<span class="c-preproc">$1</span>');

      // 3. Strings
      safe = safe.replace(/(&quot;[^&]*?&quot;|"[^"\\]*(?:\\.[^"\\]*)*")/g, '<span class="c-string">$1</span>');

      // 4. C Keywords
      safe = safe.replace(/\b(for|if|else|return|void|int|while)\b/g, '<span class="c-keyword">$1</span>');

      // 5. Functions
      safe = safe.replace(/\b(printf|scanf|selectionSort|printArray|main)\b(?=\s*\()/g, '<span class="c-func">$1</span>');

      // 6. Numbers
      safe = safe.replace(/\b(\d+)\b/g, '<span class="c-number">$1</span>');

      DOM.cCodeBlock.innerHTML = safe;
    },

    /**
     * Copy C code to clipboard
     */
    copyCCode() {
      const codeText = DOM.cCodeBlock ? DOM.cCodeBlock.innerText : '';
      if (!codeText) return;

      const performSuccess = () => {
        DOM.btnCopyCode.classList.add('copied');
        DOM.copyBtnText.textContent = 'Copied!';
        showToast('C code copied to clipboard!');
        setTimeout(() => {
          DOM.btnCopyCode.classList.remove('copied');
          DOM.copyBtnText.textContent = 'Copy Code';
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeText)
          .then(performSuccess)
          .catch(() => this.fallbackCopy(codeText, performSuccess));
      } else {
        this.fallbackCopy(codeText, performSuccess);
      }
    },

    /**
     * Fallback copy using textarea
     */
    fallbackCopy(text, onSuccess) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        onSuccess();
      } catch (err) {
        showToast('Failed to copy. Please select and copy manually.');
      }
      document.body.removeChild(ta);
    },

    /**
     * Setup Theme (Light / Dark) with localStorage persistence
     */
    setupTheme() {
      const saved = localStorage.getItem('pricesort_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = saved || (prefersDark ? 'dark' : 'light');

      document.documentElement.setAttribute('data-theme', initialTheme);

      DOM.themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('pricesort_theme', next);
        showToast(`Switched to ${next} theme.`);
      });
    }
  };


  /* ==========================================================================
     SECTION 7: DATASET LOADER & INITIALIZATION
     Validation, presets, event wiring, and initial launch
     ========================================================================== */

  /**
   * Validate and parse comma-separated price string
   * @param {string} rawPrices - raw input string
   * @param {string} rawNames - raw product names string
   * @returns {Object} { isValid, items, error }
   */
  function parseAndValidateInputs(rawPrices, rawNames) {
    if (!rawPrices || !rawPrices.trim()) {
      return { isValid: false, error: 'Please enter at least 2 comma-separated prices.' };
    }

    const priceTokens = rawPrices.split(',').map(s => s.trim()).filter(Boolean);

    if (priceTokens.length < 2) {
      return { isValid: false, error: 'Please provide at least 2 prices (minimum 2 items required).' };
    }

    if (priceTokens.length > 15) {
      return { isValid: false, error: 'Maximum 15 items allowed for optimal visualization.' };
    }

    const parsedPrices = [];
    for (let i = 0; i < priceTokens.length; i++) {
      const token = priceTokens[i];
      const num = Number(token);

      if (isNaN(num) || !Number.isInteger(num)) {
        return { isValid: false, error: `Invalid entry "${token}". Only positive whole integers are allowed.` };
      }

      if (num <= 0) {
        return { isValid: false, error: `Price must be greater than zero. Found "${num}".` };
      }

      if (num > 100000) {
        return { isValid: false, error: `Price ₹${num} is too large. Maximum supported price is ₹1,00,000.` };
      }

      parsedPrices.push(num);
    }

    // Parse optional product names
    const defaultLabels = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E', 'Item F', 'Item G', 'Item H', 'Item I', 'Item J', 'Item K', 'Item L', 'Item M', 'Item N', 'Item O'];
    const nameTokens = rawNames ? rawNames.split(',').map(s => s.trim()).filter(Boolean) : [];

    const items = parsedPrices.map((val, idx) => {
      const name = nameTokens[idx] || (idx < DEFAULT_NAMES.length ? DEFAULT_NAMES[idx] : defaultLabels[idx]);
      return {
        id: idx,
        val: val,
        name: name,
        originalIndex: idx
      };
    });

    return { isValid: true, items, error: null };
  }

  /**
   * Load dataset into visualizer and precompute all steps
   */
  function loadDataset(items) {
    Controls.pause();

    state.items = items;
    state.steps = StepGenerator.generateSteps(items);
    state.currentStepIndex = 0;

    // Build DOM elements
    VisualRenderer.setupChartStage(items);
    TraceManager.buildStepLog(state.steps);

    // Initial render
    VisualRenderer.renderSnapshot(state.steps[0], 0, state.steps.length);
    TraceManager.updateTracePanels(state.steps[0], 0, state.steps);
    TraceManager.highlightLogItem(0);
  }

  /**
   * Apply user inputs with validation feedback
   */
  function applyInputs() {
    const rawPrices = DOM.priceInput.value;
    const rawNames = DOM.productNamesInput.value;

    const result = parseAndValidateInputs(rawPrices, rawNames);

    if (!result.isValid) {
      DOM.priceInput.classList.add('is-invalid');
      DOM.inputErrorMsg.textContent = result.error;
      showToast(result.error, 3000);
      return;
    }

    DOM.priceInput.classList.remove('is-invalid');
    DOM.inputErrorMsg.textContent = '';

    loadDataset(result.items);
    Controls.toggleInputDrawer(false);
    showToast(`Loaded ${result.items.length} product prices.`);
  }

  /**
   * Wire all event listeners
   */
  function initEventListeners() {
    // Drawer toggle button
    if (DOM.btnToggleInputDrawer) {
      DOM.btnToggleInputDrawer.addEventListener('click', () => Controls.toggleInputDrawer());
    }

    // Apply & Clear input buttons
    DOM.btnApplyInput.addEventListener('click', applyInputs);
    
    DOM.btnClearInput.addEventListener('click', () => {
      DOM.priceInput.value = '';
      DOM.productNamesInput.value = '';
      DOM.inputErrorMsg.textContent = '';
      DOM.priceInput.classList.remove('is-invalid');
      DOM.priceInput.focus();
    });

    // Enter key submits input
    DOM.priceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyInputs();
      }
    });

    // Presets
    DOM.btnPresetDefault.addEventListener('click', () => {
      DOM.priceInput.value = '799, 349, 1299, 149, 599';
      DOM.productNamesInput.value = 'T-Shirt, Mouse, Earbuds, Cable, Watch';
      applyInputs();
    });

    DOM.btnPresetRandom.addEventListener('click', () => {
      const count = 6;
      const sampleNames = ['Bag', 'Shoes', 'Headphones', 'Speaker', 'Ring', 'Wallet', 'Belt', 'Cap'];
      const randomPrices = [];
      const randomNames = [];
      for (let i = 0; i < count; i++) {
        // Random e-commerce price between 99 and 2499 ending in 9 or 99
        const base = Math.floor(Math.random() * 24) + 1;
        const price = base * 100 - (Math.random() > 0.5 ? 1 : 51);
        randomPrices.push(price);
        randomNames.push(sampleNames[i] || `Item ${i + 1}`);
      }
      DOM.priceInput.value = randomPrices.join(', ');
      DOM.productNamesInput.value = randomNames.join(', ');
      applyInputs();
    });

    DOM.btnPresetSorted.addEventListener('click', () => {
      DOM.priceInput.value = '149, 349, 599, 799, 1299';
      DOM.productNamesInput.value = 'Cable, Mouse, Watch, T-Shirt, Earbuds';
      applyInputs();
      showToast('Loaded already sorted prices (Best case for zero swaps).');
    });

    DOM.btnPresetReversed.addEventListener('click', () => {
      DOM.priceInput.value = '1499, 999, 799, 499, 199';
      DOM.productNamesInput.value = 'Jacket, Boots, Backpack, Shirt, Socks';
      applyInputs();
      showToast('Loaded reverse sorted prices.');
    });

    DOM.btnPresetDuplicates.addEventListener('click', () => {
      DOM.priceInput.value = '499, 199, 499, 899, 299';
      DOM.productNamesInput.value = 'Shirt A, Socks, Shirt B, Shoes, Cap';
      applyInputs();
      showToast('Loaded prices with duplicate values (tests stability).');
    });

    // Load Worked Example Button in Worked Example section
    if (DOM.btnLoadWorkedExample) {
      DOM.btnLoadWorkedExample.addEventListener('click', () => {
        DOM.priceInput.value = '799, 349, 1299, 149, 599';
        DOM.productNamesInput.value = 'T-Shirt, Mouse, Earbuds, Cable, Watch';
        applyInputs();
        // Smooth scroll to visualizer workstation directly
        const ws = document.getElementById('visualizerWorkstation');
        if (ws) {
          ws.scrollIntoView({ behavior: 'smooth' });
        } else {
          document.getElementById('visualizer').scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Playback Controls
    DOM.btnPlayPause.addEventListener('click', () => Controls.togglePlay());
    DOM.btnNextStep.addEventListener('click', () => { Controls.pause(); Controls.nextStep(); });
    DOM.btnPrevStep.addEventListener('click', () => { Controls.pause(); Controls.prevStep(); });
    DOM.btnJumpStart.addEventListener('click', () => { Controls.pause(); Controls.jumpTo(0); });
    DOM.btnJumpEnd.addEventListener('click', () => { Controls.pause(); Controls.jumpTo(state.steps.length - 1); });
    DOM.btnResetVisualizer.addEventListener('click', () => Controls.reset());
    DOM.btnRestartShowcase.addEventListener('click', () => Controls.reset());

    // Speed Slider
    DOM.speedSlider.addEventListener('input', (e) => {
      Controls.setSpeed(e.target.value);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in input elements
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        Controls.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        Controls.pause();
        Controls.nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        Controls.pause();
        Controls.prevStep();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        Controls.reset();
      }
    });

    // Copy C Code
    DOM.btnCopyCode.addEventListener('click', () => Utilities.copyCCode());

    // Dynamic current year in footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }

  /**
   * Application Bootstrapper
   */
  function init() {
    Utilities.setupTheme();
    Utilities.highlightCCode();
    initEventListeners();

    // Load initial worked example dataset
    const initialItems = DEFAULT_PRICES.map((val, idx) => ({
      id: idx,
      val: val,
      name: DEFAULT_NAMES[idx] || `Product ${idx + 1}`,
      originalIndex: idx
    }));

    loadDataset(initialItems);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
