// src/store/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    loading: false,
    toast: null,   // { type: 'info'|'success'|'error'|'warning', message }
    modal: null,   // { id, props }
  },
  reducers: {
    setLoading(state, action) {
      state.loading = Boolean(action.payload);
    },
    showToast(state, action) {
      state.toast = action.payload || null;
    },
    hideToast(state) {
      state.toast = null;
    },
    openModal(state, action) {
      state.modal = action.payload || null;
    },
    closeModal(state) {
      state.modal = null;
    },
  },
});

export const { setLoading, showToast, hideToast, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
