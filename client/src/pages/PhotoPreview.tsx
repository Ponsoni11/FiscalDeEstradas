import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { usePhotos } from "@/hooks/useStorage";
import { useSettings } from "@/hooks/useStorage";
import { applyWatermark } from "@/lib/watermark";
import { Photo } from "@shared/schema";
import { ArrowLeft, Edit3, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PhotoPreview() {
  const [, setLocation] = useLocation();
  const { savePhoto } = usePhotos();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [processedImage, setProcessedImage] = useState<string>("");
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get captured image and form data from sessionStorage
    const imageData = sessionStorage.getItem('capturedPhoto');
    const formData = sessionStorage.getItem('currentForm');
    
    if (imageData && formData) {
      setCapturedImage(imageData);
      setCurrentFormData(JSON.parse(formData));
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  useEffect(() => {
    if (capturedImage && currentFormData && settings) {
      processImageWithWatermark();
    }
  }, [capturedImage, currentFormData, settings]);

  const processImageWithWatermark = async () => {
    if (!capturedImage || !currentFormData || !settings) return;
    
    setIsProcessing(true);
    
    try {
      // Get current GPS coordinates
      let coordinates: { latitude: number; longitude: number } | undefined;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('Não foi possível obter coordenadas GPS');
        }
      }

      const photoData = {
        highway: currentFormData.highway,
        direction: currentFormData.direction,
        km: currentFormData.km,
        meters: currentFormData.meters,
        activity: currentFormData.activity,
        subActivity: currentFormData.subActivity,
        timestamp: Date.now(),
        coordinates
      };

      const watermarkedImage = await applyWatermark(
        capturedImage,
        photoData,
        settings.watermark
      );
      
      setProcessedImage(watermarkedImage);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a imagem com marca d'água.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!processedImage || !currentFormData) return;

    try {
      // Generate filename based on settings pattern
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      
      const filename = settings?.fileNaming.pattern
        .replace('rodovia', currentFormData.highway.replace('-', ''))
        .replace('sentido', currentFormData.direction)
        .replace('data', dateStr)
        .replace('hora', timeStr)
        .replace('ocorre', currentFormData.subActivity.replace(/[^a-zA-Z0-9]/g, '')) || 
        `${currentFormData.highway}_${currentFormData.direction}_${dateStr}_${timeStr}_${currentFormData.subActivity}.jpg`;

      const photo: Photo = {
        id: Date.now().toString(),
        filename,
        highway: currentFormData.highway,
        direction: currentFormData.direction,
        km: currentFormData.km,
        meters: currentFormData.meters,
        activity: currentFormData.activity,
        subActivity: currentFormData.subActivity,
        timestamp: Date.now(),
        coordinates: undefined, // Will be set if GPS is available
        imageData: processedImage,
        watermarkSettings: settings?.watermark || {
          position: "bottom-left",
          includeDateTime: true,
          includeCoordinates: true,
          includeHighway: true,
          includeDirection: true,
          includeLocation: true,
          includeUser: false,
          includeNotes: false
        }
      };

      // Get GPS coordinates if available
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          photo.coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        } catch (error) {
          console.log('GPS não disponível');
        }
      }

      await savePhoto(photo);
      
      // Clear session storage
      sessionStorage.removeItem('capturedPhoto');
      sessionStorage.removeItem('currentForm');
      
      toast({
        title: "Foto salva",
        description: "A foto foi salva com sucesso!",
      });
      
      setLocation("/");
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a foto.",
        variant: "destructive",
      });
    }
  };

  const handleRetake = () => {
    setLocation("/camera");
  };

  if (!capturedImage || !currentFormData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
            onClick={handleRetake}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-medium">Revisar Foto</h1>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
            onClick={() => {}} // TODO: Edit watermark
          >
            <Edit3 className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Image Preview */}
      <div className="relative w-full h-full flex items-center justify-center pt-16 pb-20">
        {isProcessing ? (
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Aplicando marca d'água...</p>
          </div>
        ) : (
          <img
            src={processedImage || capturedImage}
            alt="Foto capturada com marca d'água"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-6">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="secondary"
            className="flex-1 h-12"
            onClick={handleRetake}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Repetir
          </Button>
          <Button
            className="flex-1 h-12 bg-success hover:bg-success/90"
            onClick={handleSave}
            disabled={isProcessing}
          >
            <Save className="w-5 h-5 mr-2" />
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
