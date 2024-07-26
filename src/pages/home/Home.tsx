import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";
import { appFireStore } from "../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import moment from "moment";
import "moment/locale/ko"; // 한국어 로케일 설정
import styles from "./Home.module.css";

moment.locale("ko"); // 한국어 로케일 설정

type Log = {
  id: string;
  date: Date;
  workout: string;
};

const Home: React.FC = () => {
  const { user } = useAuthContext();
  const [todayWorkout, setTodayWorkout] = useState<Log | null>(null);
  const [recentActivities, setRecentActivities] = useState<Log[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const ref = collection(appFireStore, "workouts");
      const todayQuery = query(
        ref,
        where("userId", "==", user.uid),
        where("date", "==", moment().startOf("day").toDate()) // 오늘 날짜의 운동 계획
      );

      const recentQuery = query(
        ref,
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(5) // 최근 5개의 활동
      );

      const [todaySnapshot, recentSnapshot] = await Promise.all([
        getDocs(todayQuery),
        getDocs(recentQuery),
      ]);

      const todayData = todaySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(), // 수정된 부분
      })) as Log[];

      const recentData = recentSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(), // 수정된 부분
      })) as Log[];

      setTodayWorkout(todayData[0] || null);
      setRecentActivities(recentData);
    };

    fetchLogs();
  }, [user]);

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeMessage}>
        안녕하세요, {user?.displayName}님!
      </h1>

      <div className={styles.sectionUp}>
        <h2>오늘의 운동 계획</h2>
        {todayWorkout ? (
          <div className={styles.workoutPlan}>
            <p>{moment(todayWorkout.date).format("YYYY.MM.DD (dddd)")}</p>
            <p>{todayWorkout.workout}</p>
          </div>
        ) : (
          <p>오늘의 운동 계획이 없습니다.</p>
        )}
        <Link to="/workout-log" className={styles.button}>
          운동 계획 추가
        </Link>
      </div>

      <div className={styles.section}>
        <h2>최근 활동</h2>
        <div className={styles.recentActivities}>
          {recentActivities.length === 0 ? (
            <p>최근 활동 기록이 없습니다.</p>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <p>{moment(activity.date).format("YYYY.MM.DD (dddd)")}</p>
                <div className={styles.workoutPost}>
                  <div className={styles.workoutContent}>
                    운동 내용 : {activity.workout.split("\n")[0]}{" "}
                    {/* 운동 내용 */}
                  </div>
                  <div className={styles.detailedContent}>
                    상세기록 : {activity.workout.split("\n")[1]}{" "}
                    {/* 상세 기록 */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
