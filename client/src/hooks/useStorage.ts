import { useState, useEffect, useCallback } from 'react';
import { Photo, Settings } from '@shared/schema';
import { localStorage } from '../lib/storage';

export function useStorage() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    localStorage.init().then(() => setIsInitialized(true));
  }, []);

  return { isInitialized };
}

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const allPhotos = await localStorage.getAllPhotos();
      setPhotos(allPhotos.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePhoto = useCallback(async (photo: Photo) => {
    await localStorage.savePhoto(photo);
    await loadPhotos();
  }, [loadPhotos]);

  const deletePhoto = useCallback(async (id: string) => {
    await localStorage.deletePhoto(id);
    await loadPhotos();
  }, [loadPhotos]);

  const updatePhoto = useCallback(async (photo: Photo) => {
    await localStorage.updatePhoto(photo);
    await loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    loading,
    savePhoto,
    deletePhoto,
    updatePhoto,
    refreshPhotos: loadPhotos
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const loadedSettings = await localStorage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Settings) => {
    await localStorage.saveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saveSettings
  };
}
