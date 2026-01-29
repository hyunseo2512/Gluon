# Gluon - AI-Powered IDE

> Quark와 통합된 Electron 기반 AI 개발 환경

---

## 📋 개요

Gluon는 Quark AI 백엔드와 통합된 Electron 기반 IDE입니다.
실시간 AI 채팅, 코드 에디터, 터미널을 하나의 통합 환경에서 제공합니다.

### 주요 기능

- 🤖 **AI 채팅** - Quark와 실시간 대화
- 📝 **코드 에디터** - Monaco Editor 기반 (VS Code와 동일한 엔진)
- 🖥️ **터미널** - 통합 터미널 (시뮬레이션)
- 🎨 **모던 UI** - VS Code 스타일의 다크 테마
- ⚡ **빠른 성능** - Vite 기반 개발 환경

---

## 🚀 Quick Start

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 모드 실행

```bash
# Vite 개발 서버와 Electron 동시 실행
npm run dev

# 또는 각각 실행
npm run dev:renderer  # Vite 개발 서버 (포트 3000)
npm run dev:main      # Electron 앱
```

### 3. 프로덕션 빌드

```bash
npm run build       # 빌드
npm run package     # 배포용 패키징
```

---

## 🛠️ 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Monaco Editor** - 코드 에디터
- **Axios** - HTTP 클라이언트

### Desktop
- **Electron 28** - 데스크톱 앱 프레임워크
- **Electron Builder** - 패키징

### Dev Tools
- **ESLint** - 코드 품질
- **Prettier** - 코드 포맷팅
- **Concurrently** - 병렬 스크립트 실행

---

## 📂 프로젝트 구조

```
Gluon/
├── src/
│   ├── main/                 # Electron 메인 프로세스
│   │   ├── main.ts          # 메인 진입점
│   │   └── preload.ts       # Preload 스크립트
│   │
│   └── renderer/            # React 렌더러 프로세스
│       ├── components/      # UI 컴포넌트
│       │   ├── ChatPanel.tsx
│       │   ├── CodeEditor.tsx
│       │   └── TerminalPanel.tsx
│       ├── services/        # API 레이어
│       │   └── api.ts
│       ├── styles/          # CSS 파일
│       ├── types/           # TypeScript 타입
│       ├── App.tsx          # 메인 앱 컴포넌트
│       ├── main.tsx         # React 진입점
│       └── index.html       # HTML 템플릿
│
├── dist/                    # 빌드 출력
├── package.json
├── tsconfig.json
├── tsconfig.main.json
└── vite.config.ts
```

---

## 🔗 Quark 연동

Gluon는 Quark API와 통신하여 AI 기능을 제공합니다.

### API 엔드포인트

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/chat` | POST | LLM 채팅 |
| `/vision/analyze-base64` | POST | 이미지 분석 |
| `/models/list` | GET | 모델 목록 |
| `/health` | GET | 서버 상태 |

### 연결 설정

기본적으로 `http://localhost:8000`에 연결됩니다.
다른 주소로 변경하려면 `src/renderer/services/api.ts`를 수정하세요.

```typescript
// src/renderer/services/api.ts
export const quarkApi = new QuarkApi('http://your-server:8000');
```

---

## 🎨 사용 가능한 모델

- **QUARK-PRO** (DeepSeek-R1:8b) - 논리 추론 & 코딩
- **QUARK-THINK** (Llama-3.3:8b) - 범용 대화
- **QUARK-FLASH** (CodeQwen:7b) - 하드코어 코딩

---

## 🔧 개발 가이드

### 개발 모드

개발 모드에서는 Hot Module Replacement(HMR)가 활성화되어
코드 변경 시 자동으로 리로드됩니다.

```bash
npm run dev
```

### 코드 품질

```bash
# ESLint 검사
npm run lint

# Prettier 포맷팅
npm run format
```

### 빌드 및 패키징

```bash
# TypeScript 컴파일 + Vite 빌드
npm run build

# Electron 앱 패키징 (Linux AppImage)
npm run package
```

---

## 📝 향후 개발 계획

### Phase 1 (완료)
- [x] 기본 프로젝트 구조
- [x] Electron + React + TypeScript 설정
- [x] Quark API 연동
- [x] 채팅 UI
- [x] 코드 에디터 (Monaco)
- [x] 터미널 시뮬레이션

### Phase 2 (예정)
- [ ] 실제 터미널 통합 (xterm.js)
- [ ] 파일 탐색기
- [ ] 이미지 분석 UI
- [ ] 설정 패널
- [ ] 단축키 지원

### Phase 3 (예정)
- [ ] 멀티탭/분할 화면
- [ ] Git 통합
- [ ] 플러그인 시스템
- [ ] 테마 커스터마이징

---

## ⚙️ 환경 변수

현재는 환경 변수를 사용하지 않지만, 추후 다음을 지원할 예정:

```env
QUARK_API_URL=http://localhost:8000
QUARK_DEFAULT_MODEL=QUARK-PRO
```

---

## 🐛 문제 해결

### Quark 서버에 연결되지 않음
1. Quark 서버가 실행 중인지 확인
   ```bash
   cd ../Quark
   python run.py serve
   ```
2. 브라우저에서 http://localhost:8000/health 접속 확인

### Electron이 시작되지 않음
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 개발 서버 포트 충돌
`vite.config.ts`에서 포트 변경:
```typescript
server: {
  port: 3001,  // 원하는 포트로 변경
}
```

---

## 📄 라이선스

MIT

---

## 👥 기여

개인 프로젝트 (현재)

---

## 📧 관련 프로젝트

- [Quark](../Quark) - AI 백엔드 서버
- [ai-quark](../) - 통합 프로젝트 루트
