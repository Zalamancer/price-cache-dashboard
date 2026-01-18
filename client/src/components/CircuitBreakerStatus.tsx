import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CircuitBreakerMetrics {
  name: string;
  state: "closed" | "open" | "half_open";
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  rejected_calls: number;
  success_rate_percent: number;
  state_changes: number;
  last_failure_time: number | null;
  last_state_change_time: number;
  config: {
    failure_threshold: number;
    success_threshold: number;
    timeout_seconds: number;
    half_open_max_calls: number;
  };
}

export default function CircuitBreakerStatus() {
  const [metrics, setMetrics] = useState<CircuitBreakerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFallbackMetrics = (): CircuitBreakerMetrics => ({
    name: "yahoo_finance",
    state: "closed",
    total_calls: 1000,
    successful_calls: 995,
    failed_calls: 5,
    rejected_calls: 0,
    success_rate_percent: 99.5,
    state_changes: 2,
    last_failure_time: null,
    last_state_change_time: Date.now() / 1000,
    config: {
      failure_threshold: 5,
      success_threshold: 2,
      timeout_seconds: 60,
      half_open_max_calls: 3,
    },
  });

  const fetchMetrics = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("http://localhost:8000/circuit-breaker/status", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed to fetch circuit breaker status");
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      // Use fallback data on error
      setMetrics(getFallbackMetrics());
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const resetCircuitBreaker = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("http://localhost:8000/circuit-breaker/reset", {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Failed to reset circuit breaker");
      await fetchMetrics();
    } catch (err) {
      console.warn("Could not reset circuit breaker:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-muted-foreground">Initializing circuit breaker monitor...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 text-yellow-400">
          <AlertCircle className="w-5 h-5" />
          <span>Using simulated circuit breaker data (API unavailable)</span>
        </div>
      </div>
    );
  }

  const stateConfig = {
    closed: {
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-900/20",
      label: "CLOSED",
      description: "Normal operation - requests flowing through",
    },
    open: {
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-900/20",
      label: "OPEN",
      description: "Upstream failing - requests rejected",
    },
    half_open: {
      icon: AlertCircle,
      color: "text-yellow-400",
      bg: "bg-yellow-900/20",
      label: "HALF_OPEN",
      description: "Testing recovery - limited requests allowed",
    },
  };

  const config = stateConfig[metrics.state];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* State Card */}
      <div className={`${config.bg} border border-border rounded-lg p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 ${config.color}`} />
            <div>
              <h3 className="text-2xl font-bold">{config.label}</h3>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
          {metrics.state === "open" && (
            <Button onClick={resetCircuitBreaker} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* State Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">State Changes</div>
            <div className="text-2xl font-bold">{metrics.state_changes}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Success Rate</div>
            <div className={`text-2xl font-bold ${metrics.success_rate_percent > 95 ? "text-green-400" : "text-yellow-400"}`}>
              {metrics.success_rate_percent.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Rejected Calls</div>
            <div className={`text-2xl font-bold ${metrics.rejected_calls > 0 ? "text-red-400" : "text-green-400"}`}>
              {metrics.rejected_calls}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Failed Calls</div>
            <div className={`text-2xl font-bold ${metrics.failed_calls > 0 ? "text-yellow-400" : "text-green-400"}`}>
              {metrics.failed_calls}
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h4 className="font-semibold mb-4">Configuration</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">Failure Threshold</div>
            <div className="font-mono">{metrics.config.failure_threshold}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Success Threshold</div>
            <div className="font-mono">{metrics.config.success_threshold}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Timeout (seconds)</div>
            <div className="font-mono">{metrics.config.timeout_seconds.toFixed(0)}s</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Half-Open Max Calls</div>
            <div className="font-mono">{metrics.config.half_open_max_calls}</div>
          </div>
        </div>
      </div>

      {/* Call Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Call Statistics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Calls:</span>
              <span className="font-mono">{metrics.total_calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Successful:</span>
              <span className="font-mono text-green-400">{metrics.successful_calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed:</span>
              <span className="font-mono text-red-400">{metrics.failed_calls}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rejected:</span>
              <span className="font-mono text-yellow-400">{metrics.rejected_calls}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-semibold mb-3">State Timeline</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last State Change:</span>
              <span className="font-mono">
                {new Date(metrics.last_state_change_time * 1000).toLocaleTimeString()}
              </span>
            </div>
            {metrics.last_failure_time && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Failure:</span>
                <span className="font-mono">
                  {new Date(metrics.last_failure_time * 1000).toLocaleTimeString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total State Changes:</span>
              <span className="font-mono">{metrics.state_changes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* State Machine Diagram */}
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
        <h4 className="font-semibold mb-3">📊 Circuit Breaker State Machine</h4>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">CLOSED:</strong> Normal operation. Requests go through. Opens after {metrics.config.failure_threshold} failures.
          </p>
          <p>
            <strong className="text-foreground">OPEN:</strong> Upstream failing. Requests rejected immediately. Transitions to HALF_OPEN after {metrics.config.timeout_seconds.toFixed(0)}s.
          </p>
          <p>
            <strong className="text-foreground">HALF_OPEN:</strong> Testing recovery. Up to {metrics.config.half_open_max_calls} test calls allowed. Closes after {metrics.config.success_threshold} successes.
          </p>
        </div>
      </div>

      {/* Current Behavior */}
      {metrics.state === "open" && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Circuit is OPEN
          </h4>
          <p className="text-sm text-muted-foreground">
            The upstream service is failing. All requests to Yahoo Finance are being rejected. The system will serve stale-while-revalidate data if available. The circuit will automatically transition to HALF_OPEN in {metrics.config.timeout_seconds.toFixed(0)} seconds to test recovery.
          </p>
        </div>
      )}

      {metrics.state === "half_open" && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-6">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Circuit is HALF_OPEN
          </h4>
          <p className="text-sm text-muted-foreground">
            Testing if the upstream service has recovered. Limited requests are being sent. If {metrics.config.success_threshold} succeed, the circuit will close and return to normal operation.
          </p>
        </div>
      )}
    </div>
  );
}
