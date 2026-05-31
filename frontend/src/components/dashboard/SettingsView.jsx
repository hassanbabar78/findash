import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Key, Palette, Save } from 'lucide-react';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function SettingsView() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [preferences, setPreferences] = useState({ currency: 'USD ($)', timeZone: 'UTC-08:00 (Pacific Time)' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({ name: data.name || '', email: data.email || user.email });
          setPreferences(prev => ({ ...prev, currency: data.currency_preference || 'USD ($)' }));
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    setSaving(true);
    setMessage('');
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        name: profile.name,
        displayName: profile.name,
        currency_preference: preferences.currency
      });
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-foreground">Loading settings...</div>;
  }

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-['Sora'] m-0">Settings</h2>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-foreground" />
              <h3 className="font-['Sora']">Profile</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-['Inter'] text-muted-foreground block mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-['Inter'] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                />
              </div>
              <div>
                <label className="font-['Inter'] text-muted-foreground block mb-2">Email (Read-only)</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-muted-foreground font-['Inter'] focus:outline-none cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette size={20} className="text-foreground" />
              <h3 className="font-['Sora']">Preferences</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-['Inter'] text-muted-foreground block mb-2">Currency</label>
                <select 
                  value={preferences.currency}
                  onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-['Inter'] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                </select>
              </div>
              <div>
                <label className="font-['Inter'] text-muted-foreground block mb-2">Time Zone</label>
                <select 
                  value={preferences.timeZone}
                  onChange={(e) => setPreferences({...preferences, timeZone: e.target.value})}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-['Inter'] focus:outline-none focus:border-[rgba(255,255,255,0.2)]"
                >
                  <option>UTC-08:00 (Pacific Time)</option>
                  <option>UTC-05:00 (Eastern Time)</option>
                  <option>UTC+00:00 (London)</option>
                  <option>UTC+09:00 (Tokyo)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-foreground" />
              <h3 className="font-['Sora']">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-foreground">Price Alerts</span>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-background rounded-full absolute right-0.5 top-0.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-foreground">Market Updates</span>
                <button className="w-12 h-6 bg-[#9CA3AF] rounded-full relative">
                  <div className="w-5 h-5 bg-background rounded-full absolute left-0.5 top-0.5" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-['Inter'] text-foreground">Portfolio Changes</span>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-background rounded-full absolute right-0.5 top-0.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key size={20} className="text-foreground" />
              <h3 className="font-['Sora']">API Key</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-['Inter'] text-muted-foreground block mb-2">Your API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="sk_live_xxxxxxxxxxxxxxxxxxxxx"
                    readOnly
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground font-['JetBrains_Mono'] focus:outline-none"
                  />
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-['Inter'] hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
