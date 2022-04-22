import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import ReduxReducer from './redux';

const store = configureStore({
  reducer: ReduxReducer,
});

export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
export const useAppStore = (): rootStore =>
  useSelector<rootStore, rootStore>((store) => store);
export type rootStore = ReturnType<typeof store.getState>;

export default store;
