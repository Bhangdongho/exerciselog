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
  deleteDoc,
  doc,
} from "firebase/firestore";
import useAuthContext from "../../hooks/useAuthContext";
import ExerciseInfo from "../../components/ExerciseInfo";
import styles from "./WorkoutLog.module.css";

// `ExerciseInfo` 컴포넌트와 호환되는 타입 정의
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

  const handleDateChange = (date: Date, workouts: ExerciseLog[]) => {
    setSelectedDate(date);
    setSelectedLogs(workouts as Log[]);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
  };

  const handleAddWorkout = async () => {
    if (!user || !selectedDate || !selectedTime || !workout) return;

    const dateTime = new Date(selectedDate);
    const timeParts = selectedTime.split(":");
    dateTime.setHours(parseInt(timeParts[0], 10));
    dateTime.setMinutes(parseInt(timeParts[1], 10));

    // 두 입력 필드를 결합하여 하나의 workoutLog 문자열 생성
    const combinedWorkout = `${workout}\n${detailedWorkoutInput}`;

    const newLog: Log = {
      date: dateTime,
      workout: combinedWorkout,
      userId: user.uid,
      id: "", // id를 빈 문자열로 초기화 (Firestore에서 받아올 것이므로)
    };

    try {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkout(e.target.value);
  };

  const handleDetailedWorkoutInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDetailedWorkoutInput(e.target.value);
  };

  const addCategory = (
    category: string,
    inputSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    inputSetter((prev) => prev + category + " ");
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

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>운동 기록</h2>
      <ExerciseInfo onDateChange={handleDateChange} />
      {selectedDate && (
        <>
          <h2>
            {moment(selectedDate).format("YYYY.MM.DD (dddd)")} 운동 기록 추가
          </h2>
          <div className={styles.form}>
            <div className={styles.buttonContainer}>
              <button
                onClick={() => addCategory("헬스", setWorkout)}
                className={styles.categoryButton}
              >
                헬스
              </button>
              <button
                onClick={() => addCategory("홈트", setWorkout)}
                className={styles.categoryButton}
              >
                홈트
              </button>
              <button
                onClick={() => addCategory("등산", setWorkout)}
                className={styles.categoryButton}
              >
                등산
              </button>
              <button
                onClick={() => addCategory("필라테스", setWorkout)}
                className={styles.categoryButton}
              >
                필라테스
              </button>
              <button
                onClick={() => addCategory("수영", setWorkout)}
                className={styles.categoryButton}
              >
                수영
              </button>
              <button
                onClick={() => addCategory("러닝", setWorkout)}
                className={styles.categoryButton}
              >
                러닝
              </button>
              <button
                onClick={() => addCategory("테니스", setWorkout)}
                className={styles.categoryButton}
              >
                테니스
              </button>
            </div>
            <input
              type="text"
              placeholder="운동 내용을 입력하세요"
              value={workout}
              onChange={handleInputChange}
              className={styles.input}
            />
            <p className={styles.startTime}>시작 시간</p>
            <input
              type="time"
              value={selectedTime || ""}
              onChange={handleTimeChange}
              className={styles.input}
            />
            <h3>상세 기록 추가</h3>
            <div className={styles.buttonContainer}>
              <button
                onClick={() =>
                  addCategory("트레드밀 러닝", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                트레드밀 러닝
              </button>
              <button
                onClick={() =>
                  addCategory("벤치 프레스", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                벤치 프레스
              </button>
              <button
                onClick={() => addCategory("크런치", setDetailedWorkoutInput)}
                className={styles.categoryButton}
              >
                크런치
              </button>
              <button
                onClick={() =>
                  addCategory("랫 풀다운", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                랫 풀다운
              </button>
              <button
                onClick={() =>
                  addCategory("데드 프레스", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                데드 프레스
              </button>
              <button
                onClick={() =>
                  addCategory("바벨 스쿼트", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                바벨 스쿼트
              </button>
              <button
                onClick={() =>
                  addCategory("덤벨 숄더 프레스", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                덤벨 숄더 프레스
              </button>
              <button
                onClick={() => addCategory("싸이클", setDetailedWorkoutInput)}
                className={styles.categoryButton}
              >
                싸이클
              </button>
              <button
                onClick={() =>
                  addCategory("레그 레이즈", setDetailedWorkoutInput)
                }
                className={styles.categoryButton}
              >
                레그 레이즈
              </button>
            </div>
            <input
              type="text"
              placeholder="상세 운동 내용을 입력하세요"
              value={detailedWorkoutInput}
              onChange={handleDetailedWorkoutInputChange}
              className={styles.input}
            />
            <button onClick={handleAddWorkout} className={styles.button}>
              추가
            </button>
          </div>
        </>
      )}
      <div className={styles.logs}>
        {selectedLogs.length === 0 ? (
          <p className={styles.noData}>선택한 날짜에 운동 기록이 없습니다.</p>
        ) : (
          selectedLogs.map((log) => (
            <div key={log.id} className={styles.logItem}>
              <button
                onClick={() => handleDeleteLog(log.id)}
                className={styles.deleteButton}
              >
                삭제
              </button>
              <p>{moment(log.date).format("YY-MM-DD (ddd) HH:mm")}</p>
              <div className={styles.workoutPost}>
                <div className={styles.workoutContent}>
                  {log.workout.split("\n")[0]} {/* 운동 내용 */}
                </div>
                <div className={styles.detailedContent}>
                  {log.workout.split("\n")[1]} {/* 상세 기록 */}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutLog;
