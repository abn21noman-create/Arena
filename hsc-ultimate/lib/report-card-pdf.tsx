// ===================================================================
// Report Card PDF Document — @react-pdf/renderer দিয়ে তৈরি
// -------------------------------------------------------------------
// এটা server-side (Node.js) এ রেন্ডার হয় (API route এ), ব্রাউজারে না।
// বাংলা টেক্সট সঠিকভাবে দেখানোর জন্য Hind Siliguri ফন্ট (lib/fonts/)
// এমবেড করা হয়েছে — এটা ছাড়া react-pdf এর ডিফল্ট ফন্টে বাংলা glyph
// প্রদর্শন হয় না (তোফু বক্স দেখাবে)।
// ===================================================================
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";
import type { ReportCardData } from "@/lib/report-card";

// ফন্ট রেজিস্ট্রেশন — একবারই হওয়া উচিত (module load এর সময়)
Font.register({
  family: "HindSiliguri",
  fonts: [
    { src: path.join(process.cwd(), "lib/fonts/HindSiliguri-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "lib/fonts/HindSiliguri-Medium.ttf"), fontWeight: "medium" },
    { src: path.join(process.cwd(), "lib/fonts/HindSiliguri-Bold.ttf"), fontWeight: "bold" },
  ],
});
// react-pdf hyphenation callback বাংলা শব্দ ভেঙে ফেলতে পারে (ভুলভাবে) —
// এটা বন্ধ করে দেওয়া হচ্ছে যাতে শব্দ অক্ষত থাকে
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "HindSiliguri",
    fontSize: 10,
    padding: 32,
    color: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2 solid #6d28d9",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "medium",
    textAlign: "right",
  },
  reportDate: {
    fontSize: 8,
    color: "#666",
    textAlign: "right",
    marginTop: 2,
  },
  studentInfoBox: {
    backgroundColor: "#f4f4f8",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  studentInfoCol: {
    flexDirection: "column",
    gap: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: "#666",
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "medium",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#6d28d9",
    marginTop: 14,
    marginBottom: 8,
    borderBottom: "1 solid #e0e0e8",
    paddingBottom: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    width: "23%",
    backgroundColor: "#f4f4f8",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  statLabel: {
    fontSize: 7,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  gpaBox: {
    backgroundColor: "#f5f3ff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  gpaValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  gpaRemark: {
    fontSize: 10,
    color: "#6d28d9",
    marginTop: 4,
  },
  table: {
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e0e0e8",
    paddingVertical: 6,
    alignItems: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#6d28d9",
    paddingVertical: 6,
    borderRadius: 3,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "medium",
  },
  colSubject: { width: "35%", paddingLeft: 6 },
  colScore: { width: "20%", textAlign: "center" },
  colGrade: { width: "15%", textAlign: "center" },
  colPoint: { width: "15%", textAlign: "center" },
  colData: { width: "15%", textAlign: "center", fontSize: 8, color: "#888" },
  weakTopicRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "0.5 solid #eee",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#999",
    textAlign: "center",
    borderTop: "0.5 solid #e0e0e8",
    paddingTop: 8,
  },
  emptyNote: {
    // fontStyle: "italic" ব্যবহার করা হয়নি কারণ Hind Siliguri ফন্টে italic
    // variant রেজিস্টার করা হয়নি — react-pdf এ ব্যবহার না করা ফন্ট স্টাইল
    // চাইলে "Could not resolve font" এরর দেয়
    fontSize: 9,
    color: "#999",
    marginTop: 4,
  },
});

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function ReportCardDocument({ data }: { data: ReportCardData }) {
  const { user, generatedAt, overallStats, subjectPerformance, weakTopics, gpaSummary, gpaRemark } =
    data;

  return (
    <Document title={`HSC Ultimate Report Card - ${user.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>HSC Ultimate</Text>
            <Text style={styles.brandSubtitle}>ব্যক্তিগত পারফরম্যান্স রিপোর্ট কার্ড</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>Report Card</Text>
            <Text style={styles.reportDate}>তৈরি হয়েছে: {generatedAt}</Text>
          </View>
        </View>

        {/* Student Info */}
        <View style={styles.studentInfoBox}>
          <View style={styles.studentInfoCol}>
            <Text style={styles.infoLabel}>নাম</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
            <Text style={styles.infoLabel}>HSC ব্যাচ</Text>
            <Text style={styles.infoValue}>{user.hscBatch}</Text>
          </View>
          <View style={styles.studentInfoCol}>
            <Text style={styles.infoLabel}>বোর্ড</Text>
            <Text style={styles.infoValue}>{user.board ?? "উল্লেখ করা হয়নি"}</Text>
            <Text style={styles.infoLabel}>লেভেল / XP</Text>
            <Text style={styles.infoValue}>
              লেভেল {user.level} • {user.xp} XP
            </Text>
          </View>
        </View>

        {/* Overall Stats */}
        <Text style={styles.sectionTitle}>সামগ্রিক পরিসংখ্যান</Text>
        <View style={styles.statsGrid}>
          <StatCard value={`${overallStats.masteryPct}%`} label="Mastery" />
          <StatCard value={`${overallStats.quizAccuracyPct}%`} label="Quiz Accuracy" />
          <StatCard value={overallStats.totalStudyHours} label="মোট স্টাডি ঘণ্টা" />
          <StatCard value={overallStats.currentStreak} label="বর্তমান স্ট্রিক" />
          <StatCard value={overallStats.masteredTopicsCount} label="Mastered Topics" />
          <StatCard value={overallStats.totalQuizAttempts} label="মোট Quiz Attempt" />
          <StatCard value={overallStats.level} label="লেভেল" />
          <StatCard value={overallStats.longestStreak} label="সর্বোচ্চ স্ট্রিক" />
        </View>

        {/* Predicted GPA */}
        <Text style={styles.sectionTitle}>সম্ভাব্য GPA (Predicted)</Text>
        {gpaSummary.gpaResult ? (
          <View style={styles.gpaBox}>
            <Text style={styles.gpaValue}>{gpaSummary.gpaResult.gpa.toFixed(2)}</Text>
            <Text style={styles.gpaRemark}>{gpaRemark}</Text>
          </View>
        ) : (
          <Text style={styles.emptyNote}>
            যথেষ্ট ডেটা নেই — সব মূল বিষয়ে অন্তত কিছু Practice/Mock Exam দিলে GPA
            হিসাব করা যাবে। {gpaSummary.missingSubjects.length > 0 &&
              `এখনো ডেটা নেই: ${gpaSummary.missingSubjects.join(", ")}`}
          </Text>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, styles.colSubject]}>বিষয়</Text>
            <Text style={[styles.tableHeaderCell, styles.colScore]}>সম্ভাব্য %</Text>
            <Text style={[styles.tableHeaderCell, styles.colGrade]}>গ্রেড</Text>
            <Text style={[styles.tableHeaderCell, styles.colPoint]}>পয়েন্ট</Text>
            <Text style={[styles.tableHeaderCell, styles.colData]}>ডেটা</Text>
          </View>
          {gpaSummary.subjects.map((s) => (
            <View style={styles.tableRow} key={s.subjectCode}>
              <Text style={styles.colSubject}>{s.subjectName}</Text>
              <Text style={styles.colScore}>
                {s.predictedPercentage !== null ? `${s.predictedPercentage}%` : "—"}
              </Text>
              <Text style={styles.colGrade}>{s.grade ?? "—"}</Text>
              <Text style={styles.colPoint}>{s.gradePoint !== null ? s.gradePoint.toFixed(2) : "—"}</Text>
              <Text style={styles.colData}>{s.dataPointCount} attempt</Text>
            </View>
          ))}
        </View>

        {/* Subject-wise Practice Performance */}
        <Text style={styles.sectionTitle}>বিষয়ভিত্তিক Practice পারফরম্যান্স</Text>
        {subjectPerformance.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderCell, { width: "50%", paddingLeft: 6 }]}>বিষয়</Text>
              <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "center" }]}>
                গড় স্কোর
              </Text>
              <Text style={[styles.tableHeaderCell, { width: "25%", textAlign: "center" }]}>
                Attempt
              </Text>
            </View>
            {subjectPerformance.map((s) => (
              <View style={styles.tableRow} key={s.subjectId}>
                <Text style={{ width: "50%", paddingLeft: 6 }}>{s.subjectName}</Text>
                <Text style={{ width: "25%", textAlign: "center" }}>{s.avgScorePct}%</Text>
                <Text style={{ width: "25%", textAlign: "center" }}>{s.attemptCount}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyNote}>এখনো কোনো Practice attempt নেই।</Text>
        )}

        {/* Weak Topics */}
        <Text style={styles.sectionTitle}>দুর্বল টপিক (মনোযোগ দরকার)</Text>
        {weakTopics.length > 0 ? (
          <View>
            {weakTopics.map((t) => (
              <View style={styles.weakTopicRow} key={t.topicId}>
                <Text>
                  {t.topicName} ({t.subjectName})
                </Text>
                <Text style={{ color: "#dc2626", fontWeight: "medium" }}>
                  {t.accuracyPct}% সঠিক ({t.totalAnswered}টা প্রশ্ন)
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyNote}>
            এখনো কোনো দুর্বল টপিক শনাক্ত করার মতো যথেষ্ট ডেটা নেই।
          </Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          এই রিপোর্টটি HSC Ultimate প্ল্যাটফর্ম থেকে স্বয়ংক্রিয়ভাবে তৈরি — শুধুমাত্র
          ব্যক্তিগত ব্যবহারের জন্য। এটি কোনো বোর্ড-অনুমোদিত অফিসিয়াল রিপোর্ট কার্ড নয়,
          বরং তোমার নিজস্ব প্র্যাকটিস ডেটার ভিত্তিতে একটি সম্ভাব্য (predicted) সারসংক্ষেপ।
        </Text>
      </Page>
    </Document>
  );
}
