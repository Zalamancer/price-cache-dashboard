import { useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetricsPanel from "@/components/MetricsPanel";
import { useWebSocket } from "@/hooks/useWebSocket";
import { exportMetricsHistory, MetricsSnapshot } from "@/lib/export";

interface HealthStatus {
  status: string;
  cache_age_seconds?: number;
  cache_size?: number;
  hit_rate?: number;
  upstream_errors?: number;
}

export default function Observability() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [streamStats, setStreamStats] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<MetricsSnapshot[]>([]);

  // WebSocket for stats streaming
  const { isConnected: wsStatsConnected } = useWebSocket({
    url: "http://localhost:8000/ws/stats",
    onMessage: (data) => {
      if (data && data.type === "stats") {
        setStreamStats(data.data);
        // Add to history
        const snapshot: MetricsSnapshot = {
          timestamp: new Date().toISOString(),
          cache_hits: data.data.cache_hits || 0,
          cache_misses: data.data.cache_misses || 0,
          stale_hits: data.data.stale_hits || 0,
          hit_rate_percent: data.data.hit_rate_percent || 0,
          avg_latency_us: data.data.avg_latency_us || 0,
          p95_latency_us: data.data.p95_latency_us || 0,
          p99_latency_us: data.data.p99_latency_us || 0,
          refresh_errors: data.data.refresh_errors || 0,
          cache_size: data.data.cache_size || 0,
        };
        setMetricsHistory((prev) => [...prev.slice(-99), snapshot]); // Keep last 100 samples
      }
    },
    onOpen: () => setWsConnected(true),
    onClose: () => setWsConnected(false),
  });

  // Fetch health status with fallback
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("http://localhost:8000/health", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setHealthStatus(data);
        } else {
          // Fallback data when API unavailable
          setHealthStatus({
            status: "degraded",
            cache_age_seconds: 0,
            cache_size: 5,
            hit_rate: 99.5,
            upstream_errors: 0,
          });
        }
      } catch (error) {
        // Fallback data on network error
        setHealthStatus({
          status: "degraded",
          cache_age_seconds: 0,
          cache_size: 5,
          hit_rate: 99.5,
          upstream_errors: 0,
        });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Safe getters for health status
  const getHealthStatus = () => healthStatus?.status || "unknown";
  const getCacheAge = () => healthStatus?.cache_age_seconds ?? 0;
  const getCacheSize = () => healthStatus?.cache_size ?? 0;
  const getHitRate = () => healthStatus?.hit_rate ?? 0;
  const getUpstreamErrors = () => healthStatus?.upstream_errors ?? 0;

  const handleExportMetrics = (format: "csv" | "json") => {
    if (metricsHistory.length === 0) {
      alert("No metrics history to export. Metrics are collected when WebSocket is connected.");
      return;
    }
    exportMetricsHistory(metricsHistory, format);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-border p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-accent" />
              <h1 className="text-3xl font-bold">Observability Dashboard</h1>
            </div>
            {metricsHistory.length > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExportMetrics("csv")}
                  variant="outline"
                  className="border-border hover:bg-card"
                  title="Export metrics as CSV"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={() => handleExportMetrics("json")}
                  variant="outline"
                  className="border-border hover:bg-card"
                  title="Export metrics as JSON"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">Production-grade metrics and system health monitoring</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Health Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">System Health</h3>
              {getHealthStatus() === "healthy" ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
            </div>

            {healthStatus ? (
              <div className="space-y-3 text-sm">
                {getHealthStatus() === "degraded" && (
                  <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-800/50 rounded text-yellow-400 text-xs">
                    Using fallback data (API unavailable)
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-mono font-semibold ${getHealthStatus() === "healthy" ? "text-green-400" : "text-yellow-400"}`}>
                    {getHealthStatus().toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cache Age:</span>
                  <span className="font-mono">{getCacheAge().toFixed(1)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cache Size:</span>
                  <span className="font-mono">{getCacheSize()} symbols</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hit Rate:</span>
                  <span className="font-mono text-green-400">{getHitRate().toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upstream Errors:</span>
                  <span className={`font-mono ${getUpstreamErrors() > 0 ? "text-red-400" : "text-green-400"}`}>
                    {getUpstreamErrors()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Initializing...</div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Streaming Status</h3>
              {wsStatsConnected ? (
                <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">WebSocket Status:</span>
                <span className={`font-mono font-semibold ${wsStatsConnected ? "text-green-400" : "text-red-400"}`}>
                  {wsStatsConnected ? "CONNECTED" : "DISCONNECTED"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Source:</span>
                <span className="font-mono">/ws/stats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Update Interval:</span>
                <span className="font-mono">3 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reconnect Logic:</span>
                <span className="font-mono">Exponential backoff</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Samples Collected:</span>
                <span className="font-mono text-accent">{metricsHistory.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Backend Metrics (Prometheus)</h2>
          <MetricsPanel />
        </div>

        {/* Real-time Stats from WebSocket */}
        {streamStats && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Real-time Statistics (WebSocket Stream)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Cache Hits</div>
                <div className="text-2xl font-bold text-green-400">{streamStats.cache_hits || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Cache Misses</div>
                <div className="text-2xl font-bold text-red-400">{streamStats.cache_misses || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Stale Hits</div>
                <div className="text-2xl font-bold text-yellow-400">{streamStats.stale_hits || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Avg Latency</div>
                <div className="text-2xl font-bold text-blue-400">
                  {streamStats.avg_latency_us ? streamStats.avg_latency_us.toFixed(3) : "0.000"} µs
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Measurement Methodology */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">📊 Measurement Methodology</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">In-Process Latency (nanoseconds):</strong> Measures cache lookup time only, excluding network overhead.
            </p>
            <p>
              <strong className="text-foreground">End-to-End Latency (microseconds):</strong> Full HTTP round-trip including network + serialization.
            </p>
            <p>
              <strong className="text-foreground">Network Latency:</strong> Calculated as end-to-end minus in-process latency.
            </p>
            <p>
              <strong className="text-foreground">Percentiles:</strong> P95 and P99 latencies computed from backend measurements, not frontend timing loops.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
