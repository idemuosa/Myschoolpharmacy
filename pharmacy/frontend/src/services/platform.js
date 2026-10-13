/**
 * Helper utility to detect platform environment (Desktop App / Mobile App / Web)
 * and interact with native desktop or mobile APIs.
 */

export const isElectron = () => {
  return typeof window !== 'undefined' && Boolean(window.electronAPI || window.process?.type === 'renderer');
};

export const isCapacitor = () => {
  return typeof window !== 'undefined' && Boolean(window.Capacitor);
};

export const isMobileDevice = () => {
  if (isCapacitor()) return true;
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  return false;
};

export const getPlatformType = () => {
  if (isElectron()) return 'desktop';
  if (isCapacitor()) return 'mobile_native';
  if (isMobileDevice()) return 'mobile_web';
  return 'web';
};

export const getPlatformLabel = () => {
  const type = getPlatformType();
  switch (type) {
    case 'desktop':
      return 'Desktop App';
    case 'mobile_native':
      return 'Mobile App';
    case 'mobile_web':
      return 'Mobile Web';
    default:
      return 'Web Edition';
  }
};

// Window control methods for Electron Desktop App
export const minimizeWindow = () => {
  if (isElectron() && window.electronAPI?.minimize) {
    window.electronAPI.minimize();
  }
};

export const maximizeWindow = () => {
  if (isElectron() && window.electronAPI?.maximize) {
    window.electronAPI.maximize();
  }
};

export const closeWindow = () => {
  if (isElectron() && window.electronAPI?.close) {
    window.electronAPI.close();
  }
};

export default {
  isElectron,
  isCapacitor,
  isMobileDevice,
  getPlatformType,
  getPlatformLabel,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
};
