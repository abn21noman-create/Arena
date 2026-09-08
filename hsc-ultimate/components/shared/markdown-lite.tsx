"use client";

// ===================================================================
// MarkdownLite — Topic Notes/Formula Sheet এর জন্য হালকা markdown
// renderer (কোনো ভারী dependency যেমন react-markdown/remark ছাড়া)
// -------------------------------------------------------------------
// সমস্যা: Topic.notesMarkdown/formulaSheet ফিল্ডে markdown সিনট্যাক্স
// (# হেডার, **bold**, - বুলেট লিস্ট, | টেবিল |) ও LaTeX ($...$)
// থাকতে পারে (Physics 1st Paper Notes Seed ফিচারে ব্যবহৃত), কিন্তু
// আগে UI তে `{topic.notesMarkdown}` সরাসরি whitespace-pre-wrap প্লেইন
// টেক্সট হিসেবে দেখাত — raw "# হেডার" বা "$F=ma$" literal দেখাত।
//
// সমাধান: লাইন-বাই-লাইন পার্স করে সাধারণ markdown ব্লক এলিমেন্ট
// (h1/h2, bullet list, table, paragraph) সনাক্ত করে যথাযথ HTML/React
// এলিমেন্টে রেন্ডার করে, এবং প্রতিটা টেক্সট সেগমেন্টে বিদ্যমান
// `MathText` কম্পোনেন্ট প্রয়োগ করে LaTeX সূত্র সুন্দরভাবে রেন্ডার
// করে। সম্পূর্ণ markdown spec সাপোর্ট করার দরকার নেই (CommonMark
// লাইব্রেরি আনার প্রয়োজন নেই) — শুধু আমাদের নিজেদের সিড কনটেন্টে
// ব্যবহৃত সাবসেটই যথেষ্ট (headers, bold, bullet list, simple table)।
//
// ICT Notes Seed ফিচারে যোগ: ফেন্সড কোড ব্লক (```...```) সাপোর্ট —
// HTML/C/SQL কোড উদাহরণ raw markdown মার্কার না দেখিয়ে monospace
// <pre><code> এ রেন্ডার হয় (MathText/InlineMarkdown প্রয়োগ ছাড়াই,
// যাতে কোডের ভেতরের < > $ চিহ্ন LaTeX/HTML হিসেবে ভুল পার্স না হয়)।
// ===================================================================
import { MathText } from "@/components/shared/math-text";

interface MarkdownLiteProps {
  text: string;
  className?: string;
}

// **bold** সিনট্যাক্স খুঁজে <strong> এ রূপান্তর করে, বাকি অংশ MathText দিয়ে রেন্ডার
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold">
              <MathText text={part.slice(2, -2)} />
            </strong>
          );
        }
        return <MathText key={i} text={part} />;
      })}
    </>
  );
}

export function MarkdownLite({ text, className }: MarkdownLiteProps) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let listBuffer: string[] = [];
  let tableBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1 my-2">
        {listBuffer.map((item, idx) => (
          <li key={idx}>
            <InlineMarkdown text={item} />
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  function flushTable() {
    if (tableBuffer.length === 0) return;
    // প্রথম লাইন হেডার, দ্বিতীয় লাইন সেপারেটর (---|---), বাকি ডেটা রো
    const rows = tableBuffer
      .filter((line) => !/^\|?\s*-+\s*\|/.test(line))
      .map((line) =>
        line
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cell.trim())
      );
    const [header, ...dataRows] = rows;
    if (header) {
      blocks.push(
        <div key={`table-${blocks.length}`} className="overflow-x-auto my-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                {header.map((cell, idx) => (
                  <th key={idx} className="text-left py-1.5 px-2 font-semibold">
                    <InlineMarkdown text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ridx) => (
                <tr key={ridx} className="border-b border-muted">
                  {row.map((cell, cidx) => (
                    <td key={cidx} className="py-1.5 px-2">
                      <InlineMarkdown text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ফেন্সড কোড ব্লক (```...```) — ভেতরের কনটেন্ট raw রাখা হয়, কোনো
    // markdown/LaTeX পার্সিং হয় না (কোডে থাকা $, <, > চিহ্ন যাতে ভুল
    // রেন্ডার না হয়)
    if (trimmed.startsWith("```")) {
      flushList();
      flushTable();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // বন্ধ ``` লাইন বাদ দেওয়া
      blocks.push(
        <pre
          key={`code-${blocks.length}`}
          className="bg-muted rounded-md p-3 my-3 overflow-x-auto text-xs font-mono"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushList();
      tableBuffer.push(trimmed);
      i++;
      continue;
    }
    flushTable();

    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
      i++;
      continue;
    }
    flushList();

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h3 key={i} className="text-base font-semibold mt-4 mb-1.5">
          <InlineMarkdown text={trimmed.slice(3)} />
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2 key={i} className="text-lg font-bold mt-4 mb-2">
          <InlineMarkdown text={trimmed.slice(2)} />
        </h2>
      );
    } else if (trimmed === "") {
      // খালি লাইন — প্যারাগ্রাফ ব্রেক, আলাদা কিছু render করার দরকার নেই
    } else {
      blocks.push(
        <p key={i} className="leading-relaxed my-1.5">
          <InlineMarkdown text={trimmed} />
        </p>
      );
    }
    i++;
  }
  flushList();
  flushTable();

  return <div className={className}>{blocks}</div>;
}
