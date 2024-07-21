import React, { useState } from "react";
import { useLogin } from "../../hooks/useLogin";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, error, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <fieldset>
        <legend>로그인</legend>

        <label htmlFor="myEmail">
          <span>Email</span>
        </label>
        <input
          type="email"
          id="myEmail"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <label htmlFor="myPassword">
          <span>Password</span>
        </label>
        <input
          type="password"
          id="myPassword"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button type="submit" className={styles.btn} disabled={isPending}>
          {isPending ? "Loading..." : "로그인"}
        </button>
        {error && <p>{error}</p>}
      </fieldset>
    </form>
  );
};

export default Login;
