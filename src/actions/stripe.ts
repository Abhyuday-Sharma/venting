"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import type { UserProfile } from "@/lib/types";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function createCheckoutSession(
    _amount: number,
    _user: UserProfile
): Promise<never> {
  throw new Error("Direct contributions are currently paused while payment systems are being updated.");
}

export async function verifyStripeSession(sessionId: string, userId: string): Promise<boolean> {
    if (!stripe) {
        console.error("Stripe is not configured. Cannot verify session.");
        return false;
    }
    if (!sessionId || !userId) {
        return false;
    }
    
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid' && session.metadata?.userId === userId) {
            const userDocRef = doc(db, 'users', userId);
            
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists() && userDocSnap.data().hasSupported) {
                return true; 
            }
            
            await updateDoc(userDocRef, { hasSupported: true });
            return true;
        }

        return false;
    } catch (error) {
        console.error("Stripe session verification failed:", error);
        return false;
    }
}
