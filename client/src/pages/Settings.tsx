import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/hooks/useStorage";
import { Settings as SettingsType, defaultSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { settings, saveSettings } = useSettings();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<SettingsType>(defaultSettings);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveSettings(localSettings);
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  const updateSettings = (path: string, value: any) => {
    setLocalSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="min-h-screen">
      <Header title="Configurações" showBackButton />
      
      <div className="p-4 space-y-6">
        {/* Qualidade da Foto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              Qualidade da Foto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Resolução</Label>
              <Select 
                value={localSettings.photoQuality.resolution} 
                onValueChange={(value) => updateSettings('photoQuality.resolution', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1920x1080">Alta (1920x1080)</SelectItem>
                  <SelectItem value="1280x720">Média (1280x720)</SelectItem>
                  <SelectItem value="640x480">Baixa (640x480)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Qualidade de Compressão: {localSettings.photoQuality.compression}%
              </Label>
              <Slider
                value={[localSettings.photoQuality.compression]}
                onValueChange={([value]) => updateSettings('photoQuality.compression', value)}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Marca D'água */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              Marca D'água
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Posição</Label>
              <Select 
                value={localSettings.watermark.position} 
                onValueChange={(value: any) => updateSettings('watermark.position', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-left">Canto inferior esquerdo</SelectItem>
                  <SelectItem value="bottom-right">Canto inferior direito</SelectItem>
                  <SelectItem value="top-left">Canto superior esquerdo</SelectItem>
                  <SelectItem value="top-right">Canto superior direito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Informações incluídas</Label>
              <div className="space-y-2">
                {[
                  { key: 'includeDateTime', label: 'Data/Hora' },
                  { key: 'includeCoordinates', label: 'Coordenadas GPS' },
                  { key: 'includeHighway', label: 'Rodovia' },
                  { key: 'includeDirection', label: 'Sentido' },
                  { key: 'includeLocation', label: 'Localização (Km+M)' },
                  { key: 'includeUser', label: 'Usuário' },
                  { key: 'includeNotes', label: 'Observações' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={localSettings.watermark[key as keyof typeof localSettings.watermark] as boolean}
                      onCheckedChange={(checked) => updateSettings(`watermark.${key}`, checked)}
                    />
                    <Label htmlFor={key} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nome do Arquivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              Nome do Arquivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Padrão de nomenclatura</Label>
              <Input
                value={localSettings.fileNaming.pattern}
                onChange={(e) => updateSettings('fileNaming.pattern', e.target.value)}
                className="mb-2"
              />
              <p className="text-sm text-gray-500">Exemplo: SP310_Norte_20231215_143022_Buraco.jpg</p>
            </div>
          </CardContent>
        </Card>

        {/* Armazenamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              Armazenamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { key: 'autoBackup', label: 'Backup automático na nuvem' },
                { key: 'organizeByDate', label: 'Organizar por data' },
                { key: 'organizeByHighway', label: 'Organizar por rodovia' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={localSettings.storage[key as keyof typeof localSettings.storage]}
                    onCheckedChange={(checked) => updateSettings(`storage.${key}`, checked)}
                  />
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
