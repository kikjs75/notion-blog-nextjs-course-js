export interface TagFilterItem {
  id: string;
  name: string;
  count: number;
}

export interface Post {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  date?: string;
  /** 마지막 수정 시각 (ISO 문자열, Notion `last_edited_time`) */
  modifiedDate: string;
  slug: string;
}
