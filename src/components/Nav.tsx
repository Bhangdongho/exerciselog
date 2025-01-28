import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import useAuthContext from "../hooks/useAuthContext"; // 기본 내보내기로 수정
import styles from "./Nav.module.css";

const Nav: React.FC = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.link}>
        <h1 className={styles.tit}>득근득근</h1>
      </Link>
      <ul className={styles.list_nav}>
        {!user && (
          <>
            <li className={styles.list_item}>
              <Link to="/login" className={styles.link}>
                로그인
              </Link>
            </li>
            <li className={styles.list_item}>
              <Link to="/signup" className={styles.link}>
                가입하기
              </Link>
            </li>
          </>
        )}
        {user && (
          <>
            <li className={styles.list_item}>
              <Link to="/workout-log" className={styles.link}>
                운동 기록
              </Link>
            </li>
            <li className={styles.list_item}>
              <Link to="/activity-log" className={styles.link}>
                활동 기록
              </Link>
            </li>
            <li className={styles.list_item}>
              <Link to="/analysis" className={styles.link}>
                운동 분석
              </Link>
            </li>
            <li className={styles.list_item}>
              <strong className={styles.strong}>
                환영합니다 {user.displayName}님!
              </strong>
            </li>
            <li className={styles.list_item}>
              <button type="button" onClick={logout} className={styles.button}>
                로그아웃
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
