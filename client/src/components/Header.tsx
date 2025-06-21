import { Settings, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showSettings?: boolean;
}

export default function Header({ title, showBackButton = false, showSettings = false }: HeaderProps) {
  const [, setLocation] = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-primary text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
              onClick={() => setLocation("/")}
            >
              ←
            </Button>
          )}
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h20" />
              <path d="m2 12 3-7 7 7 7 7 3-7" />
            </svg>
            <h1 className="text-lg font-medium">{title}</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-300" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-300" />
                <span>Offline</span>
              </>
            )}
          </div>
          {showSettings && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
              onClick={() => setLocation("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
