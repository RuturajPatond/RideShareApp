import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenShell from '../../src/components/ui/ScreenShell';
import SectionCard from '../../src/components/ui/SectionCard';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { bookRide, fetchRides, IRide } from '../../src/redux/slices/ridesSlice';

export default function BookingScreen() {
  const dispatch = useAppDispatch();
  const { rides, isLoading, error } = useAppSelector((state) => state.rides);
  const { user } = useAppSelector((state) => state.auth);

  const [query, setQuery] = useState('');
  const [seatsToBook, setSeatsToBook] = useState('1');
  const [selectedRide, setSelectedRide] = useState<IRide | null>(null);

  const loadRides = useCallback(
    () => dispatch(fetchRides({ page: 1, limit: 30, status: 'available' }) as any),
    [dispatch]
  );

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  const filteredRides = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rides;

    return rides.filter(
      (ride) =>
        ride.pickup.toLowerCase().includes(term) ||
        ride.dropoff.toLowerCase().includes(term) ||
        `${ride.driver?.firstName || ''} ${ride.driver?.lastName || ''}`.toLowerCase().includes(term)
    );
  }, [query, rides]);

  const onConfirmBooking = async () => {
    if (!selectedRide) return;

    const parsedSeats = Number(seatsToBook);
    if (!Number.isFinite(parsedSeats) || parsedSeats < 1) return;

    await dispatch(bookRide({ rideId: selectedRide.id, seatsToBook: parsedSeats }) as any);
    setSelectedRide(null);
    setSeatsToBook('1');
    loadRides();
  };

  const renderRideItem = ({ item }: { item: IRide }) => {
    const seatsLeft = item.availableSeats - item.bookedSeats;

    return (
      <SectionCard style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View>
            <Text style={styles.driverName}>{item.driver?.firstName} {item.driver?.lastName}</Text>
            <Text style={styles.driverRating}>Rating: {item.driver?.rating || 5}</Text>
          </View>
          <Text style={styles.price}>${item.fare}</Text>
        </View>

        <View style={styles.routeRow}>
          <Ionicons name="navigate-circle" size={18} color="#0f766e" />
          <Text style={styles.routeText}>{item.pickup}</Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="flag" size={16} color="#e11d48" />
          <Text style={styles.routeText}>{item.dropoff}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.departureDate} • {String(item.departureTime).slice(0, 5)}</Text>
          <Text style={styles.metaText}>{seatsLeft} seats left</Text>
        </View>

        {user?.userType === '2' ? (
          <TouchableOpacity style={styles.bookBtn} onPress={() => setSelectedRide(item)}>
            <Text style={styles.bookBtnText}>Book this ride</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.driverTag}>
            <Text style={styles.driverTagText}>Driver mode: booking disabled</Text>
          </View>
        )}
      </SectionCard>
    );
  };

  return (
    <ScreenShell>
      <View style={styles.hero}>
        <Text style={styles.heading}>Find your next ride</Text>
        <Text style={styles.subHeading}>Reliable routes, transparent fares, and secure bookings.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          placeholder="Search by route or driver"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && rides.length === 0 ? <ActivityIndicator size="large" color="#0f766e" style={styles.loading} /> : null}

      <FlatList
        data={filteredRides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRides} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>No rides found for your search.</Text> : null}
      />

      <Modal visible={!!selectedRide} transparent animationType="slide" onRequestClose={() => setSelectedRide(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm booking</Text>
              <TouchableOpacity onPress={() => setSelectedRide(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>How many seats do you want to reserve?</Text>
            <TextInput
              style={styles.seatInput}
              value={seatsToBook}
              onChangeText={setSeatsToBook}
              keyboardType="number-pad"
              placeholder="Seats"
            />

            <TouchableOpacity style={styles.bookBtn} onPress={onConfirmBooking} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.bookBtnText}>Confirm booking</Text>}
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
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subHeading: {
    marginTop: 5,
    color: '#d1faf5',
  },
  searchWrap: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  rideCard: {
    marginBottom: 10,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  driverRating: {
    color: '#6b7280',
    marginTop: 2,
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f766e',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  routeText: {
    color: '#1f2937',
    fontSize: 13,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookBtn: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  bookBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  driverTag: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#99f6e4',
    alignItems: 'center',
    paddingVertical: 10,
  },
  driverTagText: {
    color: '#0f766e',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSub: {
    color: '#4b5563',
    marginBottom: 8,
  },
  seatInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loading: {
    marginTop: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 30,
  },
  error: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 13,
  },
});
