import React, { useState, useEffect } from "react";
import { appFireStore } from "../firebase/config";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import useAuthContext from "../hooks/useAuthContext";
import workoutCategories from "../data/workoutCategories";
import styles from "./WorkoutModal.module.css";

type WorkoutModalProps = {
  selectedDate: Date | null;
  onClose: () => void;
  onLogAdded: (log: any) => void;
  editMode?: boolean;
  existingLog?: Log | null;
};

type Log = {
  id: string;
  date: any;
  workout: string;
  userId: string;
};

const WorkoutModal: React.FC<WorkoutModalProps> = ({
  selectedDate,
  onClose,
  onLogAdded,
  editMode = false,
  existingLog = null,
}) => {
  const { user } = useAuthContext();
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customComment, setCustomComment] = useState<string>("");
  const [showTimeDropdown, setShowTimeDropdown] = useState<boolean>(false);

  useEffect(() => {
    if (editMode && existingLog) {
      const [workoutPart, commentPart] = existingLog.workout.split(" (");
      setSelectedWorkouts(workoutPart ? workoutPart.split(", ") : []);
      setCustomComment(commentPart ? commentPart.replace(")", "") : "");
      setSelectedTime(
        existingLog.date
          ? new Date(existingLog.date).toTimeString().slice(0, 5)
          : ""
      );
    }
  }, [editMode, existingLog]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const newCategories = new Set(prev);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return newCategories;
    });
  };

  const toggleWorkout = async (workout: string) => {
    setSelectedWorkouts((prev) =>
      prev.includes(workout)
        ? prev.filter((item) => item !== workout)
        : [...prev, workout]
    );

    if (!editMode) {
      await handleAddWorkout({ workout });
    }
  };

  const handleAddWorkout = async ({
    workout = selectedWorkouts.join(", "),
    time = selectedTime,
  }: {
    workout?: string;
    time?: string;
  }) => {
    if (!user || !selectedDate || (!time && workout.length === 0)) return;

    try {
      const dateTime = new Date(selectedDate);
      if (time) {
        const timeParts = time.split(":");
        dateTime.setHours(parseInt(timeParts[0], 10));
        dateTime.setMinutes(parseInt(timeParts[1], 10));
      }

      const combinedWorkout =
        workout + (customComment ? ` (${customComment})` : "");

      if (editMode && existingLog) {
        await updateDoc(doc(appFireStore, "workouts", existingLog.id), {
          date: dateTime,
          workout: combinedWorkout,
        });
        onLogAdded({
          ...existingLog,
          date: dateTime,
          workout: combinedWorkout,
        });
      } else {
        const newLog = {
          date: dateTime,
          workout: combinedWorkout,
          userId: user.uid,
        };
        const docRef = await addDoc(
          collection(appFireStore, "workouts"),
          newLog
        );
        onLogAdded({ ...newLog, id: docRef.id });
      }

      onClose();
    } catch (error) {
      console.error("Error adding/updating workout log: ", error);
    }
  };

  const handleTimeSelect = async (time: string) => {
    setSelectedTime(time);
    setShowTimeDropdown(false);
    if (!editMode) {
      await handleAddWorkout({ time });
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          {editMode ? "운동 수정" : "운동 추가"}
        </h2>

        <div className={styles.categoryContainer}>
          {Object.keys(workoutCategories).map((category) => (
            <div key={category}>
              <button
                className={`${styles.categoryButton} ${
                  selectedCategories.has(category) ? styles.active : ""
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </button>
              {selectedCategories.has(category) && (
                <div className={styles.workoutList}>
                  {workoutCategories[category].map((exercise) => (
                    <button
                      key={exercise}
                      className={`${styles.exerciseButton} ${
                        selectedWorkouts.includes(exercise) ? styles.active : ""
                      }`}
                      onClick={() => toggleWorkout(exercise)}
                    >
                      {exercise}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.timePicker}>
          <button
            className={styles.timeButton}
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          >
            {selectedTime ? selectedTime : "운동 시간 선택"}
          </button>
          {showTimeDropdown && (
            <div className={styles.timeDropdown}>
              {[
                "06:00",
                "07:00",
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "12:00",
                "13:00",
                "14:00",
                "15:00",
                "16:00",
                "17:00",
                "18:00",
                "19:00",
                "20:00",
                "21:00",
              ].map((time) => (
                <div
                  key={time}
                  className={styles.timeOption}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="추가 코멘트 입력 (선택 사항)"
          value={customComment}
          onChange={(e) => setCustomComment(e.target.value)}
          className={styles.input}
        />

        <div className={styles.actions}>
          <button
            onClick={() => handleAddWorkout({})}
            className={styles.saveButton}
          >
            {editMode ? "수정" : "추가"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;
