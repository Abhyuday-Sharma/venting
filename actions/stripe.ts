"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import type { UserProfile } from "@/lib/types";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function createCheckoutSession(
    amount: number,
    user: UserProfile
) {
  if (!stripe) {
    throw new Error("Stripe is not configured. The site owner needs to set the STRIPE_SECRET_KEY.");
  }
  if (!user) {
    throw new Error("You must be logged in to make a donation.");
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") || "http://localhost:9002";

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: "Support the Venting Platform",
            description: "Your contribution helps keep this space running.",
          },
          unit_amount: amount * 100, // Amount in paise
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${origin}/support/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/support?canceled=true`,
    metadata: {
        userId: user.uid,
    },
    customer_email: user.email ?? undefined,
  });

  if (checkoutSession.url) {
    redirect(checkoutSession.url);
  } else {
    throw new Error("Could not create Stripe checkout session.");
  }
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
