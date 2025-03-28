import { Toaster } from "@/components/lib/ui/sonner";
import { Toaster as Sonner } from "@/components/lib/ui/sonner";
import { TooltipProvider } from "@/components/lib/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "../src/components/pages/Index";
import Account from "../src/components/pages/Account";
import Settings from "../src/components/pages/Settings";
import NotFound from "../src/components/pages/NotFound";
import MainNav from "./components/MainNav";
import { cn } from "../src/components/lib/utils";
import { ThemeProvider } from "./components/ThemeProvider";
const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <header className="relative border-b bg-gradient-to-r from-background to-secondary">
              <div className="container px-4">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                      Virtual Office
                    </h1>
                    <nav className="hidden md:flex items-center gap-1">
                      <a
                        href="/"
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                          "hover:bg-primary/10",
                          "focus:outline-none focus:ring-2 focus:ring-primary",
                          window.location.pathname === "/" && "bg-primary/10 text-primary"
                        )}
                      >
                        Home
                      </a>
                      <a
                        href="/account"
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                          "hover:bg-primary/10",
                          "focus:outline-none focus:ring-2 focus:ring-primary",
                          window.location.pathname === "/account" && "bg-primary/10 text-primary"
                        )}
                      >
                        Account
                      </a>
                      <a
                        href="/settings"
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                          "hover:bg-primary/10",
                          "focus:outline-none focus:ring-2 focus:ring-primary",
                          window.location.pathname === "/settings" && "bg-primary/10 text-primary"
                        )}
                      >
                        Settings
                      </a>
                    </nav>
                  </div>
                  <div className="md:hidden">
                    <MainNav />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none glass-effect opacity-10" />
            </header>
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/account" element={<Account />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;