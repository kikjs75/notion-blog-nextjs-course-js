'use client'; // 에러 경계는 반드시 클라이언트 컴포넌트여야 합니다

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  // 전역 에러 로깅 (Sentry 등 외부 서비스로 교체 가능)
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error는 html과 body 태그를 포함해야 합니다
    <html>
      <body>
        <h2>문제가 발생했습니다!</h2>
        <button onClick={() => reset()}>다시 시도</button>
      </body>
    </html>
  );
}
