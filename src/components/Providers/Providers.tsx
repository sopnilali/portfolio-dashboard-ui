'use client';

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "../Redux/store";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
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
