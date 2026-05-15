'use server';

import { createPost } from '@/lib/notion';
import { revalidateTag } from 'next/cache';
// import { revalidatePath, revalidateTag } from 'next/cache';
// import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getPublishedPosts } from '@/lib/notion';

const postSchema = z.object({
  title: z.string().min(1, { message: '제목을 입력해주세요.' }),
  tag: z.string().min(1, { message: '태그를 입력해주세요.' }),
  content: z.string().min(10, { message: '내용을 최소 10자 이상 입력해주세요.' }),
});

export interface PostFormData {
  title: string;
  tag: string;
  content: string;
}

export interface PostFormState {
  message: string;
  errors?: {
    title?: string[];
    tag?: string[];
    content?: string[];
  };
  formData?: PostFormData;
  success?: boolean;
}

export async function createPostAction(previousState: PostFormState, formData: FormData) {
  // const title = formData.get('title') as string;
  // const tag = formData.get('tag') as string;
  // const content = formData.get('content') as string;
  // await createPost({ title, tag, content });

  // const { title, tag, content } = Object.fromEntries(formData);

  const rawFormData = {
    title: formData.get('title') as string,
    tag: formData.get('tag') as string,
    content: formData.get('content') as string,
  };

  const validatedFields = postSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: '유효성 검사에 실패했습니다.',
      errors: validatedFields.error.flatten().fieldErrors,
      formData: rawFormData,
    };
  }

  try {
    const { title, tag, content } = validatedFields.data;
    await createPost({ title: title, tag: tag, content: content });
    revalidateTag('posts');
    return {
      message: '블로그 포스트가 성공적으로 생성되었습니다.',
      success: true,
    };
  } catch (err) {
    return {
      message: '블로그 포스트 생성에 실패했습니다.',
      formData: rawFormData,
    };
  }
  // revalidatePath('/');
  // redirect('/');
}

export async function getPosts(
  tag?: string,
  sort?: string,
  startCursor?: string,
  pageSize?: number
) {
  const posts = await getPublishedPosts({ tag, sort, startCursor, pageSize });
  return posts;
}
