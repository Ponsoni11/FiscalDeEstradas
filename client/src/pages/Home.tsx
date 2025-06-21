import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, FolderOpen } from "lucide-react";
import { useSettings } from "@/hooks/useStorage";
import { defaultSettings } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { settings } = useSettings();
  const [selectedHighway, setSelectedHighway] = useState("");
  const [selectedDirection, setSelectedDirection] = useState("");
  const [km, setKm] = useState("");
  const [meters, setMeters] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedSubActivity, setSelectedSubActivity] = useState("");

  const currentSettings = settings || defaultSettings;
  const directions = ["Norte", "Sul", "Leste", "Oeste", "Central"];

  const handleDirectionSelect = (direction: string) => {
    setSelectedDirection(direction);
  };

  const handleActivityChange = (activity: string) => {
    setSelectedActivity(activity);
    setSelectedSubActivity(""); // Reset sub-activity when activity changes
  };

  const canTakePhoto = selectedHighway && selectedDirection && km && meters && selectedActivity && selectedSubActivity;

  const handleTakePhoto = () => {
    if (canTakePhoto) {
      // Store form data in sessionStorage for camera screen
      sessionStorage.setItem('currentForm', JSON.stringify({
        highway: selectedHighway,
        direction: selectedDirection,
        km: parseInt(km),
        meters: parseInt(meters),
        activity: selectedActivity,
        subActivity: selectedSubActivity
      }));
      setLocation("/camera");
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Inspetor Rodoviário" showSettings />
      
      <main className="p-4 space-y-6">
        {/* Seleção de Rodovia */}
        <Card>
          <CardContent className="p-4">
            <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <svg className="w-4 h-4 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 12h20" />
                <path d="m2 12 3-7 7 7 7 7 3-7" />
              </svg>
              Rodovia
            </Label>
            <Select value={selectedHighway} onValueChange={setSelectedHighway}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a rodovia..." />
              </SelectTrigger>
              <SelectContent>
                {currentSettings.highways.map((highway) => (
                  <SelectItem key={highway} value={highway}>
                    {highway}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Sentido e Localização */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Sentido
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {directions.map((direction) => (
                  <Button
                    key={direction}
                    variant={selectedDirection === direction ? "default" : "outline"}
                    className="p-3 h-auto flex flex-col"
                    onClick={() => handleDirectionSelect(direction)}
                  >
                    {direction === "Norte" && "↑"}
                    {direction === "Sul" && "↓"}
                    {direction === "Leste" && "→"}
                    {direction === "Oeste" && "←"}
                    {direction === "Central" && "●"}
                    <span className="text-xs mt-1">{direction}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Km
                </Label>
                <Input
                  type="number"
                  placeholder="000"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Metros
                </Label>
                <Input
                  type="number"
                  placeholder="000"
                  value={meters}
                  onChange={(e) => setMeters(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Atividade e Sub-atividade */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" />
                  <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6" />
                </svg>
                Atividade
              </Label>
              <Select value={selectedActivity} onValueChange={handleActivityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a atividade..." />
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
              <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
                Sub-atividade
              </Label>
              <Select 
                value={selectedSubActivity} 
                onValueChange={setSelectedSubActivity}
                disabled={!selectedActivity}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedActivity ? "Selecione a sub-atividade..." : "Selecione primeiro a atividade..."} />
                </SelectTrigger>
                <SelectContent>
                  {selectedActivity && currentSettings.activities[selectedActivity]?.map((subActivity) => (
                    <SelectItem key={subActivity} value={subActivity}>
                      {subActivity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <Button 
            className="w-full h-14 text-lg font-medium"
            onClick={handleTakePhoto}
            disabled={!canTakePhoto}
          >
            <Camera className="w-6 h-6 mr-3" />
            Tirar Foto
          </Button>

          <Button 
            variant="secondary"
            className="w-full h-14 text-lg font-medium"
            onClick={() => setLocation("/photo-manager")}
          >
            <FolderOpen className="w-6 h-6 mr-3" />
            Gerenciar Fotos
          </Button>
        </div>
      </main>
    </div>
  );
}
