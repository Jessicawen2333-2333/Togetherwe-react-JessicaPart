import { auth, db } from '@/firebase';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';


// Complete the auth session - needed for both web and mobile when using OAuth
// This must be called before any auth session operations
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

export const signUp = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email.toLowerCase(),
        profile_setup: false,
    });
    return userCredential;
};

export const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Using merge: true to avoid overwriting existing user data.
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email.toLowerCase(),
    }, { merge: true });
    return userCredential;
};

export const logout = () => {
    return signOut(auth);
};

export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export const signInWithGoogle = async () => {
  try {
    // Google Client ID - configured in Google Cloud Console
    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '765241841476-r6iavv2ksrrjleuv9i44coo27t142gkr.apps.googleusercontent.com';
    
    if (!googleClientId) {
      throw new Error('Google Client ID is not configured');
    }

    if (Platform.OS === 'web') {
      // Web implementation: Use Firebase's signInWithPopup
      const { signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Create or update user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email?.toLowerCase() || '',
        profile_setup: false,
      }, { merge: true });

      return userCredential;
    } else {
      // Mobile implementation: Use expo-auth-session with authorization code flow
      // MUST use Expo proxy URI because Google Cloud Console requires HTTPS for web server clients
      // Custom schemes like exp:// or togetherwereactn:// cannot be added to Google Cloud Console
      const finalRedirectUri = 'https://auth.expo.io/@jessica_puffy/togetherwe-reactn';

      console.log('Using Expo proxy redirect URI:', finalRedirectUri);
      console.log('⚠️ IMPORTANT: This URI must be added to Google Cloud Console');
      console.log('✅ URI should already be in Google Cloud Console: https://auth.expo.io/@jessica_puffy/togetherwe-reactn');

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      // Create request with authorization code flow
      const request = new AuthSession.AuthRequest({
        clientId: googleClientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: finalRedirectUri,
      });

      console.log('Starting OAuth flow...');
      console.log('Request configuration:', {
        clientId: googleClientId,
        redirectUri: finalRedirectUri,
        scopes: ['openid', 'profile', 'email'],
      });
      
      // Use promptAsync - Expo proxy is automatically used when redirectUri is https://auth.expo.io/...
      // When user clicks Continue, Google redirects to auth.expo.io, which then redirects back to app
      const result = await request.promptAsync(discovery);
      
      // After promptAsync returns, complete the auth session if needed
      // This helps ensure any pending auth sessions are properly closed
      WebBrowser.maybeCompleteAuthSession();
      
      console.log('OAuth result type:', result.type);
      console.log('OAuth result:', JSON.stringify(result, null, 2));
      
      // If result type is cancel but user clicked Continue, it might be a timing issue
      // Check if we can get more info about what happened
      if (result.type === 'cancel') {
        console.warn('OAuth was cancelled - this might happen if:');
        console.warn('1. User actually cancelled');
        console.warn('2. Browser closed before redirect completed');
        console.warn('3. Deep link not properly configured');
        console.warn('4. App scheme mismatch');
      }
      
      if (result.type === 'success') {
        // Check if params exist and contain code
        if (!result.params || !result.params.code) {
          console.error('Success result but no code in params:', result.params);
          throw new Error('Authorization successful but no code received');
        }
        const { code } = result.params;
        console.log('Received authorization code, exchanging for tokens...');

        // Exchange authorization code for ID token
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: googleClientId,
            code: code,
            redirectUri: finalRedirectUri,
            extraParams: {},
          },
          discovery
        );

        console.log('Token exchange successful');
        const { idToken } = tokenResponse;
        
        if (!idToken) {
          console.error('Token response:', tokenResponse);
          throw new Error('No ID token received from Google');
        }

        // Create Firebase credential with Google ID token
        const credential = GoogleAuthProvider.credential(idToken);
        
        // Sign in with Firebase credential
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // Create or update user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email?.toLowerCase() || '',
          profile_setup: false,
        }, { merge: true });

        console.log('Google sign-in completed successfully');
        return userCredential;
      } else if (result.type === 'cancel') {
        console.log('User cancelled Google sign-in');
        throw new Error('Google sign-in was cancelled');
      } else if (result.type === 'dismiss') {
        console.log('OAuth prompt was dismissed');
        throw new Error('Google sign-in was dismissed');
      } else if (result.type === 'error') {
        console.error('OAuth error:', result.error);
        const errorMessage = result.error?.message || result.error?.code || 'Unknown error';
        throw new Error(`Google sign-in error: ${errorMessage}`);
      } else if (result.type === 'locked') {
        console.error('OAuth prompt is locked (another request in progress)');
        throw new Error('Another sign-in request is already in progress');
      } else {
        console.error('Unexpected OAuth result:', JSON.stringify(result, null, 2));
        throw new Error(`Unexpected OAuth result type: ${result.type}`);
      }
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};
