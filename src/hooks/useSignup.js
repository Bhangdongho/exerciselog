import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { appAuth } from "../firebase/config";
import useAuthContext from "./useAuthContext";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, displayName) => {
    setError(null);
    setIsPending(true);

    try {
      const res = await createUserWithEmailAndPassword(
        appAuth,
        email,
        password
      );
      await updateProfile(res.user, { displayName });

      dispatch({ type: "signup", payload: res.user });
      setIsPending(false);
      setError(null);
      return true; // 회원가입 성공 시 true 반환
    } catch (err) {
      setError(err.message || "Something went wrong");
      setIsPending(false);
      return false; // 회원가입 실패 시 false 반환
    }
  };

  return { error, isPending, signup };
};
