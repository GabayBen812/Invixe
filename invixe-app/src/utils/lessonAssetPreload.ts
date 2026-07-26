import { Image } from "react-native";
import type { LessonStep } from "../modules/lessons/types";
import { fetchRemoteText } from "./remoteAssetCache";
import {
  resolveLessonRemoteUrl,
  resolveSupabaseAssetUrl,
} from "./supabaseUrl";

export type LessonPreloadResult = {
  total: number;
  loaded: number;
  failed: number;
  timedOut: boolean;
};

const preloadedLessonKeys = new Set<string>();

export function isLessonAssetsPreloaded(cacheKey: string): boolean {
  return preloadedLessonKeys.has(cacheKey);
}

export function markLessonAssetsPreloaded(cacheKey: string): void {
  preloadedLessonKeys.add(cacheKey);
}

type PreloadOptions = {
  concurrency?: number;
  timeoutMs?: number;
  onProgress?: (loaded: number, total: number) => void;
};

function addUnique(
  set: Set<string>,
  ...candidates: Array<string | null | undefined>
): string | null {
  const resolved = resolveLessonRemoteUrl(...candidates);
  if (!resolved) return null;
  if (set.has(resolved)) return null;
  set.add(resolved);
  return resolved;
}

function collectImageUrls(steps: LessonStep[]): string[] {
  const urls = new Set<string>();

  const addImage = (...candidates: Array<string | null | undefined>) => {
    addUnique(urls, ...candidates);
  };

  const addSvg = (...candidates: Array<string | null | undefined>) => {
    // SVG URLs are fetched as text, not Image.prefetch
    addUnique(urls, ...candidates);
  };

  for (const step of steps) {
    const cfg = step.activityConfig;
    if (!cfg) continue;

    const qwi = cfg.questionWithImage;
    if (qwi) {
      addImage(qwi.uploadedImagePublicUrl, qwi.uploadedImageUrl);
      addSvg(qwi.svgPublicUrl, qwi.svgUrl);
    }

    const explanation = cfg.explanation;
    if (explanation) {
      if (explanation.imageType === "svg") {
        addSvg(explanation.imagePublicUrl, explanation.imageUrl);
      } else {
        addImage(explanation.imagePublicUrl, explanation.imageUrl);
      }
    }

    const pathSelect = cfg.pathSelect;
    if (pathSelect?.choices) {
      for (const choice of pathSelect.choices) {
        addImage(choice.explanationImageUrl);
        addSvg(choice.explanationSvgPublicUrl, choice.explanationSvgUrl);
        for (const extra of choice.extraExplanations || []) {
          addImage(extra.explanationImageUrl);
          addSvg(extra.explanationSvgPublicUrl, extra.explanationSvgUrl);
        }
      }
    }

    const svgOptions =
      cfg.svgOptions || cfg.svgMultiSelect?.options || [];
    for (const opt of svgOptions) {
      addImage(opt.pngPublicUrl, opt.pngUrl);
      addSvg(opt.svgPublicUrl, opt.svgUrl);
    }

    for (const slot of cfg.dragMatch?.slots || []) {
      addSvg(slot.svgPublicUrl, slot.svgUrl);
    }

    const rawCfg = cfg as Record<string, unknown>;
    for (const key of ["graphQuestion", "graphQuestionPNG"] as const) {
      const block = rawCfg[key] as Record<string, unknown> | undefined;
      if (!block) continue;

      addImage(
        block.pngPublicUrl as string,
        block.pngUrl as string,
        block.imagePublicUrl as string,
        block.imageUrl as string,
      );
      addSvg(block.svgPublicUrl as string, block.svgUrl as string);

      const choices = (block.choices as Array<Record<string, unknown>>) || [];
      for (const choice of choices) {
        addImage(
          choice.explanationImageUrl as string,
          choice.pngPublicUrl as string,
          choice.pngUrl as string,
          choice.imageUrl as string,
        );
        addSvg(
          choice.explanationSvgPublicUrl as string,
          choice.svgPublicUrl as string,
          choice.explanationSvgUrl as string,
          choice.svgUrl as string,
        );
      }
    }
  }

  return Array.from(urls);
}

function isSvgUrl(url: string): boolean {
  const lower = url.split("?")[0].toLowerCase();
  return lower.endsWith(".svg");
}

async function preloadUrl(url: string): Promise<void> {
  const resolved = await resolveSupabaseAssetUrl(url);
  if (isSvgUrl(resolved)) {
    await fetchRemoteText(resolved);
    return;
  }
  await Image.prefetch(resolved);
}

async function runWithConcurrency(
  urls: string[],
  concurrency: number,
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ loaded: number; failed: number }> {
  let loaded = 0;
  let failed = 0;
  let index = 0;

  const report = () => {
    onProgress?.(loaded + failed, urls.length);
  };

  const worker = async () => {
    while (index < urls.length) {
      const current = urls[index++];
      try {
        await preloadUrl(current);
        loaded += 1;
      } catch {
        failed += 1;
      }
      report();
    }
  };

  const workers = Array.from(
    { length: Math.min(concurrency, urls.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return { loaded, failed };
}

/** Preload every remote image/SVG referenced in a lesson before first render. */
export async function preloadLessonAssets(
  steps: LessonStep[],
  options: PreloadOptions = {},
): Promise<LessonPreloadResult> {
  const concurrency = options.concurrency ?? 8;
  const timeoutMs = options.timeoutMs ?? 12000;
  const urls = collectImageUrls(steps);

  if (urls.length === 0) {
    return { total: 0, loaded: 0, failed: 0, timedOut: false };
  }

  let timedOut = false;
  const preloadPromise = runWithConcurrency(
    urls,
    concurrency,
    options.onProgress,
  );

  const result = await Promise.race([
    preloadPromise,
    new Promise<{ loaded: number; failed: number }>((resolve) => {
      setTimeout(() => {
        timedOut = true;
        resolve({ loaded: 0, failed: 0 });
      }, timeoutMs);
    }),
  ]);

  if (timedOut) {
    void preloadPromise.catch(() => {});
    return {
      total: urls.length,
      loaded: result.loaded,
      failed: result.failed,
      timedOut: true,
    };
  }

  return {
    total: urls.length,
    loaded: result.loaded,
    failed: result.failed,
    timedOut: false,
  };
}

export function preloadLessonAssetsCached(
  cacheKey: string,
  steps: LessonStep[],
  options?: PreloadOptions,
): Promise<LessonPreloadResult> {
  if (isLessonAssetsPreloaded(cacheKey)) {
    return Promise.resolve({
      total: 0,
      loaded: 0,
      failed: 0,
      timedOut: false,
    });
  }
  return preloadLessonAssets(steps, options).then((result) => {
    if (!result.timedOut) {
      markLessonAssetsPreloaded(cacheKey);
    }
    return result;
  });
}
