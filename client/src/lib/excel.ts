import { Photo } from "@shared/schema";

export function generateExcelReport(photos: Photo[]): void {
  // Create CSV content (simple Excel alternative that works in browser)
  const headers = [
    'ID',
    'Nome do Arquivo',
    'Rodovia',
    'Sentido',
    'Km',
    'Metros',
    'Atividade',
    'Sub-atividade',
    'Data/Hora',
    'Coordenadas GPS',
    'Observações'
  ].join(',');

  const rows = photos.map(photo => {
    const date = new Date(photo.timestamp);
    const dateStr = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    const coordinates = photo.coordinates 
      ? `${photo.coordinates.latitude}, ${photo.coordinates.longitude}`
      : '';
    
    return [
      photo.id,
      photo.filename,
      photo.highway,
      photo.direction,
      photo.km,
      photo.meters,
      photo.activity,
      photo.subActivity,
      dateStr,
      coordinates,
      photo.notes || ''
    ].map(field => `"${field}"`).join(',');
  });

  const csvContent = [headers, ...rows].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_ocorrencias_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function sharePhotos(photos: Photo[]): void {
  if (navigator.share && photos.length > 0) {
    // Use native sharing if available
    const photoBlobs = photos.map(photo => {
      // Convert base64 to blob
      const byteCharacters = atob(photo.imageData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new File([byteArray], photo.filename, { type: 'image/jpeg' });
    });

    navigator.share({
      title: 'Fotos de Ocorrências Rodoviárias',
      text: `${photos.length} fotos de ocorrências rodoviárias`,
      files: photoBlobs
    }).catch(error => {
      console.log('Erro ao compartilhar:', error);
      fallbackShare(photos);
    });
  } else {
    fallbackShare(photos);
  }
}

function fallbackShare(photos: Photo[]): void {
  // Fallback: download individual photos
  photos.forEach((photo, index) => {
    const link = document.createElement('a');
    link.href = photo.imageData;
    link.download = photo.filename;
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    setTimeout(() => {
      link.click();
      document.body.removeChild(link);
    }, index * 100); // Stagger downloads
  });
}
