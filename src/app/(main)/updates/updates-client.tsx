"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Lock, 
  Zap, 
  HeartHandshake, 
  Brain, 
  ListTodo, 
  Languages, 
  Image as ImageIcon, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  Calendar,
  Layers,
  Sparkle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Release data interface
interface ReleaseNote {
  version: string;
  date: string;
  badge?: string;
  summary: string;
  added: string[];
  updated: string[];
  aiHighlights?: string[];
}

const RELEASES: ReleaseNote[] = [
  {
    version: 'v2.4.0',
    date: 'July 2026',
    badge: 'Latest Release',
    summary: 'Introduced the AI Transparency Hub, upgraded empathy comment evaluation, and enhanced mood insights.',
    added: [
      'Interactive Update Log & AI Transparency Hub to track platform releases and understand AI engine operations.',
      'Enhanced AI Empathy Assistant with real-time feedback for supportive commenting.',
      'Visual Mood Summary Cards on user dashboards for qualitative insight tracking.'
    ],
    updated: [
      'Optimized PWA caching strategy for faster initial load times on mobile devices.',
      'Refined client-side safety pre-filtering for faster form response.'
    ],
    aiHighlights: [
      'Updated AI safety pipelines to run completely isolated in serverless runtime.',
      'Zero model training guarantee on all user vents and private notes.'
    ]
  },
  {
    version: 'v2.3.0',
    date: 'June 2026',
    summary: 'Launched 5-Minute Micro-Action Item generation and customizable reflection prompts.',
    added: [
      '5-Minute Micro-Action Item generator for converting overwhelming vent thoughts into actionable relief steps.',
      'Self-guided reflection prompt requests directly within the Vent creation form.',
      'Dark mode shader gradient background customization options.'
    ],
    updated: [
      'Upgraded private vent encryption standards for enhanced anonymity.',
      'Improved feed pagination and instant category tab switching.'
    ],
    aiHighlights: [
      'Added multilingual context handling for Hinglish and mixed-language venting.'
    ]
  },
  {
    version: 'v2.2.0',
    date: 'May 2026',
    summary: 'Introduced real-time AI safety evaluation and hybrid crisis support triggers.',
    added: [
      'Serverless AI Content Safety analyzer detecting distress signals and content boundaries.',
      'Automated safety support modal providing crisis helpline info when emotional distress is detected.',
      'Public feed category filtering (Stress, Relationships, Work, Hope).'
    ],
    updated: [
      'Streamlined vent submission workflow with client-side validation.',
      'Redesigned public feed card layouts for improved readability.'
    ],
    aiHighlights: [
      'Built automated AI fallback handlers to ensure vent posting is never blocked by external service delays.'
    ]
  },
  {
    version: 'v2.1.0',
    date: 'April 2026',
    summary: 'Launched Bright Spots (Moments) and integrated instant notifications.',
    added: [
      'Bright Spots feature for sharing uplifting daily highlights and gratitude.',
      'Real-time notifications dropdown for comment replies and platform updates.',
      'User profile customization and anonymous display mode.'
    ],
    updated: [
      'Enhanced responsive navigation bar with mobile bottom-nav bar.',
      'Improved user reporting workflow for community moderation.'
    ]
  },
  {
    version: 'v2.0.0',
    date: 'March 2026',
    summary: 'Complete redesign of Venting with glassmorphism UI, Next.js 15, and PWA support.',
    added: [
      'Modern glassmorphic user interface design system.',
      'Progressive Web App (PWA) installation support across mobile and desktop.',
      'Anonymous venting options and instant account registration.'
    ],
    updated: [
      'Migrated entire application architecture to Next.js App Router.',
      'Integrated Firebase Auth & Firestore with optimized real-time listeners.'
    ]
  }
];

const AI_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Content Safety & Support',
    tag: 'Safety Engine',
    description: 'Scans vents and comments in real-time to detect severe emotional distress or harmful content, instantly providing crisis resources without silencing authentic expression.',
    whereItRuns: 'Executes within secure Next.js Server Actions on backend servers before database storage.',
    howToUse: 'Runs automatically whenever you post a public vent or comment to keep the space safe.'
  },
  {
    icon: HeartHandshake,
    title: 'Empathy Assistant',
    tag: 'Community Care',
    description: 'Evaluates comment drafts for warmth and empathy, providing friendly suggestions if a comment could be phrased more supportively.',
    whereItRuns: 'Triggered upon clicking "Comment" via asynchronous server action.',
    howToUse: 'Active automatically on the Public Feed when posting replies to fellow venters.'
  },
  {
    icon: Brain,
    title: 'Self-Reflection Prompts',
    tag: 'Personal Growth',
    description: 'Generates 1-2 thoughtful, open-ended reflection questions tailored specifically to your vent content and mood rating.',
    whereItRuns: 'Calculated on demand via server-side AI flow.',
    howToUse: 'Click "Request AI Reflection" while composing a vent in the Vent form.'
  },
  {
    icon: Sparkles,
    title: 'Qualitative Mood Insights',
    tag: 'Dashboard Analytics',
    description: 'Analyzes recurring emotional themes across your recent public and private vents to provide compassionate, high-level wellness summaries.',
    whereItRuns: 'Runs on demand in your personal dashboard when requested.',
    howToUse: 'Go to your Dashboard and click "Generate AI Mood Insights" (requires at least 3 vents).'
  },
  {
    icon: ListTodo,
    title: '5-Minute Micro-Action Items',
    tag: 'Stress Relief',
    description: 'Translates heavy emotional vent text into one simple, actionable 5-minute task to help reset your focus.',
    whereItRuns: 'Processes server-side when requested after posting a vent.',
    howToUse: 'Available on your dashboard after sharing any vent (public or private).'
  },
  {
    icon: Languages,
    title: 'Multilingual & Hinglish Processing',
    tag: 'Natural Language',
    description: 'Understands natural mixed-language venting (such as Hinglish) to provide accurate safety and empathy insights without language constraints.',
    whereItRuns: 'Integrated natively into all server AI processing pipelines.',
    howToUse: 'Express yourself freely in English, Hinglish, or mixed phrasing anywhere in the app.'
  },
  {
    icon: ImageIcon,
    title: 'Media Safety Inspection',
    tag: 'Visual Moderation',
    description: 'Verifies uploaded images for community compliance prior to publishing.',
    whereItRuns: 'Processes in background server pipeline during media upload.',
    howToUse: 'Applies automatically when attaching images to moments or vents.'
  }
];

export default function UpdatesClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredReleases = RELEASES.filter(release => {
    const matchesSearch = 
      release.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      release.added.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())) ||
      release.updated.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'added') return release.added.length > 0;
    if (activeTab === 'updated') return release.updated.length > 0;
    if (activeTab === 'ai') return release.aiHighlights && release.aiHighlights.length > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header Navigation */}
      <div className="container mx-auto px-4 pt-6 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Link href="/feed">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to App</span>
            </Link>
          </Button>

          <Badge variant="outline" className="px-3 py-1 gap-1.5 border-primary/30 bg-primary/10 text-primary">
            <Sparkle className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>Platform Changelog & AI Hub</span>
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-background to-secondary/30 border border-white/10 dark:border-white/5 p-6 md:p-10 shadow-2xl mb-10">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
              Update Log & AI System Transparency
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
              Stay up to date with new features and improvements. Discover how and where AI powers Venting to protect your privacy and support your emotional journey.
            </p>

            {/* Architecture Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/60 backdrop-blur-md border border-white/10 dark:border-white/5">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Where AI Runs</h4>
                  <p className="text-sm font-bold">Serverless Actions</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/60 backdrop-blur-md border border-white/10 dark:border-white/5">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Privacy</h4>
                  <p className="text-sm font-bold">Zero Model Training</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-background/60 backdrop-blur-md border border-white/10 dark:border-white/5">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Execution</h4>
                  <p className="text-sm font-bold">Real-time & On-demand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="ai-hub" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 p-1 bg-muted/60 backdrop-blur-md rounded-xl">
            <TabsTrigger value="ai-hub" className="rounded-lg font-medium text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span>AI System & Transparency</span>
            </TabsTrigger>
            <TabsTrigger value="changelog" className="rounded-lg font-medium text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Update Log & Release Notes</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: AI TRANSPARENCY & HOW IT RUNS */}
          <TabsContent value="ai-hub" className="space-y-10 focus-visible:outline-none">
            
            {/* Where & How AI Runs Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                  <Cpu className="h-6 w-6 text-primary" />
                  Where & How AI Runs
                </h2>
                <p className="text-muted-foreground text-sm">
                  Complete clarity on how AI operates behind the scenes on Venting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-md border-white/10 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
                  <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Where AI Runs</CardTitle>
                    <CardDescription className="text-xs">Secure Serverless Backend</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                    <p>
                      All AI features run strictly inside isolated **Next.js Server Actions** on our backend cloud infrastructure.
                    </p>
                    <p>
                      No AI code runs directly on your device, preventing client bundle bloat and ensuring your requests are executed in a secure server environment.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-md border-white/10 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                      <Lock className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Zero Data Retention</CardTitle>
                    <CardDescription className="text-xs">Your Data Stay Yours</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                    <p>
                      Your vent texts and private feelings are never used to train public or commercial AI models.
                    </p>
                    <p>
                      Text is evaluated transiently in server memory during request execution and discarded immediately after producing safety or empathy results.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-md border-white/10 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3">
                      <Zap className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Fail-Safe Architecture</CardTitle>
                    <CardDescription className="text-xs">Uninterrupted User Experience</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
                    <p>
                      We implement multi-stage client pre-filters and fallback handlers.
                    </p>
                    <p>
                      If any backend AI connection experiences temporary latency or disruption, your vent or comment will still post safely without blocking your emotional outlet.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* How AI Can Be Used - Feature Directory */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  How AI Can Be Used Across Venting
                </h2>
                <p className="text-muted-foreground text-sm">
                  Explore all the places where AI is integrated to assist, protect, and empower your emotional wellness.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AI_FEATURES.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={idx} className="bg-card/60 backdrop-blur-md border-white/10 dark:border-white/5 hover:border-primary/40 transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold">{feature.title}</CardTitle>
                              <CardDescription className="text-xs">{feature.tag}</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                        
                        <div className="pt-2 border-t border-white/5 space-y-2">
                          <div className="flex items-start gap-2 text-foreground/90">
                            <Cpu className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span><strong className="font-semibold text-foreground">Where it runs:</strong> {feature.whereItRuns}</span>
                          </div>
                          <div className="flex items-start gap-2 text-foreground/90">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span><strong className="font-semibold text-foreground">How to use:</strong> {feature.howToUse}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Prompt */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-background to-secondary/20 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold mb-1">Ready to try AI features?</h3>
                <p className="text-xs text-muted-foreground">Express your feelings in a safe space or check out your dashboard insights.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild size="sm" className="gap-2">
                  <Link href="/vent">
                    <span>Create a Vent</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: RELEASE LOGS & CHANGELOG */}
          <TabsContent value="changelog" className="space-y-6 focus-visible:outline-none">
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search updates or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background/60 backdrop-blur-md"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Updates' },
                  { id: 'added', label: 'What\'s Added' },
                  { id: 'updated', label: 'What\'s Updated' },
                  { id: 'ai', label: 'AI Engine' },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="text-xs rounded-full px-3.5"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Releases Timeline */}
            <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 sm:before:left-32 before:h-full before:w-0.5 before:bg-white/10 dark:before:bg-white/5">
              {filteredReleases.length === 0 ? (
                <div className="text-center py-12 bg-card/40 rounded-2xl border border-white/5">
                  <p className="text-muted-foreground text-sm">No updates match your search filter.</p>
                  <Button variant="link" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredReleases.map((release, idx) => (
                  <div key={idx} className="relative flex flex-col sm:flex-row gap-4 sm:gap-8 items-start group">
                    {/* Left Date / Version Badge */}
                    <div className="sm:w-28 shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full">
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <span className="font-extrabold text-base sm:text-lg text-foreground">{release.version}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {release.date}
                        </span>
                      </div>
                      {release.badge && (
                        <Badge className="sm:mt-2 text-[10px] bg-primary text-primary-foreground">
                          {release.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Timeline Node Dot */}
                    <div className="absolute left-4 sm:left-32 -translate-x-1/2 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background z-10 hidden sm:block group-hover:scale-125 transition-transform" />

                    {/* Right Card Content */}
                    <Card className="flex-1 w-full bg-card/60 backdrop-blur-md border-white/10 dark:border-white/5 hover:border-primary/30 transition-all">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-foreground">
                          {release.summary}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-xs">
                        {/* What's Added */}
                        {release.added.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-emerald-500 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              What's Added
                            </h4>
                            <ul className="space-y-1.5 text-muted-foreground pl-3">
                              {release.added.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* What's Updated */}
                        {release.updated.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-blue-400 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-400" />
                              What's Updated
                            </h4>
                            <ul className="space-y-1.5 text-muted-foreground pl-3">
                              {release.updated.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-400 font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* AI Highlights */}
                        {release.aiHighlights && release.aiHighlights.length > 0 && (
                          <div className="pt-2 border-t border-white/5">
                            <h4 className="font-semibold text-primary uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                              <Cpu className="h-3 w-3 text-primary" />
                              AI System Highlights
                            </h4>
                            <ul className="space-y-1 text-muted-foreground pl-3">
                              {release.aiHighlights.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary font-bold">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
