"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db, adminResolveReport, adminDeletePublicVent, adminDeleteComment, getContentPreview } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import type { Report, Vent, Comment } from "@/lib/types";
import {
  ShieldAlert,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AdminReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"pending" | "resolved" | "all">("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, { text: string; author?: string; notFound?: boolean; loading?: boolean }>>({});

  useEffect(() => {
    if (!user) return;

    const reportsQ = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      reportsQ,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Report[];
        setReports(fetched);
        setLoading(false);
      },
      (error) => {
        console.warn("Could not load reports:", error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load content preview on demand
  const handleLoadPreview = async (report: Report) => {
    if (!report.id || previews[report.id]?.text) return;

    setPreviews((prev) => ({
      ...prev,
      [report.id!]: { text: "", loading: true },
    }));

    const preview = await getContentPreview(report.targetId, report.targetType, report.ventId);
    setPreviews((prev) => ({
      ...prev,
      [report.id!]: { ...preview, loading: false },
    }));
  };

  // Resolve a report
  const handleResolve = async (reportId: string) => {
    if (!user) return;
    setResolvingId(reportId);
    try {
      await adminResolveReport(reportId, user);
      toast({
        title: "Report Resolved",
        description: "The report status has been marked as resolved.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: e.message || "Could not resolve report.",
      });
    } finally {
      setResolvingId(null);
    }
  };

  // Delete content associated with report
  const handleDeleteContent = async (report: Report) => {
    if (!user || !deleteReason.trim()) return;
    setDeletingId(report.id || null);

    try {
      if (report.targetType === "vent") {
        const fakeVent: Partial<Vent> = { id: report.targetId };
        await adminDeletePublicVent(fakeVent as Vent, user, deleteReason.trim());
      } else if (report.targetType === "comment" && report.ventId) {
        const fakeComment: Partial<Comment> = { id: report.targetId, userId: "" };
        await adminDeleteComment(report.ventId, fakeComment as Comment, user, deleteReason.trim());
      }

      if (report.id) {
        await adminResolveReport(report.id, user);
      }

      toast({
        title: "Content Deleted & Report Resolved",
        description: `Successfully removed reported ${report.targetType}.`,
      });
      setDeleteReason("");
    } catch (e: any) {
      console.error("Admin delete error:", e);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: e.message || "Failed to delete content.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status
      if (statusFilter === "pending" && r.status === "resolved") return false;
      if (statusFilter === "resolved" && r.status !== "resolved") return false;

      // Category
      if (categoryFilter !== "all" && r.reasonCategory !== categoryFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const matchesReason = r.reason?.toLowerCase().includes(queryLower);
        const matchesCategory = r.reasonCategory?.toLowerCase().includes(queryLower);
        const matchesId = r.targetId?.toLowerCase().includes(queryLower) || r.id?.toLowerCase().includes(queryLower);
        if (!matchesReason && !matchesCategory && !matchesId) return false;
      }

      return true;
    });
  }, [reports, statusFilter, categoryFilter, searchQuery]);

  const pendingCount = reports.filter((r) => r.status !== "resolved").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-amber-500" />
            <span>Reports Moderation Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Review community reports, inspect flagged vents or comments, and enforce safety policies.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 p-4 rounded-xl border border-border/50">
        <Tabs
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as any)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="pending" className="text-xs">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs">
              Resolved ({resolvedCount})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              All ({reports.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Categories</option>
            <option value="self-harm">Self-Harm</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search reports or ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading reports queue…</span>
            </div>
          </Card>
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="glass-card text-center p-12 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No Reports Found</CardTitle>
          <CardDescription className="text-xs mt-1">
            {statusFilter === "pending"
              ? "All caught up! There are no pending reports requiring action."
              : "No reports match your current filter settings."}
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const preview = report.id ? previews[report.id] : null;

            return (
              <Card
                key={report.id}
                className={`border shadow-sm transition-all ${
                  report.status === "resolved"
                    ? "border-border/40 opacity-80"
                    : report.reasonCategory === "self-harm"
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border/60 hover:border-border"
                }`}
              >
                <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={report.status === "resolved" ? "outline" : "destructive"}
                        className="text-[11px] font-semibold uppercase tracking-wider"
                      >
                        {report.status || "pending"}
                      </Badge>
                      <Badge
                        variant={report.reasonCategory === "self-harm" ? "destructive" : "secondary"}
                        className="text-[11px]"
                      >
                        {report.reasonCategory}
                      </Badge>
                      <span className="text-xs font-semibold capitalize text-foreground">
                        Reported {report.targetType}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {report.timestamp
                        ? formatDistanceToNow((report.timestamp as Timestamp).toDate(), { addSuffix: true })
                        : ""}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Report ID: <code className="font-mono text-primary">{report.id?.slice(0, 10)}…</code>
                    </span>
                    <span>
                      Target ID: <code className="font-mono text-primary">{report.targetId}</code>
                    </span>
                    {report.ventId && report.targetType === "comment" && (
                      <span>
                        Parent Vent ID: <code className="font-mono text-primary">{report.ventId}</code>
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 pb-5 space-y-4">
                  {/* Reporter details */}
                  <div className="bg-muted/40 p-3.5 rounded-lg text-xs space-y-1.5 border border-border/30">
                    <p className="text-foreground leading-relaxed">
                      <span className="font-semibold text-muted-foreground">Reporter Reason: </span>
                      &quot;{report.reason || "No details provided."}&quot;
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Reporter UID: <code className="font-mono">{report.reporterId}</code>
                    </p>
                  </div>

                  {/* Target Content Preview Drawer */}
                  <div className="border border-border/40 rounded-lg p-3.5 bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        Target Content Preview
                      </span>
                      {!preview?.text && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadPreview(report)}
                          disabled={preview?.loading}
                          className="h-6 text-[11px] px-2"
                        >
                          {preview?.loading ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <RefreshCw className="w-3 h-3 mr-1" />
                          )}
                          <span>Load Content</span>
                        </Button>
                      )}
                    </div>

                    {preview?.loading ? (
                      <div className="text-xs text-muted-foreground py-2 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>Fetching reported content from Firestore…</span>
                      </div>
                    ) : preview?.text ? (
                      <div className="space-y-1 text-xs">
                        <p className="p-2.5 bg-muted/30 rounded border border-border/30 whitespace-pre-wrap text-foreground/90">
                          {preview.text}
                        </p>
                        {preview.author && (
                          <p className="text-[10px] text-muted-foreground">
                            Author: <span className="font-semibold">{preview.author}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Click &quot;Load Content&quot; to inspect what the user wrote before deciding.
                      </p>
                    )}
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Mark Resolved Button */}
                      {report.status !== "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resolvingId === report.id}
                          onClick={() => handleResolve(report.id!)}
                          className="text-xs h-8 flex items-center gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        >
                          {resolvingId === report.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Mark Resolved</span>
                        </Button>
                      )}

                      {/* Admin Delete Content Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="text-xs h-8 flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Content</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5" />
                              <span>Confirm Admin Deletion</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-xs sm:text-sm">
                              This will immediately purge the reported {report.targetType} from the public database and record an official entry in the immutable audit log.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <div className="space-y-2 py-2">
                            <label className="text-xs font-semibold text-foreground">
                              Mandatory Deletion Reason:
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g. Hate speech / severe harassment violation"
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              className="text-xs"
                            />
                            <p className="text-[11px] text-muted-foreground">
                              This reason will be permanently attached to your operator ID in the audit logs.
                            </p>
                          </div>

                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteReason("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={!deleteReason.trim() || deletingId === report.id}
                              onClick={() => handleDeleteContent(report)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === report.id ? "Deleting…" : "Confirm Deletion"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={`https://venting.in/feed?ventId=${report.ventId || report.targetId}${report.targetType === 'comment' ? '&openComments=true' : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View in Feed</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={`https://console.firebase.google.com/project/studio-6635404237-5ab92/firestore/databases/-default-/data/~2Freports~2F${report.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Firebase</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
