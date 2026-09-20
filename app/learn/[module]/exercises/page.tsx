import type { Metadata } from "next";
import { ModuleDocPage } from "@/components/course/ModuleDocPage";

export const metadata: Metadata = { title: "Exercises" };

export default async function Page({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  return <ModuleDocPage moduleSlug={moduleSlug} kind="exercises" />;
}
