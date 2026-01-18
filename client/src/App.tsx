import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ApiStatusProvider } from "./contexts/ApiStatusContext";
import Home from "./pages/Home";
import Benchmark from "./pages/Benchmark";
import Observability from "./pages/Observability";
import CircuitBreakerPage from "./pages/CircuitBreakerPage";
import Header from "./components/Header";


function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/benchmark"} component={Benchmark} />
        <Route path={"/observability"} component={Observability} />
        <Route path={"/circuit-breaker"} component={CircuitBreakerPage} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ApiStatusProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </ApiStatusProvider>
    </ErrorBoundary>
  );
}

export default App;
