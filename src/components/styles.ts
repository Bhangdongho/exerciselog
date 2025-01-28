import styled from "styled-components";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// 캘린더를 감싸주는 스타일
export const StyledCalendarWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  .react-calendar {
    width: 100%;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 20px 30px;
    background-color: #f9f9f9;
  }

  /* 전체 폰트 컬러 */
  .react-calendar__month-view {
    abbr {
      color: #374151; /* 다크 그레이 */
    }
  }

  /* 네비게이션 가운데 정렬 및 스타일 */
  .react-calendar__navigation {
    justify-content: center;
    margin-bottom: 20px;
  }

  .react-calendar__navigation button {
    font-weight: bold;
    font-size: 1.2rem;
    color: #111827;
    background: transparent;
    border: none;
    padding: 10px 15px;
    border-radius: 8px;
    transition: background-color 0.3s;
    cursor: pointer;
  }

  .react-calendar__navigation button:hover {
    background-color: #e5e7eb;
  }

  /* 네비게이션 버튼 비활성화 상태 */
  .react-calendar__navigation button:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }

  /* 네비게이션 년/월 라벨 스타일 */
  .react-calendar__navigation__label {
    flex-grow: 0 !important;
    font-size: 1.1rem;
    font-weight: 600;
  }

  /* 요일 스타일 */
  .react-calendar__month-view__weekdays abbr {
    text-decoration: none;
    font-weight: 700;
    color: #6b7280;
    font-size: 1rem;
  }

  .react-calendar__month-view__weekdays__weekday--weekend abbr[title="일요일"] {
    color: #ef4444; /* 빨간색 */
  }

  /* 오늘 날짜 스타일 */
  .react-calendar__tile--now {
    background: none;
    abbr {
      color: #2563eb; /* 파란색 */
      font-weight: bold;
    }
  }

  /* 날짜 스타일 */
  .react-calendar__tile {
    padding: 15px 10px;
    font-size: 1rem;
    color: #374151;
    border-radius: 8px;
    transition: background-color 0.3s, transform 0.2s;
    position: relative;
  }

  .react-calendar__tile:hover,
  .react-calendar__tile:focus {
    background-color: #e5e7eb;
    transform: scale(1.05);
  }

  /* 선택된 날짜 스타일 */
  .react-calendar__tile--active {
    background-color: #3b82f6;
    color: white;
    font-weight: bold;
  }

  /* 월 스타일 */
  .react-calendar__year-view__months__month {
    flex: 0 0 calc(33.3333% - 10px) !important;
    margin: 5px;
    padding: 15px;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
    border-radius: 8px;
    background-color: #f3f4f6;
    transition: background-color 0.3s, transform 0.2s;
    cursor: pointer;
  }

  .react-calendar__year-view__months__month:hover {
    background-color: #e5e7eb;
    transform: scale(1.05);
  }
`;

export const StyledCalendar = styled(Calendar)``;

/* 오늘 버튼 스타일 */
export const StyledDate = styled.div`
  position: absolute;
  right: 10%;
  top: 10%;
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2563eb;
  }
`;

/* 오늘 날짜에 텍스트 삽입 스타일 */
export const StyledToday = styled.div`
  font-size: 0.8rem;
  color: #374151;
  font-weight: 600;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

/* 출석한 날짜에 점 표시 스타일 */
export const StyledDot = styled.div`
  background-color: #10b981; /* 밝은 초록색 */
  border-radius: 50%;
  width: 6px;
  height: 6px;
  position: absolute;
  top: 70%;
  left: 50%;
  transform: translateX(-50%);
`;

/* 표시된 날짜 스타일 */
export const MarkedTile = styled.div`
  background-color: #3b82f6 !important;
  color: white !important;
  border-radius: 8px;
`;
