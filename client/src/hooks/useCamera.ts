import { useState, useCallback } from 'react';
import { cameraManager, CameraConfig } from '../lib/camera';

export function useCamera() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const initCamera = useCallback(async (videoElement: HTMLVideoElement, config: CameraConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cameraManager.initCamera(videoElement, config);
      setIsInitialized(true);
      
      const multiple = await cameraManager.hasMultipleCameras();
      setHasMultipleCameras(multiple);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const capturePhoto = useCallback(async (canvas: HTMLCanvasElement): Promise<string | null> => {
    try {
      return await cameraManager.capturePhoto(canvas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao capturar foto');
      return null;
    }
  }, []);

  const switchCamera = useCallback(async () => {
    try {
      await cameraManager.switchCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alternar câmera');
    }
  }, []);

  const stopCamera = useCallback(() => {
    cameraManager.stopCamera();
    setIsInitialized(false);
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    hasMultipleCameras,
    initCamera,
    capturePhoto,
    switchCamera,
    stopCamera
  };
}
