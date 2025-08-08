import { auth } from '@/firebase/config';
import {
  GoogleAuthProvider,
  UserCredential,
  getAdditionalUserInfo,
  signInWithPopup,
} from 'firebase/auth';
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
      // const isNewUser = additionalUserInfo?.isNewUser;
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
