// scripts/benchmark-scroll.js

// Mock implementation of the scroll handler logic
function createScrollHandler(onUpdate) {
  let executions = 0;
  return {
    handleScroll: () => {
      executions++;
      // Simulate some DOM work like checking scrollLeft/scrollWidth
      const _ = Math.random() * 1000;
      onUpdate();
    },
    getExecutions: () => executions
  };
}

// Debounce implementation (simplified version of what useDebounceCallback will do)
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function runBenchmark() {
  console.log("Starting Scroll Handler Benchmark...");

  // Baseline
  let baselineUpdates = 0;
  const baselineHandler = createScrollHandler(() => { baselineUpdates++; });

  console.log("Simulating 100 scroll events over 100ms (Baseline)...");

  for (let i = 0; i < 100; i++) {
    baselineHandler.handleScroll();
    // simulate slight delay between events (simulating scroll firing)
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  console.log(`Baseline: Handler executed ${baselineHandler.getExecutions()} times.`);
  console.log(`Baseline: State updates triggered ${baselineUpdates} times.`);

  // Optimized
  let optimizedUpdates = 0;
  const optimizedLogic = createScrollHandler(() => { optimizedUpdates++; });
  const debouncedHandler = debounce(optimizedLogic.handleScroll, 100);

  console.log("\nSimulating 100 scroll events over 100ms with debounce (Optimized)...");

  for (let i = 0; i < 100; i++) {
    debouncedHandler();
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  // Wait for debounce to fire
  await new Promise(resolve => setTimeout(resolve, 150));

  console.log(`Optimized: Handler logic executed ${optimizedUpdates} times.`);

  console.log("\nConclusion:");
  console.log(`Reduction in updates: ${baselineUpdates - optimizedUpdates}`);
  console.log(`Improvement: ${((baselineUpdates - optimizedUpdates) / baselineUpdates * 100).toFixed(2)}%`);
}

runBenchmark();
