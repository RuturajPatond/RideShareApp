import React, { useMemo, useState } from 'react';
import { Link, router } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { clearError, signup } from '../../src/redux/slices/authSlice';

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'1' | '2'>('2');
  const [hidePassword, setHidePassword] = useState(true);

  const isFormValid = useMemo(
    () =>
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password.trim().length >= 8 &&
      confirmPassword.trim() &&
      password === confirmPassword,
    [confirmPassword, email, firstName, lastName, password]
  );

  const onSignup = async () => {
    if (!isFormValid) return;

    dispatch(clearError());
    const result = await dispatch(
      signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        userType,
      })
    );

    if (signup.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <Text style={styles.brand}>RideLink</Text>
            <Text style={styles.heading}>Create your account</Text>
            <Text style={styles.subHeading}>Driver or rider, you are one tap away from your first trip.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>First name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />

            <Text style={styles.label}>Last name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Phone (optional)</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />

            <Text style={styles.label}>I want to join as</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[styles.roleCard, userType === '2' && styles.roleCardActive]}
                onPress={() => setUserType('2')}
              >
                <Ionicons name="person" size={16} color={userType === '2' ? '#ffffff' : '#0f766e'} />
                <Text style={[styles.roleText, userType === '2' && styles.roleTextActive]}>Rider</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleCard, userType === '1' && styles.roleCardActive]}
                onPress={() => setUserType('1')}
              >
                <Ionicons name="car" size={16} color={userType === '1' ? '#ffffff' : '#0f766e'} />
                <Text style={[styles.roleText, userType === '1' && styles.roleTextActive]}>Driver</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                secureTextEntry={hidePassword}
              />
              <TouchableOpacity onPress={() => setHidePassword((prev) => !prev)}>
                <Ionicons name={hidePassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry={hidePassword}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity style={[styles.cta, !isFormValid && styles.ctaDisabled]} onPress={onSignup} disabled={!isFormValid || isLoading}>
              {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.ctaText}>Create account</Text>}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Already have an account? <Link href="/(auth)/login" style={styles.link}>Sign in</Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef8f5',
  },
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 18,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0f766e',
  },
  brand: {
    color: '#7ef0dd',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heading: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  subHeading: {
    marginTop: 6,
    color: '#d1faf5',
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  passwordWrap: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 11,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  roleCardActive: {
    backgroundColor: '#0f766e',
  },
  roleText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#ffffff',
  },
  cta: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#0f766e',
    paddingVertical: 13,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  footerText: {
    marginTop: 14,
    textAlign: 'center',
    color: '#4b5563',
  },
  link: {
    color: '#0f766e',
    fontWeight: '700',
  },
  error: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 13,
  },
});

