// src/hooks/device/useDeviceApis.ts
import { useState, useEffect, useCallback } from 'react';

interface DeviceCapabilities {
  camera: boolean;
  geolocation: boolean;
  deviceMotion: boolean;
  vibration: boolean;
  webShare: boolean;
  clipboard: boolean;
  fullscreen: boolean;
  notifications: boolean;
  battery: boolean;
  networkInformation: boolean;
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    camera: false,
    geolocation: false,
    deviceMotion: false,
    vibration: false,
    webShare: false,
    clipboard: false,
    fullscreen: false,
    notifications: false,
    battery: false,
    networkInformation: false
  });

  useEffect(() => {
    const checkCapabilities = async () => {
      const newCapabilities: DeviceCapabilities = {
        camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        geolocation: 'geolocation' in navigator,
        deviceMotion: 'DeviceMotionEvent' in window,
        vibration: 'vibrate' in navigator,
        webShare: 'share' in navigator,
        clipboard: !!(navigator.clipboard && navigator.clipboard.writeText),
        fullscreen: !!(document.documentElement.requestFullscreen),
        notifications: 'Notification' in window,
        battery: 'getBattery' in navigator,
        networkInformation: 'connection' in navigator
      };

      setCapabilities(newCapabilities);
    };

    checkCapabilities();
  }, []);

  return capabilities;
};

export const useCamera = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsAvailable(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
  }, []);

  const startCamera = useCallback(async (constraints: MediaStreamConstraints = { video: true }) => {
    if (!isAvailable) {
      setError('Camera not available');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsActive(true);
      setError(null);
      return mediaStream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      throw err;
    }
  }, [isAvailable]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  }, [stream]);

  const takePhoto = useCallback((videoElement: HTMLVideoElement): string | null => {
    if (!videoElement || !stream) return null;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isAvailable,
    isActive,
    stream,
    error,
    startCamera,
    stopCamera,
    takePhoto
  };
};

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPosition = useCallback((options?: PositionOptions) => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    setIsLoading(true);
    setError(null);

    return new Promise<GeolocationData>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locationData: GeolocationData = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          };
          setPosition(locationData);
          setIsLoading(false);
          resolve(locationData);
        },
        (err) => {
          const errorMessage = `Geolocation error: ${err.message}`;
          setError(errorMessage);
          setIsLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
          ...options
        }
      );
    });
  }, []);

  const watchPosition = useCallback((options?: PositionOptions) => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return null;
    }

    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const locationData: GeolocationData = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        };
        setPosition(locationData);
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
        ...options
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return {
    position,
    error,
    isLoading,
    getCurrentPosition,
    watchPosition
  };
};

export const useDeviceMotion = () => {
  const [motion, setMotion] = useState<{
    acceleration: { x: number; y: number; z: number } | null;
    rotationRate: { alpha: number; beta: number; gamma: number } | null;
    orientation: { alpha: number; beta: number; gamma: number } | null;
  }>({
    acceleration: null,
    rotationRate: null,
    orientation: null
  });

  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    setIsSupported('DeviceMotionEvent' in window && 'DeviceOrientationEvent' in window);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      // iOS 13+ requires permission request
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        const granted = permission === 'granted';
        setPermissionGranted(granted);
        return granted;
      }
      
      // Android and older iOS don't require explicit permission
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('Device motion permission error:', error);
      setPermissionGranted(false);
      return false;
    }
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported || permissionGranted === false) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      setMotion(prev => ({
        ...prev,
        acceleration: event.acceleration ? {
          x: event.acceleration.x || 0,
          y: event.acceleration.y || 0,
          z: event.acceleration.z || 0
        } : null,
        rotationRate: event.rotationRate ? {
          alpha: event.rotationRate.alpha || 0,
          beta: event.rotationRate.beta || 0,
          gamma: event.rotationRate.gamma || 0
        } : null
      }));
    };

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      setMotion(prev => ({
        ...prev,
        orientation: {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        }
      }));
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isSupported, permissionGranted]);

  return {
    motion,
    isSupported,
    permissionGranted,
    requestPermission,
    startListening
  };
};

export const useBattery = () => {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkBatteryAPI = async () => {
      if ('getBattery' in navigator) {
        setIsSupported(true);
        try {
          const battery = await (navigator as any).getBattery();
          
          const updateBatteryInfo = () => {
            setBatteryInfo({
              level: battery.level,
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime
            });
          };

          updateBatteryInfo();

          battery.addEventListener('chargingchange', updateBatteryInfo);
          battery.addEventListener('levelchange', updateBatteryInfo);
          battery.addEventListener('chargingtimechange', updateBatteryInfo);
          battery.addEventListener('dischargingtimechange', updateBatteryInfo);

          return () => {
            battery.removeEventListener('chargingchange', updateBatteryInfo);
            battery.removeEventListener('levelchange', updateBatteryInfo);
            battery.removeEventListener('chargingtimechange', updateBatteryInfo);
            battery.removeEventListener('dischargingtimechange', updateBatteryInfo);
          };
        } catch (error) {
          console.error('Battery API error:', error);
        }
      }
    };

    checkBatteryAPI();
  }, []);

  return { batteryInfo, isSupported };
};

export const useNetworkInformation = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('connection' in navigator) {
      setIsSupported(true);
      const connection = (navigator as any).connection;
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return { networkInfo, isSupported };
};

export const useWebShare = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('share' in navigator);
  }, []);

  const share = useCallback(async (data: ShareData) => {
    if (!isSupported) {
      throw new Error('Web Share API not supported');
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled the share
        return false;
      }
      throw error;
    }
  }, [isSupported]);

  return { isSupported, share };
};

export const useClipboard = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(!!(navigator.clipboard && navigator.clipboard.writeText));
  }, []);

  const writeText = useCallback(async (text: string) => {
    if (!isSupported) {
      throw new Error('Clipboard API not supported');
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      throw error;
    }
  }, [isSupported]);

  const readText = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Clipboard API not supported');
    }

    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      throw error;
    }
  }, [isSupported]);

  return { isSupported, writeText, readText };
};

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(!!document.documentElement.requestFullscreen);
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = useCallback(async (element?: Element) => {
    if (!isSupported) {
      throw new Error('Fullscreen API not supported');
    }

    try {
      const targetElement = element || document.documentElement;
      await targetElement.requestFullscreen();
    } catch (error) {
      throw error;
    }
  }, [isSupported]);

  const exitFullscreen = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Fullscreen API not supported');
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      throw error;
    }
  }, [isSupported]);

  const toggleFullscreen = useCallback(async (element?: Element) => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen(element);
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  };
};