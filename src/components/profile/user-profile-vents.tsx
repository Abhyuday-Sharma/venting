
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Vent, Comment, Notification, ReportReasonCategory } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Timestamp, doc, updateDoc, increment, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "../ui/button";
import { MessageCircle, Heart, Hand, Flag, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CommentSheet } from "../feed/comment-sheet";
import { db, submitReportAndTakeAction } from "@/lib/firebase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../ui/tooltip";


const moodBadgeVariant = (mood: number): "destructive" | "secondary" | "default" => {
    if (mood <= 3) return "destructive";
    if (mood <= 7) return "secondary";
    return "default";
}

async function createReactionNotification(vent: Vent, reactingUser: any, reactionType: 'hearts' | 'hugs') {
    if (vent.userId === reactingUser.uid) return;

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

export function UserProfileVents({ initialVents }: { initialVents: Vent[] }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [vents, setVents] = useState<Vent[]>(initialVents);
    const [selectedVentId, setSelectedVentId] = useState<string | null>(null);

    const [ventToReport, setVentToReport] = useState<Vent | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [reportCategory, setReportCategory] = useState<ReportReasonCategory | ''>('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const ventForSheet = useMemo(() => vents.find(v => v.id === selectedVentId), [vents, selectedVentId]);

    const handleCommentAdded = (ventId: string, newComment: Comment) => {
        setVents(vents.map(vent => 
            vent.id === ventId 
            ? { ...vent, comments: (vent.comments || 0) + 1 } 
            : vent
        ));
    };

    const handleReaction = async (ventId: string, reactionType: 'hearts' | 'hugs') => {
        if (!user) {
            toast({ title: 'Sign in to connect', description: 'You must be signed in to react.'});
            return;
        }

        const ventRef = doc(db, 'publicVents', ventId);
        const vent = vents.find(v => v.id === ventId);
        if (!vent) return;
        
        if (vent.safetyFlag) {
            toast({ variant: 'destructive', title: "Reactions Limited", description: "Reactions are limited for this vent." });
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

    const visibleVents = useMemo(() => vents.filter(v => !v.isHidden), [vents]);

    if (visibleVents.length === 0) {
        return (
            <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
                <h2 className="text-2xl font-semibold mb-2 font-headline">No public vents yet.</h2>
                <p className="text-muted-foreground">This user hasn&apos;t shared anything publicly.</p>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {visibleVents.map((vent) => (
                    <Card key={vent.id} className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <Badge variant={moodBadgeVariant(vent.mood)} className="shadow-sm">Mood: {vent.mood}/10</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {vent.timestamp ? formatDistanceToNow((vent.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/80 whitespace-pre-wrap break-words">
                                {vent.text}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleReaction(vent.id!, 'hearts')}>
                                    <Heart className={`mr-2 h-4 w-4 ${vent.heartedBy?.includes(user?.uid || '') ? 'text-red-500 fill-red-500' : ''}`} />
                                    {vent.hearts || 0}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleReaction(vent.id!, 'hugs')}>
                                    <Hand className={`mr-2 h-4 w-4 ${vent.huggedBy?.includes(user?.uid || '') ? 'text-yellow-500' : ''}`} />
                                    {vent.hugs || 0}
                                </Button>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span tabIndex={0}>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedVentId(vent.id!)} disabled={vent.commentsDisabled}>
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                {vent.comments || 0}
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    {vent.commentsDisabled && <TooltipContent><p>Comments are disabled by the author.</p></TooltipContent>}
                                </Tooltip>
                            </div>
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
                        </CardFooter>
                    </Card>
                ))}
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
        </TooltipProvider>
    )
}
