"use client";

// ===================================================================
// MathText — টেক্সটের মধ্যে LaTeX/গণিত সূত্র রেন্ডার করার reusable কম্পোনেন্ট
// -------------------------------------------------------------------
// Deep Research এ চিহ্নিত গ্যাপ (FEATURE_RESEARCH_V3.md অংশ ৩, Tier ১
// আইটেম ৩): বর্তমানে সূত্র ইউনিকোড সুপারস্ক্রিপ্ট (², ⁻¹) দিয়ে লেখা হতো,
// যা জটিল সমীকরণে (ভগ্নাংশ, ইন্টিগ্রাল, ম্যাট্রিক্স, রুট) ভেঙে পড়ে।
// এই কম্পোনেন্ট টেক্সটের মধ্যে "$...$" (inline) ও "$$...$$" (block)
// LaTeX সিনট্যাক্স খুঁজে বের করে KaTeX দিয়ে সুন্দরভাবে রেন্ডার করে,
// বাকি সাধারণ টেক্সট (বাংলা+ইংরেজি) অপরিবর্তিত থাকে।
//
// ব্যবহার: <MathText text={question.text} /> — প্রশ্ন/উত্তর/ব্যাখ্যা
// যেকোনো জায়গায় ব্যবহারযোগ্য। যদি টেক্সটে কোনো "$" না থাকে, সাধারণ
// প্লেইন টেক্সট হিসেবেই দেখায় (পারফরম্যান্স ওভারহেড নেই)।
//
// উদাহরণ ইনপুট: "সমাধান কর: $x^2 + 5x + 6 = 0$" অথবা
//              "$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$"
// ===================================================================
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

// "$$...$$" (block) অথবা "$...$" (inline) — non-greedy, multiline safe
const MATH_SPLIT_PATTERN = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;

interface MathTextProps {
  text: string;
  className?: string;
}

export function MathText({ text, className }: MathTextProps) {
  // "$" না থাকলে সরাসরি প্লেইন টেক্সট রিটার্ন (দ্রুততম পথ, বেশিরভাগ
  // বাংলা/সাধারণ প্রশ্নের ক্ষেত্রে এটাই ঘটবে)
  if (!text.includes("$")) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(MATH_SPLIT_PATTERN);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2).trim();
          return (
            <span key={i} className="inline-block align-middle">
              <SafeMath formula={formula} block />
            </span>
          );
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1).trim();
          return <SafeMath key={i} formula={formula} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/**
 * KaTeX parse error হলে (ভুল LaTeX সিনট্যাক্স) crash না করে raw টেক্সট
 * দেখায় — react-katex এর `renderError` prop ব্যবহার করে (এটা component
 * এর নিজস্ব error boundary, React এর try/catch এখানে কাজ করবে না কারণ
 * KaTeX parsing render-phase এর ভেতরে synchronously ঘটে)।
 */
function SafeMath({ formula, block }: { formula: string; block?: boolean }) {
  const renderError = () => <span className="text-destructive">{formula}</span>;
  return block ? (
    <BlockMath math={formula} renderError={renderError} />
  ) : (
    <InlineMath math={formula} renderError={renderError} />
  );
}
