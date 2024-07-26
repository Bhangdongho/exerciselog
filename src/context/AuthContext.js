import React, { createContext, useEffect, useReducer } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { appAuth } from "../firebase/config";

export const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isAuthReady: true };
    case "LOGOUT":
      return { ...state, user: null, isAuthReady: true };
    case "AUTH_IS_READY":
      return { ...state, user: action.payload, isAuthReady: true };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthReady: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(appAuth, (user) => {
      dispatch({ type: "AUTH_IS_READY", payload: user });
      unsubscribe();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
