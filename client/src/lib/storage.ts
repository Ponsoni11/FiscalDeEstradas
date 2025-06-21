import { Photo, Settings, defaultSettings } from "@shared/schema";

class LocalStorage {
  private dbName = "InspetorRodoviario";
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create photos store
        if (!db.objectStoreNames.contains("photos")) {
          const photosStore = db.createObjectStore("photos", { keyPath: "id" });
          photosStore.createIndex("timestamp", "timestamp", { unique: false });
          photosStore.createIndex("highway", "highway", { unique: false });
          photosStore.createIndex("activity", "activity", { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };
    });
  }

  async savePhoto(photo: Photo): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["photos"], "readwrite");
      const store = transaction.objectStore("photos");
      const request = store.put(photo);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPhoto(id: string): Promise<Photo | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["photos"], "readonly");
      const store = transaction.objectStore("photos");
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllPhotos(): Promise<Photo[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["photos"], "readonly");
      const store = transaction.objectStore("photos");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deletePhoto(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["photos"], "readwrite");
      const store = transaction.objectStore("photos");
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updatePhoto(photo: Photo): Promise<void> {
    return this.savePhoto(photo);
  }

  async getSettings(): Promise<Settings> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["settings"], "readonly");
      const store = transaction.objectStore("settings");
      const request = store.get("app-settings");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultSettings);
      };
    });
  }

  async saveSettings(settings: Settings): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["settings"], "readwrite");
      const store = transaction.objectStore("settings");
      const request = store.put({ key: "app-settings", value: settings });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPhotosByFilters(filters: {
    highway?: string;
    activity?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Photo[]> {
    const allPhotos = await this.getAllPhotos();
    
    return allPhotos.filter(photo => {
      if (filters.highway && photo.highway !== filters.highway) return false;
      if (filters.activity && photo.activity !== filters.activity) return false;
      if (filters.dateFrom && photo.timestamp < filters.dateFrom.getTime()) return false;
      if (filters.dateTo && photo.timestamp > filters.dateTo.getTime()) return false;
      return true;
    });
  }
}

export const localStorage = new LocalStorage();
