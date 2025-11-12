import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import Home from "./pages/Home";
import Configuracoes from "./pages/Configuracoes";
import Bastidores from "./pages/Bastidores";
import Descontos from "./pages/Descontos";
import { Calculator, Settings, Box, Percent } from "lucide-react";
import { Button } from "./components/ui/button";

function Navigation() {
  const [location] = useLocation();

  const links = [
    { path: "/", label: "Calculadora", icon: Calculator },
    { path: "/bastidores", label: "Bastidores", icon: Box },
    { path: "/descontos", label: "Descontos", icon: Percent },
    { path: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 py-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <Button variant={isActive ? "default" : "ghost"} size="sm" className="gap-2">
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/bastidores"} component={Bastidores} />
        <Route path={"/descontos"} component={Descontos} />
        <Route path={"/configuracoes"} component={Configuracoes} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
