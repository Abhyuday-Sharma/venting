

"use client";

import type { Vent } from "@/lib/types";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { Trash2, Shield, EyeOff, Pencil, Lock, Clock } from "lucide-react";
import { Button } from "../ui/button";
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
} from "@/components/ui/alert-dialog"
import Link from "next/link";


interface VentHistoryProps {
  vents: Vent[];
  onDeleteVent: (ventId: string) => void;
}

const moodBadgeVariant = (mood: number): "destructive" | "secondary" | "default" => {
    if (mood <= 3) return "destructive";
    if (mood <= 7) return "secondary";
    return "default";
}

export function VentHistory({ vents, onDeleteVent }: VentHistoryProps) {
  // Only show vents that have actual text content written by the user.
  const writtenVents = vents.filter(vent => vent.text && vent.text.trim().length > 0);

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">Your Vent History</h2>
      {writtenVents.map((vent, index) => (
        <Card key={vent.id} className={`glass-card card-reveal card-reveal-${((index % 6) + 1) as 1|2|3|4|5|6} relative group`}>
          <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/vent?id=${vent.id}`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Vent</span>
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your vent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteVent(vent.id!)} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <CardHeader>
            <p className="text-base text-foreground/80 whitespace-pre-wrap break-words">
              {vent.text}
            </p>
          </CardHeader>
          <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{vent.timestamp ? formatDistanceToNow((vent.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}</span>
            <div className="flex items-center gap-4">
                {!vent.isPublic ? (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                        {vent.isIncognito ? <EyeOff className="h-3 w-3"/> : <Shield className="h-3 w-3"/>}
                        {vent.isIncognito ? 'Incognito' : 'Public'}
                    </Badge>
                )}
                {vent.isPublic && vent.expiresAt && (
                    <Badge variant="outline" className={`flex items-center gap-1 border-orange-200 text-orange-600 dark:text-orange-400 ${ (vent.expiresAt as Timestamp).toMillis() < Date.now() ? 'opacity-60 line-through bg-muted text-muted-foreground border-muted' : ''}`}>
                        <Clock className="h-3 w-3" />
                        {(vent.expiresAt as Timestamp).toMillis() < Date.now() ? 'Archived' : `Expires ${formatDistanceToNow((vent.expiresAt as Timestamp).toDate(), { addSuffix: true })}`}
                    </Badge>
                )}
                <Badge variant={moodBadgeVariant(vent.mood)} className="shadow-sm">Mood: {vent.mood}/10</Badge>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
