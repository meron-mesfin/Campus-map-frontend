import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { UserIcon, BellIcon, MoonIcon, ShieldIcon, CameraIcon, MessageSquareIcon } from 'lucide-react';
import * as authApi from '../api/auth';
import * as adminApi from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { user: authUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [buildingFeedback, setBuildingFeedback] = useState<adminApi.FeedbackItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: authUser?.full_name || '',
    email: authUser?.email || '',
    profilePicture: authUser?.profile_picture || ''
  });

  // Sync form data when authUser changes (e.g. after initial load)
  useEffect(() => {
    if (authUser) {
      setFormData({
        fullName: authUser.full_name || '',
        email: authUser.email || '',
        profilePicture: authUser.profile_picture || ''
      });
    }
  }, [authUser]);

  useEffect(() => {
    // Load only building related feedback
    adminApi.getFeedback()
      .then(allFeedback => {
        const onlyBuildings = allFeedback.filter(f => f.type === 'building');
        setBuildingFeedback(onlyBuildings.slice(0, 5)); // Show only latest 5
      })
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setFeedbackLoading(false));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setFormData(prev => ({ ...prev, profilePicture: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(formData.fullName, formData.email, formData.profilePicture);
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return <div className="max-w-4xl pb-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Settings
      </h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your account details and photo
              </p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={40} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CameraIcon size={14} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
                <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size={16} /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Section (Building Only for Campus Admin) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <MessageSquareIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Building Feedback
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Latest building-related reports from users
              </p>
            </div>
          </div>
          <div className="p-6">
            {feedbackLoading ? (
              <div className="flex justify-center py-4"><LoadingSpinner /></div>
            ) : buildingFeedback.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No building feedback found.</p>
            ) : (
              <div className="space-y-4">
                {buildingFeedback.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-900 dark:text-white text-sm">{fb.building_name}</span>
                      <span className="text-xs text-slate-500">{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{fb.message}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <MoonIcon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Appearance
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customize how the system looks
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Dark Mode
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Toggle dark mode interface
                </p>
              </div>
              <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>;
}