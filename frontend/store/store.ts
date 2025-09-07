import { configureStore } from '@reduxjs/toolkit';
import contactReducer from '@/lib/redux/slices/contactSlice';
import jobReducer from '@/lib/redux/slices/jobSlice';
import ContactApi from '@/lib/redux/api/ContactApi';
import JobApi from '@/lib/redux/api/JobApi';

const store = configureStore({
  reducer: {
    contact: contactReducer,
    job: jobReducer,
    [ContactApi.reducerPath]: ContactApi.reducer,
    [JobApi.reducerPath]: JobApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ContactApi.middleware, JobApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;