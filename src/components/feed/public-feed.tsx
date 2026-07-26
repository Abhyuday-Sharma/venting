
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { getPublicVents, db, adminDeletePublicVent, submitReportAndTakeAction } from "@/lib/firebase";
import type { Vent, Comment, Notification, ReportReasonCategory } from "@/lib/types";
import { ventCategories } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Timestamp, doc, updateDoc, increment, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, HeartHandshake, Flag, User as UserIcon, ShieldAlert, Loader2, EyeOff, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useReactionBurst, useStaggerAnimate } from "@/hooks/use-anime";
import { CommentSheet } from "./comment-sheet";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { EndSessionAcknowledgement } from "@/components/layout/end-session-acknowledgement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const moodBadgeVariant = (mood: number): "destructive" | "secondary" | "default" => {
    if (mood <= 3) return "destructive";
    if (mood <= 7) return "secondary";
    return "default";
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    if (name === 'Anonymous Venter') return 'AV';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

async function createReactionNotification(vent: Vent, reactingUser: any, reactionType: 'hearts' | 'hugs') {
    if (vent.userId === reactingUser.uid) return; // Don't notify for own reaction

    const notifData: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
        type: reactionType === 'hearts' ? 'new_reaction_heart' : 'new_reaction_hug',
        ventId: vent.id!,
        ventOwnerId: vent.userId,
        triggeringUserId: reactingUser.uid,
        triggeringUserName: reactingUser.username,
        message: `${reactingUser.username} reacted to your vent.`,
    };

    const notificationsCollection = collection(db, 'users', vent.userId, 'notifications');
    await addDoc(notificationsCollection, { ...notifData, read: false, timestamp: serverTimestamp() });
}

export function PublicFeed() {
    const { user } = useAuth();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { triggerBurst } = useReactionBurst();
    const containerRef = useStaggerAnimate<HTMLDivElement>(".glass-card");
    const [vents, setVents] = useState<Vent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVentId, setSelectedVentId] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('All');
    
    const [ventToReport, setVentToReport] = useState<Vent | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [reportCategory, setReportCategory] = useState<ReportReasonCategory | ''>('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const [adminDeleteReason, setAdminDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const ventRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [showAcknowledgement, setShowAcknowledgement] = useState(false);
    
    const ventForSheet = useMemo(() => vents.find(v => v.id === selectedVentId), [vents, selectedVentId]);

    useEffect(() => {
        setLoading(true);
        getPublicVents()
            .then(fetchedVents => {
                setVents(fetchedVents);
                const ventIdFromQuery = searchParams.get('ventId');
                if (ventIdFromQuery && fetchedVents.some(v => v.id === ventIdFromQuery)) {
                    const openComments = searchParams.get('openComments');
                    if (openComments === 'true') {
                        setSelectedVentId(ventIdFromQuery);
                    }
                    setTimeout(() => {
                        const targetVent = ventRefs.current[ventIdFromQuery];
                        if (targetVent) {
                            targetVent.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetVent.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-500');
                            setTimeout(() => {
                                targetVent.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
                            }, 2500);
                        }
                    }, 200);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [searchParams]);

    useEffect(() => {
        let inactivityTimer: NodeJS.Timeout;
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                try {
                    const shown = sessionStorage.getItem('acknowledgementShown');
                    if (!shown) {
                        setShowAcknowledgement(true);
                        sessionStorage.setItem('acknowledgementShown', 'true');
                    }
                } catch (e) { console.log("sessionStorage not available"); }
            }, 2 * 60 * 1000); // 2 minutes
        };
        const handleInteraction = () => resetTimer();
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        window.addEventListener('scroll', handleInteraction);
        window.addEventListener('click', handleInteraction);
        resetTimer();
        return () => {
            clearTimeout(inactivityTimer);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('scroll', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };
    }, []);

    const filteredVents = useMemo(() => {
        return vents.filter(vent => {
            if (vent.isHidden) return false;
            if (filterCategory === 'All') return true;
            return vent.category === filterCategory;
        });
    }, [vents, filterCategory]);

    const handleCommentAdded = (ventId: string, newComment: Comment) => {
        setVents(vents.map(vent => 
            vent.id === ventId 
            ? { ...vent, comments: (vent.comments || 0) + 1 } 
            : vent
        ));
    };

    const handleReaction = async (ventId: string, reactionType: 'hearts' | 'hugs') => {
        if (!user) {
            toast({ title: 'Sign in to connect', description: 'You must be signed in to react to posts.'});
            return;
        }

        const ventRef = doc(db, 'publicVents', ventId);
        const vent = vents.find(v => v.id === ventId);
        if (!vent) return;
        
        if(vent.safetyFlag) {
            toast({ variant: 'destructive', title: "Reactions Limited", description: "Reactions are limited for this vent."});
            return;
        }

        const reactionField = reactionType === 'hearts' ? 'heartedBy' : 'huggedBy';
        const hasReacted = vent[reactionField]?.includes(user.uid);

        try {
            if (hasReacted) {
                await updateDoc(ventRef, {
                    [reactionType]: increment(-1),
                    [reactionField]: arrayRemove(user.uid)
                });
                 setVents(vents.map(v => v.id === ventId ? { ...v, [reactionType]: (v[reactionType] || 1) - 1, [reactionField]: v[reactionField]?.filter(uid => uid !== user.uid) } : v));
            } else {
                await updateDoc(ventRef, {
                    [reactionType]: increment(1),
                    [reactionField]: arrayUnion(user.uid)
                });
                setVents(vents.map(v => v.id === ventId ? { ...v, [reactionType]: (v[reactionType] || 0) + 1, [reactionField]: [...(v[reactionField] || []), user.uid] } : v));
                await createReactionNotification(vent, user, reactionType);
            }
        } catch (error) {
            console.error("Error updating reaction:", error);
            toast({ variant: "destructive", title: "Couldn't save reaction." });
        }
    };
    
    const handleReportSubmit = async () => {
        if (!user || !ventToReport || !reportReason.trim() || !reportCategory) {
            toast({ variant: 'destructive', title: 'Could not submit report.', description: 'Please select a category and provide a reason.' });
            return;
        }
        setIsSubmittingReport(true);
        try {
            const reportResult = await submitReportAndTakeAction({
                target: { id: ventToReport.id!, type: 'vent' },
                reason: reportReason,
                reasonCategory: reportCategory,
                reporterId: user.uid,
            });

            toast({ title: "Report Submitted", description: "Thank you for helping keep the community safe." });
            
            if (reportResult.contentHidden) {
                setVents(prev => prev.map(v => v.id === ventToReport.id! ? { ...v, isHidden: true } : v));
            }

            setVentToReport(null);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Report Failed', description: 'Could not submit your report. Please try again.' });
            console.error("Report submission failed:", error);
        } finally {
            setIsSubmittingReport(false);
            setReportReason("");
            setReportCategory('');
        }
    };

    const handleAdminDelete = async (ventToDelete: Vent) => {
        if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator') || !adminDeleteReason.trim()) {
            toast({ variant: "destructive", title: "Permission Denied or Reason Missing" });
            return;
        }
        
        if (ventToDelete.isIncognito) {
            toast({ variant: "destructive", title: "Cannot Delete Anonymous Vent", description: "Anonymous vents are handled by AI moderation." });
            return;
        }
    
        setIsDeleting(true);
        try {
            await adminDeletePublicVent(ventToDelete, user, adminDeleteReason);
            toast({
                title: "Vent Deleted",
                description: "The vent has been removed by admin action."
            });
            setVents(currentVents => currentVents.filter(v => v.id !== ventToDelete.id));
        } catch (error: any) {
            console.error("Admin delete error:", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: error.message
            });
        } finally {
            setAdminDeleteReason("");
            setIsDeleting(false);
        }
    }

    if (loading) {
        return (
             <div className="container mx-auto p-4 md:p-8 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="relative container mx-auto p-4 md:p-8 overflow-hidden">
                {/* Ambient glow orbs */}
                <div className="ambient-orb w-96 h-96 bg-blue-400 dark:bg-blue-600 -top-20 -right-20 -z-10" />
                <div className="ambient-orb w-72 h-72 bg-purple-300 dark:bg-indigo-700 bottom-10 -left-10 -z-10" />

                <div>
                    <h1 className="text-3xl font-bold font-headline">Public Feed</h1>
                    <p className="text-muted-foreground">Vents shared by the community. Be supportive and respectful.</p>
                </div>
                 <div className="my-6 flex flex-wrap gap-2">
                    <Button
                        variant={filterCategory === 'All' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterCategory('All')}
                    >
                        All
                    </Button>
                    {ventCategories.map(cat => (
                        <Button
                            key={cat}
                            variant={filterCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
                <div ref={containerRef} className="mt-8 space-y-6">
                    {filteredVents.length === 0 ? (
                         <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
                            <h2 className="text-2xl font-semibold mb-2 font-headline">No vents found</h2>
                            <p className="text-muted-foreground">There are no public vents in the "{filterCategory}" category yet.</p>
                        </div>
                    ) : (
                        filteredVents.map((vent, index) => {
                            const isClickableAuthor = !vent.isIncognito && vent.userId;
                            return (
                        <Card
                                key={vent.id}
                                className={`glass-card card-reveal card-reveal-${Math.min((index % 6) + 1, 6) as 1|2|3|4|5|6}`}
                                ref={el => { if(vent.id) ventRefs.current[vent.id] = el; }}
                            >
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <Avatar>
                                        {isClickableAuthor ? (
                                            <Link href={`/u/${vent.authorName}`}>
                                                <AvatarImage src={vent.authorPhotoURL ?? ''} alt={vent.authorName ?? 'User'} />
                                                <AvatarFallback>{getInitials(vent.authorName)}</AvatarFallback>
                                            </Link>
                                        ) : (
                                            <>
                                            <AvatarImage src={vent.authorPhotoURL ?? ''} alt={vent.authorName ?? 'User'} />
                                            <AvatarFallback>{getInitials(vent.authorName)}</AvatarFallback>
                                            </>
                                        )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            {isClickableAuthor ? (
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/u/${vent.authorName}`} className="font-semibold hover:underline">
                                                        {vent.authorName}
                                                    </Link>
                                                    {vent.authorRole === 'owner' && <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] px-1.5 py-0">FOUNDER</Badge>}
                                                    {vent.authorRole === 'moderator' && <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] px-1.5 py-0">MODERATOR</Badge>}
                                                </div>
                                            ) : (
                                                <p className="font-semibold">{vent.authorName}</p>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {vent.timestamp ? formatDistanceToNow((vent.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                            <Badge variant={moodBadgeVariant(vent.mood)} className="shadow-sm">Mood: {vent.mood}/10</Badge>
                                            {vent.category && <Badge variant="secondary" className="shadow-sm">{vent.category}</Badge>}
                                            {vent.expiresAt && (
                                                <Badge variant="outline" className="border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 flex items-center gap-1 shadow-sm bg-orange-50/50 dark:bg-orange-950/20">
                                                    <Clock className="h-3 w-3" />
                                                    Expires {formatDistanceToNow((vent.expiresAt as Timestamp).toDate(), { addSuffix: true })}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-foreground/80 whitespace-pre-wrap break-words">
                                        {vent.text}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:scale-110 active:scale-90 transition-transform duration-150 hover:text-red-500"
                                            onClick={(e) => {
                                              triggerBurst(e, 'heart');
                                              handleReaction(vent.id!, 'hearts');
                                            }}
                                        >
                                            <Heart className={`mr-2 h-4 w-4 transition-all ${vent.heartedBy?.includes(user?.uid || '') ? 'text-red-500 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]' : ''}`} />
                                            {vent.hearts || 0}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:scale-110 active:scale-90 transition-transform duration-150 hover:text-blue-500"
                                            onClick={(e) => {
                                              triggerBurst(e, 'hug');
                                              handleReaction(vent.id!, 'hugs');
                                            }}
                                            title="Send a Hug"
                                        >
                                            <HeartHandshake className={`mr-2 h-4 w-4 transition-all ${vent.huggedBy?.includes(user?.uid || '') ? 'text-blue-500 drop-shadow-[0_0_6px_rgba(59,130,246,0.8)]' : ''}`} />
                                            {vent.hugs || 0}
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span tabIndex={0}> {/* Allow span to be focusable for tooltip */}
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedVentId(vent.id!)} disabled={vent.commentsDisabled}>
                                                        <MessageCircle className="mr-2 h-4 w-4" />
                                                        {vent.comments || 0}
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            {vent.commentsDisabled && <TooltipContent><p>Comments are disabled by the author.</p></TooltipContent>}
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center">
                                        {(user?.role === 'owner' || user?.role === 'admin') && (
                                            <AlertDialog onOpenChange={(open) => !open && setAdminDeleteReason('')}>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <ShieldAlert className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Admin Action: Delete Vent</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            You are about to permanently delete this vent. This action will be logged. Please provide a reason for the deletion.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <Textarea 
                                                        placeholder="Reason for deletion (e.g., 'Violates community guidelines: Harassment')..."
                                                        value={adminDeleteReason}
                                                        onChange={(e) => setAdminDeleteReason(e.target.value)}
                                                    />
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => handleAdminDelete(vent)}
                                                            disabled={!adminDeleteReason.trim() || isDeleting}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                             if (!user) {
                                                 toast({ title: 'Sign in to report', description: 'You must be signed in to flag content.' });
                                                 return;
                                             }
                                             setVentToReport(vent);
                                         }}>
                                            <Flag className="h-4 w-4 text-muted-foreground" />
                                            <span className="sr-only">Report</span>
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        )})
                    )}
                </div>
            </div>

            <AlertDialog open={!!ventToReport} onOpenChange={(open) => !open && setVentToReport(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Report Vent</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your report is anonymous. Please select a reason and provide details to help moderators.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <Select onValueChange={(value) => setReportCategory(value as ReportReasonCategory)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="self-harm">Encouraging self-harm</SelectItem>
                                <SelectItem value="harassment">Harassment / Hate</SelectItem>
                                <SelectItem value="spam">Spam</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea 
                            placeholder="Provide additional details (optional but helpful)."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReportSubmit} disabled={isSubmittingReport || !reportCategory}>
                            {isSubmittingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Report"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {ventForSheet && (
                <CommentSheet 
                    vent={ventForSheet} 
                    isOpen={!!selectedVentId} 
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setSelectedVentId(null);
                        }
                    }}
                    onCommentAdded={handleCommentAdded}
                />
            )}
            <EndSessionAcknowledgement show={showAcknowledgement} onDismiss={() => setShowAcknowledgement(false)} />
        </TooltipProvider>
    )
}
