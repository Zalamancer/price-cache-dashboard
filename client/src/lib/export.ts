/**
 * Export utility functions for benchmark results and metrics
 * Supports CSV and JSON formats with proper formatting and timestamps
 */

export interface BenchmarkResult {
  symbol: string;
  cached_latency_us: number;
  uncached_latency_us: number;
  speedup_factor: number;
  p95_latency_us: number;
  p99_latency_us: number;
  sample_count: number;
  timestamp: string;
}

export interface MetricsSnapshot {
  timestamp: string;
  cache_hits: number;
  cache_misses: number;
  stale_hits: number;
  hit_rate_percent: number;
  avg_latency_us: number;
  p95_latency_us: number;
  p99_latency_us: number;
  refresh_errors: number;
  cache_size: number;
}

/**
 * Convert benchmark results to CSV format
 */
export function benchmarkToCSV(results: BenchmarkResult[]): string {
  if (results.length === 0) {
    return "No benchmark results to export";
  }

  const headers = [
    "Symbol",
    "Cached Latency (µs)",
    "Uncached Latency (µs)",
    "Speedup Factor",
    "P95 Latency (µs)",
    "P99 Latency (µs)",
    "Sample Count",
    "Timestamp",
  ];

  const rows = results.map((result) => [
    result.symbol,
    result.cached_latency_us.toFixed(3),
    result.uncached_latency_us.toFixed(3),
    result.speedup_factor.toFixed(0),
    result.p95_latency_us.toFixed(3),
    result.p99_latency_us.toFixed(3),
    result.sample_count,
    result.timestamp,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Convert metrics history to CSV format
 */
export function metricsToCSV(metrics: MetricsSnapshot[]): string {
  if (metrics.length === 0) {
    return "No metrics data to export";
  }

  const headers = [
    "Timestamp",
    "Cache Hits",
    "Cache Misses",
    "Stale Hits",
    "Hit Rate (%)",
    "Avg Latency (µs)",
    "P95 Latency (µs)",
    "P99 Latency (µs)",
    "Refresh Errors",
    "Cache Size",
  ];

  const rows = metrics.map((metric) => [
    metric.timestamp,
    metric.cache_hits,
    metric.cache_misses,
    metric.stale_hits,
    metric.hit_rate_percent.toFixed(2),
    metric.avg_latency_us.toFixed(3),
    metric.p95_latency_us.toFixed(3),
    metric.p99_latency_us.toFixed(3),
    metric.refresh_errors,
    metric.cache_size,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Convert benchmark results to JSON format with metadata
 */
export function benchmarkToJSON(results: BenchmarkResult[]): string {
  const data = {
    export_timestamp: new Date().toISOString(),
    export_type: "benchmark_results",
    result_count: results.length,
    results,
    summary: {
      avg_speedup: results.length > 0 ? results.reduce((sum, r) => sum + r.speedup_factor, 0) / results.length : 0,
      min_cached_latency: results.length > 0 ? Math.min(...results.map((r) => r.cached_latency_us)) : 0,
      max_cached_latency: results.length > 0 ? Math.max(...results.map((r) => r.cached_latency_us)) : 0,
      min_uncached_latency: results.length > 0 ? Math.min(...results.map((r) => r.uncached_latency_us)) : 0,
      max_uncached_latency: results.length > 0 ? Math.max(...results.map((r) => r.uncached_latency_us)) : 0,
    },
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Convert metrics history to JSON format with metadata
 */
export function metricsToJSON(metrics: MetricsSnapshot[]): string {
  const data = {
    export_timestamp: new Date().toISOString(),
    export_type: "metrics_history",
    data_point_count: metrics.length,
    metrics,
    summary: {
      avg_hit_rate: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.hit_rate_percent, 0) / metrics.length : 0,
      avg_latency: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.avg_latency_us, 0) / metrics.length : 0,
      total_cache_hits: metrics.reduce((sum, m) => sum + m.cache_hits, 0),
      total_cache_misses: metrics.reduce((sum, m) => sum + m.cache_misses, 0),
      total_stale_hits: metrics.reduce((sum, m) => sum + m.stale_hits, 0),
      total_refresh_errors: metrics.reduce((sum, m) => sum + m.refresh_errors, 0),
    },
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = "text/plain"): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, format: "csv" | "json"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
  const time = new Date().toISOString().split("T")[1].split(".")[0].replace(/:/g, "-");
  return `${prefix}_${timestamp}_${time}.${format}`;
}

/**
 * Export benchmark results with format selection
 */
export function exportBenchmarkResults(results: BenchmarkResult[], format: "csv" | "json" = "csv"): void {
  const content = format === "csv" ? benchmarkToCSV(results) : benchmarkToJSON(results);
  const filename = generateFilename("benchmark-results", format);
  const mimeType = format === "csv" ? "text/csv" : "application/json";
  downloadFile(content, filename, mimeType);
}

/**
 * Export metrics history with format selection
 */
export function exportMetricsHistory(metrics: MetricsSnapshot[], format: "csv" | "json" = "csv"): void {
  const content = format === "csv" ? metricsToCSV(metrics) : metricsToJSON(metrics);
  const filename = generateFilename("metrics-history", format);
  const mimeType = format === "csv" ? "text/csv" : "application/json";
  downloadFile(content, filename, mimeType);
}
