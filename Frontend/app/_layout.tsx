import { Provider, useDispatch } from 'react-redux';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import appStore from '../src/redux/store';
import { restoreToken } from '../src/redux/slices/authSlice';

function RootLayoutNav() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      dispatch(restoreToken() as any);
    };

    initializeAuth();
  }, [dispatch]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={appStore}>
      <RootLayoutNav />
    </Provider>
  );
}

