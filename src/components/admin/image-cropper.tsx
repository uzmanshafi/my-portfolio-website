"use client";

// Image cropper component for profile image editing
// Uses react-easy-crop for intuitive cropping UI

import { useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (blob: Blob) => void;
  onCancel: () => void;
  aspect?: number; // Default: 1 (square). For OG images use 1200/630
  cropShape?: "round" | "rect"; // Default: "round" for profile images
}

/**
 * Get cropped image as a Blob from canvas
 * Creates a canvas, draws the cropped region, and returns as JPEG blob
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  // Create image element to load the source
  const image = await createImage(imageSrc);

  // Create canvas for cropping
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Set canvas size to the crop dimensions
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped region onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

/**
 * Create an image element from a source URL
 * Sets crossOrigin to avoid tainted canvas issues
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = url;
  });
}

/**
 * Image cropper modal component
 * Allows user to crop an image with configurable aspect ratio and shape.
 * Defaults to 1:1 square with round crop for profile images.
 * For OG images, use aspect={1200/630} and cropShape="rect".
 */
export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspect = 1,
  cropShape = "round",
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle crop area change
  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Handle save button click
  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error("Failed to crop image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Crop profile image"
    >
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-lg overflow-hidden shadow-xl"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {/* Cropper area */}
        <div className="relative h-80 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Zoom slider */}
          <div className="flex items-center gap-4">
            <label
              htmlFor="zoom-slider"
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
            >
              Zoom
            </label>
            <input
              id="zoom-slider"
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((zoom - 1) / 2) * 100}%, rgba(243, 233, 226, 0.2) ${((zoom - 1) / 2) * 100}%, rgba(243, 233, 226, 0.2) 100%)`,
              }}
            />
            <span
              className="text-sm w-10 text-right"
              style={{ color: "var(--color-text)", opacity: 0.7 }}
            >
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "transparent",
                color: "var(--color-text)",
                border: "1px solid rgba(243, 233, 226, 0.3)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing || !croppedAreaPixels}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-text)",
                opacity: isProcessing || !croppedAreaPixels ? 0.6 : 1,
              }}
            >
              {isProcessing ? "Processing..." : "Save Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
