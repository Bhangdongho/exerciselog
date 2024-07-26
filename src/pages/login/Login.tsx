import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import styles from "./Login.module.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, error, isPending } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await login(email, password);
    if (success) {
      navigate("/"); // 로그인 성공 시 홈 화면으로 리다이렉트
    } else {
      alert("로그인 실패했습니다."); // 로그인 실패 시 알림 창 표시
    }
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
      </fieldset>
    </form>
  );
};

export default Login;
