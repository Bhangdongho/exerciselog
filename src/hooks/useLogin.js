import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { appAuth } from "../firebase/config";
import useAuthContext from "./useAuthContext";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await signInWithEmailAndPassword(appAuth, email, password);
      dispatch({ type: "login", payload: res.user });
      setIsPending(false);
      return true; // 로그인 성공 시 true 반환
    } catch (err) {
      setError(err.message);
      setIsPending(false);
      return false; // 로그인 실패 시 false 반환
    }
  };

  return { error, isPending, login };
};
