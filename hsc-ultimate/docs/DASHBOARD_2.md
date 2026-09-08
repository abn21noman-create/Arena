# Premium Dashboard 2.0

## উদ্দেশ্য

Dashboard-কে hard-coded demo widgets থেকে real database-driven learning command center-এ রূপান্তর করা। User login করেই আজ কী করবে, কোথায় দুর্বল, কী revise করতে হবে এবং focus status—সব এক screen-এ পায়।

## নতুন layout

### Command Hero

- Personalized greeting
- Bangladesh-local date
- HSC batch/board ও exam countdown
- Target GPA/System status
- Active Strict Focus state
- পরবর্তী daily mission
- Focus, Practice ও AI Tutor primary CTA

### Live metrics

- Study streak ও available freeze
- Total XP ও current level
- Next-level progress
- Weekly XP momentum
- Real topic mastery percentage

### 12-column bento intelligence

- Daily Mission — server-provided study-plan data, optimistic completion
- Strict Focus — live countdown অথবা 25/45/60 minute quick start
- Priority Insight — real weak-topic accuracy
- Revision Pulse — due flashcards, Mistake Vault ও saved topics
- Week Momentum — study/focus minutes, quizzes, mastered topics, streak
- Upcoming Tasks — due date/priorityসহ real planner tasks
- Recent Activity — quiz, study, focus ও completed-task timeline
- Subject Mastery — real subject/topic progress, valid `/learn/[subjectId]` links

## সরানো হয়েছে

Main dashboard থেকে hard-coded/fake Singularity quote, random fatigue, static cognitive load, fake peer radar এবং incorrect `/subjects/*` links সরানো হয়েছে। Source experimental components delete করা হয়নি, তবে production dashboard bundle-এ আর import হয় না।

## Performance

- User query-এর পরে independent dashboard queries `Promise.all`-এ parallel
- Client-side duplicate fetch কমানো: daily mission/weekly summary মূল page থেকেই আসে
- Unused mock widgets bundle থেকে tree-shaken
- Production server-এ full core E2E: 46/46 pass
- Production build: 193/193 page generation

## Mobile behavior

- Metric cards: 2-column → 3-column → 5-column
- Main bento: stacked mobile → 12-column desktop
- Touch-friendly mission completion
- Long labels truncate/line-clamp
- Focus quick-start এবং emergency path preserved

## Verification

- TypeScript: pass
- ESLint: 0 warning
- Unit tests: 25/25
- Production build: exit 0
- Core live E2E: 46/46
- `/dashboard`, `/practice`, `/leaderboard`: production render 200
