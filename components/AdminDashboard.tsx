
import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { Shield, Trash2, CheckCircle, LogOut, ArrowLeft, RefreshCw, UserPlus, Clock, Info, Download, Upload, FileJson, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  allUsers: User[];
  onApprove: (userId: string) => void;
  onDelete: (userId: string) => void;
  onLogout: () => void;
  onBack: () => void;
  onSync: (silent?: boolean) => void;
  onRestore: (users: User[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, 
  allUsers, 
  onApprove, 
  onDelete, 
  onLogout,
  onBack,
  onSync,
  onRestore
}) => {
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const pendingUsers = allUsers.filter(u => u.status === 'PENDING');
  const activeUsers = allUsers.filter(u => u.status === 'ACTIVE' && u.role !== 'ADMIN');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sync on mount to ensure admin sees latest data immediately
  useEffect(() => {
    handleManualSync(true); 
  }, []);

  const handleManualSync = (silent = false) => {
    setIsSyncing(true);
    onSync(silent); 
    setLastUpdated(new Date().toLocaleTimeString());
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allUsers, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `render-ai-beta-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
           if(confirm(`⚠️ WARNING: You are about to restore ${json.length} users.\n\nThis will OVERWRITE the current database. This action cannot be undone.\n\nAre you sure you want to proceed?`)) {
             onRestore(json);
           }
        } else {
          alert("Invalid backup file: The file must contain an array of user data.");
        }
      } catch (err) {
        alert("Error parsing JSON file. Please ensure it is a valid backup file.");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    if (e.target) e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-roboto p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-zinc-800 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-zinc-500 text-sm">Manage users and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-2">
                <button 
                  onClick={() => handleManualSync(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 border border-blue-900/50 transition-colors text-sm font-medium ${isSyncing ? 'opacity-70' : ''}`}
                  title="Force Refresh User Data"
                >
                  <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> Sync Data
                </button>
                <span className="text-[10px] text-zinc-600 mt-1 flex items-center gap-1">
                  <Clock size={10} /> Auto-Live: {lastUpdated}
                </span>
             </div>
             <button 
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Workspace
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 transition-colors text-sm font-medium"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-white">{allUsers.length}</p>
          </div>
          <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><UserPlus size={64} /></div>
            <h3 className="text-yellow-600/90 text-xs font-bold uppercase tracking-wider mb-2">Pending Approval</h3>
            <p className="text-4xl font-bold text-yellow-500">{pendingUsers.length}</p>
          </div>
          <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 flex flex-col justify-between">
             <h3 className="text-green-600/90 text-xs font-bold uppercase tracking-wider mb-2">Active Members</h3>
            <p className="text-4xl font-bold text-green-500">{activeUsers.length + 1}</p>
          </div>
        </div>

        {/* PENDING APPROVALS SECTION - ALWAYS VISIBLE */}
        <div className="mb-12">
           <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Pending Approvals
              </h2>
              {pendingUsers.length > 0 && (
                <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingUsers.length} ACTION REQUIRED
                </span>
              )}
           </div>

           <div className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
              {pendingUsers.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center text-zinc-500">
                   <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mb-3">
                     <CheckCircle className="w-6 h-6 text-zinc-600" />
                   </div>
                   <p className="text-sm font-medium">No pending approvals at the moment.</p>
                   <p className="text-xs text-zinc-600 mt-2 max-w-sm flex items-center gap-1 justify-center">
                     <Info size={12} />
                     Tip: To test registration, open a new Incognito window and sign up as a new user.
                   </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/50 text-zinc-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User Details</th>
                      <th className="px-6 py-4 font-semibold">Plan</th>
                      <th className="px-6 py-4 font-semibold text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {pendingUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700" />
                            <div>
                              <div className="font-bold text-white text-base">{u.name}</div>
                              <div className="text-zinc-400 text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-600">
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                             <button 
                              onClick={() => {
                                if(confirm('Are you sure you want to reject and delete this user?')) onDelete(u.id);
                              }}
                              className="px-3 py-2 text-zinc-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors text-xs font-medium"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => onApprove(u.id)}
                              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-green-900/20 transform hover:scale-105 active:scale-95"
                            >
                              <CheckCircle size={16} /> Approve Access
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
           </div>
        </div>

        {/* ACTIVE USERS SECTION */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-white mb-4">Active Database</h2>
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl overflow-hidden">
             <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/50 text-zinc-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                   {/* Admin Row */}
                   <tr className="bg-indigo-900/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-500/30" />
                          <div>
                             <div className="font-medium text-white flex items-center gap-2">
                               {user.name} <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded">YOU</span>
                             </div>
                             <div className="text-indigo-300/60 text-xs">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-indigo-400 font-bold text-xs">ADMINISTRATOR</span></td>
                      <td className="px-6 py-4"><span className="text-green-500 font-bold text-xs flex items-center gap-1"><CheckCircle size={10}/> ACTIVE</span></td>
                      <td className="px-6 py-4 text-right opacity-30 cursor-not-allowed">
                        <Trash2 size={16} className="ml-auto" />
                      </td>
                   </tr>

                   {/* Other Users */}
                   {activeUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-zinc-800" />
                          <div>
                             <div className="font-medium text-white">{u.name}</div>
                             <div className="text-zinc-500 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-xs font-medium">USER</td>
                      <td className="px-6 py-4">
                        {u.plan === 'PRO' ? (
                           <span className="px-2 py-1 rounded text-[10px] font-bold bg-orange-900/30 text-orange-400 border border-orange-900/50">PRO PLAN</span>
                        ) : (
                           <span className="px-2 py-1 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">FREE PLAN</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                             if(confirm('Are you sure you want to delete this user? This cannot be undone.')) onDelete(u.id);
                          }}
                          className="p-2 hover:bg-red-900/20 text-zinc-600 hover:text-red-400 rounded-lg transition-colors ml-auto block"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* BACKUP & RESTORE SECTION */}
        <div className="border-t border-zinc-800 pt-8">
           <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                   Database Maintenance <span className="text-xs font-normal text-zinc-500">(Beta Persistence)</span>
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Save a snapshot of your member database or restore from a previous version.</p>
              </div>
           </div>

           <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
              
              <div className="flex-1 w-full">
                 <button 
                  onClick={handleBackup}
                  className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl border border-zinc-700 transition-all group"
                 >
                    <div className="bg-zinc-700 group-hover:bg-zinc-600 p-2 rounded-lg transition-colors">
                       <Download size={24} className="text-indigo-400" />
                    </div>
                    <div className="text-left">
                       <div className="font-bold text-sm">Backup Database</div>
                       <div className="text-zinc-500 text-xs">Download .json file</div>
                    </div>
                 </button>
              </div>

              <div className="flex items-center justify-center">
                 <ArrowLeft size={20} className="text-zinc-700 rotate-90 md:rotate-0" />
                 <ArrowLeft size={20} className="text-zinc-700 rotate-90 md:rotate-180 -ml-2" />
              </div>

              <div className="flex-1 w-full">
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleRestoreFile}
                   accept=".json" 
                   className="hidden" 
                   id="restore-db-upload"
                 />
                 <label 
                  htmlFor="restore-db-upload"
                  className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl border border-zinc-700 transition-all cursor-pointer group"
                 >
                    <div className="bg-zinc-700 group-hover:bg-zinc-600 p-2 rounded-lg transition-colors">
                       <Upload size={24} className="text-orange-400" />
                    </div>
                    <div className="text-left">
                       <div className="font-bold text-sm">Restore Database</div>
                       <div className="text-zinc-500 text-xs">Upload .json file</div>
                    </div>
                 </label>
              </div>

           </div>
           
           <div className="mt-4 flex items-start gap-2 bg-yellow-900/10 p-3 rounded-lg border border-yellow-900/30">
              <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-600/80 leading-relaxed">
                 <strong>Beta Note:</strong> This feature allows you to migrate your user list between browser sessions or recover data if the local storage is cleared. Always keep a backup file safe.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};
