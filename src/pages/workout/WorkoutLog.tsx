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
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import useAuthContext from "../../hooks/useAuthContext";
import ExerciseInfo from "../../components/ExerciseInfo";
import styles from "./WorkoutLog.module.css";

type ExerciseLog = {
  id: string;
  date: any;
  workout: string;
};

type Log = ExerciseLog & {
  userId: string;
};

const WorkoutLog: React.FC = () => {
  const { user } = useAuthContext();
  const [logs, setLogs] = useState<Log[]>([]);
  const [workout, setWorkout] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedLogs, setSelectedLogs] = useState<Log[]>([]);
  const [detailedWorkoutInput, setDetailedWorkoutInput] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
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
          date: doc.data().date?.toDate
            ? doc.data().date.toDate()
            : moment(doc.data().date).toDate(),
        })) as Log[];
        setLogs(data);
      } catch (error) {
        console.error("Error fetching logs: ", error);
      }
    };

    fetchLogs();
  }, [user]);

  const handleDateChange = (date: Date, workouts: ExerciseLog[]) => {
    if (moment(date).isSame(selectedDate, "day")) {
      setSelectedDate(null);
      setSelectedLogs([]);
    } else {
      setSelectedDate(date);
      setSelectedLogs(workouts as Log[]);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleAddWorkout = async () => {
    if (!user || !selectedDate || !selectedTime || !workout) return;

    try {
      const dateTime = new Date(selectedDate);
      const timeParts = selectedTime.split(":");
      dateTime.setHours(parseInt(timeParts[0], 10));
      dateTime.setMinutes(parseInt(timeParts[1], 10));

      const combinedWorkout = `${workout}\n${detailedWorkoutInput}`;

      const newLog: Log = {
        date: dateTime,
        workout: combinedWorkout,
        userId: user.uid,
        id: "",
      };

      const docRef = await addDoc(collection(appFireStore, "workouts"), newLog);
      setLogs([{ ...newLog, id: docRef.id }, ...logs]);
      setWorkout("");
      setDetailedWorkoutInput("");
      setSelectedTime("");
      setSelectedLogs([{ ...newLog, id: docRef.id }, ...selectedLogs]);
    } catch (error) {
      console.error("Error adding workout log: ", error);
    }
  };

  const handleEditWorkout = async () => {
    if (!editingLog || !user) return;

    try {
      const updatedWorkout = `${workout}\n${detailedWorkoutInput}`;
      await updateDoc(doc(appFireStore, "workouts", editingLog.id), {
        workout: updatedWorkout,
      });

      const updatedLogs = logs.map((log) =>
        log.id === editingLog.id ? { ...log, workout: updatedWorkout } : log
      );
      setLogs(updatedLogs);
      setEditMode(false);
      setEditingLog(null);
      setWorkout("");
      setDetailedWorkoutInput("");
    } catch (error) {
      console.error("Error updating workout log: ", error);
    }
  };

  const handleEditClick = (log: Log) => {
    setEditMode(true);
    setEditingLog(log);
    const [workoutContent, detailedContent] = log.workout.split("\n");
    setWorkout(workoutContent || "");
    setDetailedWorkoutInput(detailedContent || "");
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteDoc(doc(appFireStore, "workouts", id));
      setLogs(logs.filter((log) => log.id !== id));
      setSelectedLogs(selectedLogs.filter((log) => log.id !== id));
    } catch (error) {
      console.error("Error deleting workout log: ", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>운동 기록</h2>
      <ExerciseInfo onDateChange={handleDateChange} />
      {selectedDate && (
        <>
          <h2 className={styles.h2}>
            {moment(selectedDate).format("YYYY.MM.DD (dddd)")} 운동 기록 추가
          </h2>
          <div className={styles.form}>
            <div className={styles.buttonContainer}>
              {[
                "헬스",
                "홈트",
                "등산",
                "필라테스",
                "수영",
                "러닝",
                "테니스",
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => setWorkout((prev) => `${prev}${category} `)}
                  className={styles.categoryButton}
                >
                  {category}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="운동 내용을 입력하세요"
              value={workout}
              onChange={(e) => setWorkout(e.target.value)}
              className={styles.input}
            />
            <p className={styles.startTime}>시작 시간</p>
            <input
              type="time"
              value={selectedTime || ""}
              onChange={(e) => handleTimeChange(e.target.value)}
              className={styles.input}
            />
            <h3 className={styles.h2}>상세 기록 추가</h3>
            <div className={styles.buttonContainer}>
              {[
                "트레드밀 러닝",
                "벤치 프레스",
                "크런치",
                "랫 풀다운",
                "데드 프레스",
                "바벨 스쿼트",
                "덤벨 숄더 프레스",
                "싸이클",
                "레그 레이즈",
              ].map((detail) => (
                <button
                  key={detail}
                  onClick={() =>
                    setDetailedWorkoutInput((prev) => `${prev}${detail} `)
                  }
                  className={styles.categoryButton}
                >
                  {detail}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="상세 운동 내용을 입력하세요"
              value={detailedWorkoutInput}
              onChange={(e) => setDetailedWorkoutInput(e.target.value)}
              className={styles.input}
            />
            {editMode ? (
              <button onClick={handleEditWorkout} className={styles.button}>
                수정
              </button>
            ) : (
              <button onClick={handleAddWorkout} className={styles.button}>
                추가
              </button>
            )}
          </div>
        </>
      )}
      <div className={styles.logs}>
        {selectedLogs.length === 0 ? (
          <p className={styles.noData}>선택한 날짜에 운동 기록이 없습니다.</p>
        ) : (
          selectedLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <div className={styles.header}>
                <p className={styles.dateTime}>
                  {moment(log.date).format("YY-MM-DD (ddd) HH:mm")}
                </p>
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleEditClick(log)}
                    className={styles.editButton}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className={styles.deleteButton}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div>
                <p className={styles.workoutContent}>
                  {log.workout.split("\n")[0]}
                </p>
                <p className={styles.detailedContent}>
                  {log.workout.split("\n")[1]}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutLog;
