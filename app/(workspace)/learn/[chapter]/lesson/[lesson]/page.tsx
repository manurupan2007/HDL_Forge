import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/curriculum";
import { getLessonTests, lessonTestKey } from "@/lib/lesson-tests";
import { Workspace } from "@/components/workspace/Workspace";

type LessonPageProps = {
  params: Promise<{ chapter: string; lesson: string }>;
};

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { chapter, lesson } = await params;
  const data = getLesson(chapter, lesson);
  return {
    title: data ? `Lesson ${data.chapter.number} · ${data.lesson.title}` : "Lesson",
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { chapter, lesson } = await params;
  const data = getLesson(chapter, lesson);
  if (!data) notFound();

  const spec = getLessonTests(lessonTestKey(data.chapter.slug, data.lesson.slug));

  return (
    <Workspace
      mode="lesson"
      key={`${data.chapter.slug}:${data.lesson.slug}`}
      chapter={data.chapter}
      item={data.lesson}
      backHref={`/learn/${data.chapter.slug}`}
      breadcrumb={`Ch ${data.chapter.number} · ${data.chapter.title} — ${data.lesson.title}`}
      itemKey={`${data.chapter.slug}:${data.lesson.slug}`}
      testNames={spec?.tests}
      bench={spec?.tb}
      initialFiles={spec?.starter}
    />
  );
}