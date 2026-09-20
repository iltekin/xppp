import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CropTransform, StoredAvatarPreview, ThemeMode } from '../../types';
import { saveAvatarPreview, clearAvatarPreview } from '../../utils/storage';
import { detectLoggedUser } from '../../utils/xDomSelectors';

interface CropModalProps {
  initialPreview: StoredAvatarPreview | null;
  currentTheme: ThemeMode;
  userHandle: string | null;
  onClose: () => void;
  onApplied: (newPreview: StoredAvatarPreview) => void;
  onReset: () => void;
}

const VIEWPORT_SIZE = 300; // Display dimensions of the crop box in pixels
const OUTPUT_SIZE = 400;   // High-res output dimensions for the profile avatar

export const CropModal: React.FC<CropModalProps> = ({
  initialPreview,
  currentTheme,
  userHandle,
  onClose,
  onApplied,
  onReset,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(
    initialPreview?.originalRawUrl || initialPreview?.dataUrl || null
  );
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState<number>(initialPreview?.transform?.scale ?? 1);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: initialPreview?.transform?.x ?? 0,
    y: initialPreview?.transform?.y ?? 0,
  }));
  const [rotation, setRotation] = useState<number>(initialPreview?.transform?.rotation ?? 0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isApplying, setIsApplying] = useState(false);
  const [hasActivePreview, setHasActivePreview] = useState<boolean>(
    Boolean(initialPreview?.enabled && initialPreview?.dataUrl)
  );
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const isLight = currentTheme === 'light';
  const isDim = currentTheme === 'dim';

  const modalBg = isLight ? 'bg-white text-[#0f1419]' : isDim ? 'bg-[#15202b] text-[#f7f9f9]' : 'bg-black text-[#e7e9ea]';
  const borderCol = isLight ? 'border-neutral-200' : isDim ? 'border-[#38444d]' : 'border-[#2f3336]';
  const headerBg = isLight ? 'bg-white/95 border-b border-[#eff3f4]' : isDim ? 'bg-[#15202b]/95 border-b border-[#38444d]' : 'bg-black/95 border-b border-[#2f3336]';
  const cardBg = isLight ? 'bg-[#f7f9f9] border-[#eff3f4]' : isDim ? 'bg-[#192734] border-[#38444d]' : 'bg-[#16181c] border-[#2f3336]';
  const textMuted = isLight ? 'text-[#536471]' : isDim ? 'text-[#8b98a5]' : 'text-[#71767b]';

  // Layout geometry
  const isRotated90 = Math.abs(rotation % 180) === 90;
  const naturalWidth = imgDimensions?.width || VIEWPORT_SIZE;
  const naturalHeight = imgDimensions?.height || VIEWPORT_SIZE;
  const baseScale = Math.max(VIEWPORT_SIZE / naturalWidth, VIEWPORT_SIZE / naturalHeight);

  const renderWidth = naturalWidth * baseScale * scale;
  const renderHeight = naturalHeight * baseScale * scale;

  const effectiveW = isRotated90 ? renderHeight : renderWidth;
  const effectiveH = isRotated90 ? renderWidth : renderHeight;

  // Maximum allowed pan to ensure image ALWAYS completely covers the 300x300 circle without gaps
  const maxPanX = Math.max(0, (effectiveW - VIEWPORT_SIZE) / 2);
  const maxPanY = Math.max(0, (effectiveH - VIEWPORT_SIZE) / 2);

  const clampPosition = useCallback(
    (x: number, y: number) => ({
      x: Math.min(Math.max(-maxPanX, x), maxPanX),
      y: Math.min(Math.max(-maxPanY, y), maxPanY),
    }),
    [maxPanX, maxPanY]
  );

  const centerX = VIEWPORT_SIZE / 2 + position.x;
  const centerY = VIEWPORT_SIZE / 2 + position.y;

  // Keep position clamped whenever scale, rotation or dimensions change
  useEffect(() => {
    setPosition((prev) => clampPosition(prev.x, prev.y));
  }, [clampPosition]);

  // Handle file selection from file input
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImageSrc(dataUrl);
      setImgDimensions(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers for upload box
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Drag to move (Pan) handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition(clampPosition(newX, newY));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
    setScale((prev) => Math.min(Math.max(1.0, prev + zoomFactor), 4));
  };

  // Generate real-time circular preview using an offscreen canvas - 100% pixel-perfect match to DOM
  const generateCroppedAvatarDataUrl = useCallback((): string | null => {
    if (!imgRef.current || !imageSrc || !imgDimensions) return null;

    const img = imgRef.current;
    if (!img.naturalWidth || !img.naturalHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Ratio from 300px viewport to 400px output canvas
    const ratio = OUTPUT_SIZE / VIEWPORT_SIZE;

    const outWidth = renderWidth * ratio;
    const outHeight = renderHeight * ratio;
    const outCenterX = centerX * ratio;
    const outCenterY = centerY * ratio;

    ctx.save();
    ctx.translate(outCenterX, outCenterY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -outWidth / 2, -outHeight / 2, outWidth, outHeight);
    ctx.restore();

    return canvas.toDataURL('image/png', 0.95);
  }, [imageSrc, imgDimensions, renderWidth, renderHeight, centerX, centerY, rotation]);

  // Ensure imgDimensions is populated even if onLoad fired early
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImgDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, [imageSrc]);

  // Update live preview when geometry changes
  useEffect(() => {
    if (!imageSrc || !imgDimensions) {
      setLivePreviewUrl(null);
      return;
    }
    const timer = setTimeout(() => {
      const cropped = generateCroppedAvatarDataUrl();
      if (cropped) setLivePreviewUrl(cropped);
    }, 40);
    return () => clearTimeout(timer);
  }, [imageSrc, imgDimensions, generateCroppedAvatarDataUrl]);

  // Apply preview across X
  const handleApply = async () => {
    if (!imageSrc) return;
    setIsApplying(true);

    try {
      const croppedDataUrl = generateCroppedAvatarDataUrl();
      if (!croppedDataUrl) {
        alert('An error occurred while cropping the image.');
        setIsApplying(false);
        return;
      }

      const transform: CropTransform = {
        scale,
        x: position.x,
        y: position.y,
        rotation,
      };

      const detected = detectLoggedUser();
      const resolvedHandle = userHandle || detected.username || initialPreview?.userHandle || undefined;
      const resolvedSignature = detected.signature || initialPreview?.userAvatarSignature || undefined;
      const resolvedOriginalUrl = detected.avatarUrl || initialPreview?.originalAvatarUrl || undefined;

      const previewState: StoredAvatarPreview = {
        dataUrl: croppedDataUrl,
        originalRawUrl: imageSrc,
        updatedAt: Date.now(),
        enabled: true,
        userHandle: resolvedHandle,
        userAvatarSignature: resolvedSignature,
        originalAvatarUrl: resolvedOriginalUrl,
        transform,
      };

      // 1. Immediately update page DOM in real-time
      if ((window as any).__xppp_avatar_replacer) {
        (window as any).__xppp_avatar_replacer.setActivePreview(previewState);
      }

      // 2. Persist to storage
      await saveAvatarPreview(previewState);
      setHasActivePreview(true);
      onApplied(previewState);
      onClose();
    } catch (err: any) {
      alert('Error saving preview: ' + (err.message || 'Unknown error'));
    } finally {
      setIsApplying(false);
    }
  };

  // Revert / Remove preview
  const handleRemovePreview = async () => {
    if ((window as any).__xppp_avatar_replacer) {
      (window as any).__xppp_avatar_replacer.setActivePreview(null);
    }
    await clearAvatarPreview();
    setHasActivePreview(false);
    setImageSrc(null);
    setImgDimensions(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    onReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto select-none font-chirp"
      onMouseUp={handleMouseUp}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-xl rounded-3xl ${modalBg} border ${borderCol} shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`px-5 py-3.5 flex items-center justify-between ${headerBg} backdrop-blur sticky top-0 z-30`}>
          <div>
            <h2 className="font-bold text-base leading-tight">Profile Picture Preview</h2>
            <p className={`text-xs ${textMuted}`}>Upload, position, and preview across X</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isLight
                ? 'text-black hover:text-black hover:bg-black/10 active:bg-black/20'
                : 'text-white hover:text-white hover:bg-white/10 active:bg-white/20'
            }`}
            style={isLight ? { color: '#000000' } : undefined}
            title="Close"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {!imageSrc ? (
            /* Upload Box when no image is selected */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed ${borderCol} hover:border-[#1d9bf0] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group bg-neutral-500/5 hover:bg-neutral-500/10 min-h-[280px]`}
            >
              <div className="w-14 h-14 rounded-full bg-[#1d9bf0]/10 group-hover:bg-[#1d9bf0]/20 flex items-center justify-center text-[#1d9bf0] mb-3 transition-colors">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-1">Upload Profile Picture</h3>
              <p className={`text-xs ${textMuted} max-w-xs mb-4`}>
                Drag and drop an image here, or click to browse from your device.
              </p>
              <button
                type="button"
                className="px-4 py-2 rounded-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-bold text-xs shadow-md transition-colors"
              >
                Choose File
              </button>
            </div>
          ) : (
            /* Interactive Crop / Move / Resize Viewport */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* Crop Viewport */}
                <div className="relative flex flex-col items-center">
                  <div
                    ref={viewportRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onWheel={handleWheel}
                    style={{
                      width: `${VIEWPORT_SIZE}px`,
                      height: `${VIEWPORT_SIZE}px`,
                    }}
                    className={`relative overflow-hidden rounded-2xl ${cardBg} border ${borderCol} ${
                      isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    } select-none shadow-inner`}
                  >
                    {/* Background image positioned by drag & zoom with exact pixel dimensions */}
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop target"
                      draggable={false}
                      className="absolute pointer-events-none transition-none select-none"
                      style={{
                        left: `${centerX}px`,
                        top: `${centerY}px`,
                        width: `${renderWidth}px`,
                        height: `${renderHeight}px`,
                        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        maxWidth: 'none',
                        maxHeight: 'none',
                      }}
                      onLoad={(e) => {
                        const el = e.currentTarget;
                        setImgDimensions({ width: el.naturalWidth, height: el.naturalHeight });
                      }}
                    />

                    {/* Circular Mask Guide matching X avatar style edge-to-edge */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at center, transparent 148px, rgba(0, 0, 0, 0.6) 150px)',
                      }}
                    />

                    {/* Circle border ring - full 300x300 touching edges */}
                    <div
                      className="absolute rounded-full pointer-events-none border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                      style={{
                        width: '300px',
                        height: '300px',
                        top: '0px',
                        left: '0px',
                      }}
                    />
                  </div>

                  <span className={`text-[11px] ${textMuted} mt-2 flex items-center gap-1`}>
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                    </svg>
                    Drag to position • Scroll to zoom
                  </span>
                </div>

                {/* Live Avatar Preview Badges */}
                <div className="flex flex-col items-center sm:items-start space-y-4">
                  <div className="text-xs font-bold text-inherit">Live Preview</div>

                  {/* Profile size (72px) */}
                  <div className="flex items-center space-x-3">
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-[#1d9bf0] bg-neutral-800 shadow flex-shrink-0">
                      {livePreviewUrl ? (
                        <img src={livePreviewUrl} alt="72px preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-700 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold">Profile Header</div>
                      <div className={`text-[11px] ${textMuted}`}>Large Avatar (134px)</div>
                    </div>
                  </div>

                  {/* Post size (40px) */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-neutral-800 shadow flex-shrink-0">
                      {livePreviewUrl ? (
                        <img src={livePreviewUrl} alt="40px preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-700 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold">Posts / Tweets</div>
                      <div className={`text-[11px] ${textMuted}`}>Timeline Avatar (40px)</div>
                    </div>
                  </div>

                  {/* Reply size (28px) */}
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 bg-neutral-800 shadow flex-shrink-0">
                      {livePreviewUrl ? (
                        <img src={livePreviewUrl} alt="28px preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-neutral-700 animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold">Navigation & Menu</div>
                      <div className={`text-[11px] ${textMuted}`}>Small Avatar (28px)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls: Zoom slider, rotate, reset, change image */}
              <div className={`p-4 rounded-2xl ${cardBg} border ${borderCol} space-y-3`}>
                {/* Zoom row */}
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-semibold ${textMuted} w-16`}>Zoom</span>
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.max(1.0, s - 0.1))}
                    className="w-7 h-7 rounded-full bg-neutral-500/20 hover:bg-neutral-500/30 flex items-center justify-center font-bold text-xs"
                    title="Zoom out"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1.0"
                    max="3.5"
                    step="0.02"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="flex-1 accent-[#1d9bf0] cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setScale((s) => Math.min(3.5, s + 0.1))}
                    className="w-7 h-7 rounded-full bg-neutral-500/20 hover:bg-neutral-500/30 flex items-center justify-center font-bold text-xs"
                    title="Zoom in"
                  >
                    +
                  </button>
                  <span className={`text-xs ${textMuted} w-12 text-right font-mono`}>
                    {Math.round(scale * 100)}%
                  </span>
                </div>

                {/* Secondary tools: Rotate, Reset, Change Image */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-500/10">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-500/15 hover:bg-neutral-500/25 transition-colors flex items-center space-x-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24L21 7" />
                        <path d="M21 3v4h-4" />
                      </svg>
                      <span>Rotate (90°)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScale(1);
                        setPosition({ x: 0, y: 0 });
                        setRotation(0);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-500/15 hover:bg-neutral-500/25 transition-colors flex items-center space-x-1"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                      <span>Reset</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`text-xs font-medium text-[#1d9bf0] hover:underline flex items-center space-x-1`}
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    <span>Choose Different Image</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`px-5 py-3.5 flex items-center justify-between ${headerBg} sticky bottom-0 z-20`}>
          <div>
            {hasActivePreview && (
              <button
                type="button"
                onClick={handleRemovePreview}
                className="px-3.5 py-2 rounded-full text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20 flex items-center space-x-1.5"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Remove Preview</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-full text-xs font-semibold ${cardBg} border ${borderCol} hover:bg-neutral-500/20 transition-colors`}
            >
              Cancel
            </button>

            {imageSrc && (
              <button
                type="button"
                disabled={isApplying || !livePreviewUrl}
                onClick={handleApply}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isApplying ? (
                  <span>Applying...</span>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Apply Preview</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer / Credits */}
        <div className={`px-5 py-2.5 text-center text-xs border-t ${borderCol} ${headerBg} flex items-center justify-center gap-1`}>
          <span className={textMuted}>Created by</span>
          <a
            href="https://x.com/sezeriltekin"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#1d9bf0] hover:underline"
          >
            @sezeriltekin
          </a>
        </div>
      </div>
    </div>
  );
};
