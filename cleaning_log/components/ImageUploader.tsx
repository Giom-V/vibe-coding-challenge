import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  disabled: boolean;
}

/**
 * Asynchronously resizes an image file to a maximum dimension while maintaining aspect ratio.
 * @param {File} file The image file to resize.
 * @returns {Promise<File>} A promise that resolves to the resized image file.
 */
const resizeImage = async (file: File): Promise<File> => {
    const MAX_DIMENSION = 1200;
    
    // Use createImageBitmap for efficient image decoding in a worker thread
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    // If the image is already small enough, no need to resize
    if (Math.max(width, height) <= MAX_DIMENSION) {
        bitmap.close(); // Good practice to release memory
        return file;
    }

    // Calculate new dimensions while maintaining aspect ratio
    let newWidth = width;
    let newHeight = height;
    if (width > height) {
        newWidth = MAX_DIMENSION;
        newHeight = Math.round(height * (MAX_DIMENSION / width));
    } else {
        newHeight = MAX_DIMENSION;
        newWidth = Math.round(width * (MAX_DIMENSION / height));
    }

    // Use a canvas to perform the resize operation
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        bitmap.close();
        // If canvas context cannot be created, return original file as a fallback
        return file;
    }

    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
    bitmap.close(); // Release memory after drawing

    // Convert canvas content to a Blob
    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9); // Use high quality JPEG
    });

    if (!blob) {
        // If blob creation fails, return original file as a fallback
        return file;
    }
    
    // Create a new File object from the resized blob
    return new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // State for resize feedback

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    if (stream || disabled) return;
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("L'accès à la caméra a été refusé. Veuillez l'autoriser dans les paramètres de votre navigateur.");
      setMode('upload'); // Fallback to upload mode
    }
  }, [stream, disabled]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (mode === 'camera' && !preview && !disabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, preview, disabled, startCamera, stopCamera]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [stream]);


  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth > 0) {
      const MAX_DIMENSION = 1200;
      let { videoWidth: width, videoHeight: height } = video;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "checklist.jpg", { type: "image/jpeg" });
            onImageSelect(file);
            setPreview(URL.createObjectURL(file));
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  }, [onImageSelect, stopCamera]);

  const handleClear = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onImageSelect(null);
  }, [preview, onImageSelect]);

  const switchMode = (newMode: 'camera' | 'upload') => {
    if (disabled || isProcessing || mode === newMode) return;
    handleClear();
    setMode(newMode);
  };
  
  const handleFile = useCallback(async (file: File | null) => {
    handleClear();
    if (!file || !file.type.startsWith('image/')) {
        return;
    }

    setIsProcessing(true);
    try {
        const resizedFile = await resizeImage(file);
        onImageSelect(resizedFile);
        setPreview(URL.createObjectURL(resizedFile));
    } catch (error) {
        console.error("Échec du redimensionnement de l'image:", error);
        // Fallback: use the original file if resizing fails
        onImageSelect(file);
        setPreview(URL.createObjectURL(file));
    } finally {
        setIsProcessing(false);
    }
  }, [onImageSelect, handleClear]);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (disabled || isProcessing) return;
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, [disabled, isProcessing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (disabled || isProcessing) return;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [disabled, handleFile, isProcessing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isProcessing) return;
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const activeButtonStyle = "border-indigo-600 bg-indigo-50 text-indigo-700";
  const inactiveButtonStyle = "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700";

  return (
    <div className="w-full">
       <div className="flex justify-center border-b border-slate-200">
        <button
          onClick={() => switchMode('camera')}
          disabled={disabled || isProcessing}
          className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors duration-200 disabled:cursor-not-allowed ${mode === 'camera' ? activeButtonStyle : inactiveButtonStyle}`}
        >
          <CameraIcon className="w-5 h-5" />
          Prendre une photo
        </button>
        <button
          onClick={() => switchMode('upload')}
          disabled={disabled || isProcessing}
          className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors duration-200 disabled:cursor-not-allowed ${mode === 'upload' ? activeButtonStyle : inactiveButtonStyle}`}
        >
          <UploadIcon className="w-5 h-5" />
          Télécharger un fichier
        </button>
      </div>

      <div className="mt-6">
        {preview ? (
          <div className="relative aspect-[3/4] max-w-sm mx-auto">
            <img src={preview} alt="Aperçu de la checklist" className="w-full h-full object-contain rounded-lg shadow-md" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
              <button
                onClick={handleClear}
                disabled={disabled || isProcessing}
                className="px-4 py-2 bg-white text-slate-800 font-bold rounded-lg shadow-lg hover:bg-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
              >
                Changer la photo
              </button>
            </div>
          </div>
        ) : mode === 'camera' ? (
          <div className="relative aspect-[3/4] max-w-sm mx-auto bg-slate-900 rounded-lg overflow-hidden shadow-lg">
            {cameraError ? (
              <div className="w-full h-full flex flex-col justify-center items-center text-center p-4">
                <p className="text-red-400">{cameraError}</p>
                <button onClick={() => switchMode('upload')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
                  Utiliser le téléchargement
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  playsInline
                  muted
                  autoPlay
                />
                {!stream && (
                    <div className="absolute inset-0 flex justify-center items-center">
                        <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
                  <button
                    onClick={handleCapture}
                    disabled={disabled || !stream || isProcessing}
                    className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    aria-label="Prendre une photo"
                  ></button>
                </div>
              </>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>
        ) : (
          <div
            className={`relative p-8 border-2 border-dashed rounded-lg text-center transition-colors duration-300 ${isProcessing ? 'cursor-wait bg-slate-100' : (dragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50')}`}
            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept="image/*"
              disabled={disabled || isProcessing}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-slate-600 font-semibold">Traitement de l'image...</p>
                </>
              ) : (
                <>
                  <UploadIcon className="w-10 h-10 text-slate-400" />
                  <p className="text-slate-600">
                    <span className="font-semibold text-indigo-600">Cliquez pour télécharger</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, etc.</p>
                </>
              )}
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
