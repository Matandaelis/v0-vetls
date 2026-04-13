import { performance } from 'perf_hooks';

// Mock publication to simulate network latency for unpublish
class MockPublication {
  constructor(id) {
    this.id = id;
  }

  async unpublish() {
    // Simulate ~50ms network delay per unpublish
    return new Promise(resolve => setTimeout(resolve, 50));
  }
}

async function runBenchmark() {
  console.log("🚀 Starting Unpublish Benchmark...\n");

  // Create 5 mock tracks
  const tracks = Array.from({ length: 5 }, (_, i) => new MockPublication(i));

  // 1. Sequential Unpublish (Baseline)
  const startSequential = performance.now();
  for (const publication of tracks) {
    await publication.unpublish();
  }
  const endSequential = performance.now();
  const sequentialTime = endSequential - startSequential;

  console.log(`⏱️  Sequential (Baseline): ${sequentialTime.toFixed(2)}ms`);

  // 2. Concurrent Unpublish (Optimized)
  const startConcurrent = performance.now();
  await Promise.all(tracks.map(pub => pub.unpublish()));
  const endConcurrent = performance.now();
  const concurrentTime = endConcurrent - startConcurrent;

  console.log(`⚡ Concurrent (Optimized): ${concurrentTime.toFixed(2)}ms`);

  // Calculate improvement
  const improvementMs = sequentialTime - concurrentTime;
  const improvementPercent = ((improvementMs / sequentialTime) * 100).toFixed(2);
  const speedup = (sequentialTime / concurrentTime).toFixed(2);

  console.log(`\n📊 Results:`);
  console.log(`- Time saved: ${improvementMs.toFixed(2)}ms`);
  console.log(`- Performance improvement: ${improvementPercent}%`);
  console.log(`- Speedup: ${speedup}x faster`);
}

runBenchmark().catch(console.error);
