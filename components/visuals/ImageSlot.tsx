import { imageAssets, imageAssetExists, type ImageAssetKey } from "@/lib/image-assets";
import { IconImage } from "../icons";

type ImageSlotProps = {
  assetKey: ImageAssetKey;
  /** Sizing/aspect-ratio classes for the outer box — reserved up front either way, so swapping in the real photo never shifts layout. */
  className?: string;
  tone?: "light" | "dark";
  priority?: boolean;
};

/**
 * Renders a real photo from public/images/ once one has been supplied for
 * this asset key (see lib/image-assets.ts), or — until then — a clearly
 * labeled placeholder naming exactly which file is needed. No image
 * generation tool is available in this environment, so per the task's own
 * instruction this never falls back to a drawn SVG "photo" substitute.
 *
 * A Server Component: the exists-check runs with fs.existsSync on the
 * server, so nothing here needs client JS or an onError handler, and there
 * is never a broken-image flash for visitors.
 */
export function ImageSlot({ assetKey, className = "", tone = "light", priority = false }: ImageSlotProps) {
  const asset = imageAssets[assetKey];
  const exists = imageAssetExists(asset.file);
  const isDark = tone === "dark";

  if (exists) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- local /public asset, existence already verified server-side */}
        <img
          src={`/images/${asset.file}`}
          alt={asset.alt}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Image placeholder — ${asset.label}`}
      className={`relative flex flex-col items-center justify-center gap-2.5 overflow-hidden p-6 text-center ${
        isDark
          ? "border border-dashed border-white/15 bg-white/[0.03]"
          : "border border-dashed border-ink-200 bg-ink-50"
      } ${className}`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isDark ? "bg-white/10 text-brand-300" : "bg-ink-900 text-brand-300"
        }`}
      >
        <IconImage className="h-5 w-5" />
      </span>
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${isDark ? "text-ink-400" : "text-ink-500"}`}
      >
        Image needed
      </span>
      <span className={`max-w-[16rem] text-xs font-medium ${isDark ? "text-ink-200" : "text-ink-700"}`}>
        {asset.label}
      </span>
      <span className={`max-w-[16rem] text-[10px] leading-relaxed ${isDark ? "text-ink-500" : "text-ink-400"}`}>
        Save as{" "}
        <code className={`rounded px-1 py-0.5 ${isDark ? "bg-black/30 text-ink-300" : "bg-white text-ink-600"}`}>
          public/images/{asset.file}
        </code>
      </span>
    </div>
  );
}
