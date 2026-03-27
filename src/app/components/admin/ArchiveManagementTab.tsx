'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RefreshCw, Trash2, Search, AlertTriangle, Archive, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Reflection {
  id: string;
  content: string;
  timestamp?: string;
  userId?: string;
  themeId?: string;
}

interface ThemeOption {
  id: string;
  title?: string;
}

export function ArchiveManagementTab() {
  const [themeOptions, setThemeOptions] = useState<ThemeOption[]>([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch theme list dynamically
  useEffect(() => {
    fetch('/api/admin/themes')
      .then(r => r.json())
      .then(data => {
        const list: ThemeOption[] = (data.themes ?? []).map((t: any) => ({ id: t.id, title: t.title }));
        setThemeOptions(list);
        if (list.length > 0) setSelectedTheme(list[0].id);
      })
      .catch(() => toast.error('Failed to load theme list'))
      .finally(() => setLoadingThemes(false));
  }, []);

  const fetchReflections = useCallback(async () => {
    if (!selectedTheme) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/archive/${selectedTheme}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setReflections(data.reflections ?? []);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedTheme]);

  useEffect(() => { fetchReflections(); }, [fetchReflections]);

  const handleDelete = async (reflectionId: string) => {
    if (!confirm('Are you sure you want to permanently delete this reflection?')) return;
    setDeleting(reflectionId);
    try {
      const res = await fetch(`/api/admin/archive/${selectedTheme}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reflectionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Reflection deleted!');
      setReflections(prev => prev.filter(r => r.id !== reflectionId));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = reflections.filter(r =>
    r.content?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d?: string) => d ? new Date(d).toLocaleString() : '—';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
          <SelectTrigger className="w-56 bg-white border-gray-200 text-gray-800">
            <SelectValue placeholder="Select theme..." />
          </SelectTrigger>
          <SelectContent>
            {themeOptions.map(theme => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.title || theme.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex items-center flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute ml-3 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reflection text..."
            className="bg-white border-gray-200 text-gray-800 pl-9 placeholder:text-gray-400 focus:border-yellow-400"
          />
        </div>

        <Button onClick={fetchReflections} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-3 pb-3 px-4 flex items-center gap-3">
            <Archive className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Reflections</p>
              <p className="text-xl font-black text-gray-900">{reflections.length}</p>
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-gray-400">
          Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''} for{' '}
          <span className="font-bold text-gray-600">
            {themeOptions.find(t => t.id === selectedTheme)?.title || selectedTheme}
          </span>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <Archive className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No reflections found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="bg-white border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
              <CardContent className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm leading-relaxed">{r.content}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatDate(r.timestamp)}
                      </span>
                      {r.userId && (
                        <Badge className="bg-gray-50 text-gray-500 border-gray-200 text-[10px] font-mono px-1.5 py-0">
                          {r.userId.slice(0, 20)}…
                        </Badge>
                      )}
                      <Badge className="bg-gray-50 text-gray-400 border-gray-100 text-[10px] font-mono px-1.5 py-0">
                        {r.id}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(r.id)}
                    disabled={deleting === r.id}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
