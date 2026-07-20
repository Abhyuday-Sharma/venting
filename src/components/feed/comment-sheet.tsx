
"use client";

import { useEffect, useState, useMemo } from "react";
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getCommentsForVent, addCommentToVent } from "@/lib/firebase";
import type { Comment, Vent } from "@/lib/types";
import { Send, Info, Ban } from "lucide-react";
import { CommentWithReplies } from "./comment";
import { EmpathyNudge } from "./empathy-nudge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { checkCommentEmpathy, analyzeContentSafety } from "@/actions/ai";
import { checkComment } from "@/lib/safety";

interface CommentSheetProps {
    vent: Vent;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onCommentAdded: (ventId: string, comment: Comment) => void;
}

const findComment = (comments: Comment[], id: string): Comment | null => {
    for (const comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
            const found = findComment(comment.replies, id);
            if (found) return found;
        }
    }
    return null;
}

export function CommentSheet({ vent, isOpen, onOpenChange, onCommentAdded }: CommentSheetProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const ventId = vent.id!;
    const [empathyNudge, setEmpathyNudge] = useState<{ suggestion: string; pendingText: string; pendingParentId: string | null } | null>(null);
    const [isCheckingEmpathy, setIsCheckingEmpathy] = useState(false);

    const visibleComments = useMemo(() => {
        const filterHidden = (commentList: Comment[]): Comment[] => {
            return commentList
                .filter(c => !c.isHidden)
                .map(c => ({...c, replies: c.replies ? filterHidden(c.replies) : [] }));
        }
        return filterHidden(comments);
    }, [comments]);

    const totalCommentCount = useMemo(() => {
        let count = 0;
        const countComments = (commentList: Comment[]) => {
            count += commentList.length;
            commentList.forEach(c => c.replies && countComments(c.replies));
        }
        countComments(visibleComments);
        return count;
    }, [visibleComments]);

    useEffect(() => {
        if (isOpen && ventId) {
            setLoading(true);
            getCommentsForVent(ventId)
                .then(setComments)
                .catch(err => {
                    console.error("Error fetching comments:", err);
                    toast({ variant: "destructive", title: "Could not load comments." });
                })
                .finally(() => setLoading(false));
        } else {
            // Reset state when sheet is closed
            setComments([]);
            setNewCommentText("");
            setLoading(true);
        }
    }, [isOpen, ventId, toast]);

    const handlePostComment = async (text: string, parentId: string | null = null, skipEmpathyCheck: boolean = false) => {
        if (!user || !text.trim() || !user.username) return;
        if (user.banStatus && user.banStatus !== 'none') {
            toast({ variant: 'destructive', title: 'Action Prohibited', description: 'Your account is banned and cannot post comments.' });
            return;
        }

        // Client-side safety pre-filter
        const clientSafetyResult = checkComment(text);
        if (clientSafetyResult.publish === false) {
            toast({
                variant: "destructive",
                title: "Comment Blocked",
                description: "This comment was blocked because it may contain harmful content."
            });
            return;
        }

        // Empathy check disabled to save costs
        /*
        if (!skipEmpathyCheck && !parentId) {
            setIsCheckingEmpathy(true);
            try {
                const empathyResult = await checkCommentEmpathy(text, vent.text);
                if (empathyResult.success && empathyResult.data && !empathyResult.data.isEmpathetic && empathyResult.data.suggestion) {
                    setEmpathyNudge({ suggestion: empathyResult.data.suggestion, pendingText: text, pendingParentId: parentId });
                    setIsCheckingEmpathy(false);
                    return;
                }
            } catch {
                // If empathy check fails, proceed with posting
            }
            setIsCheckingEmpathy(false);
        }
        */

        // Clear any existing empathy nudge
        setEmpathyNudge(null);

        setIsPosting(true);

        // Server-side AI safety check disabled to save costs
        /*
        try {
            const safetyResult = await analyzeContentSafety(text, 'comment');
            if (safetyResult.success && safetyResult.data && safetyResult.data.action.blockImmediately) {
                toast({
                    variant: "destructive",
                    title: "Comment Blocked",
                    description: safetyResult.data.reason || "This comment was blocked because it may contain harmful content."
                });
                setIsPosting(false);
                return;
            }
        } catch {
            // If AI safety check fails, proceed (client-side check already passed)
        }
        */

        try {
            const commentData: Omit<Comment, 'id' | 'timestamp' | 'ventId' | 'replies'> = {
                userId: user.uid,
                authorName: user.username,
                authorPhotoURL: user.photoURL,
                authorRole: user.role || 'user',
                text: text,
                parentId: parentId
            };
            const addedComment = await addCommentToVent(ventId, commentData);
            
            setComments(prev => {
                const allComments = [...prev];
                if (parentId) {
                    const parent = findComment(allComments, parentId);
                    if (parent) {
                        parent.replies = [...(parent.replies || []), addedComment];
                    }
                } else {
                    allComments.push(addedComment);
                }
                return allComments;
            });

            onCommentAdded(ventId, addedComment as Comment);
            setNewCommentText("");

        } catch (error: any) {
            console.error("Error posting comment:", error);
            toast({ 
                variant: "destructive", 
                title: "Comment Blocked",
                description: error.message || "An error occurred. Please try again later."
            });
        } finally {
            setIsPosting(false);
        }
    };

    const isBanned = user?.banStatus && user.banStatus !== 'none';
    
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Comments ({totalCommentCount})</SheetTitle>
                    <SheetDescription>This is someone’s vulnerable moment. Please respond with kindness and respect. Harassment or encouragement of harm will not be tolerated.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-4">
                            {loading ? (
                                <>
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </>
                            ) : visibleComments.length === 0 ? (
                                <div className="text-center text-muted-foreground py-10">
                                    <p>{vent.commentsDisabled ? "Comments are disabled by the author." : "Be the first to comment."}</p>
                                </div>
                            ) : (
                                visibleComments.map(comment => (
                                   <CommentWithReplies 
                                        key={comment.id}
                                        comment={comment}
                                        onReply={handlePostComment}
                                        isPosting={isPosting}
                                        ventId={ventId}
                                        onCommentReported={(commentId) => setComments(prev => 
                                            prev.map(c => c.id === commentId ? {...c, isHidden: true} : c)
                                        )}
                                   />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
                <SheetFooter className="mt-auto pt-4 border-t">
                     <div className="w-full space-y-3">
                        {empathyNudge && (
                            <EmpathyNudge
                                suggestion={empathyNudge.suggestion}
                                onEdit={() => {
                                    setEmpathyNudge(null);
                                    // Focus stays on the input for editing
                                }}
                                onPostAnyway={() => {
                                    const { pendingText, pendingParentId } = empathyNudge;
                                    setEmpathyNudge(null);
                                    handlePostComment(pendingText, pendingParentId, true);
                                }}
                                isPosting={isPosting}
                            />
                        )}
                        {!user ? (
                            <div className="text-center py-2 space-y-2">
                                <p className="text-sm text-muted-foreground">Sign in to support other venters and share your thoughts.</p>
                                <Button className="w-full" onClick={() => router.push('/login')}>
                                    Sign In to Comment
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full items-center space-x-2">
                                <Input 
                                    value={newCommentText}
                                    onChange={(e) => {
                                        setNewCommentText(e.target.value);
                                        // Clear empathy nudge when user edits
                                        if (empathyNudge) setEmpathyNudge(null);
                                    }}
                                    placeholder={
                                        isBanned ? "Your account is banned." : 
                                        vent.commentsDisabled ? "Comments are disabled by the author." : "Add a supportive comment..."
                                    }
                                    disabled={isPosting || isCheckingEmpathy || vent.commentsDisabled || isBanned}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handlePostComment(newCommentText);
                                        }
                                    }}
                                />
                                <Button onClick={() => handlePostComment(newCommentText)} disabled={!newCommentText.trim() || isPosting || isCheckingEmpathy || vent.commentsDisabled || isBanned}>
                                    {isBanned ? <Ban className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                                    <span className="sr-only">Post Comment</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
