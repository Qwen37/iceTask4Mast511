import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Car, Booking } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RentCarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RentCar'>;

type Props = {
  navigation: RentCarScreenNavigationProp;
};

const { width, height } = Dimensions.get('window');

const RentCarScreen: React.FC<Props> = ({ navigation }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-width));

  useEffect(() => {
    loadCars();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadCars = async () => {
    try {
      const storedCars = await AsyncStorage.getItem('cars');
      if (storedCars) {
        setCars(JSON.parse(storedCars));
      }
    } catch (error) {
      console.error('Error loading cars:', error);
    }
  };

  const filteredCars = cars.filter(
    (car) =>
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCarSelect = (car: Car) => {
    setSelectedCar(car);
    setModalVisible(true);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedCar(null);
      setNumberOfDays('');
    });
  };

  const handleConfirmBooking = () => {
    if (!selectedCar) return;

    const days = parseInt(numberOfDays);
    if (isNaN(days) || days <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }

    const totalCost = selectedCar.costPerDay * days;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const booking: Booking = {
      id: Date.now().toString(),
      car: selectedCar,
      numberOfDays: days,
      totalCost,
      startDate,
      endDate,
    };

    handleCloseModal();
    navigation.navigate('Confirmation', { booking });
  };

  const renderCarItem = ({ item }: { item: Car }) => (
    <TouchableOpacity
      style={styles.carCard}
      onPress={() => handleCarSelect(item)}
      activeOpacity={0.8}
    >
      <View style={styles.carInfo}>
        <Text style={styles.carTitle}>{item.make} {item.model}</Text>
        <Text style={styles.carPrice}>R{item.costPerDay}/day</Text>
      </View>
      <View style={styles.carActions}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => handleCarSelect(item)}
        >
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Rent a Car</Text>
        <Text style={styles.subtitle}>Choose from available vehicles</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by make or model..."
          placeholderTextColor="#95a5a6"
        />
      </View>

      {filteredCars.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No cars available</Text>
          <Text style={styles.emptySubtitle}>
            {cars.length === 0 
              ? 'No cars have been added yet. Contact an admin to add cars.' 
              : 'No cars match your search criteria.'}
          </Text>
          <TouchableOpacity
            style={styles.addCarButton}
            onPress={() => navigation.navigate('AddCar')}
          >
            <Text style={styles.addCarButtonText}>Add Car (Admin)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          renderItem={renderCarItem}
          keyExtractor={(item) => item.id}
          style={styles.carList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Login</Text>
      </TouchableOpacity>

      {/* Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {selectedCar && (
              <>
                <Text style={styles.modalTitle}>Book {selectedCar.make} {selectedCar.model}</Text>
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>
                    Cost per day: <Text style={styles.highlight}>R{selectedCar.costPerDay}</Text>
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Number of days:</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={numberOfDays}
                    onChangeText={setNumberOfDays}
                    placeholder="Enter number of days"
                    keyboardType="numeric"
                    placeholderTextColor="#95a5a6"
                  />
                </View>

                {numberOfDays && !isNaN(parseInt(numberOfDays)) && parseInt(numberOfDays) > 0 && (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      Total Cost: <Text style={styles.totalAmount}>
                        R{selectedCar.costPerDay * parseInt(numberOfDays)}
                      </Text>
                    </Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmBooking}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  carList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  carCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  carInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  carPrice: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  carActions: {
    marginLeft: 15,
  },
  selectButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  addCarButton: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  addCarButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#95a5a6',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#95a5a6',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  modalInfoText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  totalContainer: {
    backgroundColor: '#e8f6f3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  totalText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#27ae60',
    fontSize: 20,
  },
  modalButtons: {
    gap: 15,
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RentCarScreen;