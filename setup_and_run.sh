#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Gluon 설정 및 실행 스크립트를 시작합니다...${NC}"

# 1. NVM 설치 확인 및 설치
if [ -d "$HOME/.nvm" ]; then
    echo -e "${GREEN}NVM이 이미 설치되어 있습니다.${NC}"
else
    echo -e "${GREEN}NVM을 설치합니다...${NC}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

# NVM 로드
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# 2. Node.js LTS 설치
echo -e "${GREEN}Node.js LTS 버전을 설치하고 사용합니다...${NC}"
nvm install --lts
nvm use --lts

# 3. 의존성 설치
echo -e "${GREEN}프로젝트 의존성을 설치합니다...${NC}"
npm install

# 4. 개발 서버 실행
echo -e "${GREEN}개발 서버를 실행합니다...${NC}"
npm run dev
