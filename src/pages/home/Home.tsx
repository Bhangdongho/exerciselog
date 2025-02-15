import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";
import callChatGPT from "../../utils/callChatGPT"; // GPT 호출 유틸리티
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
import "moment/locale/ko";
import styles from "./Home.module.css";

moment.locale("ko");

type Log = {
  id: string;
  date: Date;
  workout: string;
};

const Home: React.FC = () => {
  const { user } = useAuthContext();
  const [todayWorkout, setTodayWorkout] = useState<Log | null>(null);
  const [recentActivities, setRecentActivities] = useState<Log[]>([]);
  const [recommendedPlan, setRecommendedPlan] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const ref = collection(appFireStore, "workouts");
      const todayQuery = query(
        ref,
        where("userId", "==", user.uid),
        where("date", ">=", moment().startOf("day").toDate()),
        where("date", "<=", moment().endOf("day").toDate())
      );

      const recentQuery = query(
        ref,
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(5)
      );

      const [todaySnapshot, recentSnapshot] = await Promise.all([
        getDocs(todayQuery),
        getDocs(recentQuery),
      ]);

      const todayData = todaySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
      })) as Log[];

      const recentData = recentSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate(),
      })) as Log[];

      setTodayWorkout(todayData[0] || null);
      setRecentActivities(recentData);
    };

    fetchLogs();
  }, [user]);

  const handleRecommendPlan = async () => {
    const prompt = "20대 남성을 위한 하루 운동 루틴을 추천해줘.";
    const response = await callChatGPT(prompt);
    setRecommendedPlan(response);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.welcomeMessage}>
        안녕하세요, {user?.displayName}님!
      </h1>

      <div className={styles.sectionUp}>
        <h2 className={styles.sectionTitle}>오늘의 운동 계획</h2>
        {todayWorkout ? (
          <div className={styles.workoutPlan}>
            <p className={styles.date}>
              {moment(todayWorkout.date).format("YYYY.MM.DD (dddd)")}
            </p>
            <p className={styles.workout}>{todayWorkout.workout}</p>
          </div>
        ) : (
          <div className={styles.noWorkoutPlan}>
            <p>오늘의 운동 계획이 없습니다.</p>
            <Link to="/workout-log" className={styles.button}>
              운동 계획 추가
            </Link>
          </div>
        )}
        <button
          onClick={handleRecommendPlan}
          className={`${styles.button} ${styles.recommendButton}`}
        >
          운동 계획 추천
        </button>

        {recommendedPlan && (
          <div className={styles.recommendedPlan}>
            <h3 className={styles.recommendedTitle}>추천 운동 루틴</h3>
            <div className={styles.recommendedCard}>
              <p className={styles.recommendedText}>{recommendedPlan}</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>최근 활동</h2>
        <div className={styles.recentActivities}>
          {recentActivities.length === 0 ? (
            <p>최근 활동 기록이 없습니다.</p>
          ) : (
            recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <p className={styles.date}>
                  {moment(activity.date).format("YYYY.MM.DD (dddd)")}
                </p>
                <div className={styles.workoutPost}>
                  <p className={styles.workoutContent}>
                    <strong>운동 내용 </strong>{" "}
                    {activity.workout.split("\n")[0]}
                  </p>
                  <p className={styles.detailedContent}>
                    <strong>상세 기록 </strong>{" "}
                    {activity.workout.split("\n")[1] || "없음"}
                  </p>
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
