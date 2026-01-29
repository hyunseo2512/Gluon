/**
 * 공통 SVG 아이콘 컴포넌트
 */

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}



// 전송 아이콘


// 로딩 아이콘
export const LoaderIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ animation: 'spin 1s linear infinite' }}
  >
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

// 터미널 아이콘
export const TerminalIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);

// 플러스 아이콘 (탭 추가용)
export const PlusCircleIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

// X 아이콘 (탭 닫기용)
export const XIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// 줌 확대 아이콘
export const ZoomInIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

// 플러스 아이콘
export const PlusIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// 마이너스 아이콘
export const MinusIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// 초기화(Reset) 아이콘
// 초기화(Reset) 아이콘 (Undo)
export const RotateCcwIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="1 4 1 10 7 10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
);

// 재실행(Redo) 아이콘
export const RotateCwIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

// 원격 창 아이콘
export const RemoteIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 6l6 6-6 6"></path>
    <path d="M9 18l-6-6 6-6"></path>
  </svg>
);

// Activity 아이콘 (bi-activity)
export const ActivityIcon = ({ size = 16, className = '', style = {} }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    className={`bi bi-activity ${className}`}
    viewBox="0 0 16 16"
    style={style}
  >
    <path fillRule="evenodd" d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2" />
  </svg>
);


// 왼쪽 사이드바 토글 아이콘
export const SidebarLeftIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="3" x2="9" y2="21"></line>
  </svg>
);

// 하단 패널 토글 아이콘
export const LayoutBottomIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="15" x2="21" y2="15"></line>
  </svg>
);

// 오른쪽 사이드바(AI 패널) 토글 아이콘
export const SidebarRightIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="15" y1="3" x2="15" y2="21"></line>
  </svg>
);

// 종이클립(첨부) 아이콘
export const PaperclipIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

// 마이크 아이콘
export const MicIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

// 히스토리(시계) 아이콘
export const HistoryIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
// 위쪽 화살표 (최대화)
export const ChevronUpIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

// 아래쪽 화살표 (복원/최소화)
export const ChevronDownIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// 왼쪽 화살표
export const ChevronLeftIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

// 오른쪽 화살표
export const ChevronRightIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// Import Simple Icons
import {
  siJavascript,
  siTypescript,
  siPython,
  siReact,
  siHtml5,
  siCss,
  siGit,
  siOpenjdk,
  siGithub,
  siGradle,
  siGnubash,
  siJson,
  siMarkdown,
} from 'simple-icons/icons';

// Import Material Design Icons
import {
  MdFolder,
  MdFolderOpen,
  MdInsertDriveFile,
  MdDescription,
  MdCreateNewFolder,
  MdNoteAdd,
  MdRefresh,
  MdArrowUpward,
  MdArrowDownward,
  MdClose,
  MdAdd,
  MdRemove,
  MdSearch,
  MdSettings,
  MdSend,
  MdOutlineBugReport,
  MdPlayArrow,
  MdHome,
  MdDelete,
  MdPerson,
  MdCloudUpload,
  MdCloudDownload,
  MdExtension,
} from 'react-icons/md';

// --- Simple Icons Helper ---
const SimpleIcon = ({ icon, size = 16, className = '', color }: IconProps & { icon: any, color?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill={color || `#${icon.hex}`}
    style={{ display: 'block' }} // Prevent layout shifts
  >
    <path d={icon.path} />
  </svg>
);

// --- Material Icons Helper ---
const MatIcon = ({ Icon, size = 16, className = '', color, style }: IconProps & { Icon: any, color?: string }) => (
  <Icon size={size} className={className} color={color} style={style} />
);

// 깃허브 아이콘
export const GithubIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siGithub} size={size} className={className} color="currentColor" />
);

// Git 아이콘 (사이드바용)
export const GitIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siGit} size={size} className={className} color="currentColor" />
);

// 전송 아이콘
export const SendIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdSend} size={size} className={className} />
);

// 파일 아이콘
export const FileIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdInsertDriveFile} size={size} className={className} />
);

// 폴더 닫힘 아이콘 (Modern)
export const FolderIcon = ({ size = 16, className = '', color }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color || "#3B82F6"}
    className={className}
    style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
  >
    <path d="M4 4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4H4Z" />
  </svg>
);

// 폴더 열림 아이콘 (Modern)
export const FolderOpenIcon = ({ size = 16, className = '', color }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
  >
    <path d="M4 4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6H12L10 4H4Z" fill={color || "#3B82F6"} opacity="0.4" />
    <path d="M22 8.5L20 18H5L7 8.5H22Z" fill={color || "#60A5FA"} />
  </svg>
);

// 텍스트 파일 아이콘
export const TxtIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdDescription} size={size} className={className} />
);

// 검색 아이콘
export const SearchIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdSearch} size={size} className={className} />
);

// 설정 아이콘
export const SettingsIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdSettings} size={size} className={className} />
);

// 새 파일 아이콘
export const FilePlusIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdNoteAdd} size={size} className={className} />
);

// 새 폴더 아이콘
export const FolderPlusIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdCreateNewFolder} size={size} className={className} />
);

// 업로드 아이콘
export const UploadIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdCloudUpload} size={size} className={className} />
);

// 다운로드 아이콘
export const DownloadIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdCloudDownload} size={size} className={className} />
);

// Extensions 아이콘
export const ExtensionsIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdExtension} size={size} className={className} />
);

// 사용자 아이콘
export const UserIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdPerson} size={size} className={className} />
);

// HTML 아이콘
export const HtmlIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siHtml5} size={size} className={className} />
);

// CSS 아이콘
export const CssIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siCss} size={size} className={className} />
);

// JS 아이콘
export const JsIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siJavascript} size={size} className={className} />
);

// TS 아이콘
export const TsIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siTypescript} size={size} className={className} />
);

// JSX 아이콘
export const JsxIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siReact} size={size} className={className} color="#61DAFB" />
);

// TSX 아이콘
export const TsxIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siReact} size={size} className={className} color="#3178C6" />
);

// Python 아이콘
export const PyIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siPython} size={size} className={className} />
);

// Java Icon (Coffee Cup)
export const JavaIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#EA2D2E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
    <line x1="6" y1="1" x2="6" y2="4"></line>
    <line x1="10" y1="1" x2="10" y2="4"></line>
    <line x1="14" y1="1" x2="14" y2="4"></line>
  </svg>
);

// Bash/Shell Icon
export const BashIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siGnubash} size={size} className={className} />
);

// JSON Icon (Neon Green)
export const JsonIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siJson} size={size} className={className} color="#00E676" />
);

// Markdown Icon
export const MdIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siMarkdown} size={size} className={className} color="#E3E3E3" />
);


// C 아이콘
export const CIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#5e97d0"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <text x="8" y="16" fontSize="12" fontWeight="bold" fill="currentColor" stroke="none">C</text>
  </svg>
);

// C++ 아이콘
export const CppIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#5e97d0"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <text x="3.5" y="15" fontSize="9" fontWeight="bold" fill="currentColor" stroke="none">C++</text>
  </svg>
);

// 사용되지 않는 구형 MarkdownIcon 제거됨



// Git/Gitignore 아이콘
export const GitIgnoreIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#f34f29"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="8" y1="8" x2="16" y2="16" />
  </svg>
);

// Gradle 아이콘
export const GradleIcon = ({ size = 16, className = '' }: IconProps) => (
  <SimpleIcon icon={siGradle} size={size} className={className} color="#02303A" />
);

// XML 아이콘
export const XmlIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e34c26"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="8 8 4 12 8 16" />
    <polyline points="16 8 20 12 16 16" />
    <line x1="14" y1="4" x2="10" y2="20" />
  </svg>
);

// SVG 아이콘
export const SvgIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffb13b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

// PNG/Image 아이콘
export const PngIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#b957ce"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

// React 아이콘
export const ReactIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#61dafb"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="2" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);



// 에러 아이콘 (원형 X)
export const ErrorIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#f48771"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

// 경고 아이콘 (삼각형 느낌표)
export const WarningIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#cca700"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

/**
 * 파일명에 따라 적절한 아이콘 컴포넌트를 반환하는 헬퍼 함수
 */
export const getIconForFile = (filename: string, size: number = 16) => {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (filename.toLowerCase().includes('gradle')) {
    return <GradleIcon size={size} />;
  }

  switch (ext) {
    case 'html':
    case 'htm':
      return <HtmlIcon size={size} />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <CssIcon size={size} />;
    case 'js':
    case 'mjs':
    case 'cjs':
      return <JsIcon size={size} />;
    case 'ts':
      return <TsIcon size={size} />;
    case 'tsx':
      return <TsxIcon size={size} />;
    case 'jsx':
      return <JsxIcon size={size} />;
    case 'py':
    case 'pyc':
    case 'pyd':
      return <PyIcon size={size} />;
    case 'java':
    case 'jar':
    case 'class':
      return <JavaIcon size={size} />;
    case 'c':
    case 'h':
      return <CIcon size={size} />;
    case 'cpp':
    case 'hpp':
    case 'cc':
    case 'hh':
      return <CppIcon size={size} />;
    case 'json':
      return <JsonIcon size={size} />;
    case 'xml':
    case 'yml':
    case 'yaml':
      return <XmlIcon size={size} />;
    case 'svg':
      return <SvgIcon size={size} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'ico':
    case 'webp':
      return <PngIcon size={size} />;
    case 'md':
    case 'markdown':
      return <MdIcon size={size} />;
    case 'txt':
    case 'text':
    case 'log':
      return <TxtIcon size={size} />;
    case 'gitignore':
    case 'gitattributes':
    case 'gitmodules':
    case 'gitkeep':
      return <GitIgnoreIcon size={size} />;
    default:
      return <FileIcon size={size} />;
  }
};
// 채팅 아이콘 (Ask 모드)
export const ChatBubbleIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

// 벌레 아이콘 (Debug 모드)
export const BugIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdOutlineBugReport} size={size} className={className} />
);

// 무한 아이콘 (Agent 모드)
export const InfinityIcon = ({ size = 16, className = '' }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"></path>
  </svg>
);


// 재생 아이콘 (Run)
export const PlayIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdPlayArrow} size={size} className={className} />
);

// 홈 아이콘 (Welcome)
export const HomeIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdHome} size={size} className={className} />
);

// 업데이트 아이콘
export const UpdateIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdRefresh} size={size} className={className} />
);

// 휴지통 아이콘 (Delete)
export const TrashIcon = ({ size = 16, className = '' }: IconProps) => (
  <MatIcon Icon={MdDelete} size={size} className={className} />
);

