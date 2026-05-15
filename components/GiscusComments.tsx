'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export default function GiscusComments() {
  const { theme } = useTheme();
  return (
    <Giscus
      repo="kikjs75/notion-blog-nextjs-giscus"
      repoId="R_kgDOSeOStQ"
      category="Announcements"
      categoryId="DIC_kwDOSeOStc4C9G54"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'dark' ? 'dark' : 'light'}
      lang="ko"
      loading="lazy"
    />
  );
}

/*
<script src="https://giscus.app/client.js"
        data-repo="kikjs75/notion-blog-nextjs-giscus"
        data-repo-id="R_kgDOSeOStQ"
        data-category="Announcements"
        data-category-id="DIC_kwDOSeOStc4C9G54"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="preferred_color_scheme"
        data-lang="ko"
        crossorigin="anonymous"
        async>
</script>
*/
