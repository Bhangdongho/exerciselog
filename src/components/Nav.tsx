import { Link } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import useAuthContext from "../hooks/useAuthContext";
import styles from "./Nav.module.css";

const Nav: React.FC = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  return (
    <nav className={styles.nav}>
      <div className={styles.nav_container}>
        <Link to="/" className={styles.link}>
          <h1 className={styles.tit}>득근득근</h1>
        </Link>
        <ul className={styles.list_nav}>
          {user ? (
            <>
              <NavItem to="/workout-log" label="운동 기록" />
              <NavItem to="/activity-log" label="활동 기록" />
              <NavItem to="/analysis" label="운동 분석" />
              <li className={styles.list_item}>
                <strong className={styles.strong}>
                  환영합니다, {user.displayName}님!
                </strong>
              </li>
              <li className={styles.list_item}>
                <button
                  type="button"
                  onClick={logout}
                  className={styles.button}
                >
                  로그아웃
                </button>
              </li>
            </>
          ) : (
            <>
              <NavItem to="/login" label="로그인" />
              <NavItem to="/signup" label="가입하기" />
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, label }) => (
  <li className={styles.list_item}>
    <Link to={to} className={styles.link}>
      {label}
    </Link>
  </li>
);

export default Nav;
