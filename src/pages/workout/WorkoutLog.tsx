import React, { useState, useEffect } from "react";
import moment from "moment";
import { appFireStore } from "../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
} from "firebase/firestore";
import useAuthContext from "../../hooks/useAuthContext";
import ExerciseInfo from "../../components/ExerciseInfo";
import styles from "./WorkoutLog.module.css";

type Log = {
  id: string;
  date: any;
  workout: string;
};

const WorkoutLog: React.FC = () => {
  const { user } = useAuthContext();
  const [logs, setLogs] = useState<Log[]>([]);
  const [workout, setWorkout] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedLogs, setSelectedLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
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
      setLogs(data);
    };

    fetchLogs();
  }, [user]);

  const handleDateChange = (date: Date, workouts: Log[]) => {
    setSelectedDate(date);
    setSelectedLogs(workouts);
  };

  const handleAddWorkout = async () => {
    if (!user || !selectedDate || !workout) return;

    const newLog = {
      date: selectedDate,
      workout: workout,
      userId: user.uid,
    };

    try {
      const docRef = await addDoc(collection(appFireStore, "workouts"), newLog);
      setLogs([{ ...newLog, id: docRef.id }, ...logs]);
      setWorkout("");
      setSelectedLogs([{ ...newLog, id: docRef.id }, ...selectedLogs]);
    } catch (error) {
      console.error("Error adding workout log: ", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkout(e.target.value);
  };

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>운동 기록</h2>
      <ExerciseInfo onDateChange={handleDateChange} />
      <h3>
        {moment(selectedDate).format("YYYY.MM.DD (dddd)")}에 운동 기록 추가
      </h3>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="운동 내용을 입력하세요"
          value={workout}
          onChange={handleInputChange}
          className={styles.input}
        />
        <button onClick={handleAddWorkout} className={styles.button}>
          추가
        </button>
      </div>
      <div className={styles.logs}>
        {selectedLogs.length === 0 ? (
          <p className={styles.noData}>선택한 날짜에 운동 기록이 없습니다.</p>
        ) : (
          selectedLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <p>{moment(log.date).format("YYYY.MM.DD (dddd)")}</p>
              <p>{log.workout}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutLog;
