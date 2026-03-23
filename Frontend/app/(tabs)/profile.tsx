import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenShell from '../../src/components/ui/ScreenShell';
import SectionCard from '../../src/components/ui/SectionCard';
import { useAppDispatch, useAppSelector } from '../../src/hooks/useRedux';
import { logout, setUser } from '../../src/redux/slices/authSlice';
import { apiClient } from '../../src/services/apiClient';

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  registrationNumber: string;
  seatingCapacity: number;
};

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [isSaving, setIsSaving] = useState(false);
  const [isVehicleSaving, setIsVehicleSaving] = useState(false);
  const [isVehicleModalVisible, setIsVehicleModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [editedUser, setEditedUser] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    registrationNumber: '',
    seatingCapacity: '4',
  });

  const loadProfile = useCallback(async () => {
    try {
      const profileRes = await apiClient.getProfile();
      const profileUser = profileRes.data?.data?.user;

      if (profileUser) {
        dispatch(setUser(profileUser));
        setEditedUser({
          firstName: profileUser.firstName || '',
          lastName: profileUser.lastName || '',
          phone: profileUser.phone || '',
        });
      }

      if (user?.userType === '1') {
        const vehiclesRes = await apiClient.getVehicles();
        const fetchedVehicles = vehiclesRes.data?.data?.vehicles || [];
        setVehicles(fetchedVehicles);
      }
    } catch (error: any) {
      Alert.alert('Profile error', error?.response?.data?.message || 'Failed to load profile details');
    }
  }, [dispatch, user?.userType]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const fullName = useMemo(() => `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), [user?.firstName, user?.lastName]);

  const onLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout() as any);
        },
      },
    ]);
  };

  const onSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await apiClient.updateProfile({
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        phone: editedUser.phone,
      });

      const updatedUser = res.data?.data?.user;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
      }

      setIsEditing(false);
      Alert.alert('Updated', 'Your profile has been updated.');
    } catch (error: any) {
      Alert.alert('Update failed', error?.response?.data?.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const onAddVehicle = async () => {
    if (!vehicleData.make || !vehicleData.model || !vehicleData.licensePlate || !vehicleData.color || !vehicleData.registrationNumber || !vehicleData.year) {
      Alert.alert('Validation', 'Please complete all required vehicle fields.');
      return;
    }

    try {
      setIsVehicleSaving(true);
      await apiClient.addVehicle({
        make: vehicleData.make,
        model: vehicleData.model,
        year: Number(vehicleData.year),
        licensePlate: vehicleData.licensePlate,
        color: vehicleData.color,
        registrationNumber: vehicleData.registrationNumber,
        seatingCapacity: Number(vehicleData.seatingCapacity || 4),
      });

      setIsVehicleModalVisible(false);
      setVehicleData({
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        color: '',
        registrationNumber: '',
        seatingCapacity: '4',
      });

      await loadProfile();
      Alert.alert('Added', 'Vehicle has been added successfully.');
    } catch (error: any) {
      Alert.alert('Vehicle error', error?.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setIsVehicleSaving(false);
    }
  };

  const onDeleteVehicle = async (vehicleId: string) => {
    try {
      await apiClient.deleteVehicle(vehicleId);
      setVehicles((prev) => prev.filter((item) => item.id !== vehicleId));
    } catch (error: any) {
      Alert.alert('Delete failed', error?.response?.data?.message || 'Could not delete vehicle');
    }
  };

  return (
    <ScreenShell scrollable>
      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          <Ionicons name="person-circle" size={76} color="#0f766e" />
        </View>
        <View style={styles.headerMeta}>
          <Text style={styles.name}>{fullName || 'Profile'}</Text>
          <Text style={styles.subMeta}>{user?.email}</Text>
          <Text style={styles.badge}>{user?.userType === '1' ? 'Driver account' : 'Rider account'}</Text>
        </View>
      </View>

      <SectionCard style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={20} color="#0f766e" />
            </TouchableOpacity>
          ) : null}
        </View>

        {isEditing ? (
          <>
            <TextInput style={styles.input} placeholder="First name" value={editedUser.firstName} onChangeText={(text) => setEditedUser((prev) => ({ ...prev, firstName: text }))} />
            <TextInput style={styles.input} placeholder="Last name" value={editedUser.lastName} onChangeText={(text) => setEditedUser((prev) => ({ ...prev, lastName: text }))} />
            <TextInput style={styles.input} placeholder="Phone" value={editedUser.phone} onChangeText={(text) => setEditedUser((prev) => ({ ...prev, phone: text }))} />

            <View style={styles.inlineButtons}>
              <TouchableOpacity style={[styles.outlineButton]} onPress={() => setIsEditing(false)}>
                <Text style={styles.outlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={onSaveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.infoRow}>Phone: {user?.phone || 'Not set'}</Text>
            <Text style={styles.infoRow}>Rating: {user?.rating || 5}</Text>
            <Text style={styles.infoRow}>Trips: {user?.totalRides || 0}</Text>
          </>
        )}
      </SectionCard>

      {user?.userType === '1' ? (
        <SectionCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicles</Text>
            <TouchableOpacity onPress={() => setIsVehicleModalVisible(true)}>
              <Ionicons name="add-circle" size={24} color="#0f766e" />
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 ? <Text style={styles.empty}>No vehicles added yet.</Text> : null}

          {vehicles.map((vehicle) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View>
                <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model} ({vehicle.year})</Text>
                <Text style={styles.vehicleMeta}>{vehicle.licensePlate} • {vehicle.color}</Text>
                <Text style={styles.vehicleMeta}>Seats: {vehicle.seatingCapacity}</Text>
              </View>
              <TouchableOpacity onPress={() => onDeleteVehicle(vehicle.id)}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>
          ))}
        </SectionCard>
      ) : null}

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout} disabled={isLoading}>
        <Ionicons name="log-out-outline" size={18} color="#ffffff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={isVehicleModalVisible} transparent animationType="slide" onRequestClose={() => setIsVehicleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add vehicle</Text>
              <TouchableOpacity onPress={() => setIsVehicleModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Make" value={vehicleData.make} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, make: text }))} />
            <TextInput style={styles.input} placeholder="Model" value={vehicleData.model} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, model: text }))} />
            <TextInput style={styles.input} placeholder="Year" keyboardType="number-pad" value={vehicleData.year} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, year: text }))} />
            <TextInput style={styles.input} placeholder="License plate" value={vehicleData.licensePlate} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, licensePlate: text }))} />
            <TextInput style={styles.input} placeholder="Color" value={vehicleData.color} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, color: text }))} />
            <TextInput style={styles.input} placeholder="Registration number" value={vehicleData.registrationNumber} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, registrationNumber: text }))} />
            <TextInput style={styles.input} placeholder="Seating capacity" keyboardType="number-pad" value={vehicleData.seatingCapacity} onChangeText={(text) => setVehicleData((prev) => ({ ...prev, seatingCapacity: text }))} />

            <TouchableOpacity style={styles.primaryButton} onPress={onAddVehicle} disabled={isVehicleSaving}>
              {isVehicleSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>Save vehicle</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    borderRadius: 20,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#99f6e4',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subMeta: {
    marginTop: 2,
    color: '#334155',
    fontSize: 13,
  },
  badge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: '#0f766e',
    backgroundColor: '#ccfbf1',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
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
    fontSize: 15,
  },
  infoRow: {
    color: '#374151',
    marginTop: 2,
    fontSize: 14,
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
  },
  outlineText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  vehicleCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  vehicleMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  empty: {
    color: '#6b7280',
  },
  logoutButton: {
    borderRadius: 14,
    backgroundColor: '#dc2626',
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
});
