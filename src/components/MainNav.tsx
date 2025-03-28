import { Home, Settings, Menu, User } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./lib/ui/button";

const MainNav = () => {
  const location = useLocation();

  const navItems = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Account",
      href: "/account",
      icon: User,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="flex lg:hidden">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] glass-effect">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                  location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              location.pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MainNav;
