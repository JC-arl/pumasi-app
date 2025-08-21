import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { CartItem, Cart } from '../types/cart';

interface CartState {
  cart: Cart;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart };

interface CartContextType extends CartState {
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isInCart: (machineryId: string, specificationId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        ...action.payload,
        id: `${action.payload.machineryId}-${action.payload.specificationId}`,
        addedAt: new Date().toISOString(),
      };

      // 이미 장바구니에 있는 아이템인지 확인
      const existingItemIndex = state.cart.items.findIndex(
        item => item.machineryId === newItem.machineryId && 
                item.specificationId === newItem.specificationId
      );

      if (existingItemIndex !== -1) {
        // 이미 있는 경우 업데이트하지 않음
        return state;
      }

      const newItems = [...state.cart.items, newItem];
      const newCart: Cart = {
        items: newItems,
        totalItems: newItems.length,
        totalPrice: newItems.reduce((sum, item) => sum + item.rentalPrice, 0),
      };

      // localStorage에 저장
      localStorage.setItem('pumasi_cart', JSON.stringify(newCart));

      return { cart: newCart };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.cart.items.filter(item => item.id !== action.payload);
      const newCart: Cart = {
        items: newItems,
        totalItems: newItems.length,
        totalPrice: newItems.reduce((sum, item) => sum + item.rentalPrice, 0),
      };

      // localStorage에 저장
      localStorage.setItem('pumasi_cart', JSON.stringify(newCart));

      return { cart: newCart };
    }

    case 'CLEAR_CART': {
      const newCart: Cart = {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

      // localStorage에서 삭제
      localStorage.removeItem('pumasi_cart');

      return { cart: newCart };
    }

    case 'LOAD_CART': {
      return { cart: action.payload };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: { items: [], totalItems: 0, totalPrice: 0 },
  });

  // localStorage에서 카트 데이터 로드
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('pumasi_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  // 컴포넌트 마운트 시 localStorage에서 카트 로드
  React.useEffect(() => {
    loadCartFromStorage();
  }, []);

  const addToCart = (item: Omit<CartItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (machineryId: string, specificationId: string) => {
    return state.cart.items.some(
      item => item.machineryId === machineryId && item.specificationId === specificationId
    );
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}