'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SortSelect() {
  console.log('SortSelect!!!');
  console.log('NEXT_PUBLIC_CLIENT: ', process.env.NEXT_PUBLIC_CLIENT);
  console.log('CLIENT: ', process.env.CLIENT);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'latest';
  const currentTag = searchParams.get('tag') || '';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams();
    if (currentTag) params.set('tag', currentTag);
    if (value !== 'latest') params.set('sort', value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select defaultValue={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="정렬 방식 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">최신순</SelectItem>
        <SelectItem value="oldest">오래된순</SelectItem>
      </SelectContent>
    </Select>
  );
}
