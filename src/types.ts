export interface Parrot {
  id: string;
  name: string;
  category: string;
  species: string;
  price: number;
  description: string;
  imageUrl: string;
  age: string;
  healthStatus: string;
  talkativeLevel: 'High' | 'Very High' | 'Excellent' | 'Moderate';
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  date: string;
}

export interface CartItem {
  parrot: Parrot;
  quantity: number;
}

export interface ClientOrder {
  id: string;
  trackingCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  address: string;
  phone: string;
  pincode: string;
  landmark: string;
  notes: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'upi' | 'cod';
  date: string;
  utrNumber?: string;
  promoCode?: string;
  discountAmount?: number;
}

export interface PromoCode {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  active: boolean;
}
