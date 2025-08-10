import { auth } from '@/firebase/config';
import {
  GoogleAuthProvider,
  UserCredential,
  getAdditionalUserInfo,
  signInWithPopup,
} from 'firebase/auth';
import { rtdb } from '@/firebase/config';
import { ref, set, get } from 'firebase/database';
//import { serverTimestamp } from 'firebase/firestore';

const signInWithProvider = async (provider) => {
  let result = null;
  /*provider.setCustomParameters({
    prompt: 'select_account',
  });*/

  try {
    result = await signInWithPopup(auth, provider);
    console.log({ result });
  } catch (e) {
    console.error('Authentication error:', e.message);
    throw e;
  }

  if (result) {
    try {
      const user = result.user;
      //const currentUserId = user.uid;
      const additionalUserInfo = getAdditionalUserInfo(result);
      // Check if user is signing in for the first time
      const isNewUser = additionalUserInfo?.isNewUser;
      if (isNewUser && user) {
        try {
          const uid = user.uid;
          const displayName = user.displayName || '';
          const email = user.email || '';
          const avatarUrl = user.photoURL || '';
          const providerId = additionalUserInfo?.providerId || (user.providerData && user.providerData[0]?.providerId) || '';
          const mapProvider = (pid) => {
            if (!pid) return 'oauth';
            if (pid === 'google.com') return 'Google';
            if (pid === 'github.com') return 'GitHub';
            if (pid === 'facebook.com') return 'Facebook';
            if (pid === 'password') return 'password';
            return pid;
          };
          // derive username from email localpart and sanitize
          const rawUsername = (email || '').split('@')[0] || uid;
          const sanitize = (s) => (s || '').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 60);
          let username = sanitize(rawUsername) || uid;
          // ensure uniqueness by checking /usersByUsername
          const usersByUsernameRef = (name) => ref(rtdb, `usersByUsername/${name}`);
          let exists = false;
          try {
            const snap = await get(usersByUsernameRef(username));
            exists = snap.exists();
          } catch (_) { exists = false }
          let suffix = 1;
          while (exists) {
            const candidate = `${username}_${suffix}`.slice(0, 60);
            try {
              const snap = await get(usersByUsernameRef(candidate));
              if (!snap.exists()) { username = candidate; exists = false; break; }
            } catch (_) { /* ignore */ }
            suffix += 1;
            if (suffix > 1000) break;
          }

          const userRecord = {
            public: {
              displayName,
              username: displayName || email.split('@')[0] || uid,
              avatarUrl,
            },
            private: {
              email,
              emailVerified: user.emailVerified || false,
            },
            meta: {
              createdAt: Date.now(),
              lastLoginAt: Date.now(),
              provider: mapProvider(providerId),
              role: 'user',
            },
          };
          await set(ref(rtdb, `users/${uid}`), userRecord);
          // write username index
          try {
            await set(ref(rtdb, `usersByUsername/${username}`), uid);
          } catch (e) {
            console.error('Failed to write username mapping:', e.message || e);
          }
        } catch (e) {
          console.error('Failed to write new user record to RTDB:', e.message || e);
        }
      }
    } catch (e) {
      console.error('Error processing user details:', e.message);
      throw e;
    }
  }

  return result;
};

export const signInWithGoogle = async () => {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
  // Ensure profile/email scopes are requested (usually defaults, but explicit for robustness)
  try {
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
  } catch (_) {}

  return await signInWithProvider(googleProvider);
};

export default signInWithProvider
