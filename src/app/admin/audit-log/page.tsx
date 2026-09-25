"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import type { AuditLog } from "@/lib/types";
import { getDate } from "@/lib/date-utils";
import {
  FileText,
  ShieldAlert,
  Search,
  CheckCircle2,
  Loader2,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow, format } from "date-fns";

export default function AdminAuditLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;

    const auditQ = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      auditQ,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuditLog[];
        setLogs(fetched);
        setLoading(false);
      },
      (error) => {
        console.warn("Could not load audit logs:", error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => {
      return (
        log.action?.toLowerCase().includes(q) ||
        log.actorUsername?.toLowerCase().includes(q) ||
        log.reason?.toLowerCase().includes(q) ||
        log.targetId?.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            <span>Moderation Audit Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Immutable, chronological ledger of all administrative deletions, warnings, and policy enforcement decisions.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search action or reason…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs"
          />
        </div>
      </div>

      {/* Logs Table / Card List */}
      {loading ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Loading audit log ledger…</span>
          </div>
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card className="glass-card text-center p-12 border-dashed">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No Audit Logs Recorded</CardTitle>
          <CardDescription className="text-xs mt-1">
            When moderators delete content, an immutable audit entry will be generated automatically.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const date = getDate(log.timestamp);
            const timeAgo = date ? formatDistanceToNow(date, { addSuffix: true }) : "";
            const formattedDate = date ? format(date, "MMM dd, yyyy • HH:mm:ss") : "Unknown date";

            return (
              <Card key={log.id} className="border border-border/60 hover:border-border transition-all">
                <CardHeader className="p-4 sm:p-5 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={log.action === "ADMIN_DELETE_VENT" ? "destructive" : "secondary"}
                        className="text-[11px] font-mono uppercase"
                      >
                        {log.action}
                      </Badge>
                      <span className="text-xs font-semibold flex items-center gap-1 text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{log.actorUsername || "Platform Operator"}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span title={formattedDate}>{timeAgo}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-1 space-y-2">
                  <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1 border border-border/30">
                    <p className="text-foreground leading-relaxed">
                      <span className="font-semibold text-muted-foreground">Enforcement Reason: </span>
                      &quot;{log.reason}&quot;
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span>
                        Target ID: <code className="font-mono text-primary">{log.targetId}</code>
                      </span>
                      <span>
                        Author UID: <code className="font-mono text-muted-foreground">{log.targetOwnerId}</code>
                      </span>
                      <span>
                        Timestamp: <span>{formattedDate}</span>
                      </span>
                    </div>

                    <a
                      href={`https://console.firebase.google.com/project/studio-6635404237-5ab92/firestore/databases/-default-/data/~2FauditLogs~2F${log.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Firebase Log</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
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
