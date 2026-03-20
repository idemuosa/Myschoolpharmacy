import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

const barcodeService = {
  checkPermissions: async () => {
    const { camera } = await BarcodeScanner.checkPermissions();
    return camera;
  },

  requestPermissions: async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera;
  },

  scan: async () => {
    const isSupported = await BarcodeScanner.isSupported();
    if (!isSupported) {
      throw new Error('Barcode scanning not supported on this device');
    }

    const granted = await barcodeService.checkPermissions();
    if (granted !== 'granted') {
      const status = await barcodeService.requestPermissions();
      if (status !== 'granted') {
        throw new Error('Camera permission denied');
      }
    }

    const { barcodes } = await BarcodeScanner.scan();
    return barcodes.length > 0 ? barcodes[0].displayValue : null;
  }
};

export default barcodeService;
