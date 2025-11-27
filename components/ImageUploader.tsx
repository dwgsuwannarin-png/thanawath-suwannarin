import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  onImageSelect: (data: ImageData | null) => void;
  selectedImage: ImageData | null;
  compact?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedImage, compact = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onImageSelect({
        base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          className={`
            relative w-full rounded-lg border border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center cursor-pointer group
            ${compact ? 'h-32 bg-zinc-900 border-zinc-700 hover:border-zinc-500' : 'h-64 border-zinc-700 bg-zinc-900'}
          `}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="bg-zinc-800 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform duration-300">
            <Upload className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-zinc-400 group-hover:text-indigo-400 transition-colors`} />
          </div>
          <p className="text-zinc-500 text-xs text-center px-2">
            {compact ? "Click to upload image" : "Click or drag image here"}
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />
        </div>
      ) : (
        <div className={`relative w-full rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 group ${compact ? 'h-32' : 'h-64'}`}>
          <img 
            src={selectedImage.base64} 
            alt="Source" 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm transform hover:scale-110 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> Image Loaded
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;