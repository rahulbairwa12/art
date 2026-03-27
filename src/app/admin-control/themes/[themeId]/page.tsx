'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { motion } from 'motion/react';
import {
  ArrowLeft, Save, RefreshCw, Plus, Trash2, ChevronDown, ChevronUp,
  Image, Music, BookOpen, Link, Sparkles, FileText, HelpCircle,
  GraduationCap, Sunrise, Heart, Crown, Globe, Shield, Flag, Leaf, Vote, Users, Puzzle, Archive, LayoutDashboard
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AdminGuard } from '../../../components/admin/AdminGuard';

// ------- Types -------
interface ThemeDetails {
  artistStatement: string;
  yearCreated: string;
  medium: string;
  dimensions: string;
  inspiration: string;
}

interface FeaturedReflection {
  content: string;
  author?: string;
}

interface FooterLink {
  label: string;
  url: string;
}

interface FollowUpQuestion {
  'follow-up': string;
  deeper: string;
  'archive-response': string;
  perspective: string;
  'time-shift': string;
}

interface RewardTier {
  tokens: number;
  discount: number;
  code: string;
}

interface OverviewSlide {
  type: 'image-cta' | 'info' | 'music';
  title?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  description?: string;
  buttonText?: string;
  icon?: string;
  themeDetails?: ThemeDetails;
  youtubeVideoId?: string;
  musicLibraryLink?: string;
}

interface ThemeData {
  id: string;
  title: string;
  youtubeVideoId: string;
  artworkUrl: string;
  externalLink?: string;
  themeDetails?: ThemeDetails;
  prompts?: string[];
  prompt?: string;
  promptStartDate?: string;
  followUpQuestions?: FollowUpQuestion[];
  rewardTiers?: RewardTier[];
  featuredReflections?: FeaturedReflection[];
  rewardSectionDescription?: string;
  footerLinks?: FooterLink[];
  overviewSlides?: OverviewSlide[];
  // Music Section
  musicSectionTitle?: string;
  musicYoutubeVideoId?: string;
  musicLibraryLink?: string;
  musicSectionButtonText?: string;
  musicSectionCaption?: string;
  // Aesthetics
  gradients?: string[];
  accentColors?: string[];
  badgeEmoji?: string;
  badgeBg?: string;
  archiveName?: string;
  reflectionCallToAction?: string;
  progressReportName?: string;
  archiveSectionName?: string;
  archiveSectionHeading?: string;
  archiveSectionCaption?: string;
}

// ------- Section Wrapper -------
function Section({
  title, icon, children, defaultOpen = true
}: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader
        className="cursor-pointer py-3 px-4 flex flex-row items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">{icon}</span>
          <CardTitle className="text-gray-800 text-base font-bold">{title}</CardTitle>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </CardHeader>
      {open && <CardContent className="px-4 pb-4 pt-2 space-y-4">{children}</CardContent>}
    </Card>
  );
}

// ------- Field helpers -------
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600 mb-1 block">{label}</label>
      {hint && <p className="text-[11px] text-gray-400 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

const inputClass = "bg-white border-gray-200 text-gray-900 focus:border-yellow-400 text-sm";
const textareaClass = `${inputClass} resize-none`;

// ------- Main Page -------
export default function ThemeEditorPage() {
  const { themeId } = useParams<{ themeId: string }>();
  const router = useRouter();

  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsedSlides, setCollapsedSlides] = useState<Record<number, boolean>>({});
  const [archiveReflections, setArchiveReflections] = useState<any[]>([]);

  const toggleSlideCollapse = (idx: number) => {
    setCollapsedSlides(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const fetchTheme = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/themes/${themeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTheme(data.theme);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [themeId]);

  const fetchArchiveReflections = useCallback(async () => {
    try {
      const res = await fetch(`/api/archive/${themeId}`);
      const data = await res.json();
      if (res.ok) {
        setArchiveReflections(data.reflections || []);
      }
    } catch (e) {
      console.error('Error fetching archive reflections:', e);
    }
  }, [themeId]);

  useEffect(() => { 
    fetchTheme(); 
    fetchArchiveReflections();
  }, [fetchTheme, fetchArchiveReflections]);

  const patch = (updates: Partial<ThemeData>) => setTheme(prev => prev ? { ...prev, ...updates } : prev);
  const patchDetails = (updates: Partial<ThemeDetails>) =>
    setTheme(prev => prev ? { ...prev, themeDetails: { ...(prev.themeDetails ?? {} as ThemeDetails), ...updates } } : prev);

  const handleSave = async () => {
    if (!theme) return;
    setSaving(true);
    try {
      const { id, ...updates } = theme;
      const res = await fetch(`/api/admin/themes/${themeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Theme saved!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // ------- Prompt helpers -------
  const prompts = theme?.prompts ?? (theme?.prompt ? [theme.prompt] : ['']);
  const setPrompts = (p: string[]) => patch({ prompts: p, prompt: p[0] ?? '' });

  // ------- Follow-up helpers -------
  const followUps = theme?.followUpQuestions ?? [];
  const setFollowUps = (f: FollowUpQuestion[]) => patch({ followUpQuestions: f });
  const updateFollowUp = (idx: number, key: keyof FollowUpQuestion, val: string) => {
    const next = [...followUps];
    next[idx] = { ...next[idx], [key]: val };
    setFollowUps(next);
  };
  const addFollowUp = () => setFollowUps([...followUps, {
    'follow-up': '', deeper: '', 'archive-response': '', perspective: '', 'time-shift': ''
  }]);
  const removeFollowUp = (idx: number) => setFollowUps(followUps.filter((_, i) => i !== idx));

  // ------- Reward tier helpers -------
  const tiers = theme?.rewardTiers ?? [];
  const setTiers = (t: RewardTier[]) => patch({ rewardTiers: t });
  const updateTier = (idx: number, key: keyof RewardTier, val: string | number) => {
    const next = [...tiers];
    next[idx] = { ...next[idx], [key]: val };
    setTiers(next);
  };
  const addTier = () => setTiers([...tiers, { tokens: 0, discount: 0, code: '' }]);
  const removeTier = (idx: number) => setTiers(tiers.filter((_, i) => i !== idx));
  
  // ------- Overview Slide helpers -------
  const slides = theme?.overviewSlides ?? [];
  const setSlides = (s: OverviewSlide[]) => patch({ overviewSlides: s });

  const updateSlide = (idx: number, updates: Partial<OverviewSlide>) => {
    const next = [...slides];
    next[idx] = { ...next[idx], ...updates };
    setSlides(next);
  };

  const updateSlideDetails = (idx: number, updates: Partial<ThemeDetails>) => {
    const next = [...slides];
    const slide = next[idx];
    if (slide.type === 'info') {
      next[idx] = {
        ...slide,
        themeDetails: { ...(slide.themeDetails ?? {} as ThemeDetails), ...updates }
      };
      setSlides(next);
    }
  };

  const addSlide = (type: OverviewSlide['type']) => {
    const newSlide: OverviewSlide = { type };
    if (type === 'info') {
      newSlide.title = '';
      newSlide.description = '';
      newSlide.buttonText = 'Read More';
      newSlide.icon = 'GraduationCap';
      newSlide.themeDetails = { artistStatement: '', yearCreated: '', medium: '', dimensions: '', inspiration: '' };
    } else if (type === 'music') {
      newSlide.title = 'Theme Anthem';
      newSlide.youtubeVideoId = '';
      newSlide.musicLibraryLink = '';
    } else if (type === 'image-cta') {
      newSlide.imageUrl = '';
      newSlide.ctaText = 'Learn More';
      newSlide.ctaUrl = '';
    }
    setSlides([...slides, newSlide]);
  };

  const removeSlide = (idx: number) => setSlides(slides.filter((_, i) => i !== idx));

  const moveSlide = (idx: number, direction: 'up' | 'down') => {
    const next = [...slides];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSlides(next);
  };

  // ------- Featured Reflection helpers -------
  const featured = theme?.featuredReflections ?? [];
  const setFeatured = (f: FeaturedReflection[]) => patch({ featuredReflections: f });
  const updateFeatured = (idx: number, key: keyof FeaturedReflection, val: string) => {
    const next = [...featured];
    next[idx] = { ...next[idx], [key]: val };
    setFeatured(next);
  };
  const addFeatured = () => setFeatured([...featured, { content: '', author: '' }]);
  const removeFeatured = (idx: number) => setFeatured(featured.filter((_, i) => i !== idx));
  
  const featureReflection = (content: string, author?: string) => {
    setFeatured([...featured, { content, author: author || 'Anonymous' }]);
    toast.success('Reflection added to Featured Slides!');
  };

  // ------- Footer Link helpers -------
  const links = theme?.footerLinks ?? [];
  const setLinks = (l: FooterLink[]) => patch({ footerLinks: l });
  const updateLink = (idx: number, key: keyof FooterLink, val: string) => {
    const next = [...links];
    next[idx] = { ...next[idx], [key]: val };
    setLinks(next);
  };
  const addLink = () => setLinks([...links, { label: '', url: '' }]);
  const removeLink = (idx: number) => setLinks(links.filter((_, i) => i !== idx));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading theme…</p>
      </div>
    </div>
  );

  if (!theme) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Theme not found.</p>
    </div>
  );

  const ICON_OPTIONS = ['GraduationCap', 'Sunrise', 'Heart', 'Crown', 'Trash2', 'Globe', 'Shield', 'Flag', 'Leaf', 'Vote', 'Users', 'Music', 'Puzzle'];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-center" />

        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin-control')}
                className="text-gray-500 hover:text-gray-800 gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="w-px h-5 bg-gray-200" />
              <div>
                <p className="text-xs text-gray-400 leading-none">Editing theme</p>
                <p className="text-gray-900 font-black text-base leading-tight">{theme.title || themeId}</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save All Changes'}
            </Button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

          {/* ── Theme Identity ── */}
          <Section title="Theme Identity" icon={<LayoutDashboard className="w-4 h-4" />}>
            <Field label="System Theme ID (Read-only)"><Input value={theme.id} disabled className={`${inputClass} bg-gray-50 text-gray-400`} /></Field>
            <Field label="Theme Display Name" hint="The main title of the theme (e.g. ECHOES OF THE EAST)">
              <Input value={theme.title ?? ''} onChange={e => patch({ title: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Section Header Text" hint="Shown at the very top (e.g. The Bridge of Shared Stories)">
              <Input value={theme.archiveSectionName ?? ''} onChange={e => patch({ archiveSectionName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Archive Pill Label" hint="Text inside the pill button (e.g. Cultural Dialogue Archive)">
              <Input value={theme.archiveName ?? ''} onChange={e => patch({ archiveName: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Prompt Start Date (ISO)">
              <Input value={theme.promptStartDate ?? ''} onChange={e => patch({ promptStartDate: e.target.value })} className={inputClass} placeholder="2026-03-08T00:00:00.000Z" />
            </Field>
          </Section>

          {/* ── Overview Slides ── */}
          <Section title="Overview Slides" icon={<LayoutDashboard className="w-4 h-4" />}>
            <p className="text-xs text-gray-400 mb-4">Add, remove, and reorder the introduction slides for this theme.</p>
            <div className="space-y-6">
              {slides.map((slide, i) => {
                const isCollapsed = collapsedSlides[i] ?? false;

                return (
                  <Card key={i} className="border-gray-200 bg-gray-50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />

                    {/* Slide Header (Always Visible) */}
                    <div
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100"
                      onClick={() => toggleSlideCollapse(i)}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-black bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Slide #{i + 1}</span>
                          <span className="text-xs font-bold text-gray-500 capitalize px-2 py-0.5 rounded-full border border-gray-200 bg-white flex items-center gap-1.5">
                            {slide.type === 'image-cta' && <>🖼️ <span className="hidden sm:inline">Image & CTA</span></>}
                            {slide.type === 'info' && <>ℹ️ <span className="hidden sm:inline">Details Card</span></>}
                            {slide.type === 'music' && <>🎵 <span className="hidden sm:inline">Music Video</span></>}
                          </span>
                        </div>

                        {/* Summary text when collapsed */}
                        {isCollapsed && (
                          <span className="text-xs text-gray-400 truncate font-medium border-l border-gray-200 pl-3">
                            {slide.title || slide.description || slide.imageUrl || slide.youtubeVideoId || "(No content)"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => moveSlide(i, 'up')} disabled={i === 0} className="h-7 w-7 p-0"><ChevronUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => moveSlide(i, 'down')} disabled={i === slides.length - 1} className="h-7 w-7 p-0"><ChevronDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => removeSlide(i)} className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <CardContent className="p-4 space-y-4">
                        {/* Common Fields: Title */}
                        <Field label="Slide Title (Optional)">
                          <Input
                            value={slide.title ?? ''}
                            onChange={e => updateSlide(i, { title: e.target.value })}
                            className={inputClass}
                            placeholder="e.g. The Class Act Anthem"
                          />
                        </Field>

                        {/* Type-Specific Fields */}
                        {slide.type === 'image-cta' && (
                          <div className="space-y-4">
                            <Field label="Artwork URL" hint="URL for the main image">
                              <Input value={slide.imageUrl ?? ''} onChange={e => updateSlide(i, { imageUrl: e.target.value })} className={inputClass} placeholder="https://..." />
                            </Field>
                            {slide.imageUrl && (
                              <div className="rounded-lg overflow-hidden border border-gray-200 max-h-32 bg-gray-100 flex items-center justify-center">
                                <img src={slide.imageUrl} alt="Preview" className="max-h-32 object-contain" />
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="CTA Button Text">
                                <Input value={slide.ctaText ?? ''} onChange={e => updateSlide(i, { ctaText: e.target.value })} className={inputClass} placeholder="Learn More" />
                              </Field>
                              <Field label="CTA Button Link">
                                <Input value={slide.ctaUrl ?? ''} onChange={e => updateSlide(i, { ctaUrl: e.target.value })} className={inputClass} placeholder="https://..." />
                              </Field>
                            </div>
                          </div>
                        )}

                        {slide.type === 'info' && (
                          <div className="space-y-4">
                            <Field label="Main Description" hint="Bold text shown on the card">
                              <Textarea value={slide.description ?? ''} onChange={e => updateSlide(i, { description: e.target.value })} rows={3} className={textareaClass} />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Dialog Button Label" hint="e.g. Full Lesson Plan">
                                <Input value={slide.buttonText ?? ''} onChange={e => updateSlide(i, { buttonText: e.target.value })} className={inputClass} />
                              </Field>
                              <Field label="Card Icon">
                                <select
                                  value={slide.icon ?? 'GraduationCap'}
                                  onChange={e => updateSlide(i, { icon: e.target.value })}
                                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:border-yellow-400"
                                >
                                  {ICON_OPTIONS.map(id => <option key={id} value={id}>{id}</option>)}
                                </select>
                              </Field>
                            </div>

                            {/* Detailed Artist Info (Inside Dialog) */}
                            <div className="pt-2 border-t border-gray-200 mt-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Artist & Lesson Plan Details (In-Dialog)</p>
                              <div className="space-y-3">
                                <Field label="Artist Statement">
                                  <Textarea value={slide.themeDetails?.artistStatement ?? ''} onChange={e => updateSlideDetails(i, { artistStatement: e.target.value })} rows={2} className={textareaClass} />
                                </Field>
                                <div className="grid grid-cols-3 gap-2">
                                  <Field label="Year"><Input value={slide.themeDetails?.yearCreated ?? ''} onChange={e => updateSlideDetails(i, { yearCreated: e.target.value })} className="h-8 text-xs bg-white border-gray-200" /></Field>
                                  <Field label="Medium"><Input value={slide.themeDetails?.medium ?? ''} onChange={e => updateSlideDetails(i, { medium: e.target.value })} className="h-8 text-xs bg-white border-gray-200" /></Field>
                                  <Field label="Dimensions"><Input value={slide.themeDetails?.dimensions ?? ''} onChange={e => updateSlideDetails(i, { dimensions: e.target.value })} className="h-8 text-xs bg-white border-gray-200" /></Field>
                                </div>
                                <Field label="Inspiration">
                                  <Textarea value={slide.themeDetails?.inspiration ?? ''} onChange={e => updateSlideDetails(i, { inspiration: e.target.value })} rows={2} className={textareaClass} />
                                </Field>
                              </div>
                            </div>
                          </div>
                        )}

                        {slide.type === 'music' && (
                          <div className="space-y-4">
                            <Field label="YouTube Video ID" hint="e.g. NqxAPe21K28">
                              <Input value={slide.youtubeVideoId ?? ''} onChange={e => updateSlide(i, { youtubeVideoId: e.target.value })} className={inputClass} />
                            </Field>
                            <Field label="Music Library Link">
                              <Input value={slide.musicLibraryLink ?? ''} onChange={e => updateSlide(i, { musicLibraryLink: e.target.value })} className={inputClass} />
                            </Field>
                            {slide.youtubeVideoId && (
                              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${slide.youtubeVideoId}`} title="Preview" className="w-full h-full" />
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={() => addSlide('image-cta')} variant="outline" size="sm" className="flex-1 border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-500 gap-1 text-[11px] font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Image Slide
              </Button>
              <Button onClick={() => addSlide('info')} variant="outline" size="sm" className="flex-1 border-dashed border-gray-300 hover:border-purple-400 hover:text-purple-500 gap-1 text-[11px] font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Details Slide
              </Button>
              <Button onClick={() => addSlide('music')} variant="outline" size="sm" className="flex-1 border-dashed border-gray-300 hover:border-yellow-400 hover:text-yellow-500 gap-1 text-[11px] font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Music Slide
              </Button>
            </div>
          </Section>

          {/* ── Music Section ── */}
          <Section title="Music Section" icon={<Music className="w-4 h-4" />}>
            <p className="text-xs text-gray-400 mb-4">Customize the soundtrack section that appears below the overview slides.</p>
            <div className="space-y-4">
              <Field label="Section Title" hint="e.g. 📼 THE SOUNDTRACK">
                <Input
                  value={theme.musicSectionTitle ?? ''}
                  onChange={e => patch({ musicSectionTitle: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="YouTube Video ID" hint="Used for the music section player (e.g. NqxAPe21K28)">
                <Input
                  value={theme.musicYoutubeVideoId ?? ''}
                  onChange={e => patch({ musicYoutubeVideoId: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Music Library Link" hint="Where the 'add to my library' button leads">
                <Input
                  value={theme.musicLibraryLink ?? ''}
                  onChange={e => patch({ musicLibraryLink: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Button Text">
                  <Input
                    value={theme.musicSectionButtonText ?? ''}
                    onChange={e => patch({ musicSectionButtonText: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Caption Text">
                  <Input
                    value={theme.musicSectionCaption ?? ''}
                    onChange={e => patch({ musicSectionCaption: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              {theme.musicYoutubeVideoId && (
                <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${theme.musicYoutubeVideoId}`} title="Music Preview" className="w-full h-full" />
                </div>
              )}
            </div>
          </Section>

          <Section title="Reflection Prompts" icon={<HelpCircle className="w-4 h-4" />}>
            <p className="text-xs text-gray-400">One prompt per box. Users see these as the main reflection question.</p>
            {prompts.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Textarea
                  value={p}
                  onChange={e => { const n = [...prompts]; n[i] = e.target.value; setPrompts(n); }}
                  rows={2}
                  className={`${textareaClass} flex-1`}
                  placeholder={`Prompt ${i + 1}…`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrompts(prompts.filter((_, j) => j !== i))}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-1 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => setPrompts([...prompts, ''])} variant="ghost" className="text-yellow-600 hover:bg-yellow-50 gap-2 text-sm w-full border border-dashed border-yellow-300">
              <Plus className="w-4 h-4" /> Add Prompt
            </Button>
          </Section>



          {/* ── Archive Slides (Featured Reflections) ── */}
          <Section title="Archive Slides (Featured Reflections)" icon={<Archive className="w-4 h-4" />} defaultOpen={false}>
            <div className="space-y-4">
              {/* Recent Submissions Feed */}
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">Recent Submissions</h4>
                  <Button variant="ghost" size="sm" onClick={fetchArchiveReflections} className="h-6 w-6 p-0 text-indigo-400 hover:text-indigo-600">
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
                
                {archiveReflections.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">No submissions found yet for this theme.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-indigo-200">
                    {archiveReflections.map((ref, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm flex items-start gap-3 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 line-clamp-2 italic mb-1">"{ref.content}"</p>
                          <p className="text-[10px] font-bold text-indigo-400">— {ref.author || 'Anonymous'}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => featureReflection(ref.content, ref.author)}
                          className="flex-shrink-0 h-7 w-7 p-0 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-indigo-400 mt-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Click the + to add a submission to the featured list below.
                </p>
              </div>

              <div className="h-px bg-gray-100 my-2" />
              
              <p className="text-xs text-gray-400">Curate specific reflections to appear in the "Shared Stories" section manually below.</p>
              <div className="space-y-4">
              {featured.map((fr, i) => (
                <Card key={i} className="border-gray-200 bg-gray-50">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-gray-600">Slide #{i + 1}</p>
                      <Button variant="ghost" size="sm" onClick={() => removeFeatured(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 px-2">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Field label="Reflection Content">
                      <Textarea
                        value={fr.content}
                        onChange={e => updateFeatured(i, 'content', e.target.value)}
                        rows={3}
                        className={textareaClass}
                        placeholder="Enter reflection text..."
                      />
                    </Field>
                    <Field label="Author (Optional)" hint="e.g. Anonymous, Sarah M.">
                      <Input
                        value={fr.author ?? ''}
                        onChange={e => updateFeatured(i, 'author', e.target.value)}
                        className={inputClass}
                        placeholder="Author name..."
                      />
                    </Field>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={addFeatured} variant="ghost" className="text-indigo-600 hover:bg-indigo-50 gap-2 text-sm w-full border border-dashed border-indigo-300">
              <Plus className="w-4 h-4" /> Add Featured Slide
            </Button>
          </div>
        </Section>

          {/* ── Archive Footer (Raise Your Voice) ── */}
          <Section title="Archive Footer (Raise Your Voice)" icon={<Link className="w-4 h-4" />} defaultOpen={false}>
            <p className="text-xs text-gray-400">Configure the call-to-action and links at the very bottom of the page.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-4">
              <Field label="Archive Heading" hint="e.g. 🗳️ Raise Your Voice">
                <Input
                  value={theme.archiveSectionHeading ?? ''}
                  onChange={e => patch({ archiveSectionHeading: e.target.value })}
                  className={inputClass}
                  placeholder="Enter section heading..."
                />
              </Field>
              <Field label="Archive Caption">
                <Textarea
                  value={theme.archiveSectionCaption ?? ''}
                  onChange={e => patch({ archiveSectionCaption: e.target.value })}
                  rows={2}
                  className={textareaClass}
                  placeholder="Enter section caption..."
                />
              </Field>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-600 block">Footer Buttons</label>
              {links.map((link: FooterLink, i: number) => (
                <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Button #{i + 1}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeLink(i)} className="h-6 w-6 p-0 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={link.label}
                      onChange={e => updateLink(i, 'label', e.target.value)}
                      placeholder="Label (e.g. 🖼️ Buy Artwork)"
                      className={inputClass}
                    />
                    <Input
                      value={link.url}
                      onChange={e => updateLink(i, 'url', e.target.value)}
                      placeholder="URL (e.g. https://...)"
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addLink} variant="ghost" className="text-gray-500 hover:bg-gray-100 gap-2 text-xs w-full border border-dashed border-gray-200">
                <Plus className="w-3 h-3" /> Add Footer Button
              </Button>
            </div>
          </Section>

          {/* ── Reward Tiers ── */}
          <Section title="Reward Tiers (Vibe Tokens)" icon={<Sparkles className="w-4 h-4" />} defaultOpen={false}>
            <p className="text-xs text-gray-400">Define token milestones and the discount codes users unlock.</p>
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-bold text-gray-500 px-1">
              <span>Tokens Required</span>
              <span>Discount %</span>
              <span>Code</span>
              <span />
            </div>
            {tiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                <Input
                  type="number"
                  value={tier.tokens}
                  onChange={e => updateTier(i, 'tokens', Number(e.target.value))}
                  className={inputClass}
                />
                <Input
                  type="number"
                  value={tier.discount}
                  onChange={e => updateTier(i, 'discount', Number(e.target.value))}
                  className={inputClass}
                />
                <Input
                  value={tier.code}
                  onChange={e => updateTier(i, 'code', e.target.value)}
                  className={inputClass}
                  placeholder="VIBE10"
                />
                <Button variant="ghost" size="sm" onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addTier} variant="ghost" className="text-yellow-600 hover:bg-yellow-50 gap-2 text-sm w-full border border-dashed border-yellow-300">
              <Plus className="w-4 h-4" /> Add Tier
            </Button>
          </Section>

          {/* Floating Save */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 flex justify-center pb-2"
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-black shadow-xl gap-2 px-8"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving…' : 'Save All Changes'}
            </Button>
          </motion.div>

        </div>
      </div>
    </AdminGuard>
  );
}
