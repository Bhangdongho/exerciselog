import React from "react";
import styles from "./DetailSelector.module.css";

type DetailSelectorProps = {
  details: string[];
  onSelect: (detail: string) => void;
  selectedDetail: string;
};

const DetailSelector: React.FC<DetailSelectorProps> = ({
  details,
  onSelect,
  selectedDetail,
}) => {
  return (
    <div className={styles.container}>
      {details.map((detail) => (
        <button
          key={detail}
          onClick={() => onSelect(detail)}
          className={`${styles.detailButton} ${
            selectedDetail === detail ? styles.active : ""
          }`}
        >
          {detail}
        </button>
      ))}
    </div>
  );
};

export default DetailSelector;
