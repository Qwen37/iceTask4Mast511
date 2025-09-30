export interface Car {
  id: string;
  make: string;
  model: string;
  costPerDay: number;
  image?: string;
}

export interface Booking {
  id: string;
  car: Car;
  numberOfDays: number;
  totalCost: number;
  startDate: Date;
  endDate: Date;
  customerName?: string;
}

export type UserType = 'admin' | 'customer';

export type RootStackParamList = {
  Login: undefined;
  AddCar: undefined;
  RentCar: undefined;
  Confirmation: {
    booking: Booking;
  };
};