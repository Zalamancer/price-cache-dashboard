import { Shield } from "lucide-react";
import CircuitBreakerStatus from "@/components/CircuitBreakerStatus";

export default function CircuitBreakerPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-b border-border p-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-red-400" />
            <h1 className="text-3xl font-bold">Circuit Breaker Monitor</h1>
          </div>
          <p className="text-muted-foreground">Production-grade failure handling and recovery</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <CircuitBreakerStatus />

        {/* Documentation */}
        <div className="mt-8 space-y-6">
          <div className="bg-slate-900/20 border border-slate-800/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">🛡️ What is a Circuit Breaker?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              A circuit breaker is a design pattern that prevents cascading failures when calling external services. It monitors for failures and "opens" (stops requests) when a threshold is exceeded, allowing the upstream service time to recover.
            </p>
            <p className="text-sm text-muted-foreground">
              This implementation uses three states: CLOSED (normal), OPEN (failing), and HALF_OPEN (testing recovery). It's essential for building resilient systems that gracefully handle upstream outages.
            </p>
          </div>

          <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">✅ Why This Matters for Interviews</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Demonstrates understanding of distributed systems failure modes</li>
              <li>Shows awareness of cascading failure prevention</li>
              <li>Proves knowledge of production reliability patterns</li>
              <li>Indicates systems thinking and operational mindset</li>
              <li>Reflects real-world experience with failure handling</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">📊 How It Works</h3>
            <div className="text-sm text-muted-foreground space-y-3">
              <div>
                <strong className="text-foreground">1. Monitoring:</strong> The circuit breaker tracks calls to the upstream service and counts failures.
              </div>
              <div>
                <strong className="text-foreground">2. Opening:</strong> When failures exceed the threshold (default: 5), the circuit "opens" and rejects all subsequent requests immediately.
              </div>
              <div>
                <strong className="text-foreground">3. Half-Open:</strong> After a timeout (default: 60s), the circuit transitions to HALF_OPEN and allows limited test requests.
              </div>
              <div>
                <strong className="text-foreground">4. Closing:</strong> If test requests succeed, the circuit closes and returns to normal operation.
              </div>
              <div>
                <strong className="text-foreground">5. Stale-While-Revalidate:</strong> While the circuit is open, the system serves cached stale data to maintain availability.
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">🎯 Interview Talking Points</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>"We implement circuit breaker to prevent cascading failures when the upstream service is down"</li>
              <li>"The three states (CLOSED, OPEN, HALF_OPEN) allow graceful degradation and automatic recovery"</li>
              <li>"We combine circuit breaker with stale-while-revalidate to maintain availability during failures"</li>
              <li>"Metrics track state changes and rejection rates for operational visibility"</li>
              <li>"This is a production pattern used at scale in systems like Netflix and Amazon"</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
