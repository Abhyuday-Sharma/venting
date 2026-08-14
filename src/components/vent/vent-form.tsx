
"use client";

import anime from "animejs";
import { createBurnEmbers } from "@/lib/anime-presets";
import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { transliterateText } from "@/actions/vents";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Info, Loader2, Mic, MicOff, ShieldQuestion, Flame } from "lucide-react";
import type { Vent, VentCategory } from "@/lib/types";
import { ventCategories } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { db, getVentById } from "@/lib/firebase";
import { collection, doc, setDoc, serverTimestamp, runTransaction, getDoc, Timestamp } from "firebase/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { checkVent } from "@/lib/safety";
import { generateIncognitoName, getIncognitoAvatar } from "@/lib/incognito";
import { SafetySupportModal } from "@/components/layout/safety-support-modal";
import { analyzeContentSafety } from "@/actions/ai";

// The Web Speech API is unevenly implemented and absent from lib.dom, so the
// two vendor spellings are declared here rather than suppressed.
type SpeechRecognitionCtor = new () => any;
type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

const SpeechRecognition: SpeechRecognitionCtor | null =
  typeof window !== 'undefined'
    ? (window as SpeechRecognitionWindow).SpeechRecognition ||
      (window as SpeechRecognitionWindow).webkitSpeechRecognition ||
      null
    : null;

const MAX_CHARS = 2000;

export function VentForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const ventIdFromQuery = searchParams.get('id');

  const [isLoadingVent, setIsLoadingVent] = useState(!!ventIdFromQuery);
  const [ventId, setVentId] = useState<string | undefined>(ventIdFromQuery ?? undefined);
  const [text, setText] = useState("");
  const [mood, setMood] = useState(5);
  const [category, setCategory] = useState<VentCategory>("General");
  const [isPublic, setIsPublic] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingVentData, setPendingVentData] = useState<any>(null);
  const [allowComments, setAllowComments] = useState(true);
  const [expiresInHours, setExpiresInHours] = useState<number>(0); // 0 = never
  
  const [isVenting, setIsVenting] = useState(false);
  const [isBurnMode, setIsBurnMode] = useState(false);
  const [isBurningAnim, setIsBurningAnim] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [isTransliterating, startTransliterating] = useTransition();

  useEffect(() => {
    if (ventIdFromQuery && user) {
      setIsLoadingVent(true);
      getVentById(user.uid, ventIdFromQuery)
        .then(ventData => {
          if (ventData) {
            setText(ventData.text || "");
            setMood(ventData.mood || 5);
            setCategory(ventData.category || "General");
            setIsPublic(ventData.isPublic || false);
            setIsIncognito(ventData.isIncognito || false);
            setAllowComments(ventData.commentsDisabled === false);
            setVentId(ventData.id);
          } else {
            toast({
              variant: "destructive",
              title: "Vent not found",
              description: "Could not load the vent for editing, or you don't have permission.",
            });
            router.push('/dashboard');
          }
        })
        .finally(() => {
          setIsLoadingVent(false);
        });
    }
  }, [ventIdFromQuery, user, router, toast]);

    // Speech Recognition setup
    useEffect(() => {
        if (!SpeechRecognition) return;
        const rec = new SpeechRecognition();
        rec.lang = user?.settings?.language || 'en-US';
        rec.continuous = true;
        rec.interimResults = false;

        rec.onresult = async (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (rec.lang === 'hi-IN' && finalTranscript) {
                startTransliterating(async () => {
                    const result = await transliterateText(finalTranscript);
                    if (result.success && result.text) {
                        setText((prev) => (prev ? prev + ' ' : '') + result.text);
                    } else {
                        setText((prev) => (prev ? prev + ' ' : '') + finalTranscript);
                        toast({ variant: "destructive", title: "Transliteration failed", description: result.error });
                    }
                });
            } else {
                setText((prev) => (prev ? prev + ' ' : '') + finalTranscript);
            }
        };
        rec.onerror = (event: any) => toast({ variant: "destructive", title: "Speech recognition error", description: event.error });
        rec.onend = () => setIsRecording(false);
        setRecognition(rec);
    }, [user?.settings?.language, toast]);

    const toggleRecording = () => {
        if (!recognition) {
             toast({ variant: "destructive", title: "Speech recognition not available", description: "Your browser might not support this feature." });
            return;
        };
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
        setIsRecording(!isRecording);
    };

  const CONSOLING_MESSAGES = [
    "It is gone. Take a deep breath.",
    "You've let it go. It holds no power here.",
    "Released to the wind. You are free to move forward.",
    "That weight is no longer yours to carry.",
    "It's burned away. Time to focus on the light.",
    "Leave it in the ashes. Step forward."
  ];

  const cardRef = useRef<HTMLDivElement>(null);
  const [consolingMessage, setConsolingMessage] = useState<string | null>(null);

  const handleBurnRelease = async () => {
    if (text.trim().length === 0) {
      toast({ variant: 'destructive', title: 'Nothing to release', description: 'Please write something to release.' });
      return;
    }
    setIsBurningAnim(true);

    // Trigger Anime.js particle ash & ember dissolve
    if (cardRef.current) {
      createBurnEmbers(cardRef.current, 24);
      anime({
        targets: cardRef.current,
        translateY: [0, -30],
        scale: [1, 0.95],
        opacity: [1, 0],
        filter: ["blur(0px)", "blur(14px)"],
        boxShadow: [
          "0 0 0px rgba(249,115,22,0)",
          "0 0 70px 25px rgba(239,68,68,0.6)",
        ],
        duration: 2200,
        easing: "cubicBezier(0.25, 1, 0.5, 1)",
      });
    }

    setTimeout(() => {
      setText("");
      setIsBurningAnim(false);
      
      // Reset card styles for next write session if needed
      if (cardRef.current) {
        cardRef.current.style.transform = "";
        cardRef.current.style.opacity = "";
        cardRef.current.style.filter = "";
        cardRef.current.style.boxShadow = "";
      }
      
      // Pick a random consoling message
      const randomMessage = CONSOLING_MESSAGES[Math.floor(Math.random() * CONSOLING_MESSAGES.length)];
      setConsolingMessage(randomMessage);
      
      // Hide the message after 4 seconds
      setTimeout(() => {
        setConsolingMessage(null);
        setIsBurnMode(false);
      }, 4000);

    }, 2200);
  };

  const handleVent = async () => {
    if (!user) {
      if (text.trim().length === 0) {
        toast({ variant: 'destructive', title: 'Cannot save empty vent', description: 'Please write something to vent.' });
        return;
      }
      setIsVenting(true);
      try {
        const localVentsRaw = localStorage.getItem('guest_vents');
        const localVents = localVentsRaw ? JSON.parse(localVentsRaw) : [];
        if (localVents.length >= 2) {
          toast({
            title: 'Limit reached',
            description: 'Guest users are limited to 2 local private vents. Please sign in to write more!'
          });
          router.push('/login');
          return;
        }

        const newVent = {
          id: 'local_' + Math.random().toString(36).substr(2, 9),
          text,
          mood,
          category,
          isPublic: false,
          isIncognito: false,
          timestamp: Date.now(),
          hearts: 0,
          hugs: 0,
          comments: 0
        };
        localVents.push(newVent);
        localStorage.setItem('guest_vents', JSON.stringify(localVents));
        toast({ title: 'Vent saved locally!' });
        router.push('/feed');
      } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Save failed', description: 'Could not save your vent locally.' });
      } finally {
        setIsVenting(false);
      }
      return;
    }

    if (!user.username) return;
    if (user.banStatus && user.banStatus !== 'none') {
        toast({ variant: 'destructive', title: 'Action Prohibited', description: 'Your account is banned and cannot post.' });
        return;
    }
    if (text.trim().length === 0) {
        toast({ variant: 'destructive', title: 'Cannot save empty vent', description: 'Please write something to vent.' });
        return;
    }
    
    setIsVenting(true);

    // Client-side pre-filter (fast, catches obvious patterns)
    const moderationAction = checkVent(text);

    // If the client-side check immediately blocks, use its decision.
    if (moderationAction.publish === false && !moderationAction.showSupportMessage) {
      const ventData = {
        text,
        mood,
        category: category,
        isPublic: false,
        isIncognito: false,
        commentsDisabled: false,
        safetyFlag: false,
        userId: user.uid,
        authorName: user.username,
        authorPhotoURL: user.photoURL,
        timestamp: serverTimestamp(),
        expiresAt: expiresInHours > 0 ? Timestamp.fromDate(new Date(Date.now() + expiresInHours * 60 * 60 * 1000)) : null,
      };
      await executeSave(ventData, false, moderationAction);
      return;
    }

    // Server-side AI safety check (authoritative, context-aware)
    let aiModerationAction = moderationAction;
    if (isPublic && isIncognito) {
      const aiResult = await analyzeContentSafety(text, 'vent');
      if (aiResult.success && aiResult.data) {
        const aiData = aiResult.data;
        aiModerationAction = {
          publish: aiData.action.publish,
          safetyFlag: aiData.action.safetyFlag,
          commentsEnabled: !aiData.action.disableComments,
          showSupportMessage: aiData.action.showSupportMessage,
        };
      }
    }

    const finalIsPublic = isPublic && aiModerationAction.publish !== false;

    const ventData = {
        text,
        mood,
        category: category,
        isPublic: finalIsPublic,
        isIncognito: finalIsPublic ? isIncognito : false,
        commentsDisabled: finalIsPublic ? !allowComments || aiModerationAction.commentsEnabled === false : false,
        safetyFlag: aiModerationAction.safetyFlag || false,
        userId: user.uid,
        authorName: user.username,
        authorPhotoURL: user.photoURL,
        authorRole: user.role || 'user',
        timestamp: serverTimestamp(),
        expiresAt: expiresInHours > 0 ? Timestamp.fromDate(new Date(Date.now() + expiresInHours * 60 * 60 * 1000)) : null,
    };

    if (aiModerationAction.showSupportMessage) {
        setPendingVentData({ ventData, finalIsPublic, moderationAction: aiModerationAction });
        setShowSafetyModal(true);
        setIsVenting(false);
        return;
    }

    await executeSave(ventData, finalIsPublic, aiModerationAction);
  };

  const executeSave = async (ventData: any, finalIsPublic: boolean, moderationAction: any) => {
    if (!user) return;
    setIsVenting(true);
    try {
        const finalVentId = ventId || doc(collection(db, "users", user.uid, "vents")).id;
        const privateVentRef = doc(db, "users", user.uid, "vents", finalVentId);
        const publicVentRef = doc(db, "publicVents", finalVentId);

        const userDocRef = doc(db, "users", user.uid);

        const stats = await runTransaction(db, async (transaction) => {
            const privateDoc = await transaction.get(privateVentRef);
            const publicDoc = await transaction.get(publicVentRef);
            const userDoc = await transaction.get(userDocRef);

            const existingData = privateDoc.exists() ? privateDoc.data() : {};
            
            let finalAuthorName = user.username;
            let finalAuthorPhotoURL = user.photoURL;

            if (finalIsPublic && isIncognito) {
                // Check if there was already an incognito name saved previously
                const wasAlreadyIncognito = existingData.isIncognito && existingData.authorName && existingData.authorName !== 'Anonymous Venter';
                if (wasAlreadyIncognito) {
                    finalAuthorName = existingData.authorName;
                    finalAuthorPhotoURL = existingData.authorPhotoURL;
                } else {
                    // Generate new identity
                    finalAuthorName = generateIncognitoName();
                    finalAuthorPhotoURL = getIncognitoAvatar(finalAuthorName);
                }
            }

            const dataToSave = {
                ...existingData,
                ...ventData,
                authorName: finalAuthorName,
                authorPhotoURL: finalAuthorPhotoURL,
                hearts: existingData.hearts || 0,
                hugs: existingData.hugs || 0,
                comments: existingData.comments || 0,
                heartedBy: existingData.heartedBy || [],
                huggedBy: existingData.huggedBy || [],
                reportCount: existingData.reportCount || 0,
                isHidden: existingData.isHidden || false,
            };
            
            transaction.set(privateVentRef, dataToSave, { merge: true });

            const isNewVent = !privateDoc.exists();
            let newVentCount = userDoc.data()?.ventCount || 0;
            let newPublicVentCount = userDoc.data()?.publicVentCount || 0;

            if (isNewVent) {
                newVentCount++;
                if (finalIsPublic) newPublicVentCount++;
                transaction.update(userDocRef, {
                    ventCount: newVentCount,
                    publicVentCount: newPublicVentCount
                });
            }

            if (finalIsPublic) {
                transaction.set(publicVentRef, dataToSave, { merge: true });
            } else if (publicDoc.exists()) {
                transaction.delete(publicVentRef);
            }
            
            return { isNewVent, newVentCount, newPublicVentCount };
        });
        
        if (stats.isNewVent) {
            setTimeout(() => {
                if (stats.newVentCount === 1) {
                    toast({ title: "You did something brave today.", duration: 4000 });
                } else if (stats.newVentCount === 7) {
                    toast({ title: "You've shown up for yourself 7 times. That matters.", duration: 4000 });
                }
                
                if (finalIsPublic && stats.newPublicVentCount === 1) {
                    setTimeout(() => {
                        toast({ title: "Thank you for trusting the community.", duration: 4000 });
                    }, 1000);
                }
            }, 500);
        }
        
        try {
            sessionStorage.setItem('acknowledgementTrigger', 'true');
        } catch (e) { /* ignore session storage errors */ }
        
        router.push('/dashboard');

    } catch (error: any) {
        console.error('Vent saving error:', error);
         if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: `users/${user.uid}/vents/${ventId || 'new-vent'}`,
                operation: 'write',
                requestResourceData: ventData,
            });
            errorEmitter.emit('permission-error', permissionError);
        } else {
            toast({ variant: 'destructive', title: 'Save failed', description: error.message });
        }
    } finally {
        setIsVenting(false);
    }
  };

  const confirmAndSaveVent = async () => {
      setShowSafetyModal(false);
      if (pendingVentData) {
          await executeSave(pendingVentData.ventData, pendingVentData.finalIsPublic, pendingVentData.moderationAction);
      }
  };


  const getMoodLabel = (value: number) => {
    if (value <= 2) return "Very Low";
    if (value <= 4) return "Low";
    if (value <= 6) return "Neutral";
    if (value <= 8) return "Good";
    return "Very Good";
  };
  
  const getMoodColor = (value: number) => {
    if (value <= 3) return "text-destructive";
    if (value <= 7) return "text-muted-foreground";
    return "text-[hsl(var(--chart-4))]";
  };
  
  if (isLoadingVent) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex justify-center items-start">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <Skeleton className="h-48 w-full rounded-md" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4 rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      </div>
    )
  }


  return (
    <div className="h-full w-full bg-gradient-to-br from-background via-muted to-accent animated-gradient relative">
      <div 
        className={cn(
          "fixed inset-0 pointer-events-none z-50 transition-opacity duration-1000 opacity-0 bg-gradient-to-tr from-orange-600/30 via-red-500/20 to-transparent mix-blend-color-burn dark:mix-blend-lighten",
          isBurningAnim && "animate-page-burn-flash"
        )} 
      />
      <SafetySupportModal open={showSafetyModal} onOpenChange={setShowSafetyModal} onAcknowledge={confirmAndSaveVent} />
      
      {/* Consoling Message Overlay */}
      {consolingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="text-center p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-headline font-medium text-foreground leading-relaxed tracking-wide animate-message-fade">
              {consolingMessage}
            </h2>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 md:p-8 flex justify-center items-start">
        <Card 
          ref={cardRef}
          className={cn(
            "w-full max-w-2xl shadow-xl bg-card/80 backdrop-blur-sm transition-all duration-500 border border-border/50",
            isBurnMode && "border-orange-500/30 shadow-orange-500/5 bg-gradient-to-b from-card to-orange-950/5",
            isBurningAnim && "animate-burn-glow pointer-events-none"
          )}
        >
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-2xl font-headline">{ventId ? 'Edit Vent' : isBurnMode ? 'Release & Burn' : "What's on your mind?"}</CardTitle>
                <CardDescription>
                  {isBurnMode 
                    ? "Write whatever you need to let go of. It will be burned away and never saved."
                    : "Let your thoughts out in a safe space. Your entries are private by default."}
                </CardDescription>
              </div>
            </div>

            {!ventId && (
              <div className="flex items-center justify-between mt-4 p-3 bg-muted/40 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <Flame className={cn("h-5 w-5 transition-all duration-300", isBurnMode ? 'text-orange-500 animate-pulse scale-110' : 'text-muted-foreground')} />
                  <div className="text-left">
                    <Label htmlFor="burn-switch" className="text-sm font-semibold cursor-pointer">Burn & Release Mode</Label>
                    <p className="text-[11px] text-muted-foreground">Permanently let go. Text is immediately dissolved and never stored.</p>
                  </div>
                </div>
                <Switch 
                  id="burn-switch" 
                  checked={isBurnMode} 
                  onCheckedChange={(val) => {
                    setIsBurnMode(val);
                    if (val) setIsPublic(false);
                  }} 
                />
              </div>
            )}

            {!user && !isBurnMode && (
              <Alert className="mt-4 border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-300">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-sm font-semibold">Explore Mode</AlertTitle>
                <AlertDescription className="text-xs">
                  You are browsing as a guest. You can write up to 2 private vents saved locally. <Link href="/login" className="underline font-medium hover:text-amber-800 dark:hover:text-amber-200">Sign in</Link> to unlock public sharing, comments, and unlimited posts.
                </AlertDescription>
              </Alert>
            )}
            {!isBurnMode && (
              <Alert className="mt-4" variant="destructive">
                <ShieldQuestion className="h-4 w-4" />
                <AlertTitle className="text-sm">Safety Notice</AlertTitle>
                <AlertDescription className="text-xs">
                  This app is for emotional expression, not professional mental health advice. Public vents can be seen by anyone.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="relative">
              <Textarea
                placeholder={isBurnMode ? "Write it down, prepare to let it go forever..." : "Let it out... or use the microphone to speak."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_CHARS}
                disabled={isBurningAnim}
                className={cn(
                  "min-h-[200px] text-base p-4 pr-24 focus-visible:ring-primary transition-all duration-300",
                  isBurningAnim && "animate-burn-dissolve",
                  isBurnMode && "border-orange-500/30 focus-visible:ring-orange-500 bg-orange-950/5 dark:bg-orange-950/10"
                )}
                aria-label="Venting text area"
              />
              <div className="absolute bottom-2 right-3 flex items-center gap-2">
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleRecording}
                      disabled={isTransliterating || isBurningAnim}
                      className={`h-8 w-8 ${isRecording ? 'text-destructive' : 'text-muted-foreground'}`}
                      title={isRecording ? 'Stop recording' : 'Start recording'}
                  >
                      {isTransliterating ? <Loader2 className="h-4 w-4 animate-spin" /> : isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                  </Button>
                  <div className="text-xs text-muted-foreground">
                      {text.length} / {MAX_CHARS}
                  </div>
              </div>
            </div>
            {!isBurnMode && (
              <>
                <div className="space-y-4">
                  <label htmlFor="mood-slider" className="text-sm font-medium">Rate your mood (1-10)</label>
                  <div className="flex items-center gap-4">
                      <span className={`font-bold text-lg w-8 text-center transition-colors ${getMoodColor(mood)}`} aria-live="polite">{mood}</span>
                      <Slider
                          id="mood-slider"
                          value={[mood]}
                          onValueChange={(value) => setMood(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="flex-1"
                          aria-label={`Mood slider, current value ${mood}`}
                      />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">{getMoodLabel(mood)}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category-select">Category</Label>
                    <Select value={category} onValueChange={(value: VentCategory) => setCategory(value)}>
                      <SelectTrigger id="category-select" className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ventCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} disabled={!user} />
                      <Label htmlFor="public-switch" className={!user ? 'text-muted-foreground' : ''}>Make public {!user && "(Sign in required)"}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="incognito-switch" checked={isIncognito} onCheckedChange={setIsIncognito} disabled={!isPublic || !user} />
                      <Label htmlFor="incognito-switch" className={(!isPublic || !user) ? 'text-muted-foreground' : ''}>Post anonymously</Label>
                    </div>
                  </div>
                   {isPublic && (
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch
                        id="allow-comments-switch"
                        checked={allowComments}
                        onCheckedChange={setAllowComments}
                        />
                        <Label htmlFor="allow-comments-switch">
                        Allow comments
                        </Label>
                    </div>
                  )}
                  {isPublic && (
                      <div className="space-y-2 pt-2">
                          <Label htmlFor="expiry-select">Self-destruct after</Label>
                          <Select value={expiresInHours.toString()} onValueChange={(val) => setExpiresInHours(Number(val))}>
                              <SelectTrigger id="expiry-select" className="w-full sm:w-[200px]">
                                  <SelectValue placeholder="Keep forever" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="0">Never (Keep forever)</SelectItem>
                                  <SelectItem value="24">24 Hours</SelectItem>
                                  <SelectItem value="48">48 Hours</SelectItem>
                                  <SelectItem value="168">1 Week</SelectItem>
                              </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Once expired, the vent automatically removes itself from the public feed.</p>
                      </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-6">
            <div className="flex gap-2">
                {isBurnMode ? (
                  <Button 
                    onClick={handleBurnRelease} 
                    disabled={isBurningAnim || text.trim().length === 0} 
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-0 shadow-lg shadow-orange-500/20"
                  >
                    {isBurningAnim ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Flame className="mr-2 h-4 w-4" />}
                    Release & Burn
                  </Button>
                ) : (
                  <Button onClick={handleVent} disabled={isVenting}>
                    {isVenting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {ventId ? 'Update Vent' : 'Vent'}
                  </Button>
                )}
                {!user && !isBurnMode && (
                  <Link href="/saved">
                    <Button variant="outline">Saved</Button>
                  </Link>
                )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
