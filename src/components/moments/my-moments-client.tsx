
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getVentsForUser } from "@/lib/firebase";
import type { Vent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { BookHeart } from "lucide-react";

const moodBadgeVariant = (
  mood: number
): "destructive" | "secondary" | "default" => {
  if (mood <= 3) return "destructive";
  if (mood <= 7) return "secondary";
  return "default";
};

const momentCategories = ["Personal Growth", "General"];

export function MyMomentsClient() {
  const { user } = useAuth();
  const [vents, setVents] = useState<Vent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsubscribe = getVentsForUser(user.uid, (userVents) => {
        setVents(userVents);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const myMoments = useMemo(() => {
    return vents.filter(
      (vent) =>
        momentCategories.includes(vent.category || "") && vent.mood >= 6
    );
  }, [vents]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/2" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Bright Spots</h1>
        <p className="text-muted-foreground">
          A journal of your saved wins, joys, and reflections.
        </p>
      </div>

      {myMoments.length > 0 ? (
        <div className="space-y-4">
          {myMoments.map((moment) => (
            <Card key={moment.id} className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <p className="text-base text-foreground/80 whitespace-pre-wrap break-words">
                  {moment.text}
                </p>
              </CardHeader>
              <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                <span>
                  {moment.timestamp
                    ? formatDistanceToNow(
                        (moment.timestamp as Timestamp).toDate(),
                        { addSuffix: true }
                      )
                    : ""}
                </span>
                <div className="flex items-center gap-4">
                  {moment.category && (
                    <Badge variant="secondary" className="shadow-sm">
                      {moment.category}
                    </Badge>
                  )}
                  <Badge
                    variant={moodBadgeVariant(moment.mood)}
                    className="shadow-sm"
                  >
                    Mood: {moment.mood}/10
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 px-4 border-2 border-dashed rounded-lg bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <BookHeart className="mr-2 h-8 w-8 text-muted-foreground" />
              No Bright Spots Saved Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your private bright spots will appear here once you save them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
