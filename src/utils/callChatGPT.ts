import axios from "axios";

// 환경 변수에서 OpenAI API 키 가져오기
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

if (!API_KEY) {
  console.error("OpenAI API 키가 설정되지 않았습니다.");
  throw new Error("환경 변수 REACT_APP_OPENAI_API_KEY가 필요합니다.");
}

const callChatGPT = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // 사용할 모델
        messages: [
          { role: "system", content: "운동 추천 전문가로 활동해주세요." },
          { role: "user", content: prompt }, // 사용자 입력
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`, // 올바른 키 삽입
        },
      }
    );

    // OpenAI 응답에서 결과 추출
    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error("ChatGPT API 호출 오류:", error.message);
    console.error(
      "에러 응답 데이터:",
      error.response?.data || "응답 데이터 없음"
    );
    console.error(
      "에러 상태 코드:",
      error.response?.status || "상태 코드 없음"
    );
    throw new Error("ChatGPT API 호출에 실패했습니다.");
  }
};

export default callChatGPT;
