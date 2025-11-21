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
import Maquinas from "./pages/Maquinas";
import Materiais from "./pages/Materiais";
import Carrinho from "./pages/Carrinho";
import { Calculator, Settings, Box, Percent, FileText, LogIn, LogOut, User, Menu, X, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "./components/ui/button";
import { useAuth } from "./_core/hooks/useAuth";
import { getLoginUrl } from "./const";

function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { path: "/", label: "Calculadora", icon: Calculator },
    { path: "/carrinho", label: "Carrinho", icon: ShoppingCart },
    { path: "/bastidores", label: "Bastidores", icon: Box },
    { path: "/descontos", label: "Descontos", icon: Percent },
    { path: "/maquinas", label: "Máquinas", icon: Settings },
    { path: "/materiais", label: "Materiais", icon: Settings },
    { path: "/configuracoes", label: "Configurações", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between py-4">
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

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-6 h-6 text-indigo-600" />
              <span className="font-semibold text-gray-900">BordaCalc Pro</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="pb-4 space-y-2 border-t border-gray-200 pt-4">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.path;
                return (
                  <Link key={link.path} href={link.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12 text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              {isAuthenticated && (
                <Link href="/orcamentos">
                  <Button
                    variant={location === "/orcamentos" ? "default" : "ghost"}
                    className="w-full justify-start gap-3 h-12 text-base"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileText className="w-5 h-5" />
                    Orçamentos
                  </Button>
                </Link>
              )}
              <div className="pt-2 border-t border-gray-200 mt-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-md mb-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">{user?.name || user?.email || "Usuário"}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-base"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    className="w-full justify-start gap-3 h-12 text-base"
                    onClick={() => {
                      window.location.href = getLoginUrl();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </Button>
                )}
              </div>
            </div>
          )}
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
        <Route path={"/carrinho"} component={Carrinho} />
        <Route path={"/bastidores"} component={Bastidores} />
        <Route path={"/descontos"} component={Descontos} />
        <Route path={"/maquinas"} component={Maquinas} />
        <Route path={"/materiais"} component={Materiais} />
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
