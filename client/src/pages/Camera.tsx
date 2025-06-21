import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCamera } from "@/hooks/useCamera";
import { useSettings } from "@/hooks/useStorage";
import { RefreshCw, X, Zap, ZapOff } from "lucide-react";

export default function Camera() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();
  const { 
    initCamera, 
    capturePhoto, 
    switchCamera, 
    stopCamera, 
    isInitialized, 
    isLoading, 
    error,
    hasMultipleCameras 
  } = useCamera();
  
  const [flash, setFlash] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<any>(null);

  useEffect(() => {
    // Get form data from sessionStorage
    const formData = sessionStorage.getItem('currentForm');
    if (formData) {
      setCurrentFormData(JSON.parse(formData));
    }

    if (videoRef.current && settings) {
      initCamera(videoRef.current, {
        resolution: settings.photoQuality.resolution,
        facingMode: 'environment',
        flash: false
      });
    }

    return () => {
      stopCamera();
    };
  }, [settings, initCamera, stopCamera]);

  const handleCapture = async () => {
    if (canvasRef.current && isInitialized) {
      const imageData = await capturePhoto(canvasRef.current);
      if (imageData) {
        // Store captured image in sessionStorage
        sessionStorage.setItem('capturedPhoto', imageData);
        setLocation("/photo-preview");
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    setLocation("/");
  };

  const handleSwitchCamera = () => {
    if (hasMultipleCameras) {
      switchCamera();
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h2 className="text-xl font-bold mb-2">Erro na Câmera</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={handleClose} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
            onClick={handleClose}
          >
            <X className="w-6 h-6" />
          </Button>
          <div className="text-center">
            {currentFormData && (
              <>
                <p className="text-sm">
                  {currentFormData.highway} {currentFormData.direction} Km {currentFormData.km}+{currentFormData.meters.toString().padStart(3, '0')}
                </p>
                <p className="text-xs opacity-75">
                  {currentFormData.activity} - {currentFormData.subActivity}
                </p>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
            onClick={() => setFlash(!flash)}
          >
            {flash ? <Zap className="w-6 h-6" /> : <ZapOff className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Iniciando câmera...</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
        <div className="flex items-center justify-center space-x-6">
          <Button
            variant="ghost"
            size="lg"
            className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors text-white"
            onClick={handleSwitchCamera}
            disabled={!hasMultipleCameras}
          >
            <RefreshCw className="w-6 h-6" />
          </Button>
          
          <Button
            size="lg"
            className="p-6 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            onClick={handleCapture}
            disabled={!isInitialized}
          >
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="p-4 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors text-white"
            onClick={() => setLocation("/photo-manager")}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
