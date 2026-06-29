import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { endpoints } from "../services/api.js";

export const fetchMenu = createAsyncThunk("menu/fetch", async () => {
  const { data } = await endpoints.foods();
  return data.data;
});

const fallbackMenu = [
  { _id: "demo-1", name: "Crispy Fried Chicken", price: 80, foodType: "non-veg", category: { name: "Signature Chicken" }, description: "Golden fried chicken with SFC seasoning.", imageUrl: "https://res.cloudinary.com/du3fvxchg/image/upload/v1781249851/a-close-up-shot-of-a-single-crispy-fried-chicken-drumstick-on-a-transparent-background-png_ucy3uz.png" },
  { _id: "demo-2", name: "Tandoori Chicken Pizza", price: 189, foodType: "non-veg", category: { name: "Pizza" }, description: "Smoky tandoori chicken on a cheesy crust.", imageUrl: "https://res.cloudinary.com/dbt4myzmh/image/upload/v1781254850/OIP.YiJtgruYuOoOfUi5gCF-BAHaHa_c3vv1v.webp" },
  { _id: "demo-3", name: "Veg Momos", price: 69, foodType: "veg", category: { name: "Momos" }, description: "Steamed dumplings with red chutney.", imageUrl: "https://res.cloudinary.com/du3fvxchg/image/upload/v1781258128/veg-momos-recipe_brytjz.jpg" }
];

const menuSlice = createSlice({
  name: "menu",
  initialState: { items: fallbackMenu, status: "idle", error: "" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload.length ? action.payload : fallbackMenu;
      })
      .addCase(fetchMenu.rejected, (state) => {
        state.status = "idle";
        state.items = fallbackMenu;
      });
  }
});

export default menuSlice.reducer;
