import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Barcode, Camera, Type, Loader2, AlertCircle } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, Card, SectionHeader } from '../components/ui';
import { productService } from '../services/api';

// The Barcode Detection API is supported natively in Chrome/Edge/Android.
// We feature-detect it instead of faking a scan.
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [cameraSupported, setCameraSupported] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setCameraSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookupBarcode = async (barcode: string) => {
    setLookupLoading(true);
    setLookupError(null);
    const res = await productService.scanBarcode(barcode.trim());
    setLookupLoading(false);
    if (res.success && res.data) {
      navigate(`/product/${barcode.trim()}`);
    } else {
      setLookupError(res.error || `No product found for barcode ${barcode}.`);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    if (!window.BarcodeDetector) {
      setCameraError('Your browser does not support live barcode scanning. Use manual entry instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      const detector = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
      });

      const tick = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            stopCamera();
            await lookupBarcode(codes[0].rawValue);
            return;
          }
        } catch {
          // detection hiccup, keep trying
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraError('Camera access was denied or is unavailable.');
    }
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    lookupBarcode(manualCode);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader
          title="Scan a food product"
          description="Real barcode lookup against a live global product database — no placeholders."
          alignment="center"
        />

        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('camera'); setLookupError(null); }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-5 h-5 inline-block mr-2" />
            Camera
          </button>
          <button
            onClick={() => { setActiveTab('manual'); stopCamera(); setLookupError(null); }}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Type className="w-5 h-5 inline-block mr-2" />
            Enter barcode
          </button>
        </div>

        {activeTab === 'camera' && (
          <Card>
            <div className="py-8 text-center">
              <div className="bg-gray-900 rounded-lg h-72 flex items-center justify-center mb-6 overflow-hidden relative">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                  muted
                  playsInline
                />
                {!cameraActive && (
                  <Barcode className="w-20 h-20 text-gray-600" />
                )}
                {cameraActive && (
                  <div className="absolute inset-8 border-2 border-emerald-400 rounded-lg pointer-events-none" />
                )}
              </div>

              {!cameraSupported && (
                <div className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 rounded-lg py-2 px-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Live scanning needs a Chromium-based browser (Chrome, Edge, Android). Use manual entry instead.
                </div>
              )}
              {cameraError && (
                <p className="text-sm text-red-600 mb-4">{cameraError}</p>
              )}

              <h3 className="font-semibold text-gray-900 mb-2">Live camera scanner</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Point your camera at a barcode. Detection happens on-device and looks up the real product the moment it's read.
              </p>
              {lookupLoading ? (
                <Button size="lg" disabled>
                  <Loader2 className="w-5 h-5 animate-spin" /> Looking up product…
                </Button>
              ) : cameraActive ? (
                <Button size="lg" variant="outline" onClick={stopCamera}>Stop camera</Button>
              ) : (
                <Button size="lg" onClick={startCamera}>Enable camera</Button>
              )}
              {lookupError && <p className="text-sm text-red-600 mt-4">{lookupError}</p>}
            </div>
          </Card>
        )}

        {activeTab === 'manual' && (
          <Card>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode number (UPC/EAN)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 3017620422003"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Found on the back or bottom of the package, usually 8–13 digits.
                </p>
              </div>
              <Button fullWidth size="lg" type="submit" isLoading={lookupLoading}>
                Look up product
              </Button>
              {lookupError && <p className="text-sm text-red-600 text-center">{lookupError}</p>}
            </form>
          </Card>
        )}

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Need help?</h3>
          <div className="space-y-3">
            <Card>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Where do I find the barcode?</span>
                <br />
                Usually on the back or bottom of the package as a series of black bars with numbers underneath.
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Product not found?</span>
                <br />
                We look it up against Open Food Facts' live database. If it's a very new or local product, it may not be listed yet — try searching by name instead.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Scanner;
