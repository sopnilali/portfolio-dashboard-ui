'use client';

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../Redux/store";
import LoadingSpinner from "../Shared/LoadingSpinner";
import MainSpinner from "../Shared/MainSpinner";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<MainSpinner />} persistor={persistor}>
        <>
          {children}
          <Toaster
            position="top-center"
            duration={2000}
            richColors
            theme="light"
          />
        </>
      </PersistGate>
    </Provider>
  );
};
