import { studentProof } from "@/lib/course-data";

type StudentCountFormat = "trained" | "trusted" | "join" | "number";

type StudentCountProps = {
  /**
   * "trained" -> "5,000+ Students Trained"
   * "trusted" -> "Trusted by 5,000+ Students"
   * "join"    -> "Join 5,000+ Students Who Have Been Trained"
   * "number"  -> "5,000+" (bare figure, for custom stat layouts)
   */
  format?: StudentCountFormat;
  className?: string;
};

/**
 * Single reusable place for the "students trained" claim, so the number
 * (and its exact wording) can be updated centrally in
 * lib/course-data.ts -> studentProof, without touching any component.
 *
 * This is a fixed, genuine figure — not a live/visitor-driven counter.
 * It intentionally only ever says "trained," never "active" or
 * "profitable," per the brand's social-proof guidelines.
 */
export function StudentCount({ format = "trained", className = "" }: StudentCountProps) {
  const n = `${studentProof.count.toLocaleString("en-US")}${studentProof.displaySuffix}`;

  const text =
    format === "trusted"
      ? `Trusted by ${n} Students`
      : format === "join"
        ? `Join ${n} Students Who Have Been Trained`
        : format === "number"
          ? n
          : `${n} Students Trained`;

  return <span className={className}>{text}</span>;
}
