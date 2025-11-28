
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Download, Loader2, AlertCircle, 
  RotateCcw, RotateCw, Undo, Redo, 
  Maximize, Share2, RefreshCw, 
  MoveHorizontal, ScanEye, GripVertical 
} from 'lucide-react';
import { AppStatus, GenerationResult, ImageData } from '../types';

interface GeneratedImageProps {
  status: AppStatus;
  result: GenerationResult | null;
  error: string | null;
  onReset?: () => void;
  selectedImage: ImageData | null;
  
  // Masking Props
  isMaskMode: boolean;
  brushSize: number;
  brushColor: string;
  onMaskChange: (base64Mask: string | null) => void;
  triggerUndo: number; // Increment to trigger undo
}

const GeneratedImage: React.FC<GeneratedImageProps> = ({ 
  status, 
  result, 
  error, 
  onReset, 
  selectedImage,
  isMaskMode,
  brushSize,
  brushColor,
  onMaskChange,
  triggerUndo
}) => {
  // Image transformation state
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  
  // Compare Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  
  // Masking Refs & State
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]); // Store dataURLs

  // Reset states when result changes
  useEffect(() => {
    setRotation(0);
    setFlipH(false);
    setIsCompareMode(false);
    setSliderPosition(50);
    clearCanvas();
  }, [result, selectedImage]);

  // Handle Undo from Parent
  useEffect(() => {
    if (triggerUndo > 0 && history.length > 0) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current state
      const prevState = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (prevState) {
          const img = new Image();
          img.src = prevState;
          img.onload = () => ctx.drawImage(img, 0, 0);
          onMaskChange(prevState);
        } else {
          onMaskChange(null);
        }
      }
    }
  }, [triggerUndo]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
      onMaskChange(null);
    }
  };

  // Sync Canvas Size with Image
  const syncCanvasSize = useCallback(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (img && canvas) {
      if (img.width > 0 && img.height > 0) {
          canvas.width = img.width;
          canvas.height = img.height;
      }
    }
  }, []);

  // Listen for window resize to resync canvas
  useEffect(() => {
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [syncCanvasSize]);

  // --- SLIDER DRAG HANDLERS ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    e.stopPropagation();
  };

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }
    
    // Calculate percentage position
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, [isDragging]);

  // Attach global listeners for dragging (so you can drag outside the handle)
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);


  // --- DRAWING HANDLERS ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMaskMode || isCompareMode) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isMaskMode || !isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
       const dataUrl = canvas.toDataURL();
       setHistory(prev => [...prev, dataUrl]);
       onMaskChange(dataUrl);
    }
    
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMaskMode || !isDrawing || isCompareMode) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

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

  // Determine what to show
  const displayImageUrl = result?.imageUrl || selectedImage?.base64;
  const isGeneratedResult = !!result?.imageUrl;
  
  // Transform style object
  const transformStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
    transition: 'transform 0.3s ease-in-out'
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      
      {/* LOADING STATE */}
      {status === AppStatus.LOADING && (
        <div className="flex flex-col items-center justify-center p-6 absolute inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="relative mb-6">
             <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full animate-pulse"></div>
             <Loader2 className="relative w-12 h-12 text-indigo-400 animate-spin" />
          </div>
          <p className="text-white/90 font-medium text-lg animate-pulse">AI is rendering...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {status === AppStatus.ERROR && (
        <div className="flex flex-col items-center justify-center p-8 bg-red-950/30 border border-red-500/20 rounded-xl max-w-md text-center backdrop-blur-sm absolute z-50">
          <div className="bg-red-500/20 p-3 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-red-300 font-medium mb-1">Generation Failed</h3>
          <p className="text-red-200/60 text-sm">{error || "Something went wrong. Please try again."}</p>
        </div>
      )}

      {/* IDLE PLACEHOLDER */}
      {status === AppStatus.IDLE && !displayImageUrl && (
        <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ScanEye className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-white/80 font-medium text-lg mb-2">Ready to Render</h3>
          <p className="text-white/40 max-w-xs mx-auto text-sm">Upload a reference image on the left to begin.</p>
        </div>
      )}

      {/* IMAGE VIEWER */}
      {displayImageUrl && (
        <div className="flex flex-col items-center w-full h-full p-4">
          
          {/* IMAGE CONTAINER */}
          <div 
            id="generated-image-container"
            className={`relative flex-1 w-full flex items-center justify-center overflow-hidden ${isGeneratedResult ? 'mb-20' : ''}`}
          >
             <div ref={containerRef} className="relative inline-block max-w-full max-h-full select-none">
                
                {/* 
                   COMPARE MODE LOGIC:
                   Layer 1 (Bottom): Original Image (Left side logic implies Before)
                   Layer 2 (Top): Generated Image (Right side logic implies After) 
                   We clip Layer 2 from the LEFT based on slider position.
                   
                   Actually, standard "Before | After" slider:
                   - Left Side is Before. Right Side is After.
                   - So Bottom Layer = After (Full).
                   - Top Layer = Before (Clipped). 
                   - Dragging slider to Right reveals more Before (Top Layer).
                */}
                
                {isCompareMode && selectedImage && result?.imageUrl ? (
                   <>
                      {/* Bottom Layer: Generated Result (After) - Visible on Right */}
                      <img 
                        src={result.imageUrl} 
                        alt="After" 
                        className="block max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        style={transformStyle}
                      />
                      
                      {/* Top Layer: Original (Before) - Visible on Left, Clipped */}
                      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%`, transition: 'width 0.05s linear' }}>
                         <img 
                           src={selectedImage.base64} 
                           alt="Before" 
                           className="block w-full h-full object-contain" // inner img needs full size relative to container to align
                           // However, object-contain inside a div that changes width might shift if aspect ratios differ?
                           // Best approach for perfect alignment:
                           // Both images must be strictly same size. object-contain usually ensures they fit the parent box.
                           // The parent div 'containerRef' is sized by the bottom img.
                           // The top img is absolute inset-0.
                           style={{ ...transformStyle, width: containerRef.current?.offsetWidth, height: containerRef.current?.offsetHeight }} 
                         />
                      </div>
                      {/* Fallback for responsive resizing: use clip-path instead of div width for better alignment? 
                          clip-path: inset(0 calc(100% - X%) 0 0) means "Show X% from left".
                          This is cleaner than nested divs for images.
                      */}
                   </>
                ) : (
                   /* STANDARD SINGLE IMAGE VIEW */
                   <img 
                      ref={imageRef}
                      src={displayImageUrl} 
                      alt="Display" 
                      onLoad={syncCanvasSize}
                      style={transformStyle}
                      className={`block max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border-4 ${isGeneratedResult ? 'border-zinc-400/30' : 'border-zinc-800'}`}
                    />
                )}
                
                {/* RE-IMPLEMENTING COMPARE LAYERS WITH CLIP-PATH FOR BETTER STABILITY */}
                {isCompareMode && selectedImage && result?.imageUrl && (
                   <>
                      {/* Overwrite the logic above to ensure strict stacking */}
                      {/* Base: Result (After) */}
                      <img 
                        src={result.imageUrl} 
                        alt="After" 
                        className="absolute inset-0 w-full h-full object-contain rounded-lg pointer-events-none"
                        style={transformStyle}
                      />
                      
                      {/* Overlay: Original (Before) - Clipped to show Left Side */}
                      <img 
                        src={selectedImage.base64} 
                        alt="Before" 
                        className="absolute inset-0 w-full h-full object-contain rounded-lg pointer-events-none"
                        style={{
                           ...transformStyle,
                           clipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)` // Show from 0 to slider%
                        }}
                      />

                      {/* Labels */}
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white/70 font-bold border border-white/10 pointer-events-none">BEFORE</div>
                      <div className="absolute top-4 right-4 bg-orange-500/50 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-bold border border-white/10 pointer-events-none">AFTER</div>

                      {/* Slider Handle */}
                      <div 
                        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_10px_rgba(0,0,0,0.5)] touch-none"
                        style={{ left: `${sliderPosition}%` }}
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                      >
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-xl text-zinc-900 border-4 border-zinc-900/10">
                            <GripVertical size={16} />
                         </div>
                      </div>
                   </>
                )}
                
                {/* CANVAS OVERLAY (Masking) - Hide in Compare Mode */}
                {!isCompareMode && (
                  <canvas
                    ref={canvasRef}
                    className={`absolute top-0 left-0 w-full h-full cursor-crosshair touch-none ${isMaskMode ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                )}
             </div>
            
            {/* Label for Source Image Mode */}
            {!isGeneratedResult && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs text-white/70 font-medium border border-white/10 pointer-events-none">
                 Original Source
               </div>
            )}
          </div>

          {/* FLOATING ACTION TOOLBAR */}
          {isGeneratedResult && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-max max-w-[95vw]">
               <div className="bg-[#18181b]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-2 py-2 flex items-center gap-1 shadow-2xl overflow-x-auto no-scrollbar">
                  
                  {/* UNDO/REDO */}
                  <div className="flex items-center px-2 gap-1 text-zinc-500">
                     <button className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors" title="Undo visual only"><Undo size={18} /></button>
                     <button className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors"><Redo size={18} /></button>
                  </div>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  
                  {/* TRANSFORMS */}
                  <div className="flex items-center px-2 gap-1 text-zinc-400">
                     <button onClick={handleRotateLeft} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors"><RotateCcw size={18} /></button>
                     <button onClick={handleRotateRight} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors"><RotateCw size={18} /></button>
                     <button onClick={handleFlipHorizontal} className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-colors"><MoveHorizontal size={18} /></button>
                  </div>
                  <div className="w-px h-6 bg-white/10 mx-1"></div>

                  {/* COMPARE TOGGLE */}
                  {selectedImage && (
                    <div className="flex items-center px-2">
                       <button 
                         onClick={() => setIsCompareMode(!isCompareMode)}
                         className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isCompareMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                         title="Compare Before/After"
                       >
                         <ScanEye size={18} /> 
                         <span className="hidden sm:inline">{isCompareMode ? 'Comparing' : 'Compare'}</span>
                       </button>
                    </div>
                  )}

                  <div className="w-px h-6 bg-white/10 mx-1"></div>
                  
                  {/* DOWNLOAD & RESET */}
                  <div className="flex items-center px-2 gap-2">
                     <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                       <Download size={14} /> <span className="hidden sm:inline">Download</span>
                     </button>
                  </div>
                  {onReset && (
                     <>
                       <div className="w-px h-6 bg-white/10 mx-1"></div>
                       <button onClick={onReset} className="p-2 mx-1 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
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

const ScanEyeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3" /><path d="M12 16v5" /><path d="M12 3v5" /><path d="M3 12h5" /><path d="M16 12h5" />
  </svg>
);

export default GeneratedImage;
