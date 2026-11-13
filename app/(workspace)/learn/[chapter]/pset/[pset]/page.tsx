import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPSet } from "@/lib/curriculum";
import { getLessonTests, lessonTestKey } from "@/lib/lesson-tests";
import { getPSetTests, psetKey } from "@/lib/server/psets";
import { Workspace } from "@/components/workspace/Workspace";

type PSetPageProps = {
  params: Promise<{ chapter: string; pset: string }>;
};

export async function generateMetadata({
  params,
}: PSetPageProps): Promise<Metadata> {
  const { chapter, pset } = await params;
  const data = getPSet(chapter, pset);
  return {
    title: data ? `P-Set ${data.chapter.number} · ${data.pset.title}` : "P-Set",
  };
}

export default async function PSetPage({ params }: PSetPageProps) {
  const { chapter, pset } = await params;
  const data = getPSet(chapter, pset);
  if (!data) notFound();

  const authored = getLessonTests(lessonTestKey(data.chapter.slug, data.pset.slug));
  const hidden = getPSetTests(psetKey(data.chapter.slug, data.pset.slug));

  return (
    <Workspace
      mode="pset"
      key={`${data.chapter.slug}:${data.pset.slug}`}
      chapter={data.chapter}
      item={data.pset}
      backHref={`/learn/${data.chapter.slug}`}
      breadcrumb={`Ch ${data.chapter.number} · P-Set ${data.pset.title}`}
      itemKey={`${data.chapter.slug}:${data.pset.slug}`}
      testNames={hidden?.testNames}
      initialFiles={authored?.starter}
      gradeTarget={{ chapterSlug: data.chapter.slug, psetSlug: data.pset.slug }}
    />
  );
}