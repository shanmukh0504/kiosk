/**
 * Optional Percy: use real snapshots when PERCY_TOKEN is set and @percy/playwright
 * (and its dependency @percy/sdk-utils) are installed; otherwise no-op so tests still run.
 */
import type { Page } from "@playwright/test";

let snapshotImpl: ((page: Page, name: string) => Promise<void>) | null = null;

async function getSnapshotImpl(): Promise<(page: Page, name: string) => Promise<void>> {
  if (snapshotImpl) return snapshotImpl;
  try {
    const percy = await import("@percy/playwright");
    snapshotImpl = process.env.PERCY_TOKEN
      ? percy.default
      : async (_page: Page, name: string) => {
          console.log(`[Percy skipped] ${name} (no PERCY_TOKEN)`);
        };
  } catch {
    snapshotImpl = async (_page: Page, name: string) => {
      console.log(`[Percy skipped] ${name} (@percy/playwright not available)`);
    };
  }
  return snapshotImpl;
}

export async function percySnapshot(page: Page, name: string): Promise<void> {
  const impl = await getSnapshotImpl();
  await impl(page, name);
}
