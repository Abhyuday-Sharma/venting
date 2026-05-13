
"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { transliterateText } from "@/actions/vents";
import { useToast } from "@/hooks/use-toast";
import { Info, Loader2, Mic, MicOff, ShieldQuestion } from "lucide-react";
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

// @ts-ignore
const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

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

  const handleVent = async () => {
    if (!user || !user.username) return;
    if (user.banStatus && user.banStatus !== 'none') {
        toast({ variant: 'destructive', title: 'Action Prohibited', description: 'Your account is banned and cannot post.' });
        return;
    }
    if (text.trim().length === 0) {
        toast({ variant: 'destructive', title: 'Cannot save empty vent', description: 'Please write something to vent.' });
        return;
    }
    
    setIsVenting(true);

    const moderationAction = checkVent(text);
    const finalIsPublic = isPublic && moderationAction.publish !== false;

    const ventData = {
        text,
        mood,
        category: category,
        isPublic: finalIsPublic,
        isIncognito: finalIsPublic ? isIncognito : false,
        commentsDisabled: finalIsPublic ? !allowComments || moderationAction.commentsEnabled === false : false,
        safetyFlag: moderationAction.safetyFlag || false,
        userId: user.uid,
        authorName: user.username, // Set as default, overridden during transaction if incognito
        authorPhotoURL: user.photoURL, // Set as default, overridden during transaction if incognito
        timestamp: serverTimestamp(),
        expiresAt: expiresInHours > 0 ? Timestamp.fromDate(new Date(Date.now() + expiresInHours * 60 * 60 * 1000)) : null,
    };

    if (moderationAction.showSupportMessage) {
        setPendingVentData({ ventData, finalIsPublic, moderationAction });
        setShowSafetyModal(true);
        setIsVenting(false);
        return;
    }

    await executeSave(ventData, finalIsPublic, moderationAction);
  };

  const executeSave = async (ventData: any, finalIsPublic: boolean, moderationAction: any) => {
    setIsVenting(true);
    try {
        const finalVentId = ventId || doc(collection(db, "users", user!.uid, "vents")).id;
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
                path: `users/${user!.uid}/vents/${ventId || 'new-vent'}`,
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
    <div className="h-full w-full bg-gradient-to-br from-background via-muted to-accent animated-gradient">
      <SafetySupportModal open={showSafetyModal} onOpenChange={setShowSafetyModal} onAcknowledge={confirmAndSaveVent} />
      <div className="container mx-auto p-4 md:p-8 flex justify-center items-start">
        <Card className="w-full max-w-2xl shadow-xl bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">{ventId ? 'Edit Vent' : "What's on your mind?"}</CardTitle>
            <CardDescription>Let your thoughts out in a safe space. Your entries are private by default.</CardDescription>
            <Alert className="mt-4" variant="destructive">
              <ShieldQuestion className="h-4 w-4" />
              <AlertTitle className="text-sm">Safety Notice</AlertTitle>
              <AlertDescription className="text-xs">
                This app is for emotional expression, not professional mental health advice. Public vents can be seen by anyone.
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="relative">
              <Textarea
                placeholder="Let it out... or use the microphone to speak."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_CHARS}
                className="min-h-[200px] text-base p-4 pr-24 focus-visible:ring-primary"
                aria-label="Venting text area"
              />
              <div className="absolute bottom-2 right-3 flex items-center gap-2">
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleRecording}
                      disabled={isTransliterating}
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
                  <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="public-switch">Make public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="incognito-switch" checked={isIncognito} onCheckedChange={setIsIncognito} disabled={!isPublic} />
                  <Label htmlFor="incognito-switch" className={!isPublic ? 'text-muted-foreground' : ''}>Post anonymously</Label>
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
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-6">
            <div className="flex gap-2">
                <Button onClick={handleVent} disabled={isVenting}>
                  {isVenting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {ventId ? 'Update Vent' : 'Vent'}
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
