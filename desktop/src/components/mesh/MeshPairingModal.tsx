import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Copy,
  Check,
  X,
  ShieldCheck,
  Upload,
  AlertCircle,
  Key,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { MeshIdentity, MeshPeer } from '../../mesh/storage/meshStorage';

interface MeshPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (peer: MeshPeer) => void;
  identity: MeshIdentity | null;
}

export const MeshPairingModal: React.FC<MeshPairingModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  identity,
}) => {
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan' | 'manual'>('my_qr');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Scanner state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanAnimationRef = useRef<number | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  // Manual input state
  const [manualInput, setManualInput] = useState('');
  const [manualNick, setManualNick] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);

  // Parse QR or direct payload
  const parsePeerString = (raw: string): { pubkey: string; nickname?: string } | null => {
    const trimmed = raw.trim();
    // Case 1: cfm1://peer?pk=<64hex>&nick=<name>
    if (trimmed.startsWith('cfm1://')) {
      try {
        const url = new URL(trimmed.replace('cfm1://', 'http://cfm1/'));
        const pk = url.searchParams.get('pk') || '';
        const nick = url.searchParams.get('nick') || undefined;
        if (/^[a-fA-F0-9]{64}$/.test(pk)) {
          return { pubkey: pk.toLowerCase(), nickname: nick };
        }
      } catch {}
    }

    // Case 2: Plain 64-hex string
    if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
      return { pubkey: trimmed.toLowerCase() };
    }

    return null;
  };

  // Generate QR Code onto canvas
  useEffect(() => {
    if (!isOpen || activeTab !== 'my_qr' || !identity || !qrCanvasRef.current) return;

    const payload = `cfm1://peer?pk=${identity.publicKeyHex}&nick=${encodeURIComponent(
      identity.nickname
    )}`;

    QRCode.toCanvas(
      qrCanvasRef.current,
      payload,
      {
        width: 256,
        margin: 2,
        color: {
          dark: '#052e16', // Deep emerald
          light: '#ecfdf5', // Soft emerald tint
        },
      },
      (err) => {
        if (err) console.error('[MeshQR] Generation error:', err);
      }
    );
  }, [isOpen, activeTab, identity]);

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScannedResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        startDecodingLoop();
      }
    } catch (err: any) {
      console.warn('[MeshScanner] Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access permission was denied. Please allow camera permissions in your browser or desktop settings.'
          : 'Unable to access camera or webcam. You can use the "Paste Key" tab or upload a photo of the QR code.'
      );
      setIsScanning(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (scanAnimationRef.current) {
      cancelAnimationFrame(scanAnimationRef.current);
      scanAnimationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // QR Decoding frame loop
  const startDecodingLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const parsed = parsePeerString(code.data);
            if (parsed) {
              setScannedResult(parsed.pubkey);
              stopCamera();

              const peer: MeshPeer = {
                publicKeyHex: parsed.pubkey,
                nickname: parsed.nickname || `Peer_${parsed.pubkey.substring(0, 6)}`,
                status: 'discovered',
                lastSeen: Date.now(),
              };

              setTimeout(() => {
                onConnect(peer);
                onClose();
              }, 400);
              return;
            }
          }
        }
      }
      scanAnimationRef.current = requestAnimationFrame(scanFrame);
    };

    scanAnimationRef.current = requestAnimationFrame(scanFrame);
  };

  // Handle Tab Change
  useEffect(() => {
    if (activeTab === 'scan' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, isOpen]);

  // Image Upload Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width;
        offCanvas.height = img.height;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            const parsed = parsePeerString(code.data);
            if (parsed) {
              const peer: MeshPeer = {
                publicKeyHex: parsed.pubkey,
                nickname: parsed.nickname || `Peer_${parsed.pubkey.substring(0, 6)}`,
                status: 'discovered',
                lastSeen: Date.now(),
              };
              onConnect(peer);
              onClose();
              return;
            }
          }
          setManualError('No valid Clearfeed Mesh QR code found in this image.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manual connect submission
  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    const parsed = parsePeerString(manualInput);
    if (!parsed) {
      setManualError('Please enter a valid cfm1:// link or 64-character hex public key.');
      return;
    }

    const peer: MeshPeer = {
      publicKeyHex: parsed.pubkey,
      nickname: manualNick.trim() || parsed.nickname || `Peer_${parsed.pubkey.substring(0, 6)}`,
      status: 'discovered',
      lastSeen: Date.now(),
    };

    onConnect(peer);
    onClose();
  };

  if (!isOpen) return null;

  const safetyFingerprint = identity?.publicKeyHex
    ? identity.publicKeyHex.slice(0, 16).match(/.{1,4}/g)?.join(' • ').toUpperCase()
    : '----';

  const shareableLink = identity
    ? `cfm1://peer?pk=${identity.publicKeyHex}&nick=${encodeURIComponent(identity.nickname)}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Scan & Connect Nearby
              </h2>
              <p className="text-[11px] text-neutral-400">
                100% Offline Peer Discovery | সম্পূর্ণ অফলাইন পেয়ারিং
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 p-2 gap-1.5">
          <button
            onClick={() => setActiveTab('my_qr')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'my_qr'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Paste / Upload</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: SHOW MY QR CODE */}
          {activeTab === 'my_qr' && (
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="relative p-3 bg-white rounded-2xl shadow-xl border border-neutral-200">
                <canvas ref={qrCanvasRef} className="w-56 h-56 rounded-lg" />
              </div>

              <div className="space-y-1">
                <span className="text-sm font-bold text-neutral-100">
                  {identity?.nickname || 'Nearby Peer'}
                </span>
                <p className="text-[11px] text-neutral-400 max-w-sm">
                  Show this QR code to a nearby phone or laptop. Once scanned, you can send encrypted messages immediately without internet.
                </p>
              </div>

              {/* Safety Fingerprint */}
              <div className="w-full bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-3.5 space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Cryptographic Safety Fingerprint
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Ed25519</span>
                </div>
                <p className="font-mono text-xs font-bold text-emerald-300 tracking-wider">
                  {safetyFingerprint}
                </p>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Verify these 4 blocks match the receiver’s screen to guarantee 100% protection against impersonation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    if (shareableLink) {
                      navigator.clipboard.writeText(shareableLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }
                  }}
                  className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Mesh Link'}</span>
                </button>

                <button
                  onClick={() => {
                    if (identity) {
                      navigator.clipboard.writeText(identity.publicKeyHex);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }
                  }}
                  className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Key Copied!' : 'Copy Hex Key'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CAMERA SCANNER */}
          {activeTab === 'scan' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-full max-w-sm aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center shadow-inner">
                {cameraError ? (
                  <div className="p-6 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-xs text-neutral-300 font-medium">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanner Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                      </div>
                    </div>

                    {isScanning && (
                      <div className="absolute bottom-3 px-3 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 border border-emerald-500/30">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        Align peer QR code in box
                      </div>
                    )}
                  </>
                )}
              </div>

              {scannedResult && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Peer detected! Opening encrypted session...</span>
                </div>
              )}

              <p className="text-xs text-neutral-400 text-center max-w-sm">
                Point your webcam or phone camera at the other user’s Clearfeed Mesh QR code to establish connection in less than 1 second.
              </p>
            </div>
          )}

          {/* TAB 3: MANUAL PASTE OR IMAGE UPLOAD */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <form onSubmit={handleManualConnect} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Peer Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualNick}
                    onChange={(e) => setManualNick(e.target.value)}
                    placeholder="e.g. Study Partner / Nearby Mobile"
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-300">
                    Peer Mesh Link or 64-Hex Public Key
                  </label>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="cfm1://peer?pk=... or 64-char hex key"
                    className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {manualError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{manualError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Pair & Open Chat
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-800" />
                <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                  OR Upload Screenshot
                </span>
                <div className="flex-grow border-t border-neutral-800" />
              </div>

              <div>
                <label className="border border-dashed border-neutral-700 hover:border-emerald-500/60 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-neutral-950/40 hover:bg-neutral-900/60 transition text-center">
                  <Upload className="w-6 h-6 text-neutral-400" />
                  <span className="text-xs font-semibold text-neutral-200">
                    Upload QR Code Image
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    PNG, JPG, or WEBP screenshot from phone
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeshPairingModal;
