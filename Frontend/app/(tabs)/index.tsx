import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import HomeMap from '../../src/components/HomeMap';
import SectionCard from '../../src/components/ui/SectionCard';
import ScreenShell from '../../src/components/ui/ScreenShell';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { createRide, fetchRides } from '../../src/redux/slices/ridesSlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { rides, isLoading } = useAppSelector((state) => state.rides);

  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isCreateRideModal, setIsCreateRideModal] = useState(false);
  const [createRideData, setCreateRideData] = useState({
    pickup: '',
    dropoff: '',
    departureDate: '',
    departureTime: '',
    fare: '',
    availableSeats: '4',
    vehicleInfo: '',
    notes: '',
  });

  useEffect(() => {
    dispatch(fetchRides({ page: 1, limit: 10, status: 'available' }) as any);
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  const upcomingRideCount = useMemo(() => rides.filter((ride) => ride.status === 'available').length, [rides]);

  const handleCreateRide = async () => {
    const fare = Number(createRideData.fare);
    const seats = Number(createRideData.availableSeats);

    if (!createRideData.pickup || !createRideData.dropoff || !createRideData.departureDate || !createRideData.departureTime || !createRideData.vehicleInfo) {
      Alert.alert('Validation', 'Please complete all required fields.');
      return;
    }

    if (!Number.isFinite(fare) || fare <= 0 || !Number.isFinite(seats) || seats < 1) {
      Alert.alert('Validation', 'Fare and seats must be valid positive numbers.');
      return;
    }

    const currentLat = location?.latitude || 0;
    const currentLng = location?.longitude || 0;

    const result = await dispatch(
      createRide({
        pickup: createRideData.pickup,
        pickupLat: currentLat,
        pickupLng: currentLng,
        dropoff: createRideData.dropoff,
        dropoffLat: currentLat,
        dropoffLng: currentLng,
        departureDate: createRideData.departureDate,
        departureTime: createRideData.departureTime,
        fare,
        availableSeats: seats,
        vehicleInfo: createRideData.vehicleInfo,
        notes: createRideData.notes,
      }) as any
    );

    if (createRide.fulfilled.match(result)) {
      setIsCreateRideModal(false);
      setCreateRideData({
        pickup: '',
        dropoff: '',
        departureDate: '',
        departureTime: '',
        fare: '',
        availableSeats: '4',
        vehicleInfo: '',
        notes: '',
      });
      Alert.alert('Ride created', 'Your trip is now visible to riders.');
      dispatch(fetchRides({ page: 1, limit: 10, status: 'available' }) as any);
      return;
    }

    Alert.alert('Create failed', (result as any)?.payload || 'Unable to create ride right now.');
  };

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Plan, share, and ride together</Text>
        <Text style={styles.heroSub}>Live routes and dependable co-travelers inspired by intercity carpooling apps.</Text>
      </View>

      <View style={styles.mapWrap}>
        <HomeMap
          location={
            location
              ? {
                  latitude: location.latitude,
                  longitude: location.longitude,
                }
              : null
          }
        />
      </View>

      {user?.userType === '1' ? (
        <SectionCard style={styles.actionCard}>
          <View style={styles.driverHeader}>
            <Text style={styles.sectionTitle}>Driver cockpit</Text>
            <Text style={styles.liveCount}>{upcomingRideCount} active rides</Text>
          </View>
          <Text style={styles.sectionSub}>Publish your next route and manage seats in minutes.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setIsCreateRideModal(true)}>
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Create ride</Text>
          </TouchableOpacity>
        </SectionCard>
      ) : (
        <SectionCard style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Rider quick tips</Text>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#0f766e" />
            <Text style={styles.tipText}>Use the Booking tab to filter routes and reserve seats.</Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color="#0f766e" />
            <Text style={styles.tipText}>Review driver rating and seats left before confirming.</Text>
          </View>
        </SectionCard>
      )}

      <Modal visible={isCreateRideModal} transparent animationType="slide" onRequestClose={() => setIsCreateRideModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a new ride</Text>
              <TouchableOpacity onPress={() => setIsCreateRideModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Pickup location" value={createRideData.pickup} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, pickup: text }))} />
            <TextInput style={styles.input} placeholder="Dropoff location" value={createRideData.dropoff} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, dropoff: text }))} />
            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={createRideData.departureDate} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, departureDate: text }))} />
            <TextInput style={styles.input} placeholder="Time (HH:MM)" value={createRideData.departureTime} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, departureTime: text }))} />
            <View style={styles.inlineInputs}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Fare" keyboardType="decimal-pad" value={createRideData.fare} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, fare: text }))} />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Seats" keyboardType="number-pad" value={createRideData.availableSeats} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, availableSeats: text }))} />
            </View>
            <TextInput style={styles.input} placeholder="Vehicle info (e.g. Hyundai i20 - DL 01 AB 1111)" value={createRideData.vehicleInfo} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, vehicleInfo: text }))} />
            <TextInput style={[styles.input, styles.notesInput]} multiline placeholder="Notes (optional)" value={createRideData.notes} onChangeText={(text) => setCreateRideData((prev) => ({ ...prev, notes: text }))} />

            <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRide} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Publish ride</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 20,
    backgroundColor: '#0f766e',
    padding: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroSub: {
    marginTop: 4,
    color: '#d1faf5',
    lineHeight: 20,
  },
  mapWrap: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
  },
  actionCard: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSub: {
    marginTop: 6,
    color: '#4b5563',
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveCount: {
    color: '#0f766e',
    fontWeight: '700',
    fontSize: 12,
  },
  tipRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    color: '#374151',
    fontSize: 13,
    flex: 1,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  notesInput: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
});
