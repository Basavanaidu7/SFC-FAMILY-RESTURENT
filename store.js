import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import cartReducer from "./cartSlice.js";
import menuReducer from "./menuSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    menu: menuReducer
  }
});
