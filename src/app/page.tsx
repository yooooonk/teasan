import Link from 'next/link'

export default function Home() {
  return (
    <div className="px-4 py-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          투자 대시보드
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          자산별, 계좌별, 종목별 비중 및 자산 변화 추이를 시각화합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/metadata"
          className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow active:scale-95"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            메타데이터 관리
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            종목 메타데이터를 추가, 수정, 삭제합니다
          </p>
        </Link>

        <Link
          href="/snapshot"
          className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow active:scale-95"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            스냅샷 입력
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            날짜별 자산 스냅샷 데이터를 입력합니다
          </p>
        </Link>

        <Link
          href="/dashboard"
          className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow active:scale-95"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            자산 목표 현황
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            목표 금액 대비 현재 자산 현황을 확인합니다
          </p>
        </Link>

        <Link
          href="/trends"
          className="block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow active:scale-95"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            자산 변화 추이
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            계좌별, 종목별 자산 변화 추이를 확인합니다
          </p>
        </Link>
      </div>
    </div>
  )
}

