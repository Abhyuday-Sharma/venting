"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import type { Comment } from "@/lib/types";
import { MessageSquare, Send, Flag, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { adminDeleteComment } from "@/lib/firebase";
import { submitReportAndTakeAction } from "@/lib/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReportReasonCategory } from "@/lib/types";


interface CommentWithRepliesProps {
    comment: Comment;
    ventId: string;
    onReply: (text: string, parentId: string | null) => Promise<void>;
    isPosting: boolean;
    onCommentReported: (commentId: string) => void;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function CommentWithReplies({ comment, ventId, onReply, isPosting, onCommentReported }: CommentWithRepliesProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportCategory, setReportCategory] = useState<ReportReasonCategory | ''>('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [adminDeleteReason, setAdminDeleteReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const hasReplies = comment.replies && comment.replies.length > 0;
    const isBanned = user?.banStatus && user.banStatus !== 'none';

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        await onReply(replyText, comment.id);
        setReplyText("");
        setIsReplying(false);
    };

    const handleReportSubmit = async () => {
        if (!user || !reportReason.trim() || !reportCategory) {
            toast({ variant: 'destructive', title: 'Could not submit report.', description: 'Please select a category and provide a reason.' });
            return;
        }
        setIsSubmittingReport(true);
        try {
            const reportResult = await submitReportAndTakeAction({
                target: { id: comment.id, type: 'comment' },
                ventId: ventId,
                reason: reportReason,
                reasonCategory: reportCategory,
                reporterId: user.uid,
            });
            
            toast({ title: "Report Submitted", description: "Thank you for helping keep the community safe." });
            
            if (reportResult.contentHidden) {
                onCommentReported(comment.id);
            }

            setIsReportDialogOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Report Failed', description: 'Could not submit your report. Please try again.' });
            console.error("Report submission failed:", error);
        } finally {
            setIsSubmittingReport(false);
            setReportReason("");
            setReportCategory("");
        }
    };
    
    const handleAdminDelete = async () => {
        if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'moderator') || !adminDeleteReason.trim()) {
            toast({ variant: "destructive", title: "Permission Denied or Reason Missing" });
            return;
        }
        setIsDeleting(true);
        try {
            await adminDeleteComment(ventId, comment, user, adminDeleteReason);
            toast({ title: "Comment Deleted" });
            setIsDeleteDialogOpen(false);
            // We just hide it in UI since we don't have a direct callback to remove it from the list here
            onCommentReported(comment.id); 
        } catch (error: any) {
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
        } finally {
            setIsDeleting(false);
            setAdminDeleteReason("");
        }
    };
    
    if (comment.isHidden) {
        return (
            <div className="text-sm text-muted-foreground italic bg-muted/50 rounded-lg p-3 ml-11">
                This comment was hidden after being reported by the community.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Main Comment */}
            <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.authorPhotoURL ?? ''} alt={comment.authorName} />
                    <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/50 rounded-lg p-3">
                    <div className="flex items-baseline gap-2">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{comment.authorName}</p>
                            {comment.authorRole === 'owner' && <Badge className="bg-amber-500 hover:bg-amber-600 text-[10px] px-1.5 py-0">FOUNDER</Badge>}
                            {comment.authorRole === 'moderator' && <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px] px-1.5 py-0">MODERATOR</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {comment.timestamp ? formatDistanceToNow((comment.timestamp as Timestamp).toDate(), { addSuffix: true }) : 'just now'}
                        </p>
                    </div>
                    <p className="text-sm text-foreground/90 break-words">{comment.text}</p>
                </div>
            </div>

             {/* Actions */}
            <div className="ml-11 pl-1 flex items-center">
                {user && !isBanned && (
                     <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-muted-foreground" onClick={() => setIsReplying(prev => !prev)}>
                        <MessageSquare className="mr-1 h-3 w-3"/>
                        Reply
                    </Button>
                )}
                 {hasReplies && (
                    <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-muted-foreground" onClick={() => setIsExpanded(prev => !prev)}>
                        {isExpanded ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                        {isExpanded ? 'Hide replies' : `Show ${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`}
                    </Button>
                )}
                
                {user && (user.role === 'owner' || user.role === 'admin' || user.role === 'moderator') && (
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs h-auto py-1 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Comment as Moderator?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. Please provide a reason for the audit log.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-4 py-4">
                                <Textarea 
                                    placeholder="Reason for deletion..."
                                    value={adminDeleteReason}
                                    onChange={(e) => setAdminDeleteReason(e.target.value)}
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAdminDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting || !adminDeleteReason.trim()}>
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Comment"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                
                <AlertDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                    <Button 
                        variant="ghost"  
                        size="sm" 
                        className="text-xs h-auto py-1 px-2 text-muted-foreground"
                        onClick={() => {
                            if (!user) {
                                toast({ title: 'Sign in to report', description: 'You must be signed in to flag content.' });
                            } else {
                                setIsReportDialogOpen(true);
                            }
                        }}
                    >
                        <Flag className="mr-1 h-3 w-3" />
                        Report
                    </Button>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Report Comment</AlertDialogTitle>
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
            </div>

            {/* Reply Input */}
            {isReplying && (
                <div className="ml-11 flex w-full items-center space-x-2 pl-1 pt-2">
                    <Input 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Replying to ${comment.authorName}...`}
                        disabled={isPosting}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReplySubmit();
                            }
                        }}
                        className="h-9"
                    />
                    <Button onClick={handleReplySubmit} disabled={!replyText.trim() || isPosting} size="sm">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Post Reply</span>
                    </Button>
                </div>
            )}

            {/* Render Replies */}
            {isExpanded && hasReplies && (
                <div className="ml-8 pl-4 border-l-2 border-border/50 space-y-4 pt-4">
                    {comment.replies!.map(reply => (
                        <CommentWithReplies 
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            isPosting={isPosting}
                            ventId={ventId}
                            onCommentReported={onCommentReported}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
