'use client';

import { useSearchParams } from 'next/navigation';

/**
 * global-error.js 테스트용 컴포넌트
 * 사용법 (프로덕션): npm run build && npm run start 후
 *   http://localhost:3000/?crash=global
 */
export default function GlobalErrorTrigger() {
  const searchParams = useSearchParams();

  if (searchParams.get('crash') === 'global') {
    throw new Error('global-error 테스트');
  }

  return null;
}
