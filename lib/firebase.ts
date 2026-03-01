
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth,
  deleteUser,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
  increment,
  Timestamp,
  onSnapshot,
  writeBatch,
  where,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Vent, Comment, Notification, UserProfile, Report, ReportReasonCategory } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { checkComment, type IntentAction } from './safety';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };


async function createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notificationData = { ...notification, read: false, timestamp: serverTimestamp() };
    const notificationsCollection = collection(db, 'users', notification.ventOwnerId, 'notifications');
    addDoc(notificationsCollection, notificationData).catch(serverError => {
        console.error("Failed to create notification:", serverError);
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: notificationsCollection.path,
                operation: 'create',
                requestResourceData: notificationData
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
}

export const getVentsForUser = (userId: string, callback: (vents: Vent[]) => void) => {
  const ventsCollection = collection(db, 'users', userId, 'vents');
  const q = query(ventsCollection, orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (querySnapshot) => {
    const vents: Vent[] = [];
    querySnapshot.forEach((doc) => {
      vents.push({ id: doc.id, ...doc.data() } as Vent);
    });
    callback(vents);
  }, (serverError) => {
    if (serverError.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ventsCollection.path, operation: 'list' }));
    }
  });
};

export const getVentById = async (userId: string, ventId: string): Promise<Vent | null> => {
    if (!userId || !ventId) return null;
    const ventRef = doc(db, 'users', userId, 'vents', ventId);
    try {
        const ventSnap = await getDoc(ventRef);
        return ventSnap.exists() ? { id: ventSnap.id, ...ventSnap.data() } as Vent : null;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ventRef.path, operation: 'get' }));
        }
        return null;
    }
}

export const getNotificationsForUser = (userId: string, callback: (notifications: Notification[]) => void) => {
  const notificationsCollection = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsCollection, orderBy("timestamp", "desc"));

  return onSnapshot(q, (querySnapshot) => {
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    callback(notifications);
  }, (serverError) => {
    if (serverError.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: notificationsCollection.path, operation: 'list' }));
    }
  });
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]) => {
  if (!userId || notificationIds.length === 0) return;
  const batch = writeBatch(db);
  notificationIds.forEach(id => {
    const notifRef = doc(db, 'users', userId, 'notifications', id);
    batch.update(notifRef, { read: true });
  });

  try {
    await batch.commit();
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `users/${userId}/notifications`, operation: 'write' }));
    }
  }
};

export const getPublicVents = async (): Promise<Vent[]> => {
    const ventsCollectionRef = collection(db, 'publicVents');
    const q = query(ventsCollectionRef, orderBy("timestamp", "desc"));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vent));
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ventsCollectionRef.path, operation: 'list' }));
        }
        return [];
    }
}

export const getCommentsForVent = async (ventId: string): Promise<Comment[]> => {
    const commentsCollectionRef = collection(db, 'publicVents', ventId, 'comments');
    const q = query(commentsCollectionRef, orderBy("timestamp", "asc"));
    try {
        const querySnapshot = await getDocs(q);
        const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));

        const commentMap: { [key: string]: Comment } = {};
        const nestedComments: Comment[] = [];
        comments.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });
        comments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].replies?.push(comment);
            } else {
                nestedComments.push(comment);
            }
        });
        return nestedComments;
    } catch (serverError: any) {
         if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: commentsCollectionRef.path, operation: 'list' }));
        }
        return [];
    }
}

export async function applyUserWarning(userId: string, action: IntentAction) {
    if (!('incrementWarning' in action) || !action.incrementWarning) {
        return;
    }

    const userRef = doc(db, 'users', userId);
    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User not found.");

            const data = userDoc.data();
            const currentWarnings = data.warningCount || 0;
            const newWarnings = currentWarnings + 1;

            const updatePayload: { warningCount: number, banStatus?: string, banExpiry?: Timestamp | null } = {
                warningCount: newWarnings
            };
            
            if ('autoBanAfterWarnings' in action && action.autoBanAfterWarnings && newWarnings >= action.autoBanAfterWarnings) {
                 if(action.autoBanAfterWarnings === 1){
                     updatePayload.banStatus = 'permanent';
                     updatePayload.banExpiry = null;
                 } else {
                     updatePayload.banStatus = 'temporary';
                     const expiryDate = new Date();
                     expiryDate.setDate(expiryDate.getDate() + 7);
                     updatePayload.banExpiry = Timestamp.fromDate(expiryDate);
                 }
            } else if (data.banStatus !== 'permanent' && newWarnings >= 3) {
                // Fallback for 3 total warnings -> permanent ban
                updatePayload.banStatus = 'permanent';
                updatePayload.banExpiry = null;
            }

            transaction.update(userRef, updatePayload);
        });
    } catch (error) {
        console.error("Error applying user warning:", error);
    }
}

export const addCommentToVent = async (ventId: string, commentData: Omit<Comment, 'id' | 'timestamp' | 'ventId' | 'replies'>): Promise<Comment> => {
    const moderationAction = checkComment(commentData.text);
    if (!moderationAction.publish) {
        if (moderationAction.incrementWarning) {
            await applyUserWarning(commentData.userId, moderationAction);
        }
        throw new Error("This comment violates community guidelines and cannot be posted.");
    }

    const ventRef = doc(db, 'publicVents', ventId);
    const dataForDb = { ...commentData, ventId, timestamp: serverTimestamp(), replyCount: 0, isHidden: false, reportCount: 0 };
    const commentsCollection = collection(db, 'publicVents', ventId, 'comments');
    
    try {
        const newCommentRef = await addDoc(commentsCollection, dataForDb);
        updateDoc(ventRef, { comments: increment(1) }).catch(error => console.error("Non-critical error: Failed to increment vent comment count.", error));
        if (commentData.parentId) {
            const parentCommentRef = doc(db, 'publicVents', ventId, 'comments', commentData.parentId);
            updateDoc(parentCommentRef, { replyCount: increment(1) }).catch(error => console.error("Non-critical error: Failed to increment parent reply count.", error));
        }
        getDoc(ventRef).then(ventDoc => {
            if (ventDoc.exists()) {
                const ventOwnerId = ventDoc.data().userId;
                if (ventOwnerId !== commentData.userId) {
                    createNotification({
                        type: 'new_comment', ventId: ventId, ventOwnerId: ventOwnerId,
                        triggeringUserId: commentData.userId, triggeringUserName: commentData.authorName,
                        message: `${commentData.authorName} commented on your vent.`,
                    });
                }
            }
        });
        return { ...commentData, id: newCommentRef.id, ventId, timestamp: Timestamp.now(), replyCount: 0, replies: [] };
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
             errorEmitter.emit('permission-error', new FirestorePermissionError({ path: commentsCollection.path, operation: 'create', requestResourceData: dataForDb }));
        }
        console.error("Fatal error posting comment:", serverError);
        throw serverError;
    }
}

export async function submitReportAndTakeAction(
    { target, ventId, reason, reasonCategory, reporterId }: {
        target: { id: string, type: 'vent' | 'comment' },
        ventId?: string, // only needed for comment reports
        reason: string,
        reasonCategory: ReportReasonCategory,
        reporterId: string
    }
): Promise<{ success: boolean, contentHidden: boolean }> {
    const targetRef = target.type === 'vent'
        ? doc(db, 'publicVents', target.id)
        : doc(db, 'publicVents', ventId!, 'comments', target.id);

    let contentHidden = false;

    try {
        await runTransaction(db, async (transaction) => {
            const targetDoc = await transaction.get(targetRef);
            if (!targetDoc.exists()) throw new Error("Content to report not found.");

            const newReportCount = (targetDoc.data().reportCount || 0) + 1;
            
            const updateData: { reportCount: number, isHidden?: boolean, commentsDisabled?: boolean } = { reportCount: newReportCount };

            if (target.type === 'comment' && newReportCount >= 2) {
                updateData.isHidden = true;
                contentHidden = true;
            } else if (target.type === 'vent' && newReportCount >= 3) {
                updateData.isHidden = true;
                contentHidden = true;
            }
            
            transaction.update(targetRef, updateData);
        });

        // Add the report doc outside the transaction
        const reportData = { reporterId, reason, reasonCategory, targetId: target.id, targetType: target.type, timestamp: serverTimestamp() };
        const reportsCollection = collection(db, 'publicVents', target.type === 'vent' ? target.id : ventId!, 'reports');
        await addDoc(reportsCollection, reportData);
        
        return { success: true, contentHidden };

    } catch (error: any) {
        console.error("Error submitting report and taking action:", error);
        if (error.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: targetRef.path,
                operation: 'update',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw error; // Re-throw to be caught by UI
    }
}


export async function resetWrittenVents(userId: string) {
  if (!userId) return;
  const privateVentsCollection = collection(db, 'users', userId, 'vents');
  const q = query(privateVentsCollection, where("text", "!=", ""));
  
  try {
    const privateVentsSnapshot = await getDocs(q);
    if (privateVentsSnapshot.empty) return; 

    const batch = writeBatch(db);
    for (const docSnap of privateVentsSnapshot.docs) {
      batch.delete(docSnap.ref);
      if ((docSnap.data() as Vent).isPublic) {
        batch.delete(doc(db, 'publicVents', docSnap.id));
      }
    }
    await batch.commit();
  } catch (error) {
    console.error("Error resetting written vents:", error);
    throw new Error("Could not delete your written vents. Please try again.");
  }
}
  
export async function resetMoodLogs(userId: string) {
    if (!userId) return;
    const privateVentsCollection = collection(db, 'users', userId, 'vents');
    const q = query(privateVentsCollection, where("text", "==", ""));
    try {
        const privateVentsSnapshot = await getDocs(q);
        if (privateVentsSnapshot.empty) return;
        const batch = writeBatch(db);
        privateVentsSnapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
    } catch (error) {
        console.error("Error resetting mood logs:", error);
        throw new Error("Could not delete your mood tracks. Please try again.");
    }
}

export const getUserProfileByUsername = async (username: string): Promise<UserProfile | null> => {
    if (!username) return null;
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    try {
        const usernameSnap = await getDoc(usernameRef);
        if (!usernameSnap.exists()) return null;
        const uid = usernameSnap.data().uid;
        return await getUserProfileById(uid);
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: usernameRef.path, operation: 'get' }));
        }
        return null;
    }
}

export const getUserProfileById = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    try {
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? { uid: userId, ...userSnap.data() } as UserProfile : null;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userRef.path, operation: 'get' }));
        }
        return null;
    }
}

export const getPublicVentsByUserId = async (userId: string): Promise<Vent[]> => {
    const ventsCollectionRef = collection(db, 'publicVents');
    const q = query(ventsCollectionRef, where("userId", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        const vents: Vent[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vent));
        vents.sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
        return vents;
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ventsCollectionRef.path, operation: 'list' }));
        }
        return [];
    }
}

export const changeUsername = async (userId: string, oldUsername: string, newUsername: string) => {
    const lowerCaseNewUsername = newUsername.toLowerCase();
    const userDocRef = doc(db, 'users', userId);
    const oldUsernameDocRef = doc(db, 'usernames', oldUsername.toLowerCase());
    const newUsernameDocRef = doc(db, 'usernames', lowerCaseNewUsername);

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) throw new Error("User profile not found.");
        
        const userData = userDoc.data();
        if (userData.usernameLastChanged) {
            const lastChanged = (userData.usernameLastChanged as Timestamp).toDate();
            const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
            if (Date.now() - lastChanged.getTime() < thirtyDaysInMillis) {
                const daysRemaining = Math.ceil((thirtyDaysInMillis - (Date.now() - lastChanged.getTime())) / (1000 * 60 * 60 * 24));
                throw new Error(`You can change your username again in ${daysRemaining} day(s).`);
            }
        }

        const newUsernameDoc = await transaction.get(newUsernameDocRef);
        if (newUsernameDoc.exists()) throw new Error("This username is already taken.");

        transaction.delete(oldUsernameDocRef);
        transaction.set(newUsernameDocRef, { uid: userId });
        transaction.update(userDocRef, { username: newUsername, displayName: newUsername, usernameLastChanged: serverTimestamp() });
    });

    const authUser = auth.currentUser;
    if (authUser) await updateProfile(authUser, { displayName: newUsername });
};

export async function deleteUserAccount(user: UserProfile) {
    if (!user || !user.username) throw new Error("User profile is incomplete.");
    const batch = writeBatch(db);

    const privateVentsRef = collection(db, 'users', user.uid, 'vents');
    const privateVentsSnap = await getDocs(privateVentsRef);
    privateVentsSnap.forEach(doc => batch.delete(doc.ref));

    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const notificationsSnap = await getDocs(notificationsRef);
    notificationsSnap.forEach(doc => batch.delete(doc.ref));
    
    const publicVentsQuery = query(collection(db, 'publicVents'), where('userId', '==', user.uid));
    const publicVentsSnap = await getDocs(publicVentsQuery);
    for (const ventDoc of publicVentsSnap.docs) {
        const commentsSnap = await getDocs(collection(db, 'publicVents', ventDoc.id, 'comments'));
        commentsSnap.forEach(doc => batch.delete(doc.ref));
        const reportsSnap = await getDocs(collection(db, 'publicVents', ventDoc.id, 'reports'));
        reportsSnap.forEach(doc => batch.delete(doc.ref));
        batch.delete(ventDoc.ref);
    }
    
    batch.delete(doc(db, 'users', user.uid));
    batch.delete(doc(db, 'usernames', user.username.toLowerCase()));

    await batch.commit();

    const authUser = auth.currentUser;
    if (authUser && authUser.uid === user.uid) await deleteUser(authUser);
    else throw new Error("Mismatch between authenticated user and profile to be deleted.");
}

export async function adminDeletePublicVent(vent: Vent, actor: UserProfile, reason: string) {
    if (actor.role !== 'owner' && actor.role !== 'admin') throw new Error("You do not have permission to perform this action.");
    if (!vent.id || !vent.userId) throw new Error("Invalid vent data provided.");

    const batch = writeBatch(db);
    
    const privateVentRef = doc(db, 'users', vent.userId, 'vents', vent.id);
    const privateVentSnap = await getDoc(privateVentRef);
    if (privateVentSnap.exists()) batch.delete(privateVentRef);

    const publicVentRef = doc(db, 'publicVents', vent.id);
    batch.delete(publicVentRef);

    const commentsRef = collection(db, 'publicVents', vent.id, 'comments');
    const commentsSnap = await getDocs(commentsRef);
    commentsSnap.forEach(commentDoc => batch.delete(commentDoc.ref));
    
    const auditLogRef = doc(collection(db, 'auditLogs'));
    const auditLogData = {
        actorId: actor.uid, actorUsername: actor.username,
        action: 'ADMIN_DELETE_VENT' as const, targetId: vent.id,
        targetOwnerId: vent.userId, reason: reason, timestamp: serverTimestamp(),
    };
    batch.set(auditLogRef, auditLogData);

    await batch.commit();
}
