import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { updateProfileApi, changePasswordApi } from '../services/authService';
import {
  FiUser,
  FiMail,
  FiSave,
  FiLock,
  FiCheckCircle,
  FiShield,
  FiKey,
  FiCalendar,
} from 'react-icons/fi';

const Profile = () => {
  const { user, updateUserSession } = useAuth();

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Pre-fill user data when user state loads/changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Oct 2026';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim() || !email.trim()) {
      setProfileError('Full Name and Email Address are required.');
      setProfileLoading(false);
      return;
    }

    try {
      const res = await updateProfileApi({ fullName, email });
      updateUserSession(res.data.user, res.data.token);
      setProfileSuccess('Profile information updated successfully!');
    } catch (err) {
      setProfileError(
        err.response?.data?.message || err.message || 'Failed to update profile information'
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await changePasswordApi({ currentPassword, newPassword });
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || err.message || 'Failed to update password. Please check your current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DU';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">User Profile & Account Settings</h1>
        <p className="text-sm text-slate-400">
          Manage your personal information, contact email, and security credentials.
        </p>
      </div>

      {/* User Info Overview Banner */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xl flex items-center justify-center shrink-0">
              {getInitials(user?.fullName)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">{user?.fullName || 'User'}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1.5">
            <FiShield className="w-3.5 h-3.5 text-emerald-400" /> JWT Session Active
          </div>
        </div>
      </Card>

      {/* Personal Information Form */}
      <Card title="Personal Information">
        {profileSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="mb-4">
            <ErrorMessage title="Profile Update Error" message={profileError} />
          </div>
        )}

        <form className="space-y-4 mt-2" onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={FiUser}
              placeholder="Your full name"
              required
            />
            <Input
              label="Email Address"
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={FiMail}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <Button variant="primary" type="submit" icon={FiSave} loading={profileLoading}>
            Save Profile Changes
          </Button>
        </form>
      </Card>

      {/* Security & Password Form */}
      <Card title="Security & Password Settings">
        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-4">
            <ErrorMessage title="Password Update Error" message={passwordError} />
          </div>
        )}

        <form className="space-y-4 mt-2" onSubmit={handlePasswordSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Current Password"
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              icon={FiLock}
              required
            />
            <Input
              label="New Password"
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              icon={FiKey}
              required
            />
            <Input
              label="Confirm New Password"
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              icon={FiKey}
              required
            />
          </div>
          <Button variant="secondary" type="submit" icon={FiLock} loading={passwordLoading}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
