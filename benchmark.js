const { performance } = require('perf_hooks');

const migrations = Array.from({ length: 19 }, (_, i) => ({
  id: String(i).padStart(3, '0'),
  name: `migration_${i}`,
}));

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const mockSupabase = {
  from: (table) => ({
    select: (fields) => {
      const selectObj = {
        eq: (field, val) => ({
          single: async () => {
            await delay(50); // 50ms simulated network latency
            return { data: { id: val } };
          }
        }),
        then: async (resolve) => {
            await delay(50); // 50ms simulated network latency
            resolve({ data: migrations.map(m => ({ id: m.id })) });
        }
      };
      // Allow it to be awaitable
      selectObj[Symbol.toStringTag] = 'Promise';
      return selectObj;
    }
  })
};

// Add a custom then method to the select object directly if needed
const makeAwaitable = (obj, resolveValue) => {
    return {
        ...obj,
        then: async (resolve) => {
            await delay(50);
            resolve(resolveValue);
        }
    }
}


async function runNPlusOne() {
  const start = performance.now();
  for (const migration of migrations) {
    const { data: executed } = await mockSupabase.from("migrations").select("id").eq("id", migration.id).single();
  }
  return performance.now() - start;
}

async function runOptimized() {
  const start = performance.now();
  // We need to simulate the await supabase.from("migrations").select("id")
  await delay(50);
  const executedMigrations = migrations.map(m => ({ id: m.id }));

  const executedIds = new Set(executedMigrations.map(m => m.id));
  for (const migration of migrations) {
    if (!executedIds.has(migration.id)) {
      // would run migration here
    }
  }
  return performance.now() - start;
}

async function main() {
  console.log("Warming up...");
  await delay(100);

  console.log("Running N+1...");
  const n1Time = await runNPlusOne();
  console.log(`N+1 time: ${n1Time.toFixed(2)}ms`);

  console.log("Running Optimized...");
  const optTime = await runOptimized();
  console.log(`Optimized time: ${optTime.toFixed(2)}ms`);
}

main();
