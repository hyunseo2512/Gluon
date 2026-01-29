# Gluon IDE v1 - 사용 가이드

> **Gluon**: ZAGREUS AI와 통합된 Electron 기반 코드 에디터

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [설치 및 실행](#설치-및-실행)
3. [주요 기능](#주요-기능)
4. [단축키](#단축키)
5. [문제 해결](#문제-해결)
6. [기술 스택](#기술-스택)

---

## 프로젝트 개요

### 구조
```
Gluon/
├── src/
│   ├── main/           # Electron 메인 프로세스
│   │   ├── main.ts     # 앱 초기화, IPC 핸들러
│   │   └── preload.ts  # 보안 API 브리지
│   └── renderer/       # React 프론트엔드
│       ├── App.tsx     # 메인 컴포넌트
│       ├── components/ # UI 컴포넌트
│       ├── styles/     # CSS 파일
│       └── types/      # TypeScript 타입
├── dist/               # 빌드 결과물
├── public/             # 정적 파일
└── guide/              # 문서
```

### 특징
- **VS Code 스타일 레이아웃**: 익숙한 IDE 경험
- **Monaco Editor**: VS Code와 동일한 에디터 엔진
- **실제 터미널**: xterm.js + node-pty로 완전한 셸 실행
- **파일 시스템**: Electron IPC를 통한 로컬 파일 읽기/쓰기
- **Nord 테마**: 어두운 남색 기반 색상 테마
- **리사이즈 가능**: 모든 패널 크기 조절 가능

---

## 설치 및 실행

### 사전 요구사항
```bash
# Node.js 설치 (nvm 사용)
nvm install node
nvm use node

# 의존성 설치
cd Gluon
npm install
```

### 개발 모드 실행
```bash
npm run dev

# 개별 실행
npm run dev:main      # Electron 메인 프로세스 빌드
npm run dev:renderer  # Vite 개발 서버 (포트 3000)
```

### 빌드
```bash
npm run build         # 프로덕션 빌드
npm run package       # Electron 앱 패키징
```

---

## 주요 기능

### 1. 파일 탐색기 (왼쪽 패널)
- **폴더 열기**: 헤더의 "폴더 열기" 버튼 클릭
- **파일 열기**: 파일 트리에서 파일 클릭
- **디렉토리 확장**: 폴더 아이콘 클릭으로 펼치기/접기

### 2. 코드 에디터 (중앙)
- **Monaco Editor**: IntelliSense, 문법 강조, 자동완성
- **언어 감지**: 파일 확장자 기반 자동 언어 설정
- **테마**: 커스텀 어두운 남색 테마
- **미니맵**: 비활성화됨 (화면 최적화)

**지원 언어**:
- JavaScript, TypeScript, Python, Rust, Go
- Java, C, C++, HTML, CSS, JSON
- Markdown, Shell Script

### 3. AI 패널 (오른쪽)
- **ZAGREUS AI 통합** (개발 중)
- 코드 분석 및 제안
- 대화형 AI 어시스턴트

### 4. 통합 터미널 (하단)
- **실제 셸 실행**: zsh/bash 지원
- **xterm.js**: 256색상, 커서 블링크
- **입출력**: 완전한 터미널 기능

---

## 단축키

### 패널 토글
| 단축키 | 기능 | 설명 |
|--------|------|------|
| `Ctrl+B` | 사이드바 토글 | 왼쪽 파일 탐색기 숨기기/보이기 |
| `Ctrl+J` | 터미널 토글 | 하단 터미널 숨기기/보이기 |
| `Ctrl+L` | AI 패널 토글 | 오른쪽 AI 패널 숨기기/보이기 |

### 파일 작업
| 단축키 | 기능 |
|--------|------|
| `Ctrl+S` | 파일 저장 |

### 개발자 도구
| 단축키 | 기능 |
|--------|------|
| `Ctrl+Shift+I` | 개발자 도구 열기 |

### 우측 상단 버튼
- 📁 - 사이드바 토글
- 🖥️ - 터미널 토글
- 🤖 - AI 패널 토글

---

## 문제 해결

### 터미널이 작동하지 않음
**증상**: 터미널 헤더는 보이지만 내용이 없음

**해결 방법**:
1. 개발자 도구(`Ctrl+Shift+I`) → Console 탭 확인
2. 다음 로그 확인:
   ```
   === 터미널 컴포넌트 마운트 ===
   ✅ terminalRef 확인 완료
   📦 xterm 로딩 시작...
   ```
3. 에러 메시지가 있다면 기록

**알려진 이슈**:
- xterm.js 동적 로딩 실패
- Electron IPC 연결 문제
- 셸 프로세스 권한 문제

### 파일을 열 수 없음
**증상**: 파일 클릭 시 "대기 중..." 상태

**해결 방법**:
1. 개발자 도구에서 Electron API 확인:
   ```javascript
   window.electron  // 객체가 나와야 함
   ```
2. `undefined`가 나오면 preload 스크립트 문제

### Monaco Editor 로딩 실패
**증상**: CDN 차단 에러

**해결 방법**:
- `vite-plugin-monaco-editor` 플러그인 사용 중
- CSP에서 `cdn.jsdelivr.net` 허용됨
- 로컬 번들 사용으로 전환 필요 (TODO)

### 포트 충돌
**증상**: `Port 3000 is already in use`

**해결 방법**:
```bash
# 포트 정리
lsof -ti:3000 | xargs kill -9
pkill -f vite
pkill -f electron

# 재시작
npm run dev
```

---

## 기술 스택

### Frontend
- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구 (HMR 지원)
- **Monaco Editor**: VS Code 에디터 엔진
- **@monaco-editor/react**: React 래퍼

### Backend (Electron)
- **Electron**: 데스크톱 앱 프레임워크
- **Node.js**: 런타임
- **IPC**: 프로세스 간 통신

### Terminal
- **xterm.js**: 터미널 에뮬레이터
- **@xterm/addon-fit**: 화면 크기 자동 조정
- **child_process (spawn)**: 셸 프로세스 생성

### Styling
- **CSS Variables**: 테마 관리
- **Flexbox**: 레이아웃
- **커스텀 테마**: 어두운 남색 (`#1a1f2e`)

---

## 개발 상태

### ✅ 완료된 기능
- [x] Electron 앱 기본 구조
- [x] VS Code 스타일 레이아웃
- [x] 파일 시스템 통합 (읽기/쓰기)
- [x] 폴더 탐색기
- [x] Monaco Editor 통합
- [x] 커스텀 테마 적용
- [x] 리사이즈 가능한 패널
- [x] 키보드 단축키
- [x] 셸 프로세스 연결

### 🚧 진행 중
- [ ] 터미널 UI 렌더링 (xterm 초기화 문제 해결 중)
- [ ] AI 패널 ZAGREUS 백엔드 연결
- [ ] 파일 저장 피드백 UI

### 📋 계획된 기능
- [ ] 파일 트리 컨텍스트 메뉴
- [ ] 여러 파일 탭 관리
- [ ] 검색 기능
- [ ] Git 통합
- [ ] 설정 UI
- [ ] 다크/라이트 테마 전환

---

## 아키텍처

### Electron IPC 통신
```
┌─────────────┐         IPC          ┌─────────────┐
│   Renderer  │ ◄──────────────────► │    Main     │
│  (React)    │                      │  (Node.js)  │
└─────────────┘                      └─────────────┘
      │                                      │
      │ Preload Bridge                      │
      │                                      │
      ▼                                      ▼
window.electron.fs                   File System
window.electron.terminal             Shell Process
window.electron.dialog               Native Dialogs
```

### 컴포넌트 구조
```
App.tsx
├── Sidebar (좌측 액티비티 바)
├── FileExplorer (파일 탐색기)
├── Resizer (크기 조절)
├── CodeEditor (Monaco)
├── TerminalPanel (xterm)
└── AIPanel (ZAGREUS)
```

---

## 참고 자료

### 공식 문서
- [Electron 공식 문서](https://www.electronjs.org/docs/latest/)
- [React 공식 문서](https://react.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [xterm.js](https://xtermjs.org/)
- [Vite](https://vitejs.dev/)

### 프로젝트 관련
- [ZAGREUS 백엔드](../ZAGREUS/)
- [프로젝트 루트 README](../../README.md)

---

## 라이선스

이 프로젝트는 ZAGREUS AI 프로젝트의 일부입니다.

---

## 변경 이력

### v1.0.0-alpha (2026-01-22)
- 초기 프로젝트 구조 생성
- 기본 IDE 레이아웃 구현
- 파일 시스템 통합
- Monaco Editor 통합
- 터미널 통합 (개발 중)
- Nord 테마 적용
