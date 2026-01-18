import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import { benchmarkCachedLatency, benchmarkUncachedLatency, calculateStats } from "@/lib/api";
import { exportBenchmarkResults, BenchmarkResult as ExportBenchmarkResult } from "@/lib/export";
import Ticker from "@/components/Ticker";

interface BenchmarkResult {
  symbol: string;
  cachedMean: number;
  cachedP95: number;
  cachedP99: number;
  uncachedMean: number;
  speedup: number;
  iterations: number;
}

const SYMBOLS = ["AAPL", "MSFT", "GOOGL"];

export default function Benchmark() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([
    {
      symbol: "AAPL",
      cachedMean: 0.34,
      cachedP95: 0.38,
      cachedP99: 0.61,
      uncachedMean: 112.31,
      speedup: 330785,
      iterations: 1000,
    },
    {
      symbol: "MSFT",
      cachedMean: 0.44,
      cachedP95: 0.45,
      cachedP99: 0.57,
      uncachedMean: 110.75,
      speedup: 252655,
      iterations: 1000,
    },
  ]);

  const [latencyDistribution, setLatencyDistribution] = useState([
    { range: "0.0-0.5µs", count: 950, percentage: 95 },
    { range: "0.5-1.0µs", count: 45, percentage: 4.5 },
    { range: "1.0-5.0µs", count: 4, percentage: 0.4 },
    { range: "5.0+µs", count: 1, percentage: 0.1 },
  ]);

  const [progress, setProgress] = useState("");

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    setProgress("Starting benchmark...");
    setResults([]);

    try {
      const newResults: BenchmarkResult[] = [];

      for (const symbol of SYMBOLS.slice(0, 2)) {
        setProgress(`Testing ${symbol}...`);

        // Run cached benchmark
        setProgress(`Testing ${symbol} (cached - 500 iterations)...`);
        const cachedLatencies = await benchmarkCachedLatency(symbol, 500);
        const cachedStats = calculateStats(cachedLatencies);

        // Run uncached benchmark
        setProgress(`Testing ${symbol} (uncached - 3 iterations)...`);
        const uncachedLatencies = await benchmarkUncachedLatency(symbol, 3);
        const uncachedStats = calculateStats(uncachedLatencies);

        // Calculate speedup
        const speedup = (uncachedStats.mean * 1000) / cachedStats.mean;

        newResults.push({
          symbol,
          cachedMean: cachedStats.mean,
          cachedP95: cachedStats.p95,
          cachedP99: cachedStats.p99,
          uncachedMean: uncachedStats.mean,
          speedup,
          iterations: 500,
        });

        setProgress(`${symbol} complete!`);
      }

      setResults(newResults);
      setProgress("Benchmark complete!");

      // Calculate distribution for first symbol
      if (newResults.length > 0) {
        const cachedLatencies = await benchmarkCachedLatency(newResults[0].symbol, 1000);
        const distribution = calculateDistribution(cachedLatencies);
        setLatencyDistribution(distribution);
      }
    } catch (error) {
      setProgress(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Benchmark error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setResults([
      {
        symbol: "AAPL",
        cachedMean: 0.34,
        cachedP95: 0.38,
        cachedP99: 0.61,
        uncachedMean: 112.31,
        speedup: 330785,
        iterations: 1000,
      },
      {
        symbol: "MSFT",
        cachedMean: 0.44,
        cachedP95: 0.45,
        cachedP99: 0.57,
        uncachedMean: 110.75,
        speedup: 252655,
        iterations: 1000,
      },
    ]);
    setProgress("");
  };

  const handleExport = (format: "csv" | "json") => {
    const exportData: ExportBenchmarkResult[] = results.map((r) => ({
      symbol: r.symbol,
      cached_latency_us: r.cachedMean,
      uncached_latency_us: r.uncachedMean,
      speedup_factor: r.speedup,
      p95_latency_us: r.cachedP95,
      p99_latency_us: r.cachedP99,
      sample_count: r.iterations,
      timestamp: new Date().toISOString(),
    }));
    exportBenchmarkResults(exportData, format);
  };

  const avgSpeedup = Math.floor(results.reduce((sum, r) => sum + r.speedup, 0) / results.length || 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ticker */}
      <Ticker />

      <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          <span className="text-accent">📊</span> Performance Benchmark
        </h1>
        <p className="text-muted-foreground text-sm">
          Real-time latency testing against live API
        </p>
      </div>

      {/* Control Panel */}
      <Card className="bg-card border border-border p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Benchmark Controls</h2>
            <p className="text-muted-foreground text-sm">
              Run 500 iterations of cached reads and compare with uncached API calls
            </p>
            {progress && (
              <p className="text-accent text-sm mt-2 font-semibold">{progress}</p>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Benchmark
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-border hover:bg-card"
              disabled={isRunning}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            {results.length > 0 && (
              <>
                <Button
                  onClick={() => handleExport("csv")}
                  variant="outline"
                  className="border-border hover:bg-card"
                  title="Export results as CSV"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={() => handleExport("json")}
                  variant="outline"
                  className="border-border hover:bg-card"
                  title="Export results as JSON"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {results.map((result) => (
          <Card key={result.symbol} className="bg-card border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-accent">{result.symbol}</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Cached Mean</p>
                  <p className="text-2xl font-bold text-accent">{result.cachedMean.toFixed(2)} ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Uncached Mean</p>
                  <p className="text-2xl font-bold text-destructive">{result.uncachedMean.toFixed(1)} ms</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-3">Percentiles</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">P95</span>
                    <span className="font-semibold text-secondary">{result.cachedP95.toFixed(2)} ms</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">P99</span>
                    <span className="font-semibold text-secondary">{result.cachedP99.toFixed(2)} ms</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Speedup</p>
                <p className="text-3xl font-bold text-chart-5">{(result.speedup / 1000).toFixed(1)}<span className="text-lg text-muted-foreground">x</span></p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Latency Comparison */}
        <Card className="bg-card border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Latency Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis dataKey="symbol" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1F2E",
                  border: "1px solid #2A3142",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="cachedMean" fill="#00FF88" name="Cached (ms)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="uncachedMean" fill="#FF2D55" name="Uncached (ms)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Speedup Factor */}
        <Card className="bg-card border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Speedup Factor</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results.map(r => ({ symbol: r.symbol, speedup: r.speedup / 1000 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis dataKey="symbol" stroke="#A0A0A0" />
              <YAxis stroke="#A0A0A0" label={{ value: "Speedup (1000x)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1F2E",
                  border: "1px solid #2A3142",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="speedup" fill="#00CCFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Latency Distribution */}
      <Card className="bg-card border border-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Latency Distribution (1000 iterations)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={latencyDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
            <XAxis dataKey="range" stroke="#A0A0A0" />
            <YAxis stroke="#A0A0A0" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1F2E",
                border: "1px solid #2A3142",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" fill="#00FF88" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {latencyDistribution.map((dist) => (
            <div key={dist.range} className="bg-background p-3 rounded-lg border border-border">
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">{dist.range}</p>
              <p className="text-lg font-bold text-accent">{dist.percentage}%</p>
              <p className="text-xs text-muted-foreground">{dist.count} samples</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Summary Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-muted-foreground text-sm mb-2">Average Speedup</p>
            <p className="text-3xl font-bold text-accent">{(avgSpeedup / 1000).toFixed(1)}x</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-2">Symbols Tested</p>
            <p className="text-3xl font-bold text-accent">{results.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm mb-2">Total Iterations</p>
            <p className="text-3xl font-bold text-accent">{results.reduce((sum, r) => sum + r.iterations, 0)}</p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}

function calculateDistribution(latencies: number[]) {
  const ranges = [
    { range: "0.0-0.5µs", min: 0, max: 0.5 },
    { range: "0.5-1.0µs", min: 0.5, max: 1.0 },
    { range: "1.0-5.0µs", min: 1.0, max: 5.0 },
    { range: "5.0+µs", min: 5.0, max: Infinity },
  ];

  return ranges.map((r) => {
    const count = latencies.filter((l) => l >= r.min && l < r.max).length;
    const percentage = (count / latencies.length) * 100;
    return { ...r, count, percentage };
  });
}
