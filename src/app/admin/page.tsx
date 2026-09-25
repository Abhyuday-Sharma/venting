"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import type { Report, FeedbackItem, AuditLog } from "@/lib/types";
import {
  ShieldAlert,
  MessageSquareHeart,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Star,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [totalReportsCount, setTotalReportsCount] = useState(0);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [publicVentsCount, setPublicVentsCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;

    // 1. Pending reports
    const pendingQ = query(
      collection(db, "reports"),
      where("status", "==", "pending"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const unsubPending = onSnapshot(pendingQ, (snap) => {
      setPendingReports(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Report)));
      setLoading(false);
    }, (e) => {
      console.warn("Pending reports listener error:", e);
      setLoading(false);
    });

    // 2. Total reports
    const totalReportsQ = collection(db, "reports");
    const unsubTotal = onSnapshot(totalReportsQ, (snap) => {
      setTotalReportsCount(snap.size);
    }, () => {});

    // 3. Feedback list
    const feedbackQ = query(
      collection(db, "feedback"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const unsubFeedback = onSnapshot(feedbackQ, (snap) => {
      setFeedbackList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FeedbackItem)));
    }, () => {});

    // 4. Audit logs
    const auditQ = query(
      collection(db, "auditLogs"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
    const unsubAudit = onSnapshot(auditQ, (snap) => {
      setRecentAuditLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AuditLog)));
    }, () => {});

    // 5. Public Vents count
    const ventsQ = collection(db, "publicVents");
    const unsubVents = onSnapshot(ventsQ, (snap) => {
      setPublicVentsCount(snap.size);
    }, () => {});

    return () => {
      unsubPending();
      unsubTotal();
      unsubFeedback();
      unsubAudit();
      unsubVents();
    };
  }, [user]);

  // Average feedback rating
  const avgRating = feedbackList.length
    ? (feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbackList.length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
            Command Center Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time community moderation, user sentiment, and system health status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync Active</span>
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Reports */}
        <Card className={`border shadow-sm transition-all ${
          pendingReports.length > 0
            ? "border-destructive/40 bg-destructive/5 hover:border-destructive/60"
            : "hover:border-primary/40"
        }`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pending Reports
            </CardTitle>
            <ShieldAlert className={`w-4 h-4 ${pendingReports.length > 0 ? "text-destructive animate-bounce" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold font-headline">
              {pendingReports.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingReports.length > 0 ? "Requires operator action" : "All reports resolved"}
            </p>
          </CardContent>
        </Card>

        {/* Feedback Submissions */}
        <Card className="hover:border-primary/40 border shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              User Feedback
            </CardTitle>
            <MessageSquareHeart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-headline">{feedbackList.length}</span>
              {avgRating !== "—" && (
                <span className="text-xs font-medium text-amber-500 flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {avgRating} avg
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Direct from user submissions</p>
          </CardContent>
        </Card>

        {/* Moderation Actions Taken */}
        <Card className="hover:border-primary/40 border shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions Logged
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold font-headline">
              {recentAuditLogs.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Recorded audit entries</p>
          </CardContent>
        </Card>

        {/* Public Vents */}
        <Card className="hover:border-primary/40 border shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Public Vents
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold font-headline">
              {publicVentsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Currently in public feed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Priority Reports Queue & Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Pending Reports Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-bold font-headline">Urgent Reports Queue</h2>
              {pendingReports.length > 0 && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  {pendingReports.length} Pending
                </Badge>
              )}
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link href="/admin/reports">
                <span>View All Reports ({totalReportsCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {pendingReports.length === 0 ? (
            <Card className="glass-card text-center p-8 border-dashed">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <CardTitle className="text-base">Community Clean & Safe</CardTitle>
              <CardDescription className="text-xs mt-1">
                Zero pending reports awaiting review. New reports will appear here automatically.
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingReports.map((report) => (
                <Card key={report.id} className="border border-border/60 hover:border-border transition-all">
                  <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={report.reasonCategory === 'self-harm' ? 'destructive' : 'secondary'} className="text-[11px] uppercase">
                          {report.reasonCategory}
                        </Badge>
                        <span className="text-xs font-semibold capitalize text-foreground">
                          Reported {report.targetType}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {report.timestamp ? formatDistanceToNow((report.timestamp as Timestamp).toDate(), { addSuffix: true }) : ""}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
                    <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1">
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Reason: </span>
                        {report.reason || "No details provided."}
                      </p>
                      <p className="text-muted-foreground text-[11px] truncate">
                        Target ID: <code className="font-mono text-primary">{report.targetId}</code>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Button asChild size="sm" variant="default" className="text-xs h-8">
                        <Link href="/admin/reports">
                          Review in Queue
                        </Link>
                      </Button>
                      <a
                        href={`https://venting.in/feed?ventId=${report.ventId || report.targetId}${report.targetType === 'comment' ? '&openComments=true' : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View Target in App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Recent Feedback & Quick Actions */}
        <div className="space-y-6">
          {/* User Feedback Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold font-headline">Recent Feedback</h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link href="/admin/feedback">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {feedbackList.length === 0 ? (
              <Card className="glass-card text-center p-6 border-dashed">
                <p className="text-xs text-muted-foreground">No user feedback submitted yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {feedbackList.slice(0, 3).map((item) => (
                  <Card key={item.id} className="border border-border/50 text-xs">
                    <CardHeader className="p-3 pb-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (item.rating || 0)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {item.timestamp ? formatDistanceToNow((item.timestamp as Timestamp).toDate(), { addSuffix: true }) : ""}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <p className="text-foreground/90 italic line-clamp-3">
                        &quot;{item.text}&quot;
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick System & Operator Card */}
          <Card className="border border-border/50 bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Operator Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Operator:</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{user?.displayName || user?.username || "Administrator"}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Level:</span>
                <span className="font-semibold text-foreground uppercase">{user?.role || "Admin"}</span>
              </div>
              <div className="flex justify-between">
                <span>Portal Host:</span>
                <span className="font-mono text-primary text-[11px]">admin.venting.in</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
