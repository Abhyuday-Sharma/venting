

'use client';

import { useState } from "react";
import ProtectedPage from "@/components/auth/protected-page";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Feather, HeartHandshake, Leaf, Loader2, Sparkles, Sun, Sunrise, BookHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import type { VentCategory } from "@/lib/types";
import Link from "next/link";
import { EndSessionAcknowledgement } from "@/components/layout/end-session-acknowledgement";

const InteractiveMomentCard = ({ 
    icon, 
    title, 
    prompt, 
    cardClass, 
    iconClass, 
    defaultMood, 
    defaultCategory,
    onMomentSaved
}: {
    icon: React.ReactNode;
    title: string;
    prompt: string;
    cardClass?: string;
    iconClass?: string;
    defaultMood: number;
    defaultCategory: VentCategory;
    onMomentSaved: () => void;
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [text, setText] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveMoment = async () => {
        if (!user || !user.username) {
            toast({ variant: 'destructive', title: 'Please sign in to save a moment.' });
            return;
        }
        if (!text.trim()) {
            toast({ variant: 'destructive', title: 'Please write something to save.' });
            return;
        }
        setIsSaving(true);

        const ventData = {
            text,
            mood: defaultMood,
            category: defaultCategory,
            isPublic: false, // Save as private
            isIncognito: false, 
            userId: user.uid,
            authorName: user.username,
            authorPhotoURL: user.photoURL,
            timestamp: serverTimestamp(),
            hearts: 0,
            hugs: 0,
            comments: 0,
            heartedBy: [],
            huggedBy: [],
        };

        try {
            const privateVentRef = doc(collection(db, 'users', user.uid, 'vents'));
            await setDoc(privateVentRef, ventData);

            toast({
                title: "Moment Saved!",
                description: "Your private moment has been saved. View it in 'My Moments'.",
            });
            setText('');
            onMomentSaved();
        } catch (error) {
            console.error("Error saving moment:", error);
            toast({ variant: 'destructive', title: 'Could not save moment. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className={`shadow-lg bg-card/60 backdrop-blur-sm transition-all hover:shadow-xl flex flex-col ${cardClass}`}>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-full ${iconClass}`}>
                        {icon}
                    </div>
                    <CardTitle className="font-headline text-xl text-foreground/90">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <p className="text-muted-foreground italic">"{prompt}"</p>
                <Textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Save your private moment here..."
                    className="bg-background/50"
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveMoment} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Moment
                </Button>
            </CardFooter>
        </Card>
    );
};


export default function MomentsPage() {
    const [showAcknowledgement, setShowAcknowledgement] = useState(false);

    const triggerAcknowledgement = () => {
        try {
            const acknowledgementShown = sessionStorage.getItem('acknowledgementShown');
            if (!acknowledgementShown) {
                setShowAcknowledgement(true);
                sessionStorage.setItem('acknowledgementShown', 'true');
            }
        } catch (e) { console.log("sessionStorage not available"); }
    };

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-amber-50/20 dark:bg-slate-900/20">
                <main className="container mx-auto px-4 py-12 md:py-16">
                    <header className="text-center mb-12 md:mb-16">
                        <div className="flex justify-center items-center gap-4">
                           <Sun className="h-10 w-10 text-amber-500/80" />
                            <h1 className="text-4xl md:text-5xl font-headline font-semibold text-amber-800 dark:text-amber-300">
                                Bright Spots
                            </h1>
                             <Leaf className="h-10 w-10 text-green-600/70 dark:text-green-400/70 transform -scale-x-100" />
                        </div>
                        <p className="mt-4 text-lg text-amber-700/80 dark:text-amber-300/80 max-w-2xl mx-auto">
                            A private space to record your small joys, quiet victories, and the relief of making it through the day.
                        </p>
                        <div className="mt-8">
                            <Button asChild>
                                <Link href="/moments/my-moments">
                                    <BookHeart className="mr-2 h-4 w-4" />
                                    View My Bright Spots
                                </Link>
                            </Button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InteractiveMomentCard
                            icon={<Award className="h-6 w-6" />}
                            title="Today's Small Win"
                            prompt="Share a little victory, like finishing that task you were avoiding or getting outside for a walk."
                            cardClass="border-yellow-500/10"
                            iconClass="bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300"
                            defaultMood={8}
                            defaultCategory="Personal Growth"
                            onMomentSaved={triggerAcknowledgement}
                        />
                        <InteractiveMomentCard
                            icon={<Feather className="h-6 w-6" />}
                            title="A Moment of Relief"
                            prompt="What brought you peace today? Maybe a meeting went better than expected, or you had a quiet cup of tea."
                             cardClass="border-sky-500/10"
                             iconClass="bg-sky-100/80 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300"
                             defaultMood={7}
                             defaultCategory="General"
                             onMomentSaved={triggerAcknowledgement}
                        />
                         <InteractiveMomentCard
                            icon={<HeartHandshake className="h-6 w-6" />}
                            title="Gratitude Corner"
                            prompt="What are you thankful for? Perhaps a friend checking in, or the beautiful evening sky."
                             cardClass="border-rose-500/10"
                            iconClass="bg-rose-100/80 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300"
                            defaultMood={9}
                            defaultCategory="Personal Growth"
                            onMomentSaved={triggerAcknowledgement}
                        />
                        <InteractiveMomentCard
                            icon={<Sunrise className="h-6 w-6" />}
                            title="I Survived Today"
                            prompt="Sometimes, just getting through is the victory. It's okay to just say 'I made it through today.'"
                             cardClass="border-orange-500/10"
                             iconClass="bg-orange-100/80 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300"
                             defaultMood={6}
                             defaultCategory="General"
                             onMomentSaved={triggerAcknowledgement}
                        />
                    </div>

                    <footer className="text-center mt-12 md:mt-16">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            It's okay to share your light and your resilience.
                        </p>
                    </footer>
                </main>
            </div>
            <EndSessionAcknowledgement show={showAcknowledgement} onDismiss={() => setShowAcknowledgement(false)} />
        </ProtectedPage>
    );
}
