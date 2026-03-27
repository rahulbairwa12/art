'use client';

import { useState } from 'react';
import { Toaster } from 'sonner';
import { motion } from 'motion/react';
import { Users, BookOpen, LayoutDashboard, LogOut } from 'lucide-react';
import { UserManagementTab } from '../components/admin/UserManagementTab';
import { ThemeManagementTab } from '../components/admin/ThemeManagementTab';
import { AdminGuard } from '../components/admin/AdminGuard';

type Tab = 'users' | 'themes';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'users', label: 'Users & Progress', icon: Users },
  { id: 'themes', label: 'Themes & Prompts', icon: BookOpen },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    window.location.reload();
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center">
              <img
                src="https://vibesandvirtues.com/cdn/shop/files/Vibes_Virtues_5a68e30c-61ff-4012-8e45-ca9ced637884.svg?v=1744351366"
                alt="Vibes & Virtues"
                className="h-11 w-auto" style={{ filter: 'brightness(0)' }}
              />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-50 via-purple-50 to-pink-50 border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="text-gray-800 font-bold text-sm">Welcome to the Admin Dashboard</p>
                <p className="text-gray-400 text-xs">Manage users, track progress, and edit themes.</p>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-200 rounded-lg p-1 w-fit flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-yellow-400 text-black shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'users' && <UserManagementTab />}
            {activeTab === 'themes' && <ThemeManagementTab />}
          </motion.div>
        </div>
      </div>
    </AdminGuard>
  );
}
