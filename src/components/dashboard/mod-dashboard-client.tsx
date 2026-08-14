"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Report, FeedbackItem } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldAlert, MessageSquareHeart, ExternalLink, Star } from "lucide-react";

export function ModDashboardClient() {
    const { user, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || authLoading) return;

        const isPrivileged = user.role === 'owner' || user.role === 'admin' || user.role === 'moderator';
        if (!isPrivileged) {
            setLoading(false);
            return;
        }
        
        // Subscribe to Community Reports
        const reportsQuery = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
            const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
            setReports(fetchedReports);
        }, (error) => {
            console.warn("Could not fetch reports (permission or network):", error.message);
        });

        // Subscribe to User App Feedback
        const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        const unsubscribeFeedback = onSnapshot(feedbackQuery, (snapshot) => {
            const fetchedFeedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackItem));
            setFeedbackList(fetchedFeedback);
            setLoading(false);
        }, (error) => {
            console.warn("Could not fetch feedback (permission or network):", error.message);
            setLoading(false);
        });

        return () => {
            unsubscribeReports();
            unsubscribeFeedback();
        };
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    if (!user || (user.role !== 'owner' && user.role !== 'moderator')) {
        return <div className="p-8 text-center text-red-500 font-bold">Unauthorized access.</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 overflow-x-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold font-headline">Admin Command Center</h1>
                <p className="text-sm text-muted-foreground">Monitor community safety reports and review live user feedback.</p>
            </div>

            <Tabs defaultValue="reports" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                        <span>Reports ({reports.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <MessageSquareHeart className="h-3.5 w-3.5 shrink-0" />
                        <span>Feedback ({feedbackList.length})</span>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Community Safety Reports */}
                <TabsContent value="reports" className="space-y-4">
                    {reports.length === 0 ? (
                        <Card className="glass-card text-center p-12">
                            <CardTitle className="mb-2">No Reports Found</CardTitle>
                            <p className="text-muted-foreground">The community is quiet right now.</p>
                        </Card>
                    ) : (
                        reports.map((report) => (
                            <Card key={report.id} className="glass-card">
                                <CardHeader className="pb-2 px-4 md:px-6">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <CardTitle className="text-base md:text-lg">
                                                Reported {report.targetType === 'vent' ? 'Vent' : 'Comment'}
                                            </CardTitle>
                                            <Badge variant={report.status === 'resolved' ? 'outline' : 'destructive'} className="text-xs">
                                                {report.status || 'pending'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {report.timestamp ? formatDistanceToNow((report.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            ID: {report.id?.slice(0, 8)}… | Target: {report.targetId?.slice(0, 8)}…
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 md:px-6">
                                    <div className="bg-muted/30 p-3 rounded-md space-y-2 text-sm">
                                        <div className="flex flex-wrap items-center gap-1"><span className="font-semibold text-muted-foreground">Category:</span> <Badge variant="secondary">{report.reasonCategory}</Badge></div>
                                        <p className="break-words"><span className="font-semibold text-muted-foreground">Reason:</span> {report.reason || 'No details provided.'}</p>
                                        <p className="truncate"><span className="font-semibold text-muted-foreground">Reporter:</span> {report.reporterId?.slice(0, 12)}…</p>
                                    </div>
                                </CardContent>
                                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 flex flex-wrap gap-2">
                                    <a 
                                        href={`/feed?ventId=${report.ventId || report.targetId}${report.targetType === 'comment' ? '&openComments=true' : ''}`} 
                                        className="text-xs inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 px-3"
                                    >
                                        View in App
                                    </a>
                                    <a 
                                        href={`https://console.firebase.google.com/project/studio-6635404237-5ab92/firestore/databases/-default-/data/~2Freports~2F${report.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1"
                                    >
                                        Firebase <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Tab 2: User Platform Feedback */}
                <TabsContent value="feedback" className="space-y-4">
                    {feedbackList.length === 0 ? (
                        <Card className="glass-card text-center p-12">
                            <CardTitle className="mb-2">No Feedback Submitted Yet</CardTitle>
                            <p className="text-muted-foreground">When users submit feedback on /feedback, it will appear here.</p>
                        </Card>
                    ) : (
                        feedbackList.map((item) => (
                            <Card key={item.id} className="glass-card">
                                <CardHeader className="pb-2 px-4 md:px-6">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <CardTitle className="text-base md:text-lg">
                                                User Feedback
                                            </CardTitle>
                                            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30 flex items-center gap-1 text-xs">
                                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                {item.rating}/5
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {item.timestamp ? formatDistanceToNow((item.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            ID: {item.id?.slice(0, 8)}… | User: {item.userId?.slice(0, 12)}…
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 md:px-6">
                                    <div className="bg-muted/30 p-3 md:p-4 rounded-md">
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
                                            &quot;{item.text}&quot;
                                        </p>
                                    </div>
                                </CardContent>
                                <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 flex gap-2">
                                    <a 
                                        href={`https://console.firebase.google.com/project/studio-6635404237-5ab92/firestore/databases/-default-/data/~2Ffeedback~2F${item.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 gap-1"
                                    >
                                        Firebase <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
