'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Card, CardContent } from '../ui/card';
import { Sparkles, RefreshCw, Search, User, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserReflectionsModal } from './UserReflectionsModal';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string | null;
  lastSignIn: string | null;
  themeId: string | null;
  tokens: number;
  expiresAt: string | null;
  unlockedRewards: number[];
  reflectionCount: number;
  isDev: boolean;
}

export function UserManagementTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.themeId?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : '—';

  const handleTokensRevoked = (userId: string, newTotal?: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, tokens: newTotal ?? 0, unlockedRewards: newTotal === 0 ? [] : u.unlockedRewards } : u));
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user ${email}?\nThis will remove all their tokens, reflections, and progress. This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      
      toast.success('User deleted successfully');
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex items-center flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute ml-3 pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or theme..."
              className="bg-white border-gray-200 text-gray-800 pl-9 placeholder:text-gray-400 focus:border-yellow-400"
            />
          </div>
          <Button
            onClick={fetchUsers}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-gray-400 mb-1">Total Users</p>
              <p className="text-2xl font-black text-gray-900">{users.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-gray-400 mb-1">With Themes</p>
              <p className="text-2xl font-black text-yellow-500">{users.filter(u => u.themeId).length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-gray-400 mb-1">Total Tokens</p>
              <p className="text-2xl font-black text-yellow-500">{users.reduce((s, u) => s + u.tokens, 0)}</p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 bg-gray-50 hover:bg-gray-50">
                <TableHead className="text-gray-500 font-bold">User</TableHead>
                <TableHead className="text-gray-500 font-bold">Theme</TableHead>
                <TableHead className="text-gray-500 font-bold text-right">
                  <span className="flex items-center gap-1 justify-end"><Sparkles className="w-3 h-3 text-yellow-500" />Tokens</span>
                </TableHead>
                <TableHead className="text-gray-500 font-bold">Joined</TableHead>
                <TableHead className="text-gray-500 font-bold">Last Active</TableHead>
                <TableHead className="text-gray-500 font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-gray-100">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow className="border-gray-100">
                  <TableCell colSpan={6} className="text-center text-gray-400 py-10">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="text-gray-800 text-sm font-medium truncate max-w-[200px]">{user.email}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {user.isDev && <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-[10px] px-1.5 py-0">DEV</Badge>}
                          {user.name && <span className="text-gray-500 text-[11px]">{user.name}</span>}
                          <p className="text-gray-300 text-[10px] font-mono truncate max-w-[140px]">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.themeId ? (
                        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          {user.themeId}
                        </Badge>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center gap-1 justify-end text-yellow-600 font-bold">
                        <Sparkles className="w-3 h-3" />
                        {user.tokens}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{formatDate(user.lastSignIn)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-purple-600 hover:bg-purple-50 gap-1.5"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <UserReflectionsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onTokensRevoked={handleTokensRevoked}
      />
    </>
  );
}
