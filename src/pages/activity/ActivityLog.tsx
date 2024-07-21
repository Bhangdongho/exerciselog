import React, { useState, useEffect } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import { appFireStore } from "../../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import moment from "moment";
import "moment/locale/ko"; // 추가
import styles from "./ActivityLog.module.css"; // 스타일 파일 import

moment.locale("ko"); // 한국어 로케일 설정

type Log = {
  id: string;
  date: any;
  workout: string;
};

const ActivityLog: React.FC = () => {
  const { user } = useAuthContext();
  const [activities, setActivities] = useState<Log[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      const ref = collection(appFireStore, "workouts");
      const q = query(
        ref,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate
          ? doc.data().date.toDate()
          : doc.data().date,
      })) as Log[];
      setActivities(data);
    };

    fetchActivities();
  }, [user]);

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>활동 기록</h2>
      <div className={styles.activityList}>
        {activities.length === 0 ? (
          <p className={styles.noData}>활동 기록이 없습니다.</p>
        ) : (
          activities.map((activity) => (
            <div className={styles.activityItem} key={activity.id}>
              <p>{moment(activity.date).format("YYYY.MM.DD (dddd)")}</p>
              <p>{activity.workout}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
