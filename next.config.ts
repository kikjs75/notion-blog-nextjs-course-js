import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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

export default nextConfig;
