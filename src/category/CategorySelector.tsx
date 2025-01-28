import React from "react";
import styles from "./CategorySelector.module.css";

type CategorySelectorProps = {
  categories: string[];
  onSelect: (category: string) => void;
  selectedCategory: string;
};

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onSelect,
  selectedCategory,
}) => {
  return (
    <div className={styles.container}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`${styles.categoryButton} ${
            selectedCategory === category ? styles.active : ""
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;
