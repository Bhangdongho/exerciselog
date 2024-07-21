import React, { useState, useEffect } from "react";
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
  MarkedTile,
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
  const [activeStartDate, setActiveStartDate] = useState<Date | null>(
    new Date()
  );
  const [logs, setLogs] = useState<Log[]>([]);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      const ref = collection(appFireStore, "workouts");
      const q = query(ref, where("userId", "==", user.uid));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().date.toDate
          ? doc.data().date.toDate()
          : doc.data().date,
      })) as Log[];
      setLogs(data);

      const dates = data.map((log) => moment(log.date).format("YYYY-MM-DD"));
      setMarkedDates(dates);
    };

    fetchLogs();
  }, [user]);

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    const selectedLogs = logs.filter(
      (log) =>
        moment(log.date).format("YYYY-MM-DD") ===
        moment(newDate).format("YYYY-MM-DD")
    );
    onDateChange(newDate, selectedLogs);
  };

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
        activeStartDate={activeStartDate === null ? undefined : activeStartDate}
        onActiveStartDateChange={({ activeStartDate }) =>
          setActiveStartDate(activeStartDate)
        }
        tileContent={({ date, view }) => {
          let html = [];
          if (
            view === "month" &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
          ) {
            html.push(<StyledToday key={"today"}>오늘</StyledToday>);
          }
          if (markedDates.includes(moment(date).format("YYYY-MM-DD"))) {
            html.push(<StyledDot key={moment(date).format("YYYY-MM-DD")} />);
          }
          return <>{html}</>;
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
