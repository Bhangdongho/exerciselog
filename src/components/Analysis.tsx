import React, { useEffect, useState } from "react";
import callChatGPT from "../utils/callChatGPT";
import { appFireStore } from "../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import useAuthContext from "../hooks/useAuthContext";
import styles from "./Analysis.module.css";

const Analysis: React.FC = () => {
  const { user } = useAuthContext();
  const [summary, setSummary] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;

    const fetchAndAnalyzeLogs = async () => {
      try {
        const ref = collection(appFireStore, "workouts");
        const q = query(ref, where("userId", "==", user.uid), orderBy("date"));

        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map((doc) => doc.data());

        const promptSummary = `다음 운동 기록을 요약해줘. 가독성을 위해 각 요약 내용을 개행하여 JSON 배열 형태로 만들어줘:\n${JSON.stringify(
          logs.slice(-5)
        )}`;
        const promptAnalysis = `이 운동 기록을 분석하고 개선점을 알려줘. 가독성을 위해 각 분석 내용을 개행하여 JSON 배열 형태로 만들어줘:\n${JSON.stringify(
          logs
        )}`;

        const [summaryResult, analysisResult] = await Promise.all([
          callChatGPT(promptSummary),
          callChatGPT(promptAnalysis),
        ]);

        setSummary(JSON.parse(summaryResult));
        setAnalysis(JSON.parse(analysisResult));
      } catch (error) {
        console.error("Error fetching or analyzing logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndAnalyzeLogs();
  }, [user]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>운동 기록 분석</h1>
      {loading ? (
        <p className={styles.loading}>분석 중입니다... 잠시만 기다려 주세요.</p>
      ) : (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>운동 기록 요약</h2>
            {summary.length > 0 ? (
              <ul className={styles.list}>
                {summary.map((item, index) => (
                  <li key={index} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noData}>요약할 운동 기록이 없습니다.</p>
            )}
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>운동 기록 분석</h2>
            {analysis.length > 0 ? (
              <ul className={styles.list}>
                {analysis.map((item, index) => (
                  <li key={index} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noData}>분석할 운동 기록이 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;
