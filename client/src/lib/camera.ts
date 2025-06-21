export interface CameraConfig {
  resolution: string;
  facingMode: 'user' | 'environment';
  flash: boolean;
}

export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initCamera(videoElement: HTMLVideoElement, config: CameraConfig): Promise<void> {
    this.videoElement = videoElement;
    
    const [width, height] = config.resolution.split('x').map(Number);
    
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: width },
        height: { ideal: height },
        facingMode: config.facingMode
      },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.stream;
      await videoElement.play();
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      throw new Error('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }

  async capturePhoto(canvas: HTMLCanvasElement): Promise<string> {
    if (!this.videoElement || !this.stream) {
      throw new Error('Câmera não inicializada');
    }

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Não foi possível obter contexto do canvas');
    }

    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    context.drawImage(this.videoElement, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  async switchCamera(): Promise<void> {
    if (!this.videoElement) return;

    const currentFacingMode = this.getCurrentFacingMode();
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    this.stopCamera();
    
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: newFacingMode
      },
      audio: false
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();
    } catch (error) {
      console.error('Erro ao alternar câmera:', error);
    }
  }

  private getCurrentFacingMode(): 'user' | 'environment' {
    if (!this.stream) return 'environment';
    
    const videoTrack = this.stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    return settings.facingMode as 'user' | 'environment' || 'environment';
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  async hasMultipleCameras(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return videoDevices.length > 1;
    } catch {
      return false;
    }
  }
}

export const cameraManager = new CameraManager();
