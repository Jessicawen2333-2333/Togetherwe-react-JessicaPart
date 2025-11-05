import { login, signInWithGoogle } from '@/auth';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleSignIn = async () => {
    try {
      setHasError(false); // Clear any previous error
      await login(username, password);
      // The navigation is now handled by the root layout effect.
    } catch (error) {
      setHasError(true);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      try {
        setIsGoogleLoading(true);
        setHasError(false);
        await signInWithGoogle();
        // The navigation is now handled by the root layout effect.
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        setHasError(true);
        Alert.alert(
          'Sign In Error',
          error?.message || 'Failed to sign in with Google. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsGoogleLoading(false);
      }
    } else {
      // Placeholder for other social login providers
      console.log(`${provider} login clicked`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/together-we-login-logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Login Form Section */}
      <View style={styles.formContainer}>
        <Text style={styles.loginTitle}>Login</Text>
        {hasError ? (
          <Text style={styles.errorText}>Invalid username and / or password{'\n'}Please try again</Text>
        ) : (
          <Text style={styles.loginSubtitle}>Enter your username and password to login</Text>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.forgotLink} onPress={() => router.push('/forgot-username')}>
            <Text style={styles.forgotText}>Forgot Username?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Social Login Section */}
      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>Or login in with</Text>
        
        <View style={styles.socialButtonsRow}>
          <TouchableOpacity 
            style={[styles.socialButton, isGoogleLoading && styles.socialButtonDisabled]} 
            onPress={() => handleSocialLogin('Google')}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#000" />
                <Text style={styles.socialButtonText}>Google</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, styles.socialButtonDark]} 
            onPress={() => handleSocialLogin('Facebook')}
          >
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={[styles.socialButtonText, styles.socialButtonTextLight]}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialButtonsRow}>
          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={() => handleSocialLogin('Apple')}
          >
            <Ionicons name="logo-apple" size={20} color="#000" />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.socialButton, styles.socialButtonDark]} 
            onPress={() => handleSocialLogin('WeChat')}
          >
            <Ionicons name="chatbubbles" size={20} color="#00C851" />
            <Text style={[styles.socialButtonText, styles.socialButtonTextLight]}>WeChat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <Text style={styles.bottomText}>
          Don't have an account?{' '}
          <Text style={styles.linkText} onPress={() => router.push('/sign-up')}>
            Register
          </Text>
        </Text>
      </View>

      {/* Help Center Link - Fixed at bottom */}
      <View style={styles.helpContainer}>
        <Text style={styles.bottomText}>
          Need help? Visit our <Text style={styles.linkText}>help center</Text>
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImage: {
    width: 280,
    height: 160,
  },

  // Form Section
  formContainer: {
    marginBottom: 10,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotText: {
    fontSize: 14,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Social Login Section
  socialContainer: {
    marginBottom: 10,
  },
  socialTitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 15,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    marginHorizontal: 6,
  },
  socialButtonDark: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
  },
  socialButtonTextLight: {
    color: '#fff',
  },

  // Register Link
  registerContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  // Help Center Link - Fixed at bottom
  helpContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  bottomText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  linkText: {
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 25,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
});