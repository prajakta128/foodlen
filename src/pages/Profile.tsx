import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, Plus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { Button, Card, SectionHeader } from '../components/ui';
import { userService, authService } from '../services/api';
import { dietaryPreferencesService } from '../services/localData';
import type { User } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietaryTag, setNewDietaryTag] = useState('');

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    userService.getProfile().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setUser(res.data);
        setName(res.data.name);
      } else {
        setError(res.error || 'Could not load your profile.');
      }
    });
    setAllergies(dietaryPreferencesService.getAllergies());
    setDietaryTags(dietaryPreferencesService.getDietaryTags());
  }, []);

  const handleSaveName = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await userService.updateProfile({ name });
    setSaving(false);
    if (res.success && res.data) {
      setUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(res.error || 'Could not save changes.');
    }
  };

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    dietaryPreferencesService.addAllergy(newAllergy);
    setAllergies(dietaryPreferencesService.getAllergies());
    setNewAllergy('');
  };

  const handleAddDietaryTag = () => {
    if (!newDietaryTag.trim()) return;
    dietaryPreferencesService.addDietaryTag(newDietaryTag);
    setDietaryTags(dietaryPreferencesService.getDietaryTags());
    setNewDietaryTag('');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const res = await userService.deleteAccount();
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Could not delete your account.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32 text-gray-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin" /> Loading your profile…
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SectionHeader title="Profile Settings" />

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2.5 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Info */}
        <Card className="mb-6">
          <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
              {(user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleSaveName} isLoading={saving}>Save Changes</Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Food Preferences</h3>
          <p className="text-sm text-gray-500 mb-4">
            These stay on this device and are used only to personalize what you see — nothing pre-filled.
          </p>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allergies.map((a) => (
                  <span key={a} className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-900 rounded-full text-sm">
                    {a}
                    <button onClick={() => { dietaryPreferencesService.removeAllergy(a); setAllergies(dietaryPreferencesService.getAllergies()); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {allergies.length === 0 && <p className="text-sm text-gray-500">None added yet.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAllergy()}
                  placeholder="e.g. Peanuts"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button size="sm" variant="outline" onClick={handleAddAllergy} icon={<Plus className="w-4 h-4" />}>Add</Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary preferences</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {dietaryTags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-sm">
                    {t}
                    <button onClick={() => { dietaryPreferencesService.removeDietaryTag(t); setDietaryTags(dietaryPreferencesService.getDietaryTags()); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {dietaryTags.length === 0 && <p className="text-sm text-gray-500">None added yet.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDietaryTag}
                  onChange={(e) => setNewDietaryTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDietaryTag()}
                  placeholder="e.g. Vegetarian"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button size="sm" variant="outline" onClick={handleAddDietaryTag} icon={<Plus className="w-4 h-4" />}>Add</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200 bg-red-50">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Account</h3>
          <div className="space-y-3">
            <Button variant="outline" icon={<LogOut className="w-5 h-5" />} fullWidth onClick={handleLogout}>
              Sign Out
            </Button>
            {!confirmingDelete ? (
              <Button variant="danger" icon={<Trash2 className="w-5 h-5" />} fullWidth onClick={() => setConfirmingDelete(true)}>
                Delete Account
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-800 text-center">This deactivates your account. Are you sure?</p>
                <div className="flex gap-2">
                  <Button variant="outline" fullWidth onClick={() => setConfirmingDelete(false)}>Cancel</Button>
                  <Button variant="danger" fullWidth onClick={handleDeleteAccount}>Yes, delete</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
