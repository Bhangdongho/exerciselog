import React, { useState, useEffect, useCallback } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import { appFireStore } from "../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import moment from "moment";
import "moment/locale/ko";
import EditModal from "../../components/EditModal";
import styles from "./ActivityLog.module.css";

moment.locale("ko");

type Log = {
  id: string;
  date: any;
  workout: string;
  userId: string;
};

type FilterOption = "day" | "week" | "month" | "year" | "custom";

const ActivityLog: React.FC = () => {
  const { user } = useAuthContext();
  const [activities, setActivities] = useState<Log[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Log[]>([]);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("day");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });

  const fetchActivities = useCallback(async () => {
    if (!user) return;

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

      setActivities(data);
      setFilteredActivities(data);
    } catch (error) {
      console.error("Error fetching activities: ", error);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const applyFilter = useCallback(() => {
    const now = moment();
    let startDate: moment.Moment | null = null;

    switch (selectedFilter) {
      case "day":
        startDate = now.clone().startOf("day");
        break;
      case "week":
        startDate = now.clone().startOf("week");
        break;
      case "month":
        startDate = now.clone().startOf("month");
        break;
      case "year":
        startDate = now.clone().startOf("year");
        break;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          startDate = moment(customDateRange.start);
          const endDate = moment(customDateRange.end);
          const filtered = activities.filter((activity) =>
            moment(activity.date).isBetween(startDate, endDate, undefined, "[]")
          );
          setFilteredActivities(filtered);
          return;
        }
        break;
      default:
        setFilteredActivities(activities);
        return;
    }

    if (startDate) {
      const filtered = activities.filter((activity) =>
        moment(activity.date).isBetween(startDate, now, undefined, "[]")
      );
      setFilteredActivities(filtered);
    }
  }, [selectedFilter, customDateRange, activities]);

  useEffect(() => {
    applyFilter();
  }, [selectedFilter, customDateRange, applyFilter]);

  const handleSave = async (updatedData: {
    date: Date;
    category: string;
    content: string;
  }) => {
    if (!editingLog) return;

    const updatedWorkout = `${updatedData.category}\n${updatedData.content}`;

    try {
      await updateDoc(doc(appFireStore, "workouts", editingLog.id), {
        date: updatedData.date,
        workout: updatedWorkout,
      });
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === editingLog.id
            ? { ...activity, date: updatedData.date, workout: updatedWorkout }
            : activity
        )
      );
      setEditingLog(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(appFireStore, "workouts", id));
      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== id)
      );
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>활동 기록</h2>
      <div className={styles.filterButtons}>
        {[
          { label: "하루", value: "day" },
          { label: "일주일", value: "week" },
          { label: "한 달", value: "month" },
          { label: "일 년", value: "year" },
          { label: "직접 설정", value: "custom" },
        ].map((filter) => (
          <button
            key={filter.value}
            className={`${styles.filterButton} ${
              selectedFilter === filter.value ? styles.active : ""
            }`}
            onClick={() => setSelectedFilter(filter.value as FilterOption)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {selectedFilter === "custom" && (
        <div className={styles.customDateInputs}>
          <label>
            시작 날짜:
            <input
              type="date"
              value={customDateRange.start}
              onChange={(e) =>
                setCustomDateRange((prev) => ({
                  ...prev,
                  start: e.target.value,
                }))
              }
            />
          </label>
          <label>
            종료 날짜:
            <input
              type="date"
              value={customDateRange.end}
              onChange={(e) =>
                setCustomDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </label>
        </div>
      )}
      <div className={styles.activityList}>
        {filteredActivities.map((activity) => (
          <div className={styles.activityItem} key={activity.id}>
            <div className={styles.header}>
              <p className={styles.dateTime}>
                {moment(activity.date).format("YYYY.MM.DD (dddd)")}
              </p>
              <div className={styles.actionButtons}>
                <button
                  onClick={() => setEditingLog(activity)}
                  className={styles.editButton}
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(activity.id)}
                  className={styles.deleteButton}
                >
                  삭제
                </button>
              </div>
            </div>
            <div className={styles.workoutPost}>
              <p className={styles.workoutCategory}>
                <strong>{activity.workout.split("\n")[0]}</strong>
              </p>
              <p className={styles.workoutContent}>
                <strong>운동내용 </strong> {activity.workout.split("\n")[1]}
              </p>
            </div>
          </div>
        ))}
      </div>
      {editingLog && (
        <EditModal
          initialDate={editingLog.date}
          initialCategory={editingLog.workout.split("\n")[0]}
          initialContent={editingLog.workout.split("\n")[1]}
          onSave={handleSave}
          onClose={() => setEditingLog(null)}
        />
      )}
    </div>
  );
};

export default ActivityLog;
