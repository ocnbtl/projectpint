import { importOwnerReviewBatchToHostedStorage } from "../lib/affiliate-owner-review.ts";

function argument(name: string): string {
  const prefix = `--${name}=`;
  const value = process.argv.slice(2).find((entry) => entry.startsWith(prefix))?.slice(prefix.length).trim();
  if (!value) throw new Error(`Missing --${name}=...`);
  return value;
}

const batchId = argument("batch-id");
const result = await importOwnerReviewBatchToHostedStorage(batchId, (progress) => {
  if (progress.completed === 1 || progress.completed % 5 === 0 || progress.completed === progress.total) {
    process.stdout.write(
      `[${progress.completed}/${progress.total}] ${progress.action}: ${progress.sceneId}\n`
    );
  }
});

process.stdout.write(
  `Hosted ${result.batchId}: ${result.candidateCount} candidates, ${result.uploaded} uploaded, ${result.verifiedExisting} verified existing.\n`
);
