import { Photo, Settings } from "@shared/schema";

export interface WatermarkOptions {
  position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  includeDateTime: boolean;
  includeCoordinates: boolean;
  includeHighway: boolean;
  includeDirection: boolean;
  includeLocation: boolean;
  includeUser: boolean;
  includeNotes: boolean;
}

export function applyWatermark(
  imageDataUrl: string,
  photo: Partial<Photo>,
  options: WatermarkOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Prepare watermark text
      const watermarkLines = buildWatermarkText(photo, options);
      
      if (watermarkLines.length === 0) {
        resolve(canvas.toDataURL('image/jpeg', 0.9));
        return;
      }
      
      // Configure text style
      const fontSize = Math.max(12, Math.min(24, canvas.width / 40));
      ctx.font = `${fontSize}px 'Roboto', sans-serif`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      
      // Calculate text dimensions
      const lineHeight = fontSize * 1.2;
      const padding = 10;
      const maxWidth = Math.max(...watermarkLines.map(line => ctx.measureText(line).width));
      const textHeight = watermarkLines.length * lineHeight;
      
      // Calculate position
      const { x, y } = calculateWatermarkPosition(
        options.position,
        canvas.width,
        canvas.height,
        maxWidth + padding * 2,
        textHeight + padding * 2
      );
      
      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y, maxWidth + padding * 2, textHeight + padding * 2);
      
      // Draw text
      ctx.fillStyle = 'white';
      watermarkLines.forEach((line, index) => {
        const textY = y + padding + (index + 1) * lineHeight;
        ctx.strokeText(line, x + padding, textY);
        ctx.fillText(line, x + padding, textY);
      });
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = imageDataUrl;
  });
}

function buildWatermarkText(photo: Partial<Photo>, options: WatermarkOptions): string[] {
  const lines: string[] = [];
  
  if (options.includeHighway && photo.highway) {
    let locationText = photo.highway;
    if (options.includeDirection && photo.direction) {
      locationText += ` ${photo.direction}`;
    }
    if (options.includeLocation && photo.km !== undefined && photo.meters !== undefined) {
      locationText += ` Km ${photo.km}+${photo.meters.toString().padStart(3, '0')}`;
    }
    lines.push(locationText);
  }
  
  if (options.includeDateTime && photo.timestamp) {
    const date = new Date(photo.timestamp);
    const dateStr = date.toLocaleDateString('pt-BR');
    const timeStr = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    lines.push(`${dateStr} ${timeStr}`);
  }
  
  if (photo.activity && photo.subActivity) {
    lines.push(`${photo.activity} - ${photo.subActivity}`);
  }
  
  if (options.includeCoordinates && photo.coordinates) {
    lines.push(`GPS: ${photo.coordinates.latitude.toFixed(6)}, ${photo.coordinates.longitude.toFixed(6)}`);
  }
  
  if (options.includeNotes && photo.notes) {
    lines.push(photo.notes);
  }
  
  return lines;
}

function calculateWatermarkPosition(
  position: string,
  canvasWidth: number,
  canvasHeight: number,
  textWidth: number,
  textHeight: number
): { x: number; y: number } {
  const margin = 20;
  
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin };
    case 'top-right':
      return { x: canvasWidth - textWidth - margin, y: margin };
    case 'bottom-left':
      return { x: margin, y: canvasHeight - textHeight - margin };
    case 'bottom-right':
      return { x: canvasWidth - textWidth - margin, y: canvasHeight - textHeight - margin };
    default:
      return { x: margin, y: canvasHeight - textHeight - margin };
  }
}
