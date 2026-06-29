import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { endpoints } from "../services/api.js";

const savedUser = localStorage.getItem("sfc_user");

export const loginUser = createAsyncThunk("auth/login", async (payload) => {
  const { data } = await endpoints.login(payload);
  localStorage.setItem("sfc_token", data.token);
  localStorage.setItem("sfc_user", JSON.stringify(data.user));
  return data.user;
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: savedUser ? JSON.parse(savedUser) : null, status: "idle", error: "" },
  reducers: {
    logout(state) {
      state.user = null;
      localStorage.removeItem("sfc_token");
      localStorage.removeItem("sfc_user");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.error.message || "Login failed";
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
