import { signUp } from '@/auth';
import CountryCodePicker from '@/components/CountryCodePicker';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FirebaseError } from "firebase/app";
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [hasInvalidEmailError, setInvalidEmailError] = useState(false);
  const [hasDuplicateEmail, setDuplicateEmailError] = useState(false);
  const [hasNameError, setNameError] = useState(false);
  const [hasMobileError, setMobileError] = useState(false);
  const [hasWeakPassword, setWeakPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleSignUp = async () => {
    try {
      // Clear all errors
      setInvalidEmailError(false);
      setDuplicateEmailError(false);
      setNameError(false);
      setMobileError(false);
      setWeakPasswordError(false);
      
      // Validate required fields
      if (!name.trim()) {
        setNameError(true);
        return;
      }
      if (!mobileNumber.trim()) {
        setMobileError(true);
        return;
      }
      if (!agreeToTerms) {
        Alert.alert('Error', 'Please agree to the terms and conditions');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      await signUp(email, password);
      // Navigation will be handled by the root layout effect.
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-email':
            setInvalidEmailError(true);
            break;
          case 'auth/email-already-in-use':
            setDuplicateEmailError(true);
            break;
          case 'auth/weak-password':
            setWeakPasswordError(true);
            break;
          default:
            Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', 'Something went wrong.');
      }
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

      {/* Register Form Section */}
      <View style={styles.formContainer}>
        <Text style={styles.registerTitle}>Register</Text>
        <Text style={styles.registerSubtitle}>Enter your details to register</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, hasNameError && styles.inputError]}
            placeholder="Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError(false); // Clear error when user types
            }}
            autoCapitalize="words"
          />
          {hasNameError && (
            <Text style={styles.errorText}>Please enter your name</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, (hasInvalidEmailError || hasDuplicateEmail) && styles.inputError]}
            placeholder="Email Address"
            placeholderTextColor="#999"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setInvalidEmailError(false); // Clear error when user types
              setDuplicateEmailError(false); // Clear error when user types
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {hasInvalidEmailError && (
            <Text style={styles.errorText}>Invalid email address</Text>
          )}
          {hasDuplicateEmail && (
            <Text style={styles.errorText}>Email address already taken</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <CountryCodePicker
            value={mobileNumber}
            onChangeText={(text) => {
              setMobileNumber(text);
              setMobileError(false); // Clear error when user types
            }}
            placeholder="Mobile Number"
            style={hasMobileError && styles.inputError}
          />
          {hasMobileError && (
            <Text style={styles.errorText}>Please enter your mobile number</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.passwordInputContainer, hasWeakPassword && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setWeakPasswordError(false); // Clear error when user types
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#000" 
              />
            </TouchableOpacity>
          </View>
          {hasWeakPassword && (
            <Text style={styles.errorText}>
              Must be 8 or more characters and contain at least 1 number or special character
            </Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkbox} 
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            {agreeToTerms && <Ionicons name="checkmark" size={16} color="#000" />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>I agree with the terms and conditions</Text>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSignUp}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
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
    marginBottom: 15,
  },
  logoImage: {
    width: 280,
    height: 160,
  },

  // Form Section
  formContainer: {
    marginBottom: 20,
  },
  registerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  registerSubtitle: {
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#000',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 5,
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
});
