'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { RefreshCw, Pencil, Search, AlertTriangle, BookOpen, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface AdminTheme {
  id: string;
  title?: string;
  description?: string;
  prompt?: string;
  prompts?: string[];
  youtubeVideoId?: string;
  artworkUrl?: string;
  [key: string]: any;
}

export function ThemeManagementTab() {
  const router = useRouter();
  const [themes, setThemes] = useState<AdminTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/themes');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch themes');
      setThemes(data.themes);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  const filtered = themes.filter(t =>
    t.id?.toLowerCase().includes(search.toLowerCase()) ||
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex items-center flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute ml-3 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search themes..."
            className="bg-white border-gray-200 text-gray-800 pl-9 placeholder:text-gray-400 focus:border-yellow-400"
          />
        </div>
        <Button
          onClick={fetchThemes}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-400 mb-1">Total Themes</p>
            <p className="text-2xl font-black text-gray-900">{themes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-gray-400 mb-1">With Prompts</p>
            <p className="text-2xl font-black text-yellow-500">
              {themes.filter(t => t.prompt || (t.prompts && t.prompts.length > 0)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No themes found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((theme) => (
            <Card key={theme.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Artwork thumbnail */}
                    {theme.artworkUrl && (
                      <div className="w-14 h-14 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                        <img src={theme.artworkUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-xs">
                          {theme.id}
                        </Badge>
                        {theme.title && (
                          <span className="text-gray-800 font-semibold text-sm">{theme.title}</span>
                        )}
                      </div>
                      {theme.description && (
                        <p className="text-gray-500 text-xs line-clamp-2">{theme.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {(theme.prompt || (theme.prompts && theme.prompts.length > 0)) && (
                          <span className="text-yellow-600 text-xs font-medium">
                            {theme.prompts ? `${theme.prompts.length} prompts` : '1 prompt'}
                          </span>
                        )}
                        {theme.youtubeVideoId && (
                          <span className="text-blue-500 text-xs font-medium">🎵 YouTube linked</span>
                        )}
                        {theme.rewardTiers && (
                          <span className="text-green-600 text-xs font-medium">✨ {theme.rewardTiers.length} reward tiers</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/admin-control/themes/${theme.id}`)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-1.5 flex-shrink-0 shadow-none"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
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
