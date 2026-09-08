// ===================================================================
// Topic Notes PDF Document — @react-pdf/renderer দিয়ে তৈরি
// -------------------------------------------------------------------
// একটা Topic এর Text Notes + Formula Sheet কে অফলাইন পড়ার জন্য PDF এ
// এক্সপোর্ট করার Document কম্পোনেন্ট। lib/report-card-pdf.tsx এর একই
// প্যাটার্ন অনুসরণ করা হয়েছে (Hind Siliguri ফন্ট এমবেড, hyphenation বন্ধ)।
// ===================================================================
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import path from "path";

// react-pdf সরাসরি HTML/KaTeX রেন্ডার করতে পারে না (এটা শুধু নির্দিষ্ট
// StyleSheet+Text/View primitive দিয়ে PDF তৈরি করে), তাই Physics 1st
// Paper Notes Seed ফিচারের markdown+LaTeX কনটেন্ট PDF এ সরাসরি সুন্দর
// রেন্ডার করা সম্ভব না (ওয়েব পেজে MarkdownLite+MathText দিয়ে হয়,
// কিন্তু PDF generation completely আলাদা renderer)। তাই এখানে markdown
// সিনট্যাক্স (# ## ** | -) সরিয়ে readable plain text এ রূপান্তর করা
// হয় — LaTeX এর "$...$" wrapper সরানো হয় (raw সূত্র যেমন "F=ma" থেকে
// যায়, ডলার সাইন ছাড়া) যাতে PDF এ অন্তত raw markup দেখা না যায়।
function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => {
      let cleaned = line.trim();
      cleaned = cleaned.replace(/^```.*$/, ""); // ফেন্সড কোড ব্লক মার্কার (```/```lang) খালি করা, ভেতরের কোড লাইন যেমন আছে তেমন থাকে
      cleaned = cleaned.replace(/^#{1,3}\s+/, ""); // # ## ### হেডার মার্কার সরানো
      cleaned = cleaned.replace(/^-\s+/, "• "); // বুলেট লিস্ট মার্কার bullet dot এ রূপান্তর
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1"); // **bold** সরিয়ে শুধু টেক্সট
      cleaned = cleaned.replace(/\$\$?([^$]+)\$\$?/g, "$1"); // LaTeX $ /$$ wrapper সরানো
      cleaned = cleaned.replace(/^\|(.+)\|$/, (_m, inner: string) =>
        inner
          .split("|")
          .map((cell) => cell.trim())
          .join("   ")
      ); // টেবিল রো কে স্পেস-সেপারেটেড কলামে রূপান্তর
      cleaned = cleaned.replace(/^-+$/, ""); // টেবিল সেপারেটর লাইন (---|---) খালি করা
      return cleaned;
    })
    .filter((line) => line.length > 0)
    .join("\n");
}

// ফন্ট রেজিস্ট্রেশন — module load এর সময় একবারই হওয়া উচিত। react-pdf
// এর ভেতরে Font.register() একই family নামে একাধিকবার কল করলেও নিরাপদ
// (idempotent), তাই lib/report-card-pdf.tsx এর সাথে duplicate রেজিস্ট্রেশন
// সমস্যা তৈরি করে না।
Font.register({
  family: "HindSiliguri",
  fonts: [
    { src: path.join(process.cwd(), "lib/fonts/HindSiliguri-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "lib/fonts/HindSiliguri-Medium.ttf"), fontWeight: "medium" },
    { src: path.join(process.cwd(), "lib/fonts/HindSiliguri-Bold.ttf"), fontWeight: "bold" },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    fontFamily: "HindSiliguri",
    fontSize: 10,
    padding: 32,
    color: "#1a1a2e",
    lineHeight: 1.5,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  brandSubtitle: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
  },
  breadcrumb: {
    fontSize: 8,
    color: "#888",
    textAlign: "right",
  },
  topicTitleBox: {
    backgroundColor: "#f5f3ff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6d28d9",
  },
  topicTitleEn: {
    fontSize: 9,
    color: "#6d28d9",
    marginTop: 2,
  },
  importantBadge: {
    fontSize: 8,
    color: "#b45309",
    marginTop: 6,
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
  bodyText: {
    fontSize: 10,
    whiteSpace: "pre-wrap",
  },
  formulaBox: {
    backgroundColor: "#f4f4f8",
    borderRadius: 6,
    padding: 10,
    marginTop: 4,
  },
  formulaText: {
    fontSize: 10,
    whiteSpace: "pre-wrap",
  },
  emptyNote: {
    fontSize: 9,
    color: "#999",
    marginTop: 4,
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
});

export interface TopicNotesPdfData {
  subjectName: string;
  chapterName: string;
  topicName: string;
  topicNameEn: string;
  isImportant: boolean;
  notesMarkdown: string | null;
  formulaSheet: string | null;
  generatedAt: string; // বাংলা তারিখ ফরম্যাটে
}

export function TopicNotesDocument({ data }: { data: TopicNotesPdfData }) {
  const {
    subjectName,
    chapterName,
    topicName,
    topicNameEn,
    isImportant,
    notesMarkdown,
    formulaSheet,
    generatedAt,
  } = data;

  return (
    <Document title={`HSC Ultimate - ${topicName} - নোট`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>HSC Ultimate</Text>
            <Text style={styles.brandSubtitle}>টপিক নোট (অফলাইন এক্সপোর্ট)</Text>
          </View>
          <View>
            <Text style={styles.breadcrumb}>
              {subjectName} • {chapterName}
            </Text>
            <Text style={styles.breadcrumb}>তৈরি হয়েছে: {generatedAt}</Text>
          </View>
        </View>

        {/* Topic Title */}
        <View style={styles.topicTitleBox}>
          <Text style={styles.topicTitle}>{topicName}</Text>
          <Text style={styles.topicTitleEn}>({topicNameEn})</Text>
          {isImportant && (
            <Text style={styles.importantBadge}>⭐ বোর্ড পরীক্ষায় গুরুত্বপূর্ণ টপিক</Text>
          )}
        </View>

        {/* Notes */}
        <Text style={styles.sectionTitle}>নোট</Text>
        {notesMarkdown?.trim() ? (
          <Text style={styles.bodyText}>{plainTextFromMarkdown(notesMarkdown)}</Text>
        ) : (
          <Text style={styles.emptyNote}>এই টপিকের বিস্তারিত নোট এখনো যোগ করা হয়নি।</Text>
        )}

        {/* Formula Sheet */}
        <Text style={styles.sectionTitle}>ফর্মুলা শীট</Text>
        {formulaSheet?.trim() ? (
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>{plainTextFromMarkdown(formulaSheet)}</Text>
          </View>
        ) : (
          <Text style={styles.emptyNote}>এই টপিকের ফর্মুলা শীট এখনো যোগ করা হয়নি।</Text>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          এই নোটটি HSC Ultimate প্ল্যাটফর্ম থেকে অফলাইনে পড়ার জন্য ডাউনলোড করা হয়েছে —
          শুধুমাত্র ব্যক্তিগত ব্যবহারের জন্য।
        </Text>
      </Page>
    </Document>
  );
}
