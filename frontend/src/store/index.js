// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice.js';
import ui from './uiSlice.js';

export const store = configureStore({
  reducer: { auth, ui },
  devTools: import.meta.env.DEV,
});
