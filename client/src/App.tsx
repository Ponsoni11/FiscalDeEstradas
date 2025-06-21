import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import Camera from "@/pages/Camera";
import PhotoPreview from "@/pages/PhotoPreview";
import PhotoManager from "@/pages/PhotoManager";
import PhotoEdit from "@/pages/PhotoEdit";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/camera" component={Camera} />
      <Route path="/photo-preview" component={PhotoPreview} />
      <Route path="/photo-manager" component={PhotoManager} />
      <Route path="/photo-edit/:id" component={PhotoEdit} />
      <Route component={() => <div>Página não encontrada</div>} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
        })
        .catch(error => {
          console.log('Falha ao registrar Service Worker:', error);
        });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
