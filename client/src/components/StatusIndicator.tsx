import { CheckCircle, AlertCircle } from "lucide-react";
import { useApiStatusContext } from "@/contexts/ApiStatusContext";

export default function StatusIndicator() {
  const { isRealApi } = useApiStatusContext();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
        isRealApi
          ? "text-green-400 bg-green-900/20 border-green-800/50"
          : "text-yellow-400 bg-yellow-900/20 border-yellow-800/50"
      }`}
      title={isRealApi ? "Connected to live API" : "Using fallback data"}
    >
      {isRealApi ? (
        <>
          <CheckCircle className="w-4 h-4" />
          <span>✓ API LIVE</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Using Fallback Data</span>
        </>
      )}
    </div>
  );
}
