import React, { useState } from "react";
import styles from "./EditModal.module.css";

type EditModalProps = {
  initialDate: Date;
  initialCategory: string;
  initialContent: string;
  onSave: (updatedData: {
    date: Date;
    category: string;
    content: string;
  }) => void;
  onClose: () => void;
};

const EditModal: React.FC<EditModalProps> = ({
  initialDate,
  initialCategory,
  initialContent,
  onSave,
  onClose,
}) => {
  const [date, setDate] = useState(initialDate.toISOString().split("T")[0]);
  const [category, setCategory] = useState(initialCategory);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    onSave({
      date: new Date(date),
      category,
      content,
    });
  };

  const addCategory = (newCategory: string) => {
    setCategory((prev) => `${prev}${newCategory} `);
  };

  const addDetail = (detail: string) => {
    setContent((prev) => `${prev}${detail} `);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>운동 기록 수정</h2>
        <div className={styles.formGroup}>
          <label>날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>운동 카테고리</label>
          <div className={styles.buttonContainer}>
            {["헬스", "홈트", "등산", "필라테스", "수영", "러닝", "테니스"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => addCategory(cat)}
                  className={styles.categoryButton}
                >
                  {cat}
                </button>
              )
            )}
          </div>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>운동 내용</label>
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
                onClick={() => addDetail(detail)}
                className={styles.detailButton}
              >
                {detail}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
          />
        </div>
        <div className={styles.actions}>
          <button onClick={handleSave} className={styles.saveButton}>
            저장
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
