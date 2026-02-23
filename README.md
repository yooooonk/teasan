# 투자 대시보드

자산별, 계좌별, 종목별 비중 및 자산 변화 추이를 시각화하는 투자 대시보드 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns

## 주요 기능

1. **메타데이터 관리**: 종목 메타데이터 추가, 수정, 삭제
2. **스냅샷 입력**: 날짜별 자산 스냅샷 데이터 입력
3. **자산 목표 현황**: 목표 금액 대비 현재 자산 현황 시각화
4. **자산 변화 추이**: 계좌별, 종목별 자산 변화 추이 시각화

## 데이터 저장

JSON 파일 기반으로 데이터를 관리합니다:
- `src/data/metadata.json`: 종목 메타데이터
- `src/data/snapshots.json`: 스냅샷 데이터

## 보안 (단일 비밀번호)

배포 URL을 비밀번호로 보호합니다. `.env.local`(로컬) 및 Vercel 환경 변수(배포)에 다음을 설정하세요.

| 변수 | 설명 |
|------|------|
| `APP_PASSWORD` | 로그인 시 입력할 비밀번호 |
| `AUTH_SECRET` | 쿠키 검증용 비밀 문자열 (예: `openssl rand -hex 32`로 생성) |

- 비밀번호가 맞으면 30일간 유효한 쿠키가 설정되어 재로그인 없이 이용할 수 있습니다.
- 대시보드 우측 상단 **로그아웃**으로 세션을 끝낼 수 있습니다.

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

