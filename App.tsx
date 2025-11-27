
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import GeneratedImage from './components/GeneratedImage';
import { AuthScreens } from './components/AuthScreens';
import { AppStatus, ImageData, GenerationResult, User } from './types';
import { generateImageFromReference } from './services/geminiService';
import { Wand2, Sparkles, LayoutGrid, Home, PenTool, Zap, Building2, Armchair, Box, Plus, Cpu, Settings2, ImagePlus, Globe, Layers, LogOut, User as UserIcon, Crown, Shield, RefreshCw } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';

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
    refineLabel: "Refine Result (Additional)",
    refinePlaceholder: "Add details to the generated image (e.g. add a red car, change sky color)...",
    styleReference: "Style Reference",
    optional: "Optional",
    quickPrompts: "Quick Prompts",
    generate: "Generate Render",
    rendering: "Rendering...",
    newProject: "NEW PROJECT",
    mode: "MODE",
    startNew: "Start a new project? Current progress will be lost.",
    enterKey: "Please enter your Google Gemini API Key in the sidebar settings.",
    enterPrompt: "Please enter a prompt or select a preset.",
    unexpectedError: "An unexpected error occurred during generation.",
    proPlan: "PRO PLAN",
    manageSub: "Manage Subscription",
    logout: "Log Out",
    adminDashboard: "Admin Dashboard"
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
    enterKey: "กรุณากรอก Google Gemini API Key ในแถบตั้งค่าด้านซ้าย",
    enterPrompt: "กรุณากรอกคำสั่งหรือเลือกคำสั่งด่วน",
    unexpectedError: "เกิดข้อผิดพลาดในการสร้างรูปภาพ",
    proPlan: "สมาชิก PRO",
    manageSub: "จัดการสมาชิก",
    logout: "ออกจากระบบ",
    adminDashboard: "แดชบอร์ดผู้ดูแล"
  }
};

// --- PRESET DATA ---
const EXTERIOR_PRESETS = [
  { id: 'sketch-to-photo', label: 'SKETCH TO PHOTO', subtitle: 'Convert sketch to realism', thSubtitle: 'แปลงภาพร่างเป็นภาพจริง', prompt: 'Convert this architectural sketch into a photorealistic rendering. High detail, realistic lighting, natural materials, clear blue sky.' },
  { id: 'lakeside-farmhouse', label: 'LAKESIDE FARMHOUSE', subtitle: 'Modern Cabin', thSubtitle: 'บ้านโมเดิร์นริมทะเลสาบ', prompt: 'Minimalist Modern Farmhouse Architecture, stunning lakeside house, single-story, long gabled form, exterior clad in natural light-toned vertical wood siding, steep-pitched dark grey metal roof, tall black metal chimney, large floor-to-ceiling black-framed glass sliding doors, simple outdoor patio. Situated in a vast landscape with long, dry golden tussock grasses in the foreground and a neatly mowed green lawn. Backdrop of massive, rugged, towering mountain ranges and rolling grassy foothills, with a deep blue lake visible in the distance. Clear pale blue sky. Golden hour lighting, bright natural daylight, casting sharp shadows. Wide-angle horizontal full-shot, photorealistic, extremely high detail' },
  { id: 'bangkok-street', label: 'BANGKOK STREET', subtitle: 'Night Life', thSubtitle: 'สตรีทไลฟ์กรุงเทพฯ', prompt: 'Bangkok street photography, vibrant night life, neon signs, tuk-tuks, street food stalls, power lines silhouetted against the sky, cinematic lighting, cyberpunk atmosphere.' },
  { id: 'modern-min', label: 'MODERN MINIMALIST', subtitle: 'Clean & Simple', thSubtitle: 'โมเดิร์น มินิมอล', prompt: 'Ultra-minimalist Modern House Architecture, pristine white, single-story gabled house, smooth stark white concrete exterior, steep symmetrical gable roof. Features large black-framed glass windows and sliding doors, including a dramatic triangular floor-to-ceiling window on the gable end. Subtle interior elements visible: wooden shelf, minimalist pendant lamp, light-toned furniture. Subtle wisp of smoke from a vent. Set in a dry, arid landscape with sparse golden-brown grasses, low shrubs, and large light-colored boulders. White concrete staircase and gravel pathway in the foreground. Hints of distant soft-hued mountains. Bright, clear natural daylight, high sun, soft subtle shadows. Straight-on, eye-level full-shot. High-resolution, photorealistic, serene, spacious, quiet isolation' },
  { id: 'pool-villa', label: 'POOL VILLA', subtitle: 'Luxury Vacation', thSubtitle: 'พูลวิลล่าหรู', prompt: 'Luxurious Modern Italian Villa, grand multi-story structure, pristine white stucco walls, terracotta S-tile roof. Dominant feature is the series of large, symmetrical arched windows and French doors with thin black metal frames. Set on a steep, lush wooded hillside with dense dark green trees in the background. Features a clear azure blue rectangular swimming pool on a large light-colored stone patio terrace, supported by a rugged natural stone retaining wall. Several tall, slender palm trees and potted plants decorate the patio. Bright, clear sunlit day, vibrant and high-contrast lighting. High-angle or elevated view, ultra-high resolution, photorealistic, exclusive summer luxury.' },
  { id: 'modern-twilight', label: 'MODERN TWILIGHT', subtitle: 'Dusk Setting', thSubtitle: 'โมเดิร์นยามค่ำ', prompt: 'Modern architectural house at twilight, warm interior lighting glowing through windows, blue hour sky, exterior garden lighting, cozy atmosphere, photorealistic.' },
  { id: 'stone-cottage', label: 'STONE COTTAGE', subtitle: 'Modern Rock Pool', thSubtitle: 'โมเดิร์นคอทเทจหิน', prompt: 'Luxurious Modern Stone Cottage with a Naturalistic Rock Pool. Two-story house, clean horizontal lines, flat roof, natural stacked stone cladding on the lower level, large dark-framed windows, warm modern wood entrance door. House is connected to a secluded, organically shaped rock pool with crystal-clear turquoise and emerald water, edged by massive smooth grey boulders and surrounded by ancient olive trees and low, dense Mediterranean shrubs. Manicured lawn and flowerbeds near the house entrance. Bright, warm natural sunlight, dramatic highlights on the pool and wood. Wide, slightly elevated perspective. Ultra-high resolution, photorealistic architectural render, harmonious integration with nature.' },
  { id: 'luxury-exterior', label: 'LUXURY EXTERIOR', subtitle: 'Modern Mediterranean', thSubtitle: 'โมเดิร์นเมดิเตอร์เรเนียน', prompt: 'Luxurious Modern Mediterranean Architecture, grand two-story house, pristine white stucco exterior, dark grey S-tile roof. Features bold black-framed windows: one large two-story arched window, rectangular windows with black Juliet balconies. Main entrance in a deeply recessed archway with a tall black-framed arched glass door. Symmetrical facade. Meticulously manicured formal landscape, vibrant green lawn, wide smooth white concrete driveway. Symmetrical tall, slender Italian Cypress trees, low, tightly clipped boxwood hedges, large black planters. Soft, overcast or diffused natural lighting, bright and even. Straight-on, eye-level vertical full-shot. High-resolution, photorealistic architectural photography, formal, timeless luxury.' },
];

const INTERIOR_PRESETS = [
  { id: 'modern-luxury-int', label: 'MODERN LUXURY', subtitle: 'High-end Living', thSubtitle: 'ห้องนั่งเล่นหรูหรา', prompt: 'Modern Luxury Living Room, spacious, double-height ceiling, marble flooring, large crystal chandelier, beige and gold color palette, plush velvet sofa, floor-to-ceiling windows with sheer curtains, warm ambient lighting, 8k photorealistic.' },
  { id: 'japandi-int', label: 'JAPANDI STYLE', subtitle: 'Zen & Scandi', thSubtitle: 'เจแปนดิ (ญี่ปุ่น+สแกน)', prompt: 'Japandi Interior Design, bedroom, minimalist, light oak wood furniture, low platform bed, linen bedding, soft neutral tones (white, cream, beige), bonsai plant, rice paper lamp, serene atmosphere, natural light.' },
  { id: 'industrial-loft', label: 'INDUSTRIAL LOFT', subtitle: 'Raw & Edgy', thSubtitle: 'อินดัสเทรียล ลอฟท์', prompt: 'Industrial Loft Kitchen, exposed brick walls, concrete ceiling with exposed pipes, black metal pendant lights, reclaimed wood island, stainless steel appliances, large factory-style windows, dramatic lighting.' },
  { id: 'tropical-resort-int', label: 'TROPICAL RESORT', subtitle: 'Relaxing Vibes', thSubtitle: 'รีสอร์ททรอปิคอล', prompt: 'Tropical Resort Bedroom, open-air concept, teak wood flooring, rattan furniture, white canopy bed, indoor plants, view of lush green garden, ceiling fan, warm sunlight, relaxing and airy.' },
  { id: 'minimalist-office', label: 'MINIMALIST OFFICE', subtitle: 'Productive Space', thSubtitle: 'ออฟฟิศมินิมอล', prompt: 'Minimalist Home Office, clean white desk, ergonomic chair, floating shelves with few books, large window with city view, soft daylight, clutter-free, inspiring workspace.' }
];

const PLAN_PRESETS = [
  { id: '2d-to-3d-floorplan', label: '2D TO 3D FLOORPLAN', subtitle: 'Basic 3D', thSubtitle: 'แปลน 2D เป็น 3D', prompt: 'Convert this 2D architectural floor plan into a clear 3D isometric floor plan render. White walls, realistic wooden flooring, basic furniture placement, soft top-down lighting, clean look.' },
  { id: 'realistic-plan', label: 'REALISTIC 3D PLAN', subtitle: 'Textured & Lit', thSubtitle: 'แปลน 3D สมจริง', prompt: 'High-quality 3D isometric floor plan rendering from 2D plan. Realistic textures, detailed furniture, shadows and lighting, ambient occlusion, modern interior design style.' }
];

// Initial Mock Users
const INITIAL_USERS: User[] = [
  { id: 'admin-001', name: 'Suwannarin Admin', email: 'dwgsuwannarin@gmail.com', plan: 'PRO', role: 'ADMIN', status: 'ACTIVE', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
  { id: 'user-002', name: 'Demo User', email: 'user@example.com', plan: 'FREE', role: 'USER', status: 'ACTIVE', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' },
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
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [language, setLanguage] = useState<'EN' | 'TH'>('TH');
  const [activePresets, setActivePresets] = useState(EXTERIOR_PRESETS);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync users from localStorage on load
  useEffect(() => {
    const storedUsers = localStorage.getItem('render_ai_users');
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        // Ensure admin always exists, BUT do not overwrite if already exists to preserve data.
        // Only inject if the admin account is missing completely.
        const adminIndex = parsed.findIndex((u: User) => u.email === 'dwgsuwannarin@gmail.com');
        if (adminIndex === -1) {
            parsed.push(INITIAL_USERS[0]);
            localStorage.setItem('render_ai_users', JSON.stringify(parsed));
        }
        setUsers(parsed);
      } catch (e) {
        console.error("Failed to parse users", e);
        setUsers(INITIAL_USERS);
      }
    } else {
      localStorage.setItem('render_ai_users', JSON.stringify(INITIAL_USERS));
    }

    const storedUser = localStorage.getItem('render_ai_current_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) { console.error(e) }
    }

    // Check for Magic Link Approval
    const urlParams = new URLSearchParams(window.location.search);
    const approveUserId = urlParams.get('approve_user');
    
    // Only process if we have a user logged in (as admin)
    if (approveUserId) {
      // We need to wait for login if not logged in, but if we are:
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      if (currentUser && currentUser.role === 'ADMIN') {
        handleMagicApproval(approveUserId);
      }
    }

  }, []);

  // Update localStorage when users change
  useEffect(() => {
    // Only update if users list is valid and not empty (prevent accidental wipe)
    if (users && users.length > 0) {
      localStorage.setItem('render_ai_users', JSON.stringify(users));
    }
  }, [users]);

  // Update localStorage when current user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('render_ai_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('render_ai_current_user');
    }
  }, [user]);

  // Auto-Sync Hook: Listen for storage events (Cross-tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'render_ai_users' && e.newValue) {
        setUsers(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ADMIN POLLING: Auto-fetch new users if logged in as Admin
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (user && user.role === 'ADMIN') {
      interval = setInterval(() => {
        const storedUsers = localStorage.getItem('render_ai_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (JSON.stringify(parsed) !== JSON.stringify(users)) {
             setUsers(parsed);
          }
        }
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [user, users]);

  // Real-time Approval Check for Users
  useEffect(() => {
    if (user && user.status === 'PENDING') {
      const interval = setInterval(() => {
        const storedUsers = localStorage.getItem('render_ai_users');
        if (storedUsers) {
          const allUsers = JSON.parse(storedUsers);
          const myUpdatedUser = allUsers.find((u: User) => u.id === user.id);
          
          if (myUpdatedUser && myUpdatedUser.status === 'ACTIVE') {
            setUser(myUpdatedUser);
            alert("Your account has been approved! Redirecting to workspace...");
            clearInterval(interval);
          }
        }
      }, 2000); // Check every 2 seconds
      return () => clearInterval(interval);
    }
  }, [user]);


  const handleMagicApproval = (userId: string) => {
    // Read fresh data
    const storedUsers = localStorage.getItem('render_ai_users');
    const currentList = storedUsers ? JSON.parse(storedUsers) : users;
    
    const updated = currentList.map((u: User) => u.id === userId ? { ...u, status: 'ACTIVE' as const } : u);
    
    localStorage.setItem('render_ai_users', JSON.stringify(updated));
    setUsers(updated);
    
    alert(`User Approved Successfully via Magic Link!`);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSyncDatabase = (silent = false) => {
    const storedUsers = localStorage.getItem('render_ai_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
      if (!silent) alert("Database synced successfully!");
    }
  };

  const handleRestoreDatabase = (restoredUsers: User[]) => {
    setUsers(restoredUsers);
    localStorage.setItem('render_ai_users', JSON.stringify(restoredUsers));
    alert("Database successfully restored from Backup (Beta Version).");
  };

  // Update presets when tab changes
  useEffect(() => {
    if (tab === 'EXTERIOR') setActivePresets(EXTERIOR_PRESETS);
    else if (tab === 'INTERIOR') setActivePresets(INTERIOR_PRESETS);
    else if (tab === 'PLAN') setActivePresets(PLAN_PRESETS);
  }, [tab]);

  // Text helpers
  const t = TRANSLATIONS[language];

  // --- AUTH HANDLERS ---
  const handleLogin = (loginUser: User) => {
    // Force refresh DB first
    const storedUsers = localStorage.getItem('render_ai_users');
    let currentUsers = users;
    if (storedUsers) {
      currentUsers = JSON.parse(storedUsers);
      setUsers(currentUsers);
    }

    const foundUser = currentUsers.find(
      u => u.email.toLowerCase() === loginUser.email.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.status === 'BANNED') {
        setAuthError("This account has been suspended.");
        return;
      }
      
      setUser(foundUser);
      setAuthError(null);
      
      // Check for magic link pending
      const urlParams = new URLSearchParams(window.location.search);
      const approveUserId = urlParams.get('approve_user');
      if (approveUserId && foundUser.role === 'ADMIN') {
        setTimeout(() => handleMagicApproval(approveUserId), 500);
      }
    } else {
      setAuthError("User not found. Please check your email or sign up.");
    }
  };

  const handleRegister = (newUser: User) => {
    // CRITICAL: Read from storage to ensure we have the absolute latest list
    const storedUsers = localStorage.getItem('render_ai_users');
    const currentDB = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

    // Check if email exists
    const exists = currentDB.some((u: User) => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) {
      setAuthError("Email already registered. Please sign in.");
      return;
    }

    const userWithStatus: User = { 
      ...newUser, 
      status: 'PENDING', 
      role: 'USER', 
      plan: 'FREE' 
    };
    
    const updatedUsers = [...currentDB, userWithStatus];
    
    // Write back to storage immediately
    localStorage.setItem('render_ai_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setUser(userWithStatus); // Logs them in but shows Pending screen
    setAuthError(null);
    alert("Registration successful! Please wait for admin approval.");
  };

  const handleSubscribe = () => {
    if (user) {
      // Update DB directly
      const storedUsers = localStorage.getItem('render_ai_users');
      const currentDB = storedUsers ? JSON.parse(storedUsers) : users;
      
      const updatedUser = { ...user, plan: 'PRO' as const };
      const updatedList = currentDB.map((u: User) => u.id === user.id ? updatedUser : u);
      
      localStorage.setItem('render_ai_users', JSON.stringify(updatedList));
      setUsers(updatedList);
      setUser(updatedUser);
    }
  };

  const handleContinueFree = () => {
    // Just ensure they are logged in, logic is handled in render
    if (user) {
        // Continue logic handled by state
    }
  };

  const handleLogout = () => {
    // 1. Explicitly clear local storage to prevent instant re-login
    localStorage.removeItem('render_ai_current_user');
    
    // 2. Reset App State
    setUser(null);
    setResult(null);
    setStatus(AppStatus.IDLE);
    setPrompt('');
    setAdditionalPrompt('');
    setShowAdminDashboard(false);
    
    // 3. Clean any URL parameters (Magic links)
    window.history.replaceState({}, document.title, window.location.pathname);

    // 4. Force Reload to ensure clean slate (Fixes many stuck state issues)
    window.location.reload();
  };

  // --- ADMIN HANDLERS ---
  const handleApproveUser = (userId: string) => {
    // Read-Modify-Write for safety
    const storedUsers = localStorage.getItem('render_ai_users');
    const currentDB = storedUsers ? JSON.parse(storedUsers) : users;
    
    const updatedList = currentDB.map((u: User) => u.id === userId ? { ...u, status: 'ACTIVE' as const } : u);
    
    localStorage.setItem('render_ai_users', JSON.stringify(updatedList));
    setUsers(updatedList);
  };

  const handleDeleteUser = (userId: string) => {
     // Read-Modify-Write for safety
    const storedUsers = localStorage.getItem('render_ai_users');
    const currentDB = storedUsers ? JSON.parse(storedUsers) : users;
    
    const updatedList = currentDB.filter((u: User) => u.id !== userId);
    
    localStorage.setItem('render_ai_users', JSON.stringify(updatedList));
    setUsers(updatedList);
  };


  // --- APP HANDLERS ---
  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      alert(t.enterKey);
      return;
    }
    
    // LOGIC UPDATE: Determine source image
    // If we have a previous result AND the user typed in "Additional Command", 
    // we use the previous result as the source image for refinement.
    // Otherwise, we use the original selected image.
    let sourceImageToUse = selectedImage;
    let isRefinement = false;

    if (result?.imageUrl && additionalPrompt.trim()) {
       sourceImageToUse = {
         base64: result.imageUrl,
         mimeType: 'image/png' // Generated images are typically PNG
       };
       isRefinement = true;
    }

    // Validate inputs
    if (!sourceImageToUse) {
      alert("Please upload an image first.");
      return;
    }
    
    // Construct final prompt
    let finalPrompt = prompt;
    if (additionalPrompt.trim()) {
      finalPrompt += `\n\n${isRefinement ? 'Refinement Instructions (Apply to provided previous generation):' : 'Additional Instructions:'} ${additionalPrompt}`;
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
        styleImage 
      );

      setResult(genResult);
      setStatus(AppStatus.SUCCESS);
      
    } catch (e: any) {
      console.error(e);
      setError(e.message || t.unexpectedError);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleNewProject = () => {
    // Reset inputs but keep images
    setPrompt('');
    setAdditionalPrompt('');
    
    // Clear Result
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    
    // selectedImage and styleImage remain untouched
  };

  const handleResetResult = () => {
     setResult(null);
     setStatus(AppStatus.IDLE);
     setError(null);
  }


  // --- RENDER LOGIC ---

  // 1. Auth Check
  if (!user || user.status === 'PENDING') {
    return (
      <AuthScreens 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        onSubscribe={handleSubscribe} 
        onContinueFree={handleContinueFree}
        onLogout={handleLogout}
        user={user}
        authError={authError}
        onClearError={() => setAuthError(null)}
      />
    );
  }

  // 2. Admin Dashboard Check
  if (user.role === 'ADMIN' && showAdminDashboard) {
    return (
      <AdminDashboard 
        user={user} 
        allUsers={users} 
        onApprove={handleApproveUser} 
        onDelete={handleDeleteUser}
        onLogout={handleLogout}
        onBack={() => setShowAdminDashboard(false)}
        onSync={handleSyncDatabase}
        onRestore={handleRestoreDatabase}
      />
    );
  }

  // 3. Main App
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
              <div className="text-[10px] text-orange-500 font-medium tracking-widest mt-0.5">by suwannarin</div>
            </div>
          </div>
        </div>

        {/* User Profile & Admin Access */}
        <div className="px-5 pt-4 pb-2">
           <div className="flex items-center justify-between bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                 <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full bg-zinc-800" />
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[100px]">{user.name}</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      {user.plan === 'PRO' && <Crown size={10} className="text-orange-500"/>} 
                      {user.plan} PLAN
                    </span>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 {user.role === 'ADMIN' && (
                   <button 
                    onClick={() => setShowAdminDashboard(true)}
                    className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-colors relative"
                    title={t.adminDashboard}
                   >
                     <Shield size={16} />
                     {users.some(u => u.status === 'PENDING') && (
                       <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#18181b]"></span>
                     )}
                   </button>
                 )}
                 <button 
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors"
                  title={t.logout}
                 >
                   <LogOut size={16} />
                 </button>
              </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-8 pb-20">
          
          {/* TABS */}
          <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
            <button 
              onClick={() => setTab('EXTERIOR')}
              className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${tab === 'EXTERIOR' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.exterior}
            </button>
            <button 
              onClick={() => setTab('INTERIOR')}
              className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${tab === 'INTERIOR' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.interior}
            </button>
            <button 
              onClick={() => setTab('PLAN')}
              className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${tab === 'PLAN' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.plan}
            </button>
          </div>

          {/* MODE & MODEL */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                   <Settings2 size={12}/> {t.aiSettings}
                </label>
             </div>
             
             {/* Model Select */}
             <div className="relative">
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg px-3 py-2.5 appearance-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image (Fast)</option>
                  <option value="gemini-3-pro-image-preview">Gemini 3.0 Pro Image (High Quality)</option>
                </select>
                <Cpu className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
             </div>
          </div>

          {/* MAIN UPLOAD */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
              <ImagePlus size={12} /> {t.mainImage} <span className="text-orange-500 text-[10px] bg-orange-500/10 px-1 rounded ml-auto">{t.required}</span>
            </label>
            <ImageUploader onImageSelect={setSelectedImage} selectedImage={selectedImage} />
          </div>

           {/* TEXT PROMPT - MOVED HERE */}
           <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
                <PenTool size={12} /> {t.promptLabel}
              </label>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.promptPlaceholder}
              className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all"
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

          {/* STYLE REFERENCE UPLOAD */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 flex items-center gap-2">
              <Layers size={12} /> {t.styleReference} <span className="text-zinc-600 text-[10px] bg-zinc-800 px-1 rounded ml-auto">{t.optional}</span>
            </label>
            <ImageUploader onImageSelect={setStyleImage} selectedImage={styleImage} compact={true} />
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
                    className="group relative w-full h-9 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/50 rounded-lg overflow-hidden transition-all duration-300 flex items-center text-left px-3"
                  >
                    <div className="flex flex-col justify-center w-full">
                       <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white truncate">{preset.label}</span>
                       <span className="text-[9px] text-zinc-500 group-hover:text-orange-400 truncate">{language === 'TH' ? preset.thSubtitle : preset.subtitle}</span>
                    </div>
                    {prompt === preset.prompt && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    )}
                  </button>
                ))}
             </div>
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
             
             {/* New Project Button - Only show if we have data to clear */}
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
             />
          </div>
      </main>

    </div>
  );
};

export default App;
