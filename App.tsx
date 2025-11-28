import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import { AppStatus, ImageData, GenerationResult } from './types';
import { generateImageFromReference, enhancePrompt as enhancePromptService } from './services/geminiService';
import { Wand2, Sparkles, Zap, Cpu, Settings2, ImagePlus, Globe, Key, Link, Brush, Undo2, RefreshCw, PenTool, Image as ImageIcon, BookOpen, Loader2 } from 'lucide-react';

// Translations
const TRANSLATIONS = {
  EN: {
    aiSettings: "AI Settings",
    aiModel: "AI Model",
    fastEfficient: "Fast & Efficient",
    highQuality: "High Quality",
    apiKey: "API Key",
    getKey: "Get Key",
    pasteKey: "Paste Gemini API Key...",
    exterior: "EXTERIOR",
    interior: "INTERIOR",
    plan: "PLAN",
    mainImage: "Main Image (Structure)",
    required: "Required",
    promptLabel: "Prompt (Command)",
    promptPlaceholder: "Describe what you want to change...",
    enhanceButton: "Magic Enhance",
    enhancing: "Improving...",
    refineLabel: "Additional Command (Refine)",
    refinePlaceholder: "Add details to the generated image (e.g. add a red car, change sky color)...",
    styleReference: "Style Reference",
    optional: "Optional",
    quickPrompts: "Quick Prompts",
    generate: "Generate Render",
    rendering: "Rendering...",
    newProject: "NEW PROJECT",
    mode: "MODE",
    startNew: "Start a new project? Current progress will be lost.",
    enterKey: "Please connect your Google Gemini API Key.",
    enterPrompt: "Please enter a prompt or select a preset.",
    unexpectedError: "An unexpected error occurred during generation.",
    brushTool: "Brush Tool (Edit)",
    brushSize: "Size",
    brushColor: "Color",
    undo: "Undo",
    apiKeyStatus: "API Key Status",
    connected: "Connected",
    customRules: "My Style (AI Memory)",
    customRulesPlaceholder: "Teach AI your preference here. E.g., 'Always use warm lighting, modern luxury style, 8k resolution.' (This will be applied to every generation)"
  },
  TH: {
    aiSettings: "ตั้งค่า AI",
    aiModel: "โมเดล AI",
    fastEfficient: "รวดเร็ว & ประหยัด",
    highQuality: "คุณภาพสูง",
    apiKey: "คีย์ API",
    getKey: "รับคีย์",
    pasteKey: "วาง Gemini API Key ที่นี่...",
    exterior: "ภายนอก",
    interior: "ภายใน",
    plan: "แปลน",
    mainImage: "รูปภาพหลัก (โครงสร้าง)",
    required: "จำเป็น",
    promptLabel: "คำสั่ง (Prompt)",
    promptPlaceholder: "อธิบายสิ่งที่ต้องการแก้ไข...",
    enhanceButton: "เสกคำสั่งสวย (AI ช่วยเขียน)",
    enhancing: "กำลังปรับปรุง...",
    refineLabel: "คำสั่งเพิ่มเติม (ปรับแต่งต่อจากรูปที่ได้)",
    refinePlaceholder: "พิมพ์เพื่อเพิ่มรายละเอียดลงในรูปที่สร้างเสร็จแล้ว (เช่น เติมรถสีแดง, เปลี่ยนสีท้องฟ้า)...",
    styleReference: "รูปอ้างอิงสไตล์",
    optional: "ไม่บังคับ",
    quickPrompts: "สไตล์ตัวอย่าง (เลือกใช้)",
    generate: "สร้างรูปภาพ",
    rendering: "กำลังประมวลผล...",
    newProject: "โปรเจคใหม่",
    mode: "โหมด",
    startNew: "เริ่มโปรเจคใหม่หรือไม่? ข้อมูลปัจจุบันจะหายไป",
    enterKey: "กรุณาเชื่อมต่อ Google Gemini API Key ก่อนใช้งาน",
    enterPrompt: "กรุณากรอกคำสั่งหรือเลือกคำสั่งด่วน",
    unexpectedError: "เกิดข้อผิดพลาดในการสร้างรูปภาพ",
    brushTool: "แปรงแก้ไข (ระบายตำแหน่ง)",
    brushSize: "ขนาด",
    brushColor: "สี",
    undo: "ย้อนกลับ",
    apiKeyStatus: "สถานะคีย์ API",
    connected: "เชื่อมต่อแล้ว",
    customRules: "สไตล์ของฉัน (ความจำ AI)",
    customRulesPlaceholder: "สอนให้ AI จำสไตล์ของคุณที่นี่ เช่น 'ชอบแสงอุ่นๆ, สไตล์โมเดิร์นลักชูรี่, ขอภาพชัดระดับ 8k เสมอ' (ข้อความนี้จะถูกแนบไปกับทุกคำสั่ง)"
  }
};

// --- PRESET DATA ---
const EXTERIOR_PRESETS = [
  { id: 'luxury-nordic-masterpiece', label: '⭐ LUXURY NORDIC (MASTER)', subtitle: 'Detailed Landscape & Driveway', thSubtitle: 'บ้านหรูนอร์ดิก (เน้นรายละเอียด)', prompt: 'Architectural Masterpiece. A grand modern Nordic house with a high gable roof, white walls, and grey stone accents. A wide, meticulously detailed cobblestone or stamped concrete driveway leads to a spacious garage (featuring luxury cars parked). The foreground is lush and vibrant, featuring colorful flower beds (reds, oranges, yellows) lining the driveway, and a perfectly manicured green lawn. Framed by tall, mature tropical trees providing depth. Bright, sunny, high-contrast professional photography style with sharp shadows. 8k, ultra-realistic.' },
  { id: 'sketch-to-photo', label: 'SKETCH TO PHOTO', subtitle: 'Convert sketch to realism', thSubtitle: 'แปลงภาพร่างเป็นภาพจริง', prompt: 'Convert this architectural sketch into a photorealistic rendering. High detail, realistic lighting, natural materials, clear blue sky.' },
  { id: 'modern-tropical-luxury', label: 'MODERN TROPICAL', subtitle: 'Luxury White & Green', thSubtitle: 'บ้านหรูโมเดิร์นทรอปิคอล', prompt: 'High-end Modern Tropical & Nordic-inspired Architecture. Pristine white stucco exterior walls with subtle grey stone accents. Steep gable roofs with dark grey tiles. Large, expansive floor-to-ceiling glass windows and doors connecting indoor and outdoor spaces. The house sits on a meticulously manicured vibrant green lawn. Landscaping includes mature tropical trees (like rain trees or palm trees) providing shade, low hedges, and colorful flower beds. A wide, clean concrete driveway leads to the house. The atmosphere is serene, luxurious, and bright with clear natural daylight and a blue sky. Photorealistic architectural rendering, 8k resolution.' },
  { id: 'lakeside-farmhouse', label: 'LAKESIDE FARMHOUSE', subtitle: 'Modern Cabin', thSubtitle: 'บ้านโมเดิร์นริมทะเลสาบ', prompt: 'Minimalist Modern Farmhouse Architecture, stunning lakeside house, single-story, long gabled form, exterior clad in natural light-toned vertical wood siding, steep-pitched dark grey metal roof, tall black-framed glass sliding doors.' },
  { id: 'modern-rustic-luxury', label: 'MODERN RUSTIC', subtitle: 'Luxurious Stone & Wood', thSubtitle: 'บ้านหรูสไตล์รัสติก', prompt: 'Subject: A stunning two-story contemporary rustic home, nestled harmoniously within a natural landscape. Architecture: Multi-faceted design with clean lines, mixing traditional gable and mono-pitch roofs with wide overhangs. Exterior walls feature irregular stone masonry and warm natural wood siding. Dark standing-seam metal roof. Windows: Expansive floor-to-ceiling windows with dark frames, allowing warm interior light to spill out. Lighting: Twilight/Dusk setting. Warm interior glow, exterior up-lighting highlighting stone textures. Landscape: Lush natural landscape, curving flagstone pathway, manicured lawns mixed with wilder ornamental grasses and mature trees.' },
  { id: 'nordic-barn', label: 'NORDIC BARN', subtitle: 'Modern White & Dark', thSubtitle: 'บ้านสไตล์นอร์ดิก', prompt: 'A bright, sunny outdoor scene showcasing a pristine, expansive green lawn that dominates the foreground and extends towards the background. To the left, a large, mature tree with visible roots and a supportive wooden structure stands prominently, casting soft shadows. In the mid-ground, a sleek, rectangular swimming pool with clear blue water is bordered by a narrow, well-maintained garden bed featuring small green bushes and delicate white flowers. A clean, grey concrete walkway/patio area leads up to the house entrance, connecting seamlessly with a wide, grey concrete driveway on the right side of the frame. The background is filled with various healthy green trees of different sizes and species, creating a lush canopy, along with a neatly trimmed dark green hedge that separates the property from adjacent houses, which are subtly visible in the distance. The overall atmosphere is one of serenity, modernity, and natural beauty, under a clear, bright sky.' },
  { id: 'contemporary-stone-garden', label: 'CONTEMPORARY STONE', subtitle: 'Luxury Home & Zen Garden', thSubtitle: 'บ้านโมเดิร์นสวนญี่ปุ่น', prompt: 'A magnificent 2-story contemporary home, its facade a sophisticated blend of stone and dark wood accents, stands proudly amidst a lush, meticulously manicured garden. The architecture features clean lines, expansive windows that reflect the surrounding greenery, and an inviting wooden front door. A gracefully winding pathway of light-colored stone leads to the entrance, flanked by vibrant flower beds bursting with color and diverse shrubbery. Tall, mature trees with verdant canopies frame the house, providing both shade and a sense of established elegance.\n\nThe garden is a masterpiece of landscape design, showcasing a serene Japanese aesthetic. A large, ancient tree with a gnarled trunk dominates one section, its branches spreading wide. Below it, artfully placed large, smooth rocks create a natural focal point. Further into the garden, a perfectly sculpted bonsai tree, with its distinctive horizontal branches, adds to the tranquil atmosphere. The ground is a mosaic of soft green moss, precisely raked white gravel forming intricate patterns, and strategically placed flat stepping stones. Low-lying, rounded bushes add texture and depth to the serene environment.\n\nAnother view of the garden reveals a captivating series of meandering pathways that curve gracefully through rolling green lawns. These paths, made of light-colored paving stones, create a sense of discovery and flow. The lawns are bordered by exquisitely trimmed hedges and a variety of trees with elegant, arching branches, their leaves a fresh, vibrant green. Large, smooth boulders are nestled among the foliage, adding to the natural, harmonious feel. The overall impression is one of peaceful serenity, a perfectly sculpted natural oasis designed for quiet contemplation.' },
  { id: 'modern-mediterranean', label: 'MODERN MEDITERRANEAN', subtitle: 'Luxury White Stucco', thSubtitle: 'บ้านหรูสไตล์เมดิเตอร์เรเนียน', prompt: 'Elegant Classic European Mansion Architecture, grand two-story, perfect symmetry. Exterior in pale polished stone and pristine white stucco. Dark S-tile roof. Features multiple large arched windows with bold black metal frames, intricate black wrought-iron Juliet balconies, and a deeply recessed arched main entrance with ornate black wrought-iron glass doors. Fronted by an immaculately manicured formal French garden: straight driveway of pale stone pavers, bordered by low, tightly clipped boxwood hedges, flanked by tall, cone-shaped topiaries. Elegant urns and planters near the entrance. Bright natural daylight, soft defined shadows, high contrast. Straight-on, perfectly symmetrical eye-level full-shot. Ultra-high resolution, photorealistic architectural render.' },
  { id: 'bangkok-street', label: 'BANGKOK STREET', subtitle: 'Night Life', thSubtitle: 'สตรีทไลฟ์กรุงเทพฯ', prompt: 'Bangkok street photography, vibrant night life, neon signs, tuk-tuks, street food stalls, power lines silhouetted against the sky, cinematic lighting, cyberpunk atmosphere.' },
  { id: 'modern-min', label: 'MODERN MINIMALIST', subtitle: 'Clean & Simple', thSubtitle: 'โมเดิร์น มินิมอล', prompt: 'Ultra-minimalist Modern House Architecture, pristine white, single-story gabled house, smooth stark white concrete exterior, steep symmetrical gable roof.' },
  { id: 'pool-villa', label: 'POOL VILLA', subtitle: 'Luxury Vacation', thSubtitle: 'พูลวิลล่าหรู', prompt: 'A luxurious modern private pool villa with wide open architecture, large floor-to-ceiling glass walls, a sparkling infinity pool with crystal-clear water reflecting the sunlight. Bright and cheerful atmosphere with a clear blue sky, warm natural light, soft shadows, and lush tropical plants surrounding the villa. High-end outdoor furniture such as premium sunbeds and modern wooden tables. Ultra-detailed 8K clarity, cinematic lighting, crisp reflections on the water surface, relaxing yet elegant resort aesthetic, wide-angle lens composition.' },
];

const INTERIOR_PRESETS = [
  { id: 'modern-luxury-int', label: 'MODERN LUXURY', subtitle: 'High-end Living', thSubtitle: 'ห้องนั่งเล่นหรูหรา', prompt: 'Modern Luxury Living Room, spacious, double-height ceiling, marble flooring, large crystal chandelier, beige and gold color palette, plush velvet sofa, floor-to-ceiling windows.' },
  { id: 'japandi-int', label: 'JAPANDI STYLE', subtitle: 'Zen & Scandi', thSubtitle: 'เจแปนดิ (ญี่ปุ่น+สแกน)', prompt: 'Japandi Interior Design, bedroom, minimalist, light oak wood furniture, low platform bed, linen bedding, soft neutral tones (white, cream, beige), bonsai plant, rice paper lamp.' },
  { id: 'industrial-loft', label: 'INDUSTRIAL LOFT', subtitle: 'Raw & Edgy', thSubtitle: 'อินดัสเทรียล ลอฟท์', prompt: 'Industrial Loft Kitchen, exposed brick walls, concrete ceiling with exposed pipes, black metal pendant lights, reclaimed wood island, stainless steel appliances.' },
];

const PLAN_PRESETS = [
  { id: '2d-to-3d-floorplan', label: '2D TO 3D FLOORPLAN', subtitle: 'Basic 3D', thSubtitle: 'แปลน 2D เป็น 3D', prompt: 'Convert this 2D architectural floor plan into a clear 3D isometric floor plan render. White walls, realistic wooden flooring, basic furniture placement, soft top-down lighting, clean look.' },
  { id: 'realistic-plan', label: 'REALISTIC 3D PLAN', subtitle: 'Textured & Lit', thSubtitle: 'แปลน 3D สมจริง', prompt: 'High-quality 3D isometric floor plan rendering from 2D plan. Realistic textures, detailed furniture, shadows and lighting, ambient occlusion, modern interior design style.' }
];

const App: React.FC = () => {
  // STATE
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [styleImage, setStyleImage] = useState<ImageData | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'EXTERIOR' | 'INTERIOR' | 'PLAN'>('EXTERIOR');
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false); // State for prompt enhancement
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  // Custom Rules / Memory State - Initialize from LocalStorage
  const [customRules, setCustomRules] = useState(() => {
    return localStorage.getItem('render-ai-custom-rules') || '';
  });
  
  // Set DEFAULT MODEL to PRO for better quality
  const [model, setModel] = useState('gemini-3-pro-image-preview'); 
  const [language, setLanguage] = useState<'EN' | 'TH'>('TH');
  const [activePresets, setActivePresets] = useState(EXTERIOR_PRESETS);
  
  // Brush/Mask Tool State
  const [isMaskMode, setIsMaskMode] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#ef4444'); // Default Red
  const [maskData, setMaskData] = useState<string | null>(null);
  const [triggerUndo, setTriggerUndo] = useState(0);

  useEffect(() => {
    if (tab === 'EXTERIOR') setActivePresets(EXTERIOR_PRESETS);
    else if (tab === 'INTERIOR') setActivePresets(INTERIOR_PRESETS);
    else if (tab === 'PLAN') setActivePresets(PLAN_PRESETS);
  }, [tab]);

  // Save custom rules whenever they change
  useEffect(() => {
    localStorage.setItem('render-ai-custom-rules', customRules);
  }, [customRules]);

  const t = TRANSLATIONS[language];

  // --- APP HANDLERS ---
  
  // New Function to Enhance Prompt
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
        alert(t.enterPrompt);
        return;
    }
    
    // Check API Key
    if (!process.env.API_KEY && !(window as any).aistudio) {
        alert(t.enterKey);
        return;
    }

    setIsEnhancing(true);
    try {
        const enhanced = await enhancePromptService(prompt);
        setPrompt(enhanced);
    } catch (e) {
        console.error("Enhance failed", e);
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    // 1. Check & Prompt for API Key via aistudio interface if available
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
               await (window as any).aistudio.openSelectKey();
            } catch (err) {
               console.error("Failed to open key selector", err);
            }
        }
    }

    // 2. Fallback check for environment variable
    if (!process.env.API_KEY) {
      alert(t.enterKey);
      // Try to open selector again if possible
      if ((window as any).aistudio) {
         try { await (window as any).aistudio.openSelectKey(); } catch {}
      }
      return;
    }
    
    // Determine source image (Result or Original)
    let sourceImageToUse = selectedImage;
    let isRefinement = false;

    if (result?.imageUrl && (additionalPrompt.trim() || maskData)) {
       sourceImageToUse = {
         base64: result.imageUrl,
         mimeType: 'image/png' 
       };
       isRefinement = true;
    }

    if (!sourceImageToUse) {
      alert("Please upload an image first.");
      return;
    }
    
    // Construct final prompt
    let finalPrompt = prompt;
    
    // Append Custom Rules (The AI's "Memory")
    if (customRules.trim()) {
        finalPrompt += `\n\n[USER PREFERENCES/STYLE GUIDE]: ${customRules.trim()}`;
    }

    if (additionalPrompt.trim()) {
      finalPrompt += `\n\n${isRefinement ? 'Refinement Instructions:' : 'Additional Instructions:'} ${additionalPrompt}`;
    }
    
    if (!finalPrompt.trim()) {
      alert(t.enterPrompt);
      return;
    }

    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const genResult = await generateImageFromReference(
        sourceImageToUse.base64,
        sourceImageToUse.mimeType,
        finalPrompt,
        model,
        styleImage, // Pass Style Image here
        maskData // Pass the mask if it exists
      );

      setResult(genResult);
      setStatus(AppStatus.SUCCESS);
      // Turn off mask mode after successful generation to show result clearly
      setIsMaskMode(false);
      setMaskData(null);
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || t.unexpectedError);
      setStatus(AppStatus.ERROR);

      // Handle 403 / Permission errors by offering to change the key
      if (e.message && (e.message.includes('403') || e.message.includes('Permission'))) {
         if ((window as any).aistudio) {
            const shouldChange = confirm("Permission Denied: Your API Key may not support this model or is invalid. Would you like to select a new API Key?");
            if (shouldChange) {
                try { await (window as any).aistudio.openSelectKey(); } catch {}
            }
         }
      }
    }
  };

  const handleNewProject = () => {
    setPrompt('');
    setAdditionalPrompt('');
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    setIsMaskMode(false);
    setMaskData(null);
    setStyleImage(null);
  };

  const handleResetResult = () => {
     setResult(null);
     setStatus(AppStatus.IDLE);
     setError(null);
     setIsMaskMode(false);
     setMaskData(null);
  }

  // --- RENDER LOGIC ---

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-300 font-roboto overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[340px] flex-shrink-0 flex flex-col border-r border-zinc-800 bg-[#18181b] overflow-y-auto z-20 shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 sticky top-0 bg-[#18181b]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gradient-to-tr from-orange-600 to-amber-500 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none flex items-baseline gap-1">
                RENDER AI <span className="text-xs font-normal text-zinc-500">(beta)</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 pb-20">
          
          {/* TABS */}
          <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            {['EXTERIOR', 'INTERIOR', 'PLAN'].map((tabName) => (
              <button 
                key={tabName}
                onClick={() => setTab(tabName as any)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${tab === tabName ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {t[tabName.toLowerCase() as keyof typeof t] || tabName}
              </button>
            ))}
          </div>

          {/* AI SETTINGS GROUP (Combined) */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                   <Settings2 size={12}/> {t.aiSettings}
                </label>
             </div>
             
             <div className="flex flex-col rounded-lg border border-zinc-700 bg-zinc-900 overflow-hidden">
                {/* Top: Model */}
                <div className="relative border-b border-zinc-700/50">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <Cpu size={14} />
                    </div>
                    <select 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-transparent text-white text-xs px-10 py-3 appearance-none focus:bg-zinc-800 outline-none cursor-pointer"
                    >
                      <option value="gemini-3-pro-image-preview">Gemini 3.0 Pro (High Quality)</option>
                      <option value="gemini-2.5-flash-image">Gemini 2.5 Flash (Fast)</option>
                    </select>
                </div>

                {/* Bottom: API Key */}
                <div className="relative hover:bg-zinc-800 transition-colors">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <Key size={14} />
                    </div>
                   <button
                     onClick={async () => {
                       if ((window as any).aistudio) {
                         try { await (window as any).aistudio.openSelectKey(); } catch(e) { console.error(e); }
                       } else {
                         window.open("https://aistudio.google.com/app/apikey", "_blank");
                       }
                     }}
                     className="w-full flex items-center justify-between text-xs px-10 py-3 cursor-pointer"
                   >
                      <span className="text-zinc-300">
                        {t.apiKeyStatus}
                      </span>
                      
                      <span className="flex items-center gap-2">
                         <div className="flex items-center gap-1.5 text-zinc-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
                            <span className="text-[10px]">{t.connected}</span>
                         </div>
                         <Link size={10} className="text-zinc-600" />
                      </span>
                   </button>
                </div>
             </div>
          </div>

          {/* MAIN UPLOAD */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
              <ImagePlus size={12} /> {t.mainImage} <span className="text-orange-500 text-[10px] bg-orange-500/10 px-1 rounded ml-auto">{t.required}</span>
            </label>
            <ImageUploader onImageSelect={setSelectedImage} selectedImage={selectedImage} />
          </div>

           {/* TEXT PROMPT & ENHANCER */}
           <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                <PenTool size={12} /> {t.promptLabel}
              </label>
              <button 
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {isEnhancing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                {isEnhancing ? t.enhancing : t.enhanceButton}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.promptPlaceholder}
              className="w-full h-20 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all"
            />
          </div>

           {/* ADDITIONAL PROMPT */}
           <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                <Sparkles size={12} /> {t.refineLabel}
              </label>
            </div>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder={t.refinePlaceholder}
              className="w-full h-16 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
            />
          </div>

          {/* STYLE REFERENCE IMAGE */}
          <div className="space-y-2">
             <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
               <ImageIcon size={12} /> {t.styleReference} <span className="text-zinc-600 text-[10px] ml-auto">{t.optional}</span>
             </label>
             <ImageUploader onImageSelect={setStyleImage} selectedImage={styleImage} compact />
          </div>

          {/* BRUSH TOOL - BELOW ADDITIONAL COMMAND */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                   <Brush size={12} /> {t.brushTool}
                </label>
                <button 
                  onClick={() => setIsMaskMode(!isMaskMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isMaskMode ? 'bg-orange-500' : 'bg-zinc-700'}`}
                >
                   <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isMaskMode ? 'translate-x-4.5' : 'translate-x-1'}`} />
                </button>
             </div>

             {isMaskMode && (
               <div className="animate-in fade-in slide-in-from-top-2 space-y-3 pt-1">
                  {/* Size Slider */}
                  <div className="space-y-1">
                     <div className="flex justify-between text-[10px] text-zinc-500">
                        <span>{t.brushSize}</span>
                        <span>{brushSize}px</span>
                     </div>
                     <input 
                       type="range" 
                       min="5" max="100" 
                       value={brushSize}
                       onChange={(e) => setBrushSize(parseInt(e.target.value))}
                       className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                     />
                  </div>

                  {/* Colors & Undo */}
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {['#ef4444', '#22c55e', '#3b82f6', '#ffffff'].map(color => (
                          <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${brushColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                     </div>
                     <button 
                       onClick={() => setTriggerUndo(prev => prev + 1)}
                       className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                       title={t.undo}
                     >
                        <Undo2 size={16} />
                     </button>
                  </div>
               </div>
             )}
          </div>


          {/* QUICK PROMPTS */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                   <Zap size={12} /> {t.quickPrompts}
                </label>
             </div>
             <div className="flex flex-col space-y-2">
                {activePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setPrompt(preset.prompt)}
                    className={`group relative w-full h-9 rounded-lg overflow-hidden transition-all duration-300 flex items-center text-left px-3 border ${
                      preset.id === 'luxury-nordic-masterpiece' 
                        ? 'bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20' 
                        : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-orange-500/50'
                    }`}
                  >
                    <div className="flex flex-col justify-center w-full">
                       <span className={`text-[10px] font-bold truncate ${
                           preset.id === 'luxury-nordic-masterpiece' ? 'text-amber-400 group-hover:text-amber-300' : 'text-zinc-300 group-hover:text-white'
                       }`}>{preset.label}</span>
                       <span className={`text-[9px] truncate ${
                           preset.id === 'luxury-nordic-masterpiece' ? 'text-amber-500/70 group-hover:text-amber-400' : 'text-zinc-500 group-hover:text-orange-400'
                       }`}>{language === 'TH' ? preset.thSubtitle : preset.subtitle}</span>
                    </div>
                  </button>
                ))}
             </div>
          </div>

          {/* CUSTOM RULES / MEMORY */}
          <div className="space-y-2 border-t border-zinc-800 pt-4">
             <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
               <BookOpen size={12} /> {t.customRules}
             </label>
             <textarea
               value={customRules}
               onChange={(e) => setCustomRules(e.target.value)}
               placeholder={t.customRulesPlaceholder}
               className="w-full h-20 bg-zinc-900/50 border border-zinc-700/50 rounded-lg p-3 text-xs text-zinc-300 placeholder-zinc-600 focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none resize-none transition-all"
             />
          </div>

          {/* GENERATE ACTION AREA */}
          <div className="pt-4 mt-auto sticky bottom-0 bg-[#18181b] pb-5 -mx-5 px-5 border-t border-zinc-800/50">
             <button
              onClick={handleGenerate}
              disabled={status === AppStatus.LOADING}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === AppStatus.LOADING ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   {t.rendering}
                 </>
              ) : (
                 <>
                   <Wand2 className="w-4 h-4" /> {t.generate}
                 </>
              )}
            </button>
             
             {(result || selectedImage || prompt) && (
               <button 
                 onClick={() => {
                   if(confirm(t.startNew)) handleNewProject();
                 }}
                 className="w-full mt-3 py-2 text-[10px] uppercase font-bold text-zinc-600 hover:text-zinc-400 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-2"
               >
                 <RefreshCw size={12} /> {t.newProject}
               </button>
             )}
          </div>

        </div>
      </aside>

      {/* RIGHT SIDE: MAIN PREVIEW AREA */}
      <main className="flex-1 relative bg-zinc-950 overflow-hidden flex flex-col">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(24,24,27,0.8),_rgba(9,9,11,1))] pointer-events-none"></div>
          
          {/* Language Toggle (Floating) */}
          <div className="absolute top-5 right-6 z-30">
             <button 
               onClick={() => setLanguage(l => l === 'EN' ? 'TH' : 'EN')}
               className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/5 text-zinc-400 hover:text-white px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:bg-white/5"
             >
               <Globe size={12} /> {language}
             </button>
          </div>

          {/* Generated Image Component */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
             <GeneratedImage 
               status={status} 
               result={result} 
               error={error} 
               onReset={handleResetResult}
               selectedImage={selectedImage}
               
               // Pass Brush Props
               isMaskMode={isMaskMode}
               brushSize={brushSize}
               brushColor={brushColor}
               onMaskChange={setMaskData}
               triggerUndo={triggerUndo}
             />
          </div>
      </main>

    </div>
  );
};

export default App;