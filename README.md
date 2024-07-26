# 득근득근 프로젝트 (Exercise Log)

## 프로젝트 개요

득근득근 프로젝트는 사용자가 자신의 운동 계획과 기록을 관리할 수 있는 애플리케이션입니다. 이 애플리케이션은 사용자 인증 및 데이터 저장을 위해 Firebase를 사용하며, 운동 계획 및 활동 기록을 효율적으로 관리할 수 있도록 돕습니다.

## 주요 기능

- **오늘의 운동 계획**: 현재 날짜에 해당하는 운동 계획을 조회하고 표시합니다.
- **최근 활동**: 최근 5개의 운동 활동을 확인할 수 있습니다.
- **운동 계획 추가**: 사용자가 새로운 운동 계획을 추가할 수 있는 기능을 제공합니다.

## 기술 스택

- **프론트엔드**: React, TypeScript
- **백엔드**: Firebase Firestore
- **날짜 처리**: Moment.js

## 설치 및 실행 방법

1. **프로젝트 클론하기**:

   ```bash
   git clone https://github.com/yourusername/exercise-log.git
   cd exercise-log
   ```

2. **의존성 설치하기**:

   ```bash
   npm install
   ```

3. **환경 변수 설정**:

   - Firebase 프로젝트 설정을 위해 `.env` 파일에 Firebase 구성 값을 추가합니다.
   - `.env` 예시:
     ```env
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     ```

4. **로컬 서버 실행하기**:
   ```bash
   npm start
   ```

## 기능 설명

### 오늘의 운동 계획

홈 화면에서 오늘의 운동 계획을 조회할 수 있습니다. 오늘 날짜에 해당하는 운동 계획이 Firestore에서 자동으로 불러와집니다.

**코드 예시**:

```javascript
const todayQuery = query(
  ref,
  where("userId", "==", user.uid),
  where("date", "==", moment().startOf("day").toDate())
);
```

### 최근 활동

홈 화면에서 최근 5개의 운동 활동을 조회할 수 있습니다. 사용자는 최근 활동을 통해 운동 기록을 빠르게 확인할 수 있습니다.

**코드 예시**:

```javascript
const recentQuery = query(
  ref,
  where("userId", "==", user.uid),
  orderBy("date", "desc"),
  limit(5)
);
```

### 운동 계획 추가

운동 계획 추가 페이지로 이동할 수 있는 링크를 제공합니다. 이 페이지에서는 새로운 운동 계획을 입력하고 저장할 수 있습니다.

**코드 예시**:

```javascript
<Link to="/workout-log" className={styles.button}>
  운동 계획 추가
</Link>
```
