import React, { useState, useEffect } from 'react';
import { 
  Download, Loader2, AlertCircle, 
  RotateCcw, RotateCw, Undo, Redo, 
  Maximize, Share2, RefreshCw, 
  MoveHorizontal 
} from 'lucide-react';
import { AppStatus, GenerationResult, ImageData } from '../types';

interface GeneratedImageProps {
  status: AppStatus;
  result: GenerationResult | null;
  error: string | null;
  onReset?: () => void;
  selectedImage: ImageData | null;
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ status, result, error, onReset, selectedImage }) => {
  // Image transformation state
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);

  // Reset transforms when result changes
  useEffect(() => {
    setRotation(0);
    setFlipH(false);
  }, [result]);

  const handleDownload = () => {
    if (result?.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `render-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRotateLeft = () => setRotation(prev => prev - 90);
  const handleRotateRight = () => setRotation(prev => prev + 90);
  const handleFlipHorizontal = () => setFlipH(prev => !prev);
  const handleFullscreen = () => {
    const elem = document.getElementById('generated-image-container');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Determine what to show
  // If result exists, show result. If not, but selectedImage exists (e.g. idle or reset), show source.
  const displayImageUrl = result?.imageUrl || selectedImage?.base64;
  const isGeneratedResult = !!result?.imageUrl;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      
      {/* LOADING STATE - Takes Precedence */}
      {status === AppStatus.LOADING && (
        <div className="flex flex-col items-center justify-center p-6">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse"></div>
             <Loader2 className="relative w-12 h-12 text-indigo-400 animate-spin" />
          </div>
          <p className="text-white/90 font-medium text-lg animate-pulse">AI is rendering...</p>
          <p className="text-white/50 text-sm mt-2">Transforming architecture & details</p>
        </div>
      )}

      {/* ERROR STATE */}
      {status === AppStatus.ERROR && (
        <div className="flex flex-col items-center justify-center p-8 bg-red-950/30 border border-red-500/20 rounded-xl max-w-md text-center backdrop-blur-sm">
          <div className="bg-red-500/20 p-3 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-red-300 font-medium mb-1">Generation Failed</h3>
          <p className="text-red-200/60 text-sm">{error || "Something went wrong. Please try again."}</p>
        </div>
      )}

      {/* IDLE PLACEHOLDER - Only if no image is selected at all */}
      {status === AppStatus.IDLE && !displayImageUrl && (
        <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <SparklesIcon className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-white/80 font-medium text-lg mb-2">Ready to Render</h3>
          <p className="text-white/40 max-w-xs mx-auto text-sm">Upload a reference image on the left and choose a preset to begin.</p>
        </div>
      )}

      {/* IMAGE VIEWER - Shows either Result or Source */}
      {status !== AppStatus.LOADING && status !== AppStatus.ERROR && displayImageUrl && (
        <div className="flex flex-col items-center w-full h-full">
          
          {/* IMAGE CONTAINER */}
          <div 
            id="generated-image-container"
            className={`relative flex-1 w-full flex items-center justify-center overflow-hidden ${isGeneratedResult ? 'mb-20' : ''}`}
          >
            {/* If it's a text-only result (unlikely for this app but handled) */}
            {isGeneratedResult && !result?.imageUrl && result?.text ? (
               <div className="p-8 text-zinc-300 overflow-y-auto bg-black/50 rounded-xl border border-zinc-800 max-h-full max-w-2xl">
                {result.text}
              </div>
            ) : (
              <img 
                src={displayImageUrl} 
                alt="Display" 
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  transition: 'transform 0.3s ease-in-out'
                }}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl border-4 ${isGeneratedResult ? 'border-zinc-400/30' : 'border-zinc-800'}`}
              />
            )}
            
            {/* Label for Source Image Mode */}
            {!isGeneratedResult && (
               <div className="absolute top-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs text-white/70 font-medium border border-white/10">
                 Original Source
               </div>
            )}
          </div>

          {/* FLOATING ACTION TOOLBAR - Only visible when we have a generated result */}
          {isGeneratedResult && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
               <div className="bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl">
                  
                  {/* 1. History (Visual only) */}
                  <div className="flex items-center px-2 gap-1 text-zinc-500">
                     <button className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Undo">
                       <Undo size={18} />
                     </button>
                     <button className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Redo">
                       <Redo size={18} />
                     </button>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  {/* 2. Transform Controls */}
                  <div className="flex items-center px-2 gap-1 text-zinc-400">
                     <button onClick={handleRotateLeft} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Rotate Left">
                       <RotateCcw size={18} />
                     </button>
                     <button onClick={handleRotateRight} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Rotate Right">
                       <RotateCw size={18} />
                     </button>
                     <button onClick={handleFlipHorizontal} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Flip Horizontal">
                       <MoveHorizontal size={18} />
                     </button>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  {/* 3. View / Upscale */}
                  <div className="flex items-center px-2 gap-3 text-zinc-400">
                     <button onClick={handleFullscreen} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Fullscreen">
                       <Maximize size={18} />
                     </button>
                     <div className="flex flex-col items-center justify-center leading-none select-none opacity-80">
                        <span className="text-[10px] font-bold text-white tracking-wider">ขยายภาพ</span>
                        <span className="text-[9px] font-black text-white/50">4K</span>
                     </div>
                  </div>

                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  {/* 4. Actions: Share & Download */}
                  <div className="flex items-center px-2 gap-2">
                     <button className="p-2 text-zinc-400 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Share">
                       <Share2 size={18} />
                     </button>
                     <button 
                       onClick={handleDownload}
                       className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                     >
                       <Download size={14} />
                       <span>ดาวน์โหลด</span>
                     </button>
                  </div>

                  {/* 5. Reset / Re-run */}
                  {onReset && (
                     <>
                       <div className="w-px h-6 bg-white/10 mx-1"></div>
                       <button 
                         onClick={onReset}
                         className="p-2 mx-1 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all" 
                         title="Reset Settings"
                       >
                         <RefreshCw size={18} />
                       </button>
                     </>
                  )}

               </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

// Helper icon component
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default GeneratedImage;