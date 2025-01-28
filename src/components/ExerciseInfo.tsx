import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import { appFireStore } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import useAuthContext from "../hooks/useAuthContext";
import {
  StyledCalendarWrapper,
  StyledCalendar,
  StyledDate,
  StyledToday,
  StyledDot,
} from "./styles";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type ExerciseInfoProps = {
  onDateChange: (date: Date, workouts: Log[]) => void;
};

type Log = {
  id: string;
  date: any;
  workout: string;
};

const ExerciseInfo: React.FC<ExerciseInfoProps> = ({ onDateChange }) => {
  const { user } = useAuthContext();
  const today = new Date();
  const [date, setDate] = useState<Value>(today);
  const [activeStartDate, setActiveStartDate] = useState<Date | null>(today);
  const [logs, setLogs] = useState<Log[]>([]);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  // Firestore에서 데이터 가져오기
  const fetchLogs = useCallback(async () => {
    if (!user) return;

    try {
      const ref = collection(appFireStore, "workouts");
      const q = query(ref, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date?.toDate
          ? doc.data().date.toDate()
          : moment(doc.data().date).toDate(),
      })) as Log[];

      setLogs(data);

      const dates = data.map((log) => moment(log.date).format("YYYY-MM-DD"));
      setMarkedDates(dates);
    } catch (error) {
      console.error("Error fetching exercise logs: ", error);
    }
  }, [user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 날짜 변경 핸들러
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    const selectedLogs = logs.filter(
      (log) =>
        moment(log.date).format("YYYY-MM-DD") ===
        moment(newDate).format("YYYY-MM-DD")
    );
    onDateChange(newDate, selectedLogs);
  };

  // 오늘 날짜로 이동
  const handleTodayClick = () => {
    const today = new Date();
    setActiveStartDate(today);
    setDate(today);
  };

  return (
    <StyledCalendarWrapper>
      <StyledCalendar
        value={date}
        onClickDay={handleDateChange}
        formatDay={(locale: any, date: any) => moment(date).format("D")}
        formatYear={(locale: any, date: any) => moment(date).format("YYYY")}
        formatMonthYear={(locale: any, date: any) =>
          moment(date).format("YYYY. MM")
        }
        calendarType="gregory"
        showNeighboringMonth={false}
        next2Label={null}
        prev2Label={null}
        minDetail="year"
        activeStartDate={activeStartDate || undefined}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(activeStartDate)
        }
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const formattedDate = moment(date).format("YYYY-MM-DD");
          return (
            <>
              {date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() && (
                  <StyledToday key="today">오늘</StyledToday>
                )}
              {markedDates.includes(formattedDate) && (
                <StyledDot key={formattedDate} />
              )}
            </>
          );
        }}
        tileClassName={({ date, view }) => {
          if (
            view === "month" &&
            markedDates.includes(moment(date).format("YYYY-MM-DD"))
          ) {
            return "marked";
          }
          return "";
        }}
      />
      <StyledDate onClick={handleTodayClick}>오늘</StyledDate>
    </StyledCalendarWrapper>
  );
};

export default ExerciseInfo;
