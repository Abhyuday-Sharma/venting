"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getGlobalReports } from "@/lib/firebase";
import type { Report } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function ModDashboardClient() {
    const { user, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || authLoading) return;
        
        const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
            setReports(fetchedReports);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch reports:", error);
            setLoading(false);
        });

        return () => unsubscribe();
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
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Report History</h1>
                <p className="text-muted-foreground">Monitor and review community reports.</p>
            </div>

            {reports.length === 0 ? (
                <Card className="glass-card text-center p-12">
                    <CardTitle className="mb-2">No Reports Found</CardTitle>
                    <p className="text-muted-foreground">The community is quiet right now.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <Card key={report.id} className="glass-card">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            Reported {report.targetType === 'vent' ? 'Vent' : 'Comment'}
                                            <Badge variant={report.status === 'resolved' ? 'outline' : 'destructive'}>
                                                {report.status || 'pending'}
                                            </Badge>
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Report ID: {report.id} | Target ID: {report.targetId} {report.ventId ? `| Vent ID: ${report.ventId}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {report.timestamp ? formatDistanceToNow((report.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/30 p-3 rounded-md space-y-2 text-sm">
                                    <p><span className="font-semibold text-muted-foreground">Category:</span> <Badge variant="secondary" className="ml-1">{report.reasonCategory}</Badge></p>
                                    <p><span className="font-semibold text-muted-foreground">Reason Details:</span> {report.reason || 'No additional details provided.'}</p>
                                    <p><span className="font-semibold text-muted-foreground">Reporter UID:</span> {report.reporterId}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
