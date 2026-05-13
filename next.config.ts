import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  /* config options here */
  // 마크다운과 MDX 파일을 포함하도록 `pageExtensions` 구성
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // 필요한 경우 여기에 다른 Next.js 설정을 추가할 수 있습니다
  images: {
    remotePatterns: [
      {
        hostname: 'picsum.photos',
      },
      {
        hostname: 'images.unsplash.com',
      },
      // 한글 주석: Notion cover가 외부/파일(S3)로 내려오는 경우가 있어 미리 허용합니다.
      {
        hostname: 's3.us-west-2.amazonaws.com',
      },
      {
        hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
      },
    ],
  },
};

const withMDX = createMDX({
  // 필요한 마크다운 플러그인을 여기에 추가하세요
});

// MDX 설정을 Next.js 설정과 병합
export default withMDX(nextConfig);
