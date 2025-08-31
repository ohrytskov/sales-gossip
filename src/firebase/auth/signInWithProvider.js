import { auth } from '@/firebase/config';
import {
  GoogleAuthProvider,
  UserCredential,
  getAdditionalUserInfo,
  signInWithPopup,
} from 'firebase/auth';
import { rtdb } from '@/firebase/config';
import { ref, set, get } from 'firebase/database';
import { createUserRecord } from '@/firebase/rtdb/users'
import { checkUsernameUnique, setUsernameMapping } from '@/firebase/rtdb/usernames'
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
          // derive username from email localpart and sanitize; attempt to ensure uniqueness
          const rawUsername = (email || '').split('@')[0] || uid;
          let username = rawUsername
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .slice(0, 60) || uid;
          // ensure uniqueness (best-effort client-side)
          let unique = await checkUsernameUnique(username)
          let suffix = 1
          while (unique === false && suffix <= 1000) {
            const candidate = `${username}_${suffix}`.slice(0, 60)
            unique = await checkUsernameUnique(candidate)
            if (unique) username = candidate
            suffix += 1
          }

          const userRecord = {
            public: {
              displayName,
              username: (email || '').split('@')[0] || uid,
              nickname: username,
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
          await createUserRecord(uid, userRecord)
          // write username index (best-effort)
          try {
            await setUsernameMapping(username, uid)
          } catch (e) {
            console.error('Failed to write username mapping:', e.message || e)
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
