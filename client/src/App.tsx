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
import Orcamentos from "./pages/Orcamentos";
import { Calculator, Settings, Box, Percent, FileText, LogIn, LogOut, User } from "lucide-react";
import { Button } from "./components/ui/button";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";

function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const links = [
    { path: "/", label: "Calculadora", icon: Calculator },
    { path: "/bastidores", label: "Bastidores", icon: Box },
    { path: "/descontos", label: "Descontos", icon: Percent },
    { path: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href="/orcamentos">
                  <Button variant={location === "/orcamentos" ? "default" : "ghost"} size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Orçamentos
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{user?.name || user?.email || "Usuário"}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={() => window.location.href = getLoginUrl()} className="gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <Navigation />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/bastidores"} component={Bastidores} />
        <Route path={"/descontos"} component={Descontos} />
        <Route path={"/configuracoes"} component={Configuracoes} />
        <Route path={"/orcamentos"} component={Orcamentos} />
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
