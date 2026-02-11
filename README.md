# Gluon - AI 기반 IDE (Quark 연동)

> **AI 통합 모던 개발 환경** (Electron + React + Quark Backend)

Gluon은 **로컬 LLM 엔진**과 완벽하게 통합된 차세대 IDE입니다. VS Code 수준의 사용자 경험을 제공하며 실시간 AI 채팅, 코드 분석, 스마트 터미널 통합 등 강력한 AI 기능을 지원합니다.

---

## 핵심 기능

### 심층 AI 통합
- **실시간 채팅**: Quark AI(DeepSeek, Llama 3)와 직접 대화
- **문맥 인식**: 현재 파일 내용 및 프로젝트 문맥 분석
- **코드 생성**: 지능형 코드 제안 및 리팩토링

### 최신 개발 도구
- **Monaco Editor**: VS Code와 동일한 강력한 코드 작성 경험
- **스마트 터미널**: `pty` 기반의 완벽한 쉘 통합 환경 제공
- **파일 탐색기**: 
  - 생성, 읽기, 수정, 삭제(CRUD) 지원
  - 드래그 앤 드롭 지원
  - 파일 아이콘 및 상태 표시
- **Git 통합**: 변경 사항 확인, 스테이징, 커밋 기능 제공
- **SSH 원격 접속**: 원격 서버 접속 및 직접 파일 수정 지원

### 사용자 경험 (UX)
- **글래스모피즘 UI**: 세련된 현대적 다크 테마 및 투명 효과
- **분할 보기**: 유연한 화면 및 레이아웃 관리
- **명령 팔레트**: `Ctrl+Shift+P`를 통한 모든 기능 빠른 실행

---

## 시작하기

### 필요 조건
- Node.js 18 이상
- Python 3.10 이상 (Quark 백엔드용)

### 1. 설치
```bash
# 의존성 설치
npm install
```

### 2. 개발 모드 실행
Vite 렌더러와 Electron 메인 프로세스를 동시에 실행합니다:
```bash
npm run dev
```
또는 두 개의 터미널에서 각각 실행할 수도 있습니다:
```bash
npm run dev:renderer  # 포트 5173
npm run dev:main      # Electron 앱
```

### 3. 빌드 및 패키징 (Linux)
`.deb` 및 `.AppImage` 설치 파일을 생성합니다:
```bash
# TypeScript 및 Vite 프로젝트 빌드
npm run build

# Linux용 패키징 (출력 경로: release/)
npm run package
```

---

## 단축키

| 단축키 | 설명 |
|--------|-----|
| `Ctrl + \`` | 터미널 패널 열기/닫기 |
| `Ctrl + W` | 현재 탭/창 닫기 (스마트 닫기) |
| `Ctrl + ,` | 설정 열기 |
| `Ctrl + Shift + P` | 명령 팔레트 열기 |
| `Ctrl + Arrows` | 분할 창 간 이동 |
| `Ctrl + S` | 현재 파일 저장 |

---

## 기술 스택

- **Core**: Electron 28, React 18, TypeScript
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Terminal**: xterm.js, node-pty
- **Styling**: TailwindCSS, CSS Modules
- **State**: Zustand (Store)
- **Build**: Vite, Electron Builder

---

## 로드맵 및 상태

### 완료됨 (Phase 1)
- [x] 프로젝트 아키텍처 (Electron + React + TS)
- [x] Quark AI API 통합
- [x] 파일 탐색기 (CRUD, 드래그 앤 드롭)
- [x] 통합 터미널 (pty)
- [x] 기본 Git 통합
- [x] SSH 원격 접속 UI

### 진행 중 (Phase 2)
- [ ] 고급 Git 기능 (Diff 보기, 브랜치 관리)
- [ ] 확장 시스템 (Extensions)
- [ ] 디버거 프로토콜 통합
- [ ] 테마 커스터마이징

---

## 관련 프로젝트
- **[Quark](../Quark)**: Gluon의 핵심인 AI 백엔드 서버

---

## 라이선스
MIT
