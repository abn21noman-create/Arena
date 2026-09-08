import { describe, expect, it } from "vitest";
import {
  ACADEMIC_SNAPSHOT_SCHEMA_VERSION,
  academicSnapshotChecksum,
  verifyAcademicContentSnapshot,
} from "@/lib/content-snapshot";

function validSnapshot() {
  const data = {
    subjects: [{ id: "subject-1", name: "Physics" }],
    chapters: [{ id: "chapter-1", subjectId: "subject-1", name: "Chapter" }],
    topics: [{ id: "topic-1", chapterId: "chapter-1", name: "Topic" }],
    coreMcq: [{ id: "question-1", topicId: "topic-1", text: "Question" }],
    admissionMcq: [{ id: "admission-1", text: "Admission" }],
    cq: [{ id: "cq-1", topicId: "topic-1", stimulus: "Stimulus" }],
    badges: [{ id: "badge-1", name: "Badge" }],
    contentReviews: [{ id: "review-1", targetType: "CORE_MCQ", targetId: "question-1" }],
    contentReviewRevisions: [{ id: "revision-1", reviewId: "review-1" }],
    aiReviewBatches: [{ id: "ai-batch-1", methodVersion: "multi-ai-consensus-v1" }],
    aiReviewRuns: [{ id: "ai-run-1", batchId: "ai-batch-1", targetId: "question-1" }],
  };
  const counts = Object.fromEntries(
    Object.entries(data).map(([key, rows]) => [key, rows.length])
  );
  return {
    schemaVersion: ACADEMIC_SNAPSHOT_SCHEMA_VERSION,
    generatedAt: "2026-08-04T00:00:00.000Z",
    source: {
      application: "HSC Ultimate",
      purpose: "academic-content-disaster-recovery",
      sensitiveTablesExcluded: ["users"],
    },
    counts,
    data,
    checksum: {
      algorithm: "sha256",
      canonicalPayload: "schemaVersion+counts+data",
      value: academicSnapshotChecksum({
        schemaVersion: ACADEMIC_SNAPSHOT_SCHEMA_VERSION,
        counts,
        data,
      }),
    },
  };
}

describe("Academic content snapshot integrity", () => {
  it("accepts a valid checksum and referential graph", () => {
    const result = verifyAcademicContentSnapshot(validSnapshot());
    expect(result).toMatchObject({ valid: true, checksumValid: true, issues: [] });
  });

  it("generates deterministic checksums independent of object key order", () => {
    expect(academicSnapshotChecksum({ schemaVersion: 1, counts: { a: 1 }, data: { a: 1, b: 2 } })).toBe(
      academicSnapshotChecksum({ schemaVersion: 1, counts: { a: 1 }, data: { b: 2, a: 1 } })
    );
  });

  it("detects content tampering", () => {
    const snapshot = validSnapshot();
    snapshot.data.coreMcq[0].text = "Tampered";
    const result = verifyAcademicContentSnapshot(snapshot);
    expect(result.checksumValid).toBe(false);
    expect(result.issues).toContain("SHA-256 checksum mismatch");
  });

  it("detects declared count mismatch", () => {
    const snapshot = validSnapshot();
    snapshot.counts.coreMcq = 99;
    snapshot.checksum.value = academicSnapshotChecksum({
      schemaVersion: snapshot.schemaVersion,
      counts: snapshot.counts,
      data: snapshot.data,
    });
    expect(verifyAcademicContentSnapshot(snapshot).issues).toContain("coreMcq count mismatch");
  });

  it("rejects forbidden sensitive keys", () => {
    const snapshot = validSnapshot();
    Object.assign(snapshot.data.subjects[0], { passwordHash: "must-not-exist" });
    snapshot.checksum.value = academicSnapshotChecksum({
      schemaVersion: snapshot.schemaVersion,
      counts: snapshot.counts,
      data: snapshot.data,
    });
    expect(verifyAcademicContentSnapshot(snapshot).issues.some((issue) =>
      issue.startsWith("Forbidden sensitive keys:")
    )).toBe(true);
  });

  it("detects broken academic references", () => {
    const snapshot = validSnapshot();
    snapshot.data.coreMcq[0].topicId = "missing-topic";
    snapshot.checksum.value = academicSnapshotChecksum({
      schemaVersion: snapshot.schemaVersion,
      counts: snapshot.counts,
      data: snapshot.data,
    });
    expect(verifyAcademicContentSnapshot(snapshot).issues).toContain(
      "Question question-1 unknown topicId"
    );
  });
});
