
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getNotificationsForUser, markNotificationsAsRead } from '@/lib/firebase';
import type { Notification } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Hand, MessageCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

function NotificationIcon({ type }: { type: Notification['type'] }) {
    switch (type) {
        case 'new_reaction_heart':
            return <Heart className="h-4 w-4 mt-1 text-red-500 fill-red-500" />;
        case 'new_reaction_hug':
            return <Hand className="h-4 w-4 mt-1 text-yellow-500" />;
        case 'new_comment':
            return <MessageCircle className="h-4 w-4 mt-1 text-sky-500" />;
        default:
            return <Info className="h-4 w-4 mt-1" />;
    }
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const unsubscribe = getNotificationsForUser(user.uid, setNotifications);
      return () => unsubscribe();
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && user && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      markNotificationsAsRead(user.uid, unreadIds);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    let path = '';
    if (notification.type === 'new_comment') {
        path = `/feed?ventId=${notification.ventId}&openComments=true`;
    } else { // for reactions
        path = `/feed?ventId=${notification.ventId}`;
    }
    router.push(path);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <p className="text-sm text-muted-foreground text-center w-full py-4">
              You have no notifications yet.
            </p>
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 10).map(notif => (
            <DropdownMenuItem
              key={notif.id}
              className={cn("flex items-start gap-3 cursor-pointer", !notif.read && "bg-accent/50")}
              onClick={() => handleNotificationClick(notif)}
            >
              <NotificationIcon type={notif.type} />
              <div className="flex-1">
                <p className="text-sm leading-snug">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notif.timestamp ? formatDistanceToNow((notif.timestamp as Timestamp).toDate(), { addSuffix: true }) : ''}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
