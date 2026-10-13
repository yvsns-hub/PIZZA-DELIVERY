import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, DeliveryAddress } from '../types.js';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartId' | 'totalPrice'>) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<DeliveryAddress>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pizza_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: 'Springfield',
    landmark: '',
    pincode: '97477',
  });

  useEffect(() => {
    try {
      localStorage.setItem('pizza_cart_items', JSON.stringify(items));
    } catch (err) {
      console.warn('Cart storage error:', err);
    }
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'cartId' | 'totalPrice'>) => {
    const cartId = 'ci_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const totalPrice = Math.round(newItem.unitPrice * newItem.quantity * 100) / 100;
    setItems((prev) => [...prev, { ...newItem, cartId, totalPrice }]);
    setIsCartOpen(true);
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity,
              totalPrice: Math.round(item.unitPrice * quantity * 100) / 100,
            }
          : item
      )
    );
  };

  const removeFromCart = (cartId: string) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.totalPrice, 0) * 100) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 35 ? 0 : 2.50;
  const totalAmount = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        itemCount,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        deliveryAddress,
        setDeliveryAddress,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
