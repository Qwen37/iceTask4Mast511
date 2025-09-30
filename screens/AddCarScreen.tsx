import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Car } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AddCarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCar'>;

type Props = {
  navigation: AddCarScreenNavigationProp;
};

const { width } = Dimensions.get('window');

const AddCarScreen: React.FC<Props> = ({ navigation }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [costPerDay, setCostPerDay] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const saveCar = async (car: Car) => {
    try {
      const existingCars = await AsyncStorage.getItem('cars');
      const cars: Car[] = existingCars ? JSON.parse(existingCars) : [];
      cars.push(car);
      await AsyncStorage.setItem('cars', JSON.stringify(cars));
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };

  const handleAddCar = async () => {
    if (!make.trim() || !model.trim() || !costPerDay.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const cost = parseFloat(costPerDay);
    if (isNaN(cost) || cost <= 0) {
      Alert.alert('Error', 'Please enter a valid cost per day');
      return;
    }

    const newCar: Car = {
      id: generateId(),
      make: make.trim(),
      model: model.trim(),
      costPerDay: cost,
    };

    await saveCar(newCar);

    Alert.alert(
      'Success',
      `${make} ${model} has been added successfully!`,
      [
        {
          text: 'Add Another Car',
          onPress: () => {
            setMake('');
            setModel('');
            setCostPerDay('');
          },
        },
        {
          text: 'Go to Rent Cars',
          onPress: () => navigation.navigate('RentCar'),
        },
      ]
    );
  };

  const clearFields = () => {
    setMake('');
    setModel('');
    setCostPerDay('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New Car</Text>
          <Text style={styles.subtitle}>Fill in the car details below</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Car Make</Text>
            <TextInput
              style={styles.input}
              value={make}
              onChangeText={setMake}
              placeholder="e.g., Toyota, BMW, Mercedes"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Car Model</Text>
            <TextInput
              style={styles.input}
              value={model}
              onChangeText={setModel}
              placeholder="e.g., Camry, X5, C-Class"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cost Per Day (R)</Text>
            <TextInput
              style={styles.input}
              value={costPerDay}
              onChangeText={setCostPerDay}
              placeholder="e.g., 500"
              placeholderTextColor="#95a5a6"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCar}>
            <Text style={styles.addButtonText}>Add Car</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearFields}>
            <Text style={styles.clearButtonText}>Clear Fields</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('RentCar')}
          >
            <Text style={styles.navButtonText}>Go to Rent Cars</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#2c3e50',
  },
  buttonContainer: {
    gap: 15,
  },
  addButton: {
    backgroundColor: '#27ae60',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f39c12',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navButton: {
    backgroundColor: '#3498db',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
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
});

export default AddCarScreen;