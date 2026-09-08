// ===================================================================
// English 1st+2nd Paper — গুরুত্বপূর্ণ টপিকে Notes+Formula Sheet Seed
// Script
// -------------------------------------------------------------------
// Bangla/ICT/Higher Math/Physics/Chemistry/Biology Notes Seed
// ফিচারগুলোর সরাসরি ধারাবাহিকতা — একই প্রমাণিত প্যাটার্নে English
// 1st+2nd Paper এর ৪টা isImportant=true টপিকে বাস্তব কনটেন্ট যোগ করা
// হচ্ছে। কনটেন্ট মূলত ইংরেজিতে লেখা (বিষয়ের প্রকৃতি অনুযায়ী উপযুক্ত),
// তবে headers/explanatory অংশে বাংলা মিশিয়ে দ্বিভাষিক রাখা হয়েছে
// (HSC ছাত্রদের জন্য সহজবোধ্য) — একই প্যাটার্ন যা Bangla-Preposition
// deep research সোর্সগুলোতেও দেখা গেছে (Banglish grammar explanation)।
//
// তথ্যসূত্র (web_search দিয়ে verify করা, ২০২৬ জুলাই):
// - Unseen Passage Reading: reading strategies, factual vs literary
//   passages, question types (infinitylearn.com, eklavyaparv.com)
// - Paragraph Writing: topic sentence, supporting sentences, closing
//   sentence, unity/order/coherence (smartlearningapproach.com,
//   ebookbou.edu.bd)
// - Right Forms of Verbs: tense rules, subject-verb agreement,
//   modal auxiliary rules (scribd.com HSC guide, brightonbd.com,
//   ebookbou.edu.bd)
// - Preposition: preposition of time/place, phrase preposition,
//   appropriate preposition list (teachers.gov.bd, courstika.com)
//
// রান করার নিয়ম: pnpm exec tsx prisma/seed-english-notes.ts
// idempotent — বার বার চালালে আগের নোট/ফর্মুলাশীট মুছে নতুন করে বসাবে।
// ===================================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TopicContentSeed {
  notesMarkdown: string;
  formulaSheet: string;
}

const contentByTopic: Record<string, TopicContentSeed> = {
  "Unseen Passage Reading": {
    notesMarkdown: `# Unseen Passage Reading

## What is an Unseen Passage
An unseen passage is a piece of writing (usually 150-350 words) that students have not seen before the exam. It tests **reading comprehension** — the ability to understand meaning, tone, and details without prior knowledge of the text.

## Types of Passages
- **Factual Passage**: Descriptive, instructive, or reporting passages (news, science, history). Questions are usually short and fact-based (১ নম্বরের প্রশ্ন)
- **Literary Passage**: Stories or narrative texts that require understanding of tone, character, and implied meaning

## Best Strategy to Solve Unseen Passages
1. **First read**: Read the entire passage once without looking at the questions — get the overall idea (মূলভাব বোঝা)
2. **Underline unknown words**: Mark words you don't understand; guess their meaning from context
3. **Read the questions carefully**: Understand exactly what is being asked before searching for answers
4. **Re-read relevant portions**: Go back to the passage to find specific answers
5. **Answer in complete sentences**: Follow the marks allocated — 1 mark = 1 point, 2 marks = 2 points
6. **Answer in your own words**: Avoid copying entire sentences; paraphrase to show understanding

## Common Question Types
- **Fill in the blanks / Cloze test**: Testing vocabulary and grammar in context
- **True/False**: Testing factual understanding
- **Short answer questions**: Requiring 1-2 sentence answers based on the passage
- **Summary writing**: Condensing the main idea into a shorter version
- **Title suggestion**: Suggesting an appropriate title for the passage

## Key Tips
- Do not change the meaning of the passage while paraphrasing
- Pay attention to time signals and transition words (however, therefore, moreover) — they show the structure of ideas
- Practice reading speed — aim to read a 300-word passage in 3-4 minutes`,
    formulaSheet: `## Unseen Passage Reading — Summary

| Step | Action |
|---|---|
| 1 | Read passage once (get overall idea) |
| 2 | Underline unknown words |
| 3 | Read questions carefully |
| 4 | Re-read relevant portions |
| 5 | Answer in complete sentences, per mark allocation |

**Passage types**: Factual (descriptive/instructive/reporting) vs Literary (narrative)

**Marking rule**: 1 mark question = 1 point; 2 marks question = 2 points`,
  },

  "Paragraph Writing": {
    notesMarkdown: `# Paragraph Writing

## What is a Paragraph
A paragraph is a group of sentences organized around **one central idea**. A good paragraph focuses on a single topic without unnecessary detours.

## Structure of a Paragraph (5 sentences typically)
1. **Topic Sentence**: States the main idea, usually the first sentence. It should not be too broad or too narrow
2. **Supporting Sentences** (3 sentences): Provide details, examples, and explanation to develop the topic sentence
3. **Closing Sentence**: Restates the topic sentence in different words, providing a sense of completion

## Writing a Good Topic Sentence
The topic sentence should contain both a **topic** and an **angle** (point of view). 

*Weak example*: "My father is a teacher." (শুধু তথ্য, কোনো angle নেই)
*Strong example*: "My father is the best person in my life." (angle: "the best" — এখন explain করার প্রয়োজন আছে কেন)

## Four Elements of a Good Paragraph
1. **Unity**: One single, controlling idea expressed in the topic sentence
2. **Order**: Logical organization of supporting sentences (chronological, order of importance, etc.)
3. **Coherence**: Sentences connect smoothly using transition words (firstly, then, next, finally, in fact)
4. **Completeness**: All necessary supporting details are included

## Sample Paragraph Structure Example
"Every year millions of people... die... as a result of pollution [Topic Sentence]. **Firstly**, air pollution... **Then**, water pollution... **The next factor** is noise pollution... **And finally**, odor pollution... [Supporting Sentences]. In fact, pollution results from unwise actions... [Closing Sentence]"

## Common Paragraph Topics for HSC
Pollution, Load Shedding, A Journey by Boat, Your Hobby, Traffic Jam, Digital Bangladesh, Global Warming, A School Magazine, Your Favourite Teacher, Physical Exercise`,
    formulaSheet: `## Paragraph Writing — Summary

| Part | Function |
|---|---|
| Topic Sentence | States main idea (Topic + Angle) |
| Supporting Sentences (3) | Explain, give examples/evidence |
| Closing Sentence | Restates topic sentence differently |

**Four Elements**: Unity, Order, Coherence, Completeness

**Transition words**: firstly, secondly, then, next, moreover, however, in fact, finally`,
  },

  "Right Forms of Verbs": {
    notesMarkdown: `# Right Forms of Verbs

## What This Section Tests
This grammar section tests the correct **tense** and **form** of verbs in sentences — requiring understanding of tenses, subject-verb agreement, and verb forms (base form, past simple, past participle, -ing form).

## Key Rules (গুরুত্বপূর্ণ নিয়মাবলি)

### Rule 1: Present Indefinite Tense — Subject-Verb Agreement
Third person singular subject (he, she, it) → verb + s/es
Example: *He eats rice. The sun rises in the east.*
Plural subject → no s/es added
Example: *They play football.*

### Rule 2: Universal Truth
Universal truths always take **Present Indefinite Tense**.
Example: *The sun rises in the east. Parents take special care of their children.*

### Rule 3: Two Verbs in One Sentence
If a sentence has two verbs, the second verb takes **-ing** or **to + base form**.
Example: *I saw him running. I want to go now.*

### Rule 4: Modal Auxiliary + Verb
After modal auxiliaries (can, could, may, might, must, should, will, would), the verb takes its **base form**.
Example: *We must develop the habit of reading.*
Passive form: Modal + be + V3 → *It should be developed.*

### Rule 5: 'While' Clause
- Verb immediately after 'while' → takes **-ing**: *While going to school, I saw a snake.*
- 'While + subject' → **past continuous tense**: *While he was walking, a snake bit him.*

### Rule 6: Conditional Sentences (If-clauses)
- **Type 2 (Present unreal)**: If + past tense, subject + would/could/might + base verb
  Example: *If I were rich, I would help the poor.*
- **Type 3 (Past unreal)**: If + past perfect, subject + would have/could have + V3
  Example: *If you had walked fast, you could have reached in time.*

### Rule 7: Wish/As if/As though
After wish, as if, as though — 'to be' verb changes to **'were'** (for all persons).
Example: *I wish I were a king.*

### Rule 8: Active vs Passive Voice
- Subject can perform the action → **Active voice**
- Subject cannot perform the action → **Passive voice**
Example: *Cricket is called the gentlemen's game.* (passive, because "cricket" cannot call itself anything)

## Practice Tip
Memorize the most common irregular verb forms (go-went-gone, eat-ate-eaten, see-saw-seen) as they appear frequently in HSC exams.`,
    formulaSheet: `## Right Forms of Verbs — Summary

| Rule | Pattern |
|---|---|
| Present Indefinite (3rd person singular) | verb + s/es |
| Universal Truth | Present Indefinite Tense |
| Two verbs in a sentence | 2nd verb + ing/to |
| Modal Auxiliary + verb | base form of verb |
| While + verb | verb + ing |
| While + subject | past continuous |
| If (Type 2) | would/could/might + base verb |
| If (Type 3) | would have/could have + V3 |
| Wish/as if/as though | 'to be' → were |`,
  },

  "Preposition": {
    notesMarkdown: `# Preposition

## What is a Preposition
A preposition is a word that shows the relationship between a noun/pronoun and other words in a sentence — usually indicating **time, place, direction, or manner**.

## Types of Prepositions
1. **Simple Preposition**: in, on, at, by, for, of, to, with
2. **Compound Preposition**: into, onto, within, without, throughout
3. **Phrase Preposition**: Two or more words functioning as one preposition — on account of, in spite of, in front of, by means of, by dint of
4. **Participle Preposition**: Present/past participle used as preposition — during, considering, pending, owing to, notwithstanding
5. **Disguised Preposition**: Preposition hidden/merged into another word — o'clock (of + clock), along (on + long)

## Preposition of Time
- **At**: for a point of time — *at 9 am, at night, at noon*
- **On**: for days and dates — *on Friday, on 15 August*
- **In**: for months, years, seasons, longer periods — *in April, in 2026, in winter*

## Preposition of Place
- **At**: for a small place — *at Dhaka* (within a larger context)
- **In**: for a large place/area — *in Bangladesh*
- **On**: for a surface — *on the table*

## Important Rules
- **For** vs **Since**: For + duration of time (*for two years*); Since + a point of time (*since 2020*)
- After a **verb ending** meaning arrival/pointing at a specific place, use **on**: *He depends on his parents.*
- If the word after a blank is a verb in its **base form**, use **to**: *He is used to working hard.* (Note: "to" here can be followed by -ing since it's a preposition, not an infinitive marker)

## Common Appropriate Prepositions (গুরুত্বপূর্ণ তালিকা)
- **depend/dependent on** — নির্ভর করা
- **deprive of** — বঞ্চিত করা
- **capable of** — সমর্থ হওয়া
- **afraid of** — ভীত হওয়া
- **famous for** — বিখ্যাত হওয়া
- **married to** — বিবাহিত হওয়া
- **proud of** — গর্বিত হওয়া
- **interested in** — আগ্রহী হওয়া
- **angry with (person) / at (thing)** — রাগান্বিত হওয়া
- **good at** — দক্ষ হওয়া

## Practice Tip
HSC exam usually gives a passage with 10 blanks requiring appropriate prepositions — memorize commonly tested collocations (verb/adjective + preposition combinations) from previous board questions.`,
    formulaSheet: `## Preposition — Summary

| Type | Example |
|---|---|
| Simple | in, on, at, by, for |
| Compound | into, within, throughout |
| Phrase | in spite of, in front of |
| Participle | during, considering, owing to |

**Time**: at (point) → on (day/date) → in (month/year/season)

**Place**: at (small place) → in (large place) → on (surface)

**For vs Since**: for = duration; since = starting point

**Common combos**: depend on, afraid of, famous for, interested in, good at`,
  },
};

async function main() {
  console.log("🌱 English Topic Notes+Formula Sheet Seeding শুরু হচ্ছে...\n");

  let totalUpdated = 0;
  const topicsNotFound: string[] = [];

  for (const [topicName, content] of Object.entries(contentByTopic)) {
    const topic = await prisma.topic.findFirst({
      where: { name: topicName },
    });

    if (!topic) {
      topicsNotFound.push(topicName);
      continue;
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: {
        notesMarkdown: content.notesMarkdown,
        formulaSheet: content.formulaSheet,
      },
    });

    console.log(`✅ ${topicName} — নোট (${content.notesMarkdown.length} অক্ষর) ও সারাংশ যোগ হলো`);
    totalUpdated += 1;
  }

  if (topicsNotFound.length > 0) {
    console.log(`\n⚠️  এই টপিকগুলো পাওয়া যায়নি: ${topicsNotFound.join(", ")}`);
  }

  console.log(`\n✅ মোট ${totalUpdated}টা টপিকে নোট+সারাংশ সিড করা হলো!`);
}

main()
  .catch((e) => {
    console.error("❌ সমস্যা হয়েছে:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
