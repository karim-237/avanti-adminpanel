import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, OrderItem, ShippingAddress } from '@/types'

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0,
  paymentMethod: undefined,
  shippingAddress: undefined,
  deliveryDateIndex: undefined,
}

interface CartState {
  cart: Cart
  addItem: (item: OrderItem, quantity: number) => Promise<string>
  updateItem: (item: OrderItem, quantity: number) => Promise<void>
  removeItem: (item: OrderItem) => void
  clearCart: () => void
  setShippingAddress: (shippingAddress: ShippingAddress) => void
  setPaymentMethod: (paymentMethod: string) => void
  setDeliveryDateIndex: (index: number) => void
  init: () => void
}

// Fonction interne pour calculer les totaux
const calculateCartTotals = (items: OrderItem[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shippingPrice = 0 // Tu peux mettre un calcul selon itemsPrice ou livraison gratuite
  const taxPrice = 0 // Tu peux mettre un calcul si nécessaire
  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice: itemsPrice + shippingPrice + taxPrice,
  }
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: initialState,

      addItem: async (item: OrderItem, quantity: number) => {
        const { items } = get().cart
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }]

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calculateCartTotals(updatedCartItems),
          },
        })

        const foundItem = updatedCartItems.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )
        if (!foundItem) throw new Error('Item not found in cart')
        return foundItem.clientId
      },

      updateItem: async (item: OrderItem, quantity: number) => {
        const { items } = get().cart
        const exist = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        )
        if (!exist) return

        const updatedCartItems = items.map((x) =>
          x.product === item.product &&
          x.color === item.color &&
          x.size === item.size
            ? { ...exist, quantity }
            : x
        )
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calculateCartTotals(updatedCartItems),
          },
        })
      },

      removeItem: (item: OrderItem) => {
        const { items } = get().cart
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        )
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...calculateCartTotals(updatedCartItems),
          },
        })
      },

      setShippingAddress: (shippingAddress: ShippingAddress) => {
        const { items } = get().cart
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...calculateCartTotals(items),
          },
        })
      },

      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        })
      },

      setDeliveryDateIndex: (index: number) => {
        set({
          cart: {
            ...get().cart,
            deliveryDateIndex: index,
          },
        })
      },

      clearCart: () => {
        set({
          cart: {
            ...get().cart,
            items: [],
            ...calculateCartTotals([]),
          },
        })
      },

      init: () => set({ cart: initialState }),
    }),
    { name: 'cart-store' }
  )
)

export default useCartStore
