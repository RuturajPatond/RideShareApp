import React, { useMemo, useState } from 'react';
import { Link, router } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { clearError, login } from '../../src/redux/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);

  const isFormValid = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password]);

  const onLogin = async () => {
    if (!isFormValid) return;

    dispatch(clearError());
    const result = await dispatch(login({ email: email.trim(), password }));

    if (login.fulfilled.match(result)) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.heroCard}>
            <Text style={styles.brand}>RideLink</Text>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subHeading}>Book smarter rides with trusted co-travelers.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                value={password}
                secureTextEntry={isPasswordHidden}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setIsPasswordHidden((prev) => !prev)}>
                <Ionicons name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'} size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <TouchableOpacity
              style={[styles.cta, !isFormValid && styles.ctaDisabled]}
              onPress={onLogin}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.ctaText}>Sign in</Text>}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              New here? <Link href="/(auth)/signup" style={styles.link}>Create account</Link>
            </Text>
          </View>
        </View>
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
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 28,
    justifyContent: 'center',
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
    fontSize: 30,
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

