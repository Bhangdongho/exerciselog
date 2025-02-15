import React, { useState, useEffect } from "react";
import moment from "moment";
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
import useAuthContext from "../../hooks/useAuthContext";
import ExerciseInfo from "../../components/ExerciseInfo";
import WorkoutModal from "../../components/WorkoutModal"; // 모달 컴포넌트 추가
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<Log[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
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

  const handleDateChange = (date: Date, workouts: Partial<Log>[]) => {
    if (moment(date).isSame(selectedDate, "day")) {
      setSelectedDate(null);
      setSelectedLogs([]);
    } else {
      setSelectedDate(date);
      setSelectedLogs(
        workouts.map((log) => ({ ...log, userId: user?.uid || "" })) as Log[]
      );
    }
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

  const handleEditLog = (log: Log) => {
    setEditingLog(log);
    setEditMode(true);
    setModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>운동 기록</h2>
      <ExerciseInfo onDateChange={handleDateChange} />

      {selectedDate && (
        <>
          <h2 className={styles.h2}>
            {moment(selectedDate).format("YYYY.MM.DD (dddd)")} 운동 기록
          </h2>
          <button onClick={() => setModalOpen(true)} className={styles.button}>
            운동 추가하기
          </button>
        </>
      )}

      {modalOpen && (
        <WorkoutModal
          selectedDate={selectedDate}
          onClose={() => {
            setModalOpen(false);
            setEditMode(false);
            setEditingLog(null);
          }}
          onLogAdded={(newLog) => setLogs([newLog, ...logs])}
          editMode={editMode}
          existingLog={editingLog}
        />
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
                    onClick={() => handleEditLog(log)}
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
                  <strong>{log.workout.split("\n")[0]}</strong>
                </p>
                <p className={styles.detailedContent}>
                  {log.workout.split("\n")[1] || "상세 운동 없음"}
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
