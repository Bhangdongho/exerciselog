import React, { useState, useEffect } from "react";
import { useSignup } from "../../hooks/useSignup";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

const Signup: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const { signup, error, isPending } = useSignup();
  const navigate = useNavigate();

  const handleData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { type, value } = event.target;
    if (type === "email") {
      setEmail(value);
    } else if (type === "password") {
      setPassword(value);
    } else if (type === "text") {
      setDisplayName(value);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await signup(email, password, displayName);
    if (success) {
      navigate("/"); // 회원가입 성공 시 홈 화면으로 이동
    }
  };

  return (
    <form className={styles.signup_form} onSubmit={handleSubmit}>
      <fieldset>
        <legend>회원가입</legend>
        <label htmlFor="myEmail">
          <span>Email</span>
        </label>
        <input
          type="email"
          id="myEmail"
          required
          onChange={handleData}
          value={email}
        />

        <label htmlFor="myPassWord">
          <span>Password</span>
        </label>
        <input
          type="password"
          id="myPassWord"
          required
          onChange={handleData}
          value={password}
        />

        <label htmlFor="myNickName">
          <span>닉네임</span>
        </label>
        <input
          type="text"
          id="myNickName"
          required
          onChange={handleData}
          value={displayName}
        />

        <button type="submit" className={styles.btn} disabled={isPending}>
          {isPending ? "Loading..." : "회원가입"}
        </button>
        {error && <p>{error}</p>}
      </fieldset>
    </form>
  );
};

export default Signup;
