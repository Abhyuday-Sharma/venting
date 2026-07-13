'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfileById, getPublicVentsByUserId } from "@/lib/firebase";
import type { UserProfile, Vent } from '@/lib/types';
import { UserProfileVents } from "@/components/profile/user-profile-vents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function UserProfilePage() {
    const params = useParams<{ userId: string }>();
    const userId = params?.userId;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [vents, setVents] = useState<Vent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            Promise.all([
                getUserProfileById(userId),
                getPublicVentsByUserId(userId)
            ]).then(([userProfile, userVents]) => {
                if (userProfile) {
                    setProfile(userProfile);
                    setVents(userVents);
                } else {
                    setProfile(null); 
                }
                setLoading(false);
            });
        }
    }, [userId]);
    
    if (!loading && !profile) {
        notFound();
    }

    if (loading) {
        return (
             <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-row items-start gap-8 mb-8">
                     <Skeleton className="h-32 w-32 rounded-full border-4" />
                     <div className="pt-4 space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            {profile && (
                <>
                    <div className="flex flex-row items-start gap-8 mb-8">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-card flex-shrink-0">
                            <AvatarImage src={profile.photoURL ?? ''} alt={profile.displayName ?? 'User'} />
                            <AvatarFallback className="text-4xl">{getInitials(profile.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="pt-4">
                            <h1 className="text-3xl md:text-4xl font-bold font-headline">{profile.displayName}</h1>
                            <p className="text-muted-foreground mt-1">@{profile.username}</p>
                            <p className="mt-4 text-foreground/80 max-w-lg">{vents.length} public vent(s).</p>
                        </div>
                    </div>

                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                       <UserProfileVents initialVents={vents} />
                    </Suspense>
                </>
            )}
        </div>
    );
}
