'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, MessageSquare, ChevronDown, ChevronUp, AlertTriangle, Trash2, Loader2, BookOpen, Clock, Ban } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface Reflection {
  id: string;
  content: string;
  reflectionType: string;
  tokens: number;
  timestamp: string;
  promptId: string;
  themeId: string;
  revoked: boolean;
}

interface User {
  id: string;
  email: string;
  tokens: number;
  themeId: string | null;
}

interface Props {
  user: User | null;
  onClose: () => void;
  onTokensRevoked: (userId: string, newTotal?: number) => void;
}

const REFLECTION_TYPE_LABELS: Record<string, string> = {
  main: 'Main Reflection',
  primary: 'Main Reflection',
  'follow-up': 'Follow-Up',
  deeper: 'Deeper Dive',
  'archive-response': 'Archive Response',
  perspective: 'Perspective',
  'time-shift': 'Time Shift',
};

export function UserReflectionsModal({ user, onClose, onTokensRevoked }: Props) {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [currentTokens, setCurrentTokens] = useState(0);

  useEffect(() => {
    if (!user) return;
    setReflections([]);
    setLoading(true);
    setConfirmRevoke(false);
    setConfirmRevokeId(null);
    setCurrentTokens(user.tokens);

    fetch(`/api/admin/users/${user.id}/reflections`)
      .then((r) => r.json())
      .then((data) => {
        setReflections(data.reflections || []);
      })
      .catch(() => toast.error('Failed to load reflections'))
      .finally(() => setLoading(false));
  }, [user]);

  // Revoke ALL tokens
  const handleRevokeAll = async () => {
    if (!user) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/revoke-tokens`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to revoke');
      toast.success(`All tokens revoked for ${user.email}`);
      onTokensRevoked(user.id, 0);
      onClose();
    } catch {
      toast.error('Failed to revoke tokens');
    } finally {
      setRevoking(false);
      setConfirmRevoke(false);
    }
  };

  // Revoke tokens for a SINGLE reflection
  const handleRevokeReflection = async (reflectionId: string) => {
    if (!user) return;
    setRevokingId(reflectionId);
    try {
      const res = await fetch(
        `/api/admin/users/${user.id}/reflections/${reflectionId}/revoke`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke');

      const tokensDeducted = data.tokensDeducted ?? 0;
      if (data.alreadyRevoked) {
        toast.info('Tokens already revoked for this reflection');
      } else {
        toast.success(`Revoked ${tokensDeducted} tokens`);
      }

      // Mark reflection as revoked locally
      setReflections((prev) =>
        prev.map((r) => r.id === reflectionId ? { ...r, revoked: true, tokens: 0 } : r)
      );
      const newTotal = data.newTokenTotal ?? Math.max(0, currentTokens - tokensDeducted);
      setCurrentTokens(newTotal);
      onTokensRevoked(user.id, newTotal);
    } catch (e: any) {
      toast.error(e.message || 'Failed to revoke');
    } finally {
      setRevokingId(null);
      setConfirmRevokeId(null);
    }
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalTokens = reflections.reduce((s, r) => s + (r.tokens ?? 0), 0);

  return (
    <AnimatePresence>
      {user && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-mono">{user.id}</p>
                <p className="text-gray-900 font-bold text-base truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {user.themeId && (
                    <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                      {user.themeId}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-yellow-600 font-bold text-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentTokens} tokens
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Revoke All Section */}
            <div className="px-5 py-3 border-b border-gray-100 bg-red-50/50">
              {!confirmRevoke ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
                  onClick={() => setConfirmRevoke(true)}
                  disabled={currentTokens === 0}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revoke All Tokens
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-red-600 text-sm font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Confirm revoke all {currentTokens} tokens?
                  </span>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                    onClick={handleRevokeAll}
                    disabled={revoking}
                  >
                    {revoking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Yes, Revoke All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500"
                    onClick={() => setConfirmRevoke(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Reflections List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Reflections ({reflections.length})
                </p>
                <p className="text-xs text-yellow-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {totalTokens} active tokens
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-4 space-y-2 animate-pulse">
                      <div className="h-3 w-1/3 bg-gray-100 rounded" />
                      <div className="h-3 w-full bg-gray-100 rounded" />
                      <div className="h-3 w-4/5 bg-gray-100 rounded" />
                    </div>
                  ))}
                </div>
              ) : reflections.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No reflections yet</p>
                </div>
              ) : (
                reflections.map((ref) => {
                  const isExpanded = !!expanded[ref.id];
                  const isConfirmingThis = confirmRevokeId === ref.id;
                  const isRevokingThis = revokingId === ref.id;
                  const PREVIEW_LEN = 160;
                  const needsTruncation = ref.content.length > PREVIEW_LEN;

                  return (
                    <div
                      key={ref.id}
                      className={`rounded-xl border p-4 space-y-2 transition-colors ${
                        ref.revoked
                          ? 'border-gray-100 bg-gray-50 opacity-60'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0">
                            {REFLECTION_TYPE_LABELS[ref.reflectionType] || ref.reflectionType}
                          </Badge>
                          {ref.revoked ? (
                            <Badge className="bg-gray-100 text-gray-400 border-gray-200 text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                              <Ban className="w-2.5 h-2.5" /> Revoked
                            </Badge>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs">
                              <Sparkles className="w-3 h-3" />
                              +{ref.tokens}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-gray-400 text-[10px] whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {new Date(ref.timestamp).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                          {/* Per-reflection revoke */}
                          {!ref.revoked && (
                            isConfirmingThis ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-[10px] bg-red-600 hover:bg-red-700 text-white gap-1"
                                  onClick={() => handleRevokeReflection(ref.id)}
                                  disabled={isRevokingThis}
                                >
                                  {isRevokingThis ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : null}
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[10px] text-gray-400"
                                  onClick={() => setConfirmRevokeId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <button
                                className="text-[10px] text-red-400 hover:text-red-600 flex items-center gap-0.5 transition-colors whitespace-nowrap"
                                onClick={() => setConfirmRevokeId(ref.id)}
                              >
                                <Ban className="w-2.5 h-2.5" /> Revoke
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {isExpanded || !needsTruncation
                          ? ref.content
                          : ref.content.slice(0, PREVIEW_LEN) + '...'}
                      </p>

                      {needsTruncation && (
                        <button
                          onClick={() => toggleExpand(ref.id)}
                          className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-3 h-3" /> Show less</>
                          ) : (
                            <><ChevronDown className="w-3 h-3" /> Read more</>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
