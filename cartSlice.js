import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const item = state.items.find((entry) => entry.foodItem === action.payload._id);
      if (item) item.quantity += 1;
      else state.items.push({ foodItem: action.payload._id, name: action.payload.name, price: action.payload.price, quantity: 1 });
    },
    changeQuantity(state, action) {
      const item = state.items.find((entry) => entry.foodItem === action.payload.id);
      if (!item) return;
      item.quantity += action.payload.delta;
      state.items = state.items.filter((entry) => entry.quantity > 0);
    },
    clearCart(state) {
      state.items = [];
    }
  }
});

export const selectCartTotals = (state) => {
  const subtotal = state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  return { subtotal, tax, deliveryFee, grandTotal: subtotal + tax + deliveryFee };
};

export const { addToCart, changeQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
