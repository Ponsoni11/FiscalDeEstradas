import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePhotos, useSettings } from "@/hooks/useStorage";
import { Photo, defaultSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PhotoEdit() {
  const [, params] = useRoute("/photo-edit/:id");
  const [, setLocation] = useLocation();
  const { photos, updatePhoto } = usePhotos();
  const { settings } = useSettings();
  const { toast } = useToast();
  
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [editedPhoto, setEditedPhoto] = useState<Photo | null>(null);

  const currentSettings = settings || defaultSettings;
  const directions = ["Norte", "Sul", "Leste", "Oeste", "Central"];

  useEffect(() => {
    if (params?.id && photos.length > 0) {
      const foundPhoto = photos.find(p => p.id === params.id);
      if (foundPhoto) {
        setPhoto(foundPhoto);
        setEditedPhoto({ ...foundPhoto });
      } else {
        setLocation("/photo-manager");
      }
    }
  }, [params?.id, photos, setLocation]);

  const handleSave = async () => {
    if (!editedPhoto) return;

    try {
      await updatePhoto(editedPhoto);
      toast({
        title: "Foto atualizada",
        description: "As alterações foram salvas com sucesso!",
      });
      setLocation("/photo-manager");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setLocation("/photo-manager");
  };

  const updateField = (field: keyof Photo, value: any) => {
    if (!editedPhoto) return;
    setEditedPhoto({ ...editedPhoto, [field]: value });
  };

  const handleActivityChange = (activity: string) => {
    updateField('activity', activity);
    updateField('subActivity', ''); // Reset sub-activity when activity changes
  };

  if (!photo || !editedPhoto) {
    return (
      <div className="min-h-screen">
        <Header title="Editar Foto" showBackButton />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Editar Foto" showBackButton />
      
      <div className="p-4 space-y-6">
        {/* Photo Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={photo.imageData}
              alt="Foto sendo editada"
              className="w-full h-48 object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Rodovia
              </Label>
              <Select value={editedPhoto.highway} onValueChange={(value) => updateField('highway', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentSettings.highways.map((highway) => (
                    <SelectItem key={highway} value={highway}>
                      {highway}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Sentido
              </Label>
              <Select value={editedPhoto.direction} onValueChange={(value: any) => updateField('direction', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {directions.map((direction) => (
                    <SelectItem key={direction} value={direction}>
                      {direction}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Km
                </Label>
                <Input
                  type="number"
                  value={editedPhoto.km}
                  onChange={(e) => updateField('km', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Metros
                </Label>
                <Input
                  type="number"
                  value={editedPhoto.meters}
                  onChange={(e) => updateField('meters', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Atividade
              </Label>
              <Select value={editedPhoto.activity} onValueChange={handleActivityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(currentSettings.activities).map((activity) => (
                    <SelectItem key={activity} value={activity}>
                      {activity.charAt(0).toUpperCase() + activity.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Sub-atividade
              </Label>
              <Select 
                value={editedPhoto.subActivity} 
                onValueChange={(value) => updateField('subActivity', value)}
                disabled={!editedPhoto.activity}
              >
                <SelectTrigger>
                  <SelectValue placeholder={editedPhoto.activity ? "Selecione a sub-atividade..." : "Selecione primeiro a atividade..."} />
                </SelectTrigger>
                <SelectContent>
                  {editedPhoto.activity && currentSettings.activities[editedPhoto.activity]?.map((subActivity) => (
                    <SelectItem key={subActivity} value={subActivity}>
                      {subActivity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Observações
              </Label>
              <Textarea
                placeholder="Adicione observações sobre a ocorrência..."
                value={editedPhoto.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                className="h-24 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3 pb-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
          >
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
