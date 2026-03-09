// src/redux/store.js  (or wherever your store lives)
// Add healthReducer alongside your existing authReducer

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../authSlice";       // your existing slice
import healthReducer from "../redux/healthSlice";    // new slice

const store = configureStore({
  reducer: {
    auth: authReducer,
    health: healthReducer,   // ← add this line
  },
});

export default store;