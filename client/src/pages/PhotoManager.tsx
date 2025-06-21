import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { usePhotos } from "@/hooks/useStorage";
import { generateExcelReport, sharePhotos } from "@/lib/excel";
import { Photo } from "@shared/schema";
import { Edit, Filter, FileSpreadsheet, Share2 } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PhotoManager() {
  const [, setLocation] = useLocation();
  const { photos, loading } = usePhotos();
  const { toast } = useToast();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredPhotos = useMemo(() => {
    if (activeFilter === "all") return photos;
    
    if (activeFilter.startsWith("highway-")) {
      const highway = activeFilter.replace("highway-", "");
      return photos.filter(photo => photo.highway === highway);
    }
    
    if (activeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return photos.filter(photo => photo.timestamp >= today.getTime());
    }
    
    if (activeFilter.startsWith("activity-")) {
      const activity = activeFilter.replace("activity-", "");
      return photos.filter(photo => photo.activity === activity);
    }
    
    return photos;
  }, [photos, activeFilter]);

  const handleSelectAll = () => {
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map(photo => photo.id)));
    }
  };

  const handlePhotoSelect = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSharePhotos = () => {
    const photosToShare = photos.filter(photo => selectedPhotos.has(photo.id));
    if (photosToShare.length === 0) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Selecione pelo menos uma foto para compartilhar.",
        variant: "destructive",
      });
      return;
    }
    
    sharePhotos(photosToShare);
  };

  const handleGenerateReport = () => {
    const photosToReport = photos.filter(photo => selectedPhotos.has(photo.id));
    if (photosToReport.length === 0) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Selecione pelo menos uma foto para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }
    
    generateExcelReport(photosToReport);
    toast({
      title: "Relatório gerado",
      description: "O relatório Excel foi baixado com sucesso!",
    });
  };

  const getUniqueValues = (key: keyof Photo) => {
    const values = new Set(photos.map(photo => photo[key] as string));
    return Array.from(values).sort();
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Gerenciar Fotos" showBackButton />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <Header title="Gerenciar Fotos" showBackButton />
      
      {/* Header Controls */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedPhotos.size === filteredPhotos.length && filteredPhotos.length > 0 ? 'Deselecionar' : 'Sel. Todas'}
          </Button>
          <Button
            variant="outline"
            size="sm"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtros
          </Button>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-1">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
          >
            Todas
          </Button>
          {getUniqueValues("highway").map(highway => (
            <Button
              key={highway}
              variant={activeFilter === `highway-${highway}` ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(`highway-${highway}`)}
            >
              {highway}
            </Button>
          ))}
          <Button
            variant={activeFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("today")}
          >
            Hoje
          </Button>
          {getUniqueValues("activity").slice(0, 2).map(activity => (
            <Button
              key={activity}
              variant={activeFilter === `activity-${activity}` ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(`activity-${activity}`)}
            >
              {activity.charAt(0).toUpperCase() + activity.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Photo Count */}
      <div className="px-4 py-3 text-sm text-gray-600">
        <span>{filteredPhotos.length} fotos</span> • 
        <span className="ml-1">{selectedPhotos.size} selecionadas</span>
      </div>

      {/* Photo List */}
      <div className="px-4 space-y-3">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma foto encontrada</h3>
            <p className="text-gray-500">Tire sua primeira foto para começar!</p>
          </div>
        ) : (
          filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center p-3">
                  <Checkbox
                    checked={selectedPhotos.has(photo.id)}
                    onCheckedChange={() => handlePhotoSelect(photo.id)}
                    className="mr-3"
                  />
                  
                  <img
                    src={photo.imageData}
                    alt={`${photo.highway} - ${photo.subActivity}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">
                        {photo.highway} {photo.direction} Km {photo.km}+{photo.meters.toString().padStart(3, '0')}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(photo.timestamp).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {photo.activity}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {photo.subActivity}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(photo.timestamp).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => setLocation(`/photo-edit/${photo.id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <Button
          className="w-full h-12"
          onClick={handleSharePhotos}
          disabled={selectedPhotos.size === 0}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Compartilhar Fotos Selecionadas
        </Button>
        <Button
          variant="secondary"
          className="w-full h-12 bg-success hover:bg-success/90 text-white"
          onClick={handleGenerateReport}
          disabled={selectedPhotos.size === 0}
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Gerar Relatório Excel
        </Button>
      </div>
    </div>
  );
}
