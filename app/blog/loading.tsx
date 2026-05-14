import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function TagSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-16" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PostCardSkeleton({ hasCoverImage }: { hasCoverImage?: boolean }) {
  return (
    <Card className="overflow-hidden">
      {hasCoverImage && <Skeleton className="aspect-[2/1] w-full rounded-none" />}
      <CardContent className="p-6">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-6 flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSectionSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-[152px] w-[152px] rounded-full" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

function ContactSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-16" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-lg p-3">
              <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="grid grid-cols-[200px_1fr_220px] gap-6">
        {/* 좌측 사이드바 */}
        <aside>
          <TagSectionSkeleton />
        </aside>

        {/* 메인 컨텐츠 */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-[180px]" />
          </div>
          <div className="grid gap-4">
            <PostCardSkeleton />
            <PostCardSkeleton hasCoverImage />
            <PostCardSkeleton hasCoverImage />
          </div>
        </div>

        {/* 우측 사이드바 */}
        <aside className="flex flex-col gap-6">
          <ProfileSectionSkeleton />
          <ContactSectionSkeleton />
        </aside>
      </div>
    </div>
  );
}
