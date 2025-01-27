import { Link, Outlet } from "react-router";
import { Home, Info } from "lucide-react";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";

export function MainLayout() {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Thin Icon Navigation */}
            <div className="w-12 border-r bg-muted/50 flex flex-col items-center py-4">
                {/* Top Navigation Icons */}
                <div className="flex-1 flex flex-col space-y-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Home className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Link to="/about">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Info className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>

                {/* Theme Toggle at Bottom */}
                <div className="pb-4">
                    <ThemeToggle />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
} 