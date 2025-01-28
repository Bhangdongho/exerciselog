import React, { useEffect, useState } from "react";
import callChatGPT from "../utils/callChatGPT";
import { appFireStore } from "../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import useAuthContext from "../hooks/useAuthContext";
import styles from "./Analysis.module.css";

const Analysis: React.FC = () => {
  const { user } = useAuthContext();
  const [summary, setSummary] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const fetchAndAnalyzeLogs = async () => {
      try {
        const ref = collection(appFireStore, "workouts");
        const q = query(ref, where("userId", "==", user.uid), orderBy("date"));

        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map((doc) => doc.data());

        const promptSummary = `다음 운동 기록을 요약해줘:\n${JSON.stringify(
          logs.slice(-5)
        )}`;
        const promptAnalysis = `이 운동 기록을 분석하고 개선점을 알려줘:\n${JSON.stringify(
          logs
        )}`;

        const [summaryResult, analysisResult] = await Promise.all([
          callChatGPT(promptSummary),
          callChatGPT(promptAnalysis),
        ]);

        setSummary(summaryResult);
        setAnalysis(analysisResult);
      } catch (error) {
        console.error("Error fetching or analyzing logs:", error);
      }
    };

    fetchAndAnalyzeLogs();
  }, [user]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>운동 기록 분석</h1>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>운동 기록 요약</h2>
        <p className={styles.sectionContent}>
          {summary || "요약을 불러오는 중..."}
        </p>
      </div>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>운동 기록 분석</h2>
        <p className={styles.sectionContent}>
          {analysis || "분석을 불러오는 중..."}
        </p>
      </div>
    </div>
  );
};

export default Analysis;
