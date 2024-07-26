import React, { useState, useEffect } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import { appFireStore } from "../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import moment from "moment";
import "moment/locale/ko";
import styles from "./ActivityLog.module.css"; // 스타일 파일 import

moment.locale("ko"); // 한국어 로케일 설정

type Log = {
  id: string;
  date: any;
  workout: string;
  userId: string;
  duration?: string; // 선택적 속성으로 추가
  detail?: string[]; // 선택적 속성으로 추가
  exerciseType?: string; // 선택적 속성으로 추가
};

const ActivityLog: React.FC = () => {
  const { user } = useAuthContext();
  const [activities, setActivities] = useState<Log[]>([]);
  const [startDate, setStartDate] = useState<string>(""); // 시작 날짜 상태 추가
  const [endDate, setEndDate] = useState<string>(""); // 종료 날짜 상태 추가

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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(appFireStore, "workouts", id));
      setActivities(activities.filter((activity) => activity.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // 선택한 날짜 범위에 해당하는 활동만 필터링
  const filteredActivities = activities.filter((activity) => {
    const activityDate = moment(activity.date).format("YYYY-MM-DD");
    return (
      (startDate === "" || activityDate >= startDate) &&
      (endDate === "" || activityDate <= endDate)
    );
  });

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>활동 기록</h2>
      <div className={styles.dateFilter}>
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className={styles.dateInput}
          placeholder="시작 날짜"
        />
        <span className={styles.dateSeparator}> ~ </span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className={styles.dateInput}
          placeholder="종료 날짜"
        />
      </div>
      <div className={styles.activityList}>
        {filteredActivities.length === 0 ? (
          <p className={styles.noData}>
            선택한 날짜 범위에 활동 기록이 없습니다.
          </p>
        ) : (
          filteredActivities.map((activity) => {
            // workout 필드를 \n으로 분리하여 운동 내용과 상세 기록으로 나눔
            const [workoutContent, detailedContent] =
              activity.workout.split("\n");

            return (
              <div className={styles.activityItem} key={activity.id}>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className={styles.deleteButton}
                >
                  삭제
                </button>
                <p className={styles.dateTime}>
                  {moment(activity.date).format("YYYY.MM.DD (dddd)")}{" "}
                  {moment(activity.date).format("HH:mm")}
                </p>
                <div className={styles.workoutPost}>
                  <div className={styles.workoutContent}>
                    <strong>운동 내용:</strong> {workoutContent || "없음"}
                  </div>
                  {detailedContent && (
                    <div className={styles.detailedContent}>
                      <strong>상세 기록:</strong> {detailedContent}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
