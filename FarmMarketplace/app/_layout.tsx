// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { User } from '@supabase/supabase-js';
import { ActivityIndicator, View, Text } from 'react-native';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError('Auth error: ' + error.message);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize auth');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 10 }}>Error: {error}</Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          Please restart the app or check your connection.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="green" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>Loading AgriLink...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: 'Listing Details' }} />
          <Stack.Screen name="shop/[userId]" options={{ headerShown: true, title: 'Seller Shop' }} />
          <Stack.Screen name="edit-listing/[id]" options={{ headerShown: true, title: 'Edit Listing' }} />
        </>
      )}
    </Stack>
  );
}