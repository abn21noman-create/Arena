-- HSC ULTIMATE COMPLETE DATABASE INITIALIZATION SCHEMA
-- Auto-generated consolidated PostgreSQL DDL

-- Migration: 20260710103900_baseline_reconstructed_after_migration_folder_loss
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SubjectCode" AS ENUM ('BANGLA', 'ENGLISH', 'ICT', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'HIGHER_MATH');

-- CreateEnum
CREATE TYPE "PaperNumber" AS ENUM ('FIRST', 'SECOND', 'NONE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'CQ');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "MasteryStatus" AS ENUM ('NOT_STARTED', 'LEARNING', 'PRACTICING', 'MASTERED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "StudySessionType" AS ENUM ('POMODORO', 'READING', 'PRACTICE', 'FLASHCARD_REVIEW');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "LeagueTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "AiTutorMode" AS ENUM ('DIRECT', 'SOCRATIC');

-- CreateEnum
CREATE TYPE "PetStage" AS ENUM ('EGG', 'HATCHLING', 'OWLET', 'ADULT', 'SAGE');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "QuizDuelStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SrsAlgorithm" AS ENUM ('SM2', 'FSRS');

-- CreateEnum
CREATE TYPE "FsrsCardState" AS ENUM ('NEW', 'LEARNING', 'REVIEW', 'RELEARNING');

-- CreateEnum
CREATE TYPE "FlashcardType" AS ENUM ('BASIC', 'CLOZE', 'IMAGE_OCCLUSION');

-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('QUESTION', 'DISCUSSION', 'NOTE_SHARE', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "ContentReportReason" AS ENUM ('SPAM', 'OFFENSIVE', 'MISINFORMATION', 'HARASSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ContentReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "MockExamMode" AS ENUM ('FULL', 'QUICK');

-- CreateEnum
CREATE TYPE "MockExamStatus" AS ENUM ('IN_PROGRESS', 'MCQ_DONE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PdfDocumentStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "CustomQuestionSetStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "LiveExamStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "QuizBattleStatus" AS ENUM ('WAITING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AdmissionExamType" AS ENUM ('MEDICAL', 'DU_A_UNIT', 'BUET');

-- CreateEnum
CREATE TYPE "AdmissionSubject" AS ENUM ('PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'MATH', 'ENGLISH', 'GENERAL_KNOWLEDGE');

-- CreateEnum
CREATE TYPE "AdmissionAttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "hscBatch" INTEGER NOT NULL DEFAULT 2028,
    "board" TEXT,
    "examDate" TIMESTAMP(3),
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "streakFreezes" INTEGER NOT NULL DEFAULT 2,
    "lastFreezeRefillAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leagueTier" "LeagueTier" NOT NULL DEFAULT 'BRONZE',
    "weeklyXp" INTEGER NOT NULL DEFAULT 0,
    "weekStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aiTutorMode" "AiTutorMode" NOT NULL DEFAULT 'DIRECT',
    "publicProfileEnabled" BOOLEAN NOT NULL DEFAULT false,
    "profileSlug" TEXT,
    "emailDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastDigestSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_pets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'বুদ্ধি',
    "stage" "PetStage" NOT NULL DEFAULT 'EGG',
    "carePoints" INTEGER NOT NULL DEFAULT 0,
    "happiness" INTEGER NOT NULL DEFAULT 100,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "lastCareAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inviteCode" TEXT NOT NULL,
    "weeklyGoalXp" INTEGER NOT NULL DEFAULT 500,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "weeklyXpContributed" INTEGER NOT NULL DEFAULT 0,
    "weekStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_duels" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "opponentId" TEXT,
    "questionIds" JSONB NOT NULL,
    "challengerAnswers" JSONB,
    "opponentAnswers" JSONB,
    "challengerScore" INTEGER NOT NULL DEFAULT 0,
    "opponentScore" INTEGER NOT NULL DEFAULT 0,
    "challengerTimeSec" INTEGER,
    "opponentTimeSec" INTEGER,
    "winnerId" TEXT,
    "status" "QuizDuelStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "quiz_duels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "code" "SubjectCode" NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "paper" "PaperNumber" NOT NULL DEFAULT 'NONE',
    "colorHex" TEXT NOT NULL DEFAULT '#6366f1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "videoUrl" TEXT,
    "notesMarkdown" TEXT,
    "formulaSheet" TEXT,
    "mindMap" JSONB,
    "mindMapGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq_questions" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "stimulus" TEXT NOT NULL,
    "questionA" TEXT NOT NULL,
    "questionB" TEXT NOT NULL,
    "questionC" TEXT NOT NULL,
    "questionD" TEXT NOT NULL,
    "modelAnswerA" TEXT,
    "modelAnswerB" TEXT,
    "modelAnswerC" TEXT,
    "modelAnswerD" TEXT,
    "boardYear" INTEGER,
    "boardName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cq_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cq_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cqQuestionId" TEXT NOT NULL,
    "answerA" TEXT NOT NULL,
    "answerB" TEXT NOT NULL,
    "answerC" TEXT NOT NULL,
    "answerD" TEXT NOT NULL,
    "scoreA" INTEGER NOT NULL DEFAULT 0,
    "scoreB" INTEGER NOT NULL DEFAULT 0,
    "scoreC" INTEGER NOT NULL DEFAULT 0,
    "scoreD" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "aiProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cq_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "status" "MasteryStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedPct" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'MCQ',
    "text" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "misconceptionTag" TEXT,
    "boardYear" INTEGER,
    "boardName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "quizType" TEXT NOT NULL DEFAULT 'practice',
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "timeTakenSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempt_answers" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "confidence" TEXT,

    CONSTRAINT "quiz_attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_decks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectCode" "SubjectCode",
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "importCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcard_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "cardType" "FlashcardType" NOT NULL DEFAULT 'BASIC',
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "imageUrl" TEXT,
    "occlusionBoxes" JSONB,
    "srsAlgorithm" "SrsAlgorithm" NOT NULL DEFAULT 'FSRS',
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewed" TIMESTAMP(3),
    "fsrsStability" DOUBLE PRECISION,
    "fsrsDifficulty" DOUBLE PRECISION,
    "fsrsScheduledDays" INTEGER DEFAULT 0,
    "fsrsReps" INTEGER DEFAULT 0,
    "fsrsLapses" INTEGER DEFAULT 0,
    "fsrsState" "FsrsCardState" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "subjectCode" "SubjectCode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectCode" "SubjectCode",
    "type" "StudySessionType" NOT NULL DEFAULT 'POMODORO',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconEmoji" TEXT NOT NULL DEFAULT '🏆',
    "criteria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "provider" TEXT,
    "tutorMode" "AiTutorMode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "PostCategory" NOT NULL DEFAULT 'QUESTION',
    "subjectCode" "SubjectCode",
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_replies" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isBestAnswer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_votes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "replyId" TEXT,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "replyId" TEXT,
    "reason" "ContentReportReason" NOT NULL,
    "details" TEXT,
    "status" "ContentReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exam_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "mode" "MockExamMode" NOT NULL DEFAULT 'FULL',
    "mcqQuestionIds" JSONB NOT NULL,
    "mcqUserAnswers" JSONB,
    "mcqScore" INTEGER NOT NULL DEFAULT 0,
    "mcqTotal" INTEGER NOT NULL DEFAULT 0,
    "cqQuestionIds" JSONB NOT NULL,
    "cqScore" INTEGER NOT NULL DEFAULT 0,
    "cqTotal" INTEGER NOT NULL DEFAULT 0,
    "status" "MockExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "timeTakenSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "mock_exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "status" "PdfDocumentStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "summary" TEXT,
    "summaryGeneratedAt" TIMESTAMP(3),
    "mindMap" JSONB,
    "mindMapGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "pageNumber" INTEGER,
    "content" TEXT NOT NULL,
    "embedding" vector(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_chat_messages" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "citedPages" TEXT,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_slots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subjectCode" "SubjectCode",
    "label" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "daysUntilExam" INTEGER NOT NULL,
    "aiProvider" TEXT,
    "renewalSuggested" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_plan_items" (
    "id" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subjectCode" "SubjectCode" NOT NULL,
    "topicName" TEXT,
    "taskDescription" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_question_sets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "status" "CustomQuestionSetStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_question_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_questions" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "text" TEXT,
    "options" JSONB,
    "correctAnswer" TEXT,
    "stimulus" TEXT,
    "questionA" TEXT,
    "questionB" TEXT,
    "questionC" TEXT,
    "questionD" TEXT,
    "modelAnswerA" TEXT,
    "modelAnswerB" TEXT,
    "modelAnswerC" TEXT,
    "modelAnswerD" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_exam_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customSetId" TEXT,
    "questionIds" JSONB NOT NULL,
    "sourceType" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "userAnswers" JSONB,
    "score" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "status" "LiveExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "live_exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_battles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subjectId" TEXT,
    "customSetId" TEXT,
    "questionIds" JSONB NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 30,
    "status" "QuizBattleStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "quiz_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_battle_participants" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answers" JSONB,
    "score" INTEGER NOT NULL DEFAULT 0,
    "timeTakenSec" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_battle_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_questions" (
    "id" TEXT NOT NULL,
    "examType" "AdmissionExamType" NOT NULL,
    "subject" "AdmissionSubject" NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admission_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_mock_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examType" "AdmissionExamType" NOT NULL,
    "status" "AdmissionAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "questionIds" JSONB NOT NULL,
    "userAnswers" JSONB,
    "totalCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "rawScore" DOUBLE PRECISION,
    "maxScore" INTEGER NOT NULL,
    "timeTakenSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "admission_mock_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_profileSlug_key" ON "users"("profileSlug");

-- CreateIndex
CREATE INDEX "users_leagueTier_weeklyXp_idx" ON "users"("leagueTier", "weeklyXp");

-- CreateIndex
CREATE UNIQUE INDEX "study_pets_userId_key" ON "study_pets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "study_groups_inviteCode_key" ON "study_groups"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "study_group_members_userId_key" ON "study_group_members"("userId");

-- CreateIndex
CREATE INDEX "quiz_duels_status_subjectId_idx" ON "quiz_duels"("status", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_paper_key" ON "subjects"("code", "paper");

-- CreateIndex
CREATE INDEX "chapters_subjectId_idx" ON "chapters"("subjectId");

-- CreateIndex
CREATE INDEX "topics_chapterId_idx" ON "topics"("chapterId");

-- CreateIndex
CREATE INDEX "cq_questions_topicId_idx" ON "cq_questions"("topicId");

-- CreateIndex
CREATE INDEX "cq_attempts_userId_idx" ON "cq_attempts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_progress_userId_topicId_key" ON "topic_progress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "questions_topicId_idx" ON "questions"("topicId");

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempts_subjectId_idx" ON "quiz_attempts"("subjectId");

-- CreateIndex
CREATE INDEX "quiz_attempt_answers_quizAttemptId_idx" ON "quiz_attempt_answers"("quizAttemptId");

-- CreateIndex
CREATE INDEX "quiz_attempt_answers_questionId_idx" ON "quiz_attempt_answers"("questionId");

-- CreateIndex
CREATE INDEX "flashcard_decks_userId_idx" ON "flashcard_decks"("userId");

-- CreateIndex
CREATE INDEX "flashcard_decks_isPublic_subjectCode_idx" ON "flashcard_decks"("isPublic", "subjectCode");

-- CreateIndex
CREATE INDEX "flashcards_deckId_idx" ON "flashcards"("deckId");

-- CreateIndex
CREATE INDEX "flashcards_deckId_dueDate_idx" ON "flashcards"("deckId", "dueDate");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- CreateIndex
CREATE INDEX "study_sessions_userId_idx" ON "study_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "chat_messages_userId_createdAt_idx" ON "chat_messages"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_topicId_key" ON "bookmarks"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "notes_userId_topicId_key" ON "notes"("userId", "topicId");

-- CreateIndex
CREATE INDEX "forum_posts_category_idx" ON "forum_posts"("category");

-- CreateIndex
CREATE INDEX "forum_posts_subjectCode_idx" ON "forum_posts"("subjectCode");

-- CreateIndex
CREATE INDEX "forum_posts_isPinned_createdAt_idx" ON "forum_posts"("isPinned", "createdAt");

-- CreateIndex
CREATE INDEX "forum_replies_postId_idx" ON "forum_replies"("postId");

-- CreateIndex
CREATE INDEX "forum_votes_postId_idx" ON "forum_votes"("postId");

-- CreateIndex
CREATE INDEX "forum_votes_replyId_idx" ON "forum_votes"("replyId");

-- CreateIndex
CREATE UNIQUE INDEX "forum_votes_userId_postId_key" ON "forum_votes"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "forum_votes_userId_replyId_key" ON "forum_votes"("userId", "replyId");

-- CreateIndex
CREATE INDEX "content_reports_status_createdAt_idx" ON "content_reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "content_reports_postId_idx" ON "content_reports"("postId");

-- CreateIndex
CREATE INDEX "content_reports_replyId_idx" ON "content_reports"("replyId");

-- CreateIndex
CREATE UNIQUE INDEX "content_reports_userId_postId_key" ON "content_reports"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "content_reports_userId_replyId_key" ON "content_reports"("userId", "replyId");

-- CreateIndex
CREATE INDEX "mock_exam_attempts_subjectId_mode_status_idx" ON "mock_exam_attempts"("subjectId", "mode", "status");

-- CreateIndex
CREATE INDEX "mock_exam_attempts_userId_status_idx" ON "mock_exam_attempts"("userId", "status");

-- CreateIndex
CREATE INDEX "pdf_documents_userId_createdAt_idx" ON "pdf_documents"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "pdf_chunks_documentId_chunkIndex_idx" ON "pdf_chunks"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "pdf_chat_messages_documentId_createdAt_idx" ON "pdf_chat_messages"("documentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");

-- CreateIndex
CREATE INDEX "routine_slots_userId_dayOfWeek_idx" ON "routine_slots"("userId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "study_plans_userId_createdAt_idx" ON "study_plans"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "study_plan_items_studyPlanId_date_idx" ON "study_plan_items"("studyPlanId", "date");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "custom_question_sets_userId_createdAt_idx" ON "custom_question_sets"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "custom_questions_setId_idx" ON "custom_questions"("setId");

-- CreateIndex
CREATE INDEX "live_exam_sessions_userId_createdAt_idx" ON "live_exam_sessions"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_battles_roomCode_key" ON "quiz_battles"("roomCode");

-- CreateIndex
CREATE INDEX "quiz_battles_roomCode_idx" ON "quiz_battles"("roomCode");

-- CreateIndex
CREATE INDEX "quiz_battles_ownerId_createdAt_idx" ON "quiz_battles"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "quiz_battle_participants_battleId_score_idx" ON "quiz_battle_participants"("battleId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_battle_participants_battleId_userId_key" ON "quiz_battle_participants"("battleId", "userId");

-- CreateIndex
CREATE INDEX "admission_questions_examType_subject_idx" ON "admission_questions"("examType", "subject");

-- CreateIndex
CREATE INDEX "admission_mock_attempts_userId_examType_createdAt_idx" ON "admission_mock_attempts"("userId", "examType", "createdAt");

-- AddForeignKey
ALTER TABLE "study_pets" ADD CONSTRAINT "study_pets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_group_members" ADD CONSTRAINT "study_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_duels" ADD CONSTRAINT "quiz_duels_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_duels" ADD CONSTRAINT "quiz_duels_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_duels" ADD CONSTRAINT "quiz_duels_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_questions" ADD CONSTRAINT "cq_questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_attempts" ADD CONSTRAINT "cq_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cq_attempts" ADD CONSTRAINT "cq_attempts_cqQuestionId_fkey" FOREIGN KEY ("cqQuestionId") REFERENCES "cq_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_progress" ADD CONSTRAINT "topic_progress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "quiz_attempt_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_decks" ADD CONSTRAINT "flashcard_decks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "flashcard_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "forum_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_postId_fkey" FOREIGN KEY ("postId") REFERENCES "forum_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "forum_replies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_documents" ADD CONSTRAINT "pdf_documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_chunks" ADD CONSTRAINT "pdf_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "pdf_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_chat_messages" ADD CONSTRAINT "pdf_chat_messages_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "pdf_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_slots" ADD CONSTRAINT "routine_slots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_plan_items" ADD CONSTRAINT "study_plan_items_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_question_sets" ADD CONSTRAINT "custom_question_sets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_questions" ADD CONSTRAINT "custom_questions_setId_fkey" FOREIGN KEY ("setId") REFERENCES "custom_question_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_exam_sessions" ADD CONSTRAINT "live_exam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_battles" ADD CONSTRAINT "quiz_battles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_battles" ADD CONSTRAINT "quiz_battles_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_battle_participants" ADD CONSTRAINT "quiz_battle_participants_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "quiz_battles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_battle_participants" ADD CONSTRAINT "quiz_battle_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_mock_attempts" ADD CONSTRAINT "admission_mock_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- pgvector HNSW ইনডেক্স (Prisma migrate dev এর recurring bug এর ফিক্স,
-- scripts/fix-vector-index.ts এও একই কাজ করে, এখানে idempotent ভাবে যোগ করা হলো)
CREATE INDEX IF NOT EXISTS "pdf_chunks_embedding_idx" ON "pdf_chunks" USING hnsw ("embedding" vector_cosine_ops);


-- Migration: 20260711000000_add_target_gpa
-- AlterTable
-- Personal Goal Setting (GPA Target) — MASTER_PLAN.md এর মূল ভিশনের
-- "Goal Setting (weekly/monthly targets, GPA target)" আইটেম
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "targetGpa" DOUBLE PRECISION;


-- Migration: 20260712091731_add_habit_tracker
-- Habit Tracker ফিচার — নতুন habits + habit_logs টেবিল
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট এসেছিল
-- (এই সেশনে বহুবার দেখা documented Prisma bug, GitHub issue
-- prisma/prisma#28414 — pgvector HNSW ইনডেক্স ভুলভাবে migration এ
-- অন্তর্ভুক্ত হয়ে যায়)। সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া
-- হয়েছে — HNSW ইনডেক্স অক্ষত থাকবে।

-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '✅',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoggedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_logs" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "habits_userId_idx" ON "habits"("userId");

-- CreateIndex
CREATE INDEX "habit_logs_habitId_date_idx" ON "habit_logs"("habitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_logs_habitId_date_key" ON "habit_logs"("habitId", "date");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260712165818_add_peer_note_sharing
-- Peer Note Sharing ফিচার — Note এ isPublic/helpfulCount যোগ + নতুন
-- note_helpful_votes টেবিল
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (এই সেশনে বহুবার দেখা documented Prisma bug, GitHub issue
-- prisma/prisma#28414)। সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া
-- হয়েছে — HNSW ইনডেক্স অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "note_helpful_votes" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_helpful_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "note_helpful_votes_noteId_userId_key" ON "note_helpful_votes"("noteId", "userId");

-- CreateIndex
CREATE INDEX "notes_topicId_isPublic_idx" ON "notes"("topicId", "isPublic");

-- AddForeignKey
ALTER TABLE "note_helpful_votes" ADD CONSTRAINT "note_helpful_votes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_helpful_votes" ADD CONSTRAINT "note_helpful_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260712171520_add_push_notifications
-- Push Notification ফিচার — নতুন push_subscriptions টেবিল
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও (এই সেশনে চতুর্থবার) ভুলবশত
-- `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট এসেছিল
-- (documented Prisma bug, GitHub issue prisma/prisma#28414)। সেই
-- স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260713034813_add_task_xp_awarded
-- Task XP Farming বাগ ফিক্স — Task এ xpAwarded ফ্ল্যাগ যোগ
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও (এই সেশনে পঞ্চমবার) ভুলবশত
-- `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট এসেছিল
-- (documented Prisma bug, GitHub issue prisma/prisma#28414)। সেই
-- স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব Task ইতিমধ্যে DONE (আগের লজিক অনুযায়ী তারা
-- একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের xpAwarded=true করে দেওয়া
-- হচ্ছে, যাতে migration এর পরে সেই টাস্কগুলো আবার toggle করলে দ্বিতীয়
-- বার XP না পায়। এই মুহূর্তে DB তে কোনো Task নেই (0 rows), কিন্তু
-- ভবিষ্যতে অন্য environment এ এই migration apply হলে নিরাপদ থাকার জন্য
-- এই defensive backfill রাখা হয়েছে।
UPDATE "tasks" SET "xpAwarded" = true WHERE "status" = 'DONE';


-- Migration: 20260713035718_add_study_plan_item_xp_awarded
-- Study Plan Item XP Farming বাগ ফিক্স — xpAwarded ফ্ল্যাগ যোগ (Task
-- এর একই প্যাটার্ন)
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও (এই সেশনে ষষ্ঠবার) ভুলবশত
-- `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট এসেছিল
-- (documented Prisma bug, GitHub issue prisma/prisma#28414)। সেই
-- স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "study_plan_items" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব আইটেম ইতিমধ্যে isCompleted=true (আগের লজিক
-- অনুযায়ী তারা একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের
-- xpAwarded=true করে দেওয়া হচ্ছে।
UPDATE "study_plan_items" SET "xpAwarded" = true WHERE "isCompleted" = true;


-- Migration: 20260713051848_add_cq_misconception_tag
-- AlterTable
ALTER TABLE "cq_questions" ADD COLUMN     "misconceptionTag" TEXT;


-- Migration: 20260717060500_add_reading_room
-- CreateEnum
CREATE TYPE "ReadingRoomTheme" AS ENUM ('LOFI_CAFE', 'DARK_ACADEMIA', 'COZY_LIBRARY', 'RAINY_WINDOW', 'SILENT_HALL');

-- CreateEnum
CREATE TYPE "ReadingRoomActivity" AS ENUM ('SELF_STUDY', 'CLASS', 'BREAK');

-- CreateTable
CREATE TABLE "reading_room_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "room" "ReadingRoomTheme" NOT NULL,
    "activity" "ReadingRoomActivity" NOT NULL DEFAULT 'SELF_STUDY',
    "goal" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalFocusSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_room_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reading_room_sessions_room_endedAt_lastHeartbeatAt_idx" ON "reading_room_sessions"("room", "endedAt", "lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "reading_room_sessions_userId_endedAt_idx" ON "reading_room_sessions"("userId", "endedAt");

-- AddForeignKey
ALTER TABLE "reading_room_sessions" ADD CONSTRAINT "reading_room_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260718000000_add_topic_progress_xp_awarded
-- Topic Progress XP Farming বাগ ফিক্স — TopicProgress এ xpAwarded
-- ফ্ল্যাগ যোগ (Task/StudyPlanItem এর একই প্যাটার্ন)
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "topic_progress" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব রেকর্ড ইতিমধ্যে MASTERED (আগের লজিক অনুযায়ী
-- তারা একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের xpAwarded=true করে
-- দেওয়া হচ্ছে, যাতে migration এর পরে সেই টপিকগুলো আবার toggle করলে
-- দ্বিতীয়বার XP না পায়। এই মুহূর্তে DB তে কোনো topic_progress রেকর্ড
-- নেই (0 rows, যাচাই করা হয়েছে), কিন্তু ভবিষ্যতে অন্য environment এ
-- এই migration apply হলে নিরাপদ থাকার জন্য এই defensive backfill রাখা
-- হয়েছে (Task/StudyPlanItem migration এর একই প্যাটার্ন)।
UPDATE "topic_progress" SET "xpAwarded" = true WHERE "status" = 'MASTERED';


-- Migration: 20260718010000_add_study_group_weekly_bonus_claim
-- Study Group Weekly Bonus XP race condition ফিক্স — atomic claim
-- mechanism এর জন্য StudyGroup এ weeklyBonusWeekStart ফিল্ড যোগ
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "study_groups" ADD COLUMN     "weeklyBonusWeekStart" TIMESTAMP(3);


-- Migration: 20260718020000_add_flexible_study_plan_duration
-- "আজকের পড়া" (Today's Focus) ফিচার — নমনীয় Duration সহ Study Plan
-- (১/৭/৩০/৩৬৫ দিন) + ব্যাকগ্রাউন্ড chunked generation ট্র্যাকিং
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- CreateEnum
CREATE TYPE "StudyPlanGenerationStatus" AS ENUM ('GENERATING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "study_plans" ADD COLUMN     "daysGenerated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "durationDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "generationError" TEXT,
ADD COLUMN     "generationStatus" "StudyPlanGenerationStatus" NOT NULL DEFAULT 'READY';

-- Backfill: বিদ্যমান সব প্ল্যান আগের ফিক্সড ৭-দিনের সিস্টেমে বানানো
-- হয়েছিল, তাই durationDays=7 (ডিফল্ট) ও generationStatus=READY
-- (ডিফল্ট) স্বাভাবিকভাবেই সঠিক থাকবে — কোনো ম্যানুয়াল UPDATE লাগবে না।


-- Migration: 20260719000000_add_forum_best_answer_xp_awarded
-- Forum Best Answer XP Farming বাগ ফিক্স — ForumReply এ
-- bestAnswerXpAwarded ফ্ল্যাগ যোগ (Task/StudyPlanItem/TopicProgress এর
-- একই প্যাটার্ন)
-- -------------------------------------------------------------------
-- ⚠️ নোট: `prisma migrate diff` স্বয়ংক্রিয়ভাবে জেনারেট করা SQL এ
-- আবারও ভুলবশত `DROP INDEX "pdf_chunks_embedding_idx"` স্টেটমেন্ট
-- এসেছিল (documented Prisma bug, GitHub issue prisma/prisma#28414)।
-- সেই স্টেটমেন্ট ইচ্ছাকৃতভাবে এখানে বাদ দেওয়া হয়েছে — HNSW ইনডেক্স
-- অক্ষত থাকবে।

-- AlterTable
ALTER TABLE "forum_replies" ADD COLUMN     "bestAnswerXpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: বিদ্যমান যেসব reply ইতিমধ্যে isBestAnswer=true (আগের লজিক
-- অনুযায়ী তারা একবার XP পেয়ে গেছে ধরে নেওয়া হচ্ছে) তাদের
-- bestAnswerXpAwarded=true করে দেওয়া হচ্ছে, যাতে migration এর পরে সেই
-- reply আবার toggle করলে দ্বিতীয়বার XP না পায়।
UPDATE "forum_replies" SET "bestAnswerXpAwarded" = true WHERE "isBestAnswer" = true;


-- Migration: 20260721000000_add_admin_powerup_ban_system_settings
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedBy" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "announcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "announcementText" TEXT,
    "announcementId" TEXT,
    "featureFlags" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);


-- Migration: 20260722000000_add_performance_indexes_studygroupmember_quizduel
-- Performance অডিটে আবিষ্কৃত: Postgres FK কলামে automatic index তৈরি হয়
-- না (MySQL এর বিপরীতে), তাই এই hot-path FK কলামগুলো ম্যানুয়ালি indexed
-- করা হলো।

-- StudyGroupMember.groupId — member list/capacity count/weekly bonus
-- query সবই groupId দিয়ে ফিল্টার করে
CREATE INDEX IF NOT EXISTS "study_group_members_groupId_idx" ON "study_group_members"("groupId");

-- QuizDuel.challengerId ও opponentId — /api/duel ও getMyDuelHistory()
-- উভয়ই "status + OR(challengerId, opponentId)" প্যাটার্নে query করে
CREATE INDEX IF NOT EXISTS "quiz_duels_challengerId_idx" ON "quiz_duels"("challengerId");
CREATE INDEX IF NOT EXISTS "quiz_duels_opponentId_idx" ON "quiz_duels"("opponentId");


-- Migration: 20260725060000_add_bookmark_folders
-- Bookmark Collections/Folders — নতুন BookmarkFolder মডেল + Bookmark.folderId
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- CreateTable
CREATE TABLE "bookmark_folders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL DEFAULT '#6366f1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmark_folders_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "bookmarks" ADD COLUMN "folderId" TEXT;

-- CreateIndex
CREATE INDEX "bookmark_folders_userId_idx" ON "bookmark_folders"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_folderId_idx" ON "bookmarks"("userId", "folderId");

-- AddForeignKey
ALTER TABLE "bookmark_folders" ADD CONSTRAINT "bookmark_folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "bookmark_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260725063000_add_exam_checklist
-- Exam Day Checklist Mode — নতুন ExamChecklistItem মডেল + ExamChecklistCategory enum
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- CreateEnum
CREATE TYPE "ExamChecklistCategory" AS ENUM ('NIGHT_BEFORE', 'EXAM_DAY');

-- CreateTable
CREATE TABLE "exam_checklist_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "ExamChecklistCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_checklist_items_userId_category_idx" ON "exam_checklist_items"("userId", "category");

-- AddForeignKey
ALTER TABLE "exam_checklist_items" ADD CONSTRAINT "exam_checklist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260726000000_add_live_study_presence
-- Live Study Presence — "এখন কে কে পড়ছে" (Live Study Leaderboard) ফিচার
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- CreateEnum
CREATE TYPE "LiveActivityType" AS ENUM ('PRACTICE', 'CQ', 'FLASHCARD', 'POMODORO', 'READING_ROOM', 'MOCK_EXAM');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "currentActivityAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "currentActivityType" "LiveActivityType";

-- Live Study Leaderboard এ "এখন কে পড়ছে" query করার সময় বারবার
-- WHERE currentActivityAt >= X ফিল্টার হবে (Leaderboard পেজ hit হলেই)
CREATE INDEX "users_currentActivityAt_idx" ON "users"("currentActivityAt");


-- Migration: 20260727000000_add_duel_custom_set_support
-- Duel + CustomQuestionSet সংযোগ — subjectId ঐচ্ছিক করা হচ্ছে, customSetId
-- যোগ হচ্ছে (Quiz Battle এর established প্যাটার্ন অনুসরণ করে)
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- DropForeignKey (subjectId এর existing CASCADE constraint, ঐচ্ছিক করার জন্য SetNull এ পরিবর্তন)
ALTER TABLE "quiz_duels" DROP CONSTRAINT "quiz_duels_subjectId_fkey";

-- AlterTable
ALTER TABLE "quiz_duels" ALTER COLUMN "subjectId" DROP NOT NULL;
ALTER TABLE "quiz_duels" ADD COLUMN "customSetId" TEXT;

-- AddForeignKey (SetNull — Subject ডিলিট হলে Duel টা customSetId-based
-- ছিল কিনা তা অক্ষত রেখে subjectId শুধু null হয়ে যাবে)
ALTER TABLE "quiz_duels" ADD CONSTRAINT "quiz_duels_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260727010000_add_live_exam_cq_support
-- Live Exam এ CQ (সৃজনশীল প্রশ্ন) সাপোর্ট যোগ — established শুধু MCQ
-- সীমাবদ্ধতা তুলে নেওয়া হচ্ছে, AI-evaluate ভিত্তিক scoring
-- -------------------------------------------------------------------
-- ⚠️ নোট (established pattern): `prisma migrate dev` shadow database তে
-- `vector` extension না থাকায় P3006 error দেয় (pgvector HNSW ইনডেক্স
-- সংক্রান্ত documented recurring issue) — তাই migration ম্যানুয়ালি লেখা
-- হয়েছে এবং সরাসরি apply করে `prisma migrate resolve --applied` দিয়ে
-- migration history সিঙ্ক করা হবে।

-- AlterTable
ALTER TABLE "live_exam_sessions" ADD COLUMN "questionType" "QuestionType" NOT NULL DEFAULT 'MCQ';
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqAnswers" JSONB;
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqEvaluations" JSONB;
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqScore" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "live_exam_sessions" ADD COLUMN "cqTotalMarks" INTEGER NOT NULL DEFAULT 0;


-- Migration: 20260804000000_add_strict_focus
-- Consent-based Strict Focus contracts and sessions
CREATE TYPE "FocusSessionSource" AS ENUM ('SELF', 'ADMIN');
CREATE TYPE "FocusSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EMERGENCY_EXIT');

CREATE TABLE "focus_contracts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowAdminStart" BOOLEAN NOT NULL DEFAULT false,
    "maxAdminDurationMinutes" INTEGER NOT NULL DEFAULT 120,
    "nativeEnforcementEnabled" BOOLEAN NOT NULL DEFAULT false,
    "consentVersion" TEXT NOT NULL DEFAULT '2026-08',
    "consentedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "focus_contracts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "focus_contracts_duration_check" CHECK ("maxAdminDurationMinutes" BETWEEN 20 AND 120)
);

CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "initiatedById" TEXT,
    "source" "FocusSessionSource" NOT NULL,
    "status" "FocusSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "durationMinutes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "nativeEnforcementRequested" BOOLEAN NOT NULL DEFAULT false,
    "nativeEnforcementActive" BOOLEAN NOT NULL DEFAULT false,
    "lastHeartbeatAt" TIMESTAMP(3),
    "emergencyExitedAt" TIMESTAMP(3),
    "emergencyReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "focus_sessions_duration_check" CHECK ("durationMinutes" BETWEEN 20 AND 120),
    CONSTRAINT "focus_sessions_time_check" CHECK ("endsAt" > "startedAt")
);

CREATE UNIQUE INDEX "focus_contracts_userId_key" ON "focus_contracts"("userId");
CREATE INDEX "focus_sessions_userId_status_endsAt_idx" ON "focus_sessions"("userId", "status", "endsAt");
CREATE INDEX "focus_sessions_initiatedById_createdAt_idx" ON "focus_sessions"("initiatedById", "createdAt");
-- Database-level race guard: at most one active session per target user.
CREATE UNIQUE INDEX "focus_sessions_one_active_per_user_idx"
    ON "focus_sessions"("userId") WHERE "status" = 'ACTIVE';

ALTER TABLE "focus_contracts"
    ADD CONSTRAINT "focus_contracts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "focus_sessions"
    ADD CONSTRAINT "focus_sessions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "focus_sessions"
    ADD CONSTRAINT "focus_sessions_initiatedById_fkey"
    FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "native_devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'android',
    "remoteFocusCapable" BOOLEAN NOT NULL DEFAULT false,
    "accessibilityEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "native_devices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "native_devices_token_key" ON "native_devices"("token");
CREATE INDEX "native_devices_userId_remoteFocusCapable_idx"
    ON "native_devices"("userId", "remoteFocusCapable");

ALTER TABLE "native_devices"
    ADD CONSTRAINT "native_devices_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260804010000_add_focus_analytics
-- Focus analytics dimensions and privacy consent
ALTER TABLE "focus_contracts"
    ADD COLUMN "shareAnalyticsWithAdmin" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "focus_sessions"
    ADD COLUMN "subjectCode" "SubjectCode",
    ADD COLUMN "focusLabel" VARCHAR(120);

CREATE INDEX "focus_sessions_userId_startedAt_idx"
    ON "focus_sessions"("userId", "startedAt");
CREATE INDEX "focus_sessions_status_startedAt_idx"
    ON "focus_sessions"("status", "startedAt");
CREATE INDEX "focus_sessions_subjectCode_startedAt_idx"
    ON "focus_sessions"("subjectCode", "startedAt");


-- Migration: 20260804020000_add_focus_scheduling
CREATE TYPE "FocusScheduleRepeat" AS ENUM ('NONE', 'DAILY', 'WEEKLY');
CREATE TYPE "FocusScheduleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

CREATE TABLE "focus_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "subjectCode" "SubjectCode",
    "focusLabel" VARCHAR(120),
    "repeat" "FocusScheduleRepeat" NOT NULL DEFAULT 'NONE',
    "status" "FocusScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Dhaka',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "lastResult" VARCHAR(80),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "focus_schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "focus_schedules_duration_check" CHECK ("durationMinutes" BETWEEN 20 AND 120)
);

ALTER TABLE "focus_sessions" ADD COLUMN "focusScheduleId" TEXT;

CREATE INDEX "focus_schedules_status_nextRunAt_idx" ON "focus_schedules"("status", "nextRunAt");
CREATE INDEX "focus_schedules_userId_status_nextRunAt_idx" ON "focus_schedules"("userId", "status", "nextRunAt");
CREATE INDEX "focus_schedules_createdById_createdAt_idx" ON "focus_schedules"("createdById", "createdAt");
CREATE INDEX "focus_sessions_focusScheduleId_startedAt_idx" ON "focus_sessions"("focusScheduleId", "startedAt");

ALTER TABLE "focus_schedules"
    ADD CONSTRAINT "focus_schedules_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "focus_schedules"
    ADD CONSTRAINT "focus_schedules_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "focus_sessions"
    ADD CONSTRAINT "focus_sessions_focusScheduleId_fkey"
    FOREIGN KEY ("focusScheduleId") REFERENCES "focus_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260804030000_add_focus_scheduler_operations
-- Bounded one-row operational heartbeat/state for external Focus scheduling.
-- Additive only: no existing schedule/session/content rows are changed.
CREATE TABLE "focus_scheduler_state" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastStartedAt" TIMESTAMP(3),
    "lastCompletedAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "lastStatus" VARCHAR(32) NOT NULL DEFAULT 'NEVER',
    "lastSource" VARCHAR(16),
    "lastDurationMs" INTEGER,
    "lastReminderCount" INTEGER NOT NULL DEFAULT 0,
    "lastDueCount" INTEGER NOT NULL DEFAULT 0,
    "lastProcessedCount" INTEGER NOT NULL DEFAULT 0,
    "lastStartedCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailedCount" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" VARCHAR(80),
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "overlapSkips" INTEGER NOT NULL DEFAULT 0,
    "leaseToken" VARCHAR(64),
    "leaseExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_scheduler_state_pkey" PRIMARY KEY ("id")
);


-- Migration: 20260804040000_add_native_push_delivery_readiness
-- Native Android/FCM delivery diagnostics and receipt tracking.
-- Additive: existing device tokens remain registered and no Focus data is removed.
ALTER TABLE "native_devices"
    ADD COLUMN "appVersion" VARCHAR(40),
    ADD COLUMN "deviceModel" VARCHAR(120),
    ADD COLUMN "lastPushAttemptAt" TIMESTAMP(3),
    ADD COLUMN "lastPushSuccessAt" TIMESTAMP(3),
    ADD COLUMN "lastPushFailureAt" TIMESTAMP(3),
    ADD COLUMN "lastPushErrorCode" VARCHAR(100),
    ADD COLUMN "lastCommandId" VARCHAR(64),
    ADD COLUMN "lastReceiptAt" TIMESTAMP(3),
    ADD COLUMN "lastReceiptStatus" VARCHAR(64),
    ADD COLUMN "disabledAt" TIMESTAMP(3),
    ADD COLUMN "disabledReason" VARCHAR(100);

DROP INDEX "native_devices_userId_remoteFocusCapable_idx";
CREATE INDEX "native_devices_userId_remoteFocusCapable_disabledAt_idx"
    ON "native_devices"("userId", "remoteFocusCapable", "disabledAt");
CREATE INDEX "native_devices_lastSeenAt_idx" ON "native_devices"("lastSeenAt");

CREATE TABLE "native_push_deliveries" (
    "id" TEXT NOT NULL,
    "commandId" VARCHAR(64) NOT NULL,
    "deviceId" TEXT NOT NULL,
    "sessionId" VARCHAR(80) NOT NULL,
    "type" VARCHAR(24) NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "receiptAt" TIMESTAMP(3),
    "errorCode" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "native_push_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "native_push_deliveries_commandId_deviceId_key"
    ON "native_push_deliveries"("commandId", "deviceId");
CREATE INDEX "native_push_deliveries_deviceId_createdAt_idx"
    ON "native_push_deliveries"("deviceId", "createdAt");
CREATE INDEX "native_push_deliveries_sessionId_type_createdAt_idx"
    ON "native_push_deliveries"("sessionId", "type", "createdAt");
CREATE INDEX "native_push_deliveries_status_createdAt_idx"
    ON "native_push_deliveries"("status", "createdAt");

ALTER TABLE "native_push_deliveries"
    ADD CONSTRAINT "native_push_deliveries_deviceId_fkey"
    FOREIGN KEY ("deviceId") REFERENCES "native_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Migration: 20260804050000_add_academic_content_reviews
-- Human-controlled academic review workflow.
-- Absence of a row means unreviewed; no content is auto-approved or modified.
CREATE TYPE "ContentReviewTargetType" AS ENUM (
    'CORE_MCQ',
    'ADMISSION_MCQ',
    'CQ',
    'TOPIC_NOTE'
);

CREATE TYPE "ContentReviewStatus" AS ENUM (
    'APPROVED',
    'NEEDS_CORRECTION',
    'REJECTED'
);

CREATE TABLE "content_reviews" (
    "id" TEXT NOT NULL,
    "targetType" "ContentReviewTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" "ContentReviewStatus" NOT NULL,
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "sourceUrl" VARCHAR(2048),
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_reviews_targetType_targetId_key"
    ON "content_reviews"("targetType", "targetId");
CREATE INDEX "content_reviews_status_updatedAt_idx"
    ON "content_reviews"("status", "updatedAt");
CREATE INDEX "content_reviews_reviewerId_updatedAt_idx"
    ON "content_reviews"("reviewerId", "updatedAt");

ALTER TABLE "content_reviews"
    ADD CONSTRAINT "content_reviews_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260804060000_add_content_review_integrity
-- Review integrity: bind decisions to exact content and preserve immutable history.
-- contentHash remains nullable on the current row for backward compatibility;
-- all new application writes require it, and null is treated as stale.
ALTER TABLE "content_reviews"
    ADD COLUMN "contentHash" VARCHAR(64);

CREATE TABLE "content_review_revisions" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "status" "ContentReviewStatus" NOT NULL,
    "contentHash" VARCHAR(64) NOT NULL,
    "reviewNote" TEXT,
    "sourceUrl" VARCHAR(2048),
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_review_revisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_review_revisions_reviewId_createdAt_idx"
    ON "content_review_revisions"("reviewId", "createdAt");
CREATE INDEX "content_review_revisions_reviewerId_createdAt_idx"
    ON "content_review_revisions"("reviewerId", "createdAt");

ALTER TABLE "content_review_revisions"
    ADD CONSTRAINT "content_review_revisions_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "content_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_review_revisions"
    ADD CONSTRAINT "content_review_revisions_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260804070000_add_reverse_fk_performance_indexes
-- Reverse foreign-key indexes for scalable parent deletes/cascades and joins.
-- Additive only; no table rows are changed.
CREATE INDEX "bookmarks_topicId_idx" ON "bookmarks"("topicId");
CREATE INDEX "bookmarks_folderId_idx" ON "bookmarks"("folderId");
CREATE INDEX "cq_attempts_cqQuestionId_idx" ON "cq_attempts"("cqQuestionId");
CREATE INDEX "forum_posts_userId_idx" ON "forum_posts"("userId");
CREATE INDEX "forum_replies_userId_idx" ON "forum_replies"("userId");
CREATE INDEX "note_helpful_votes_userId_idx" ON "note_helpful_votes"("userId");
CREATE INDEX "quiz_battle_participants_userId_idx" ON "quiz_battle_participants"("userId");
CREATE INDEX "quiz_battles_subjectId_idx" ON "quiz_battles"("subjectId");
CREATE INDEX "quiz_duels_subjectId_idx" ON "quiz_duels"("subjectId");
CREATE INDEX "topic_progress_topicId_idx" ON "topic_progress"("topicId");
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");


-- Migration: 20260804080000_add_critical_query_performance_indexes
-- Critical read-path indexes: engagement windows, recent activity and ordered feeds.
-- Additive only; no existing indexes or rows are removed.
CREATE INDEX "users_lastActiveAt_idx" ON "users"("lastActiveAt");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "notifications_userId_read_createdAt_idx"
    ON "notifications"("userId", "read", "createdAt");
CREATE INDEX "quiz_attempts_userId_createdAt_idx"
    ON "quiz_attempts"("userId", "createdAt");
CREATE INDEX "cq_attempts_userId_createdAt_idx"
    ON "cq_attempts"("userId", "createdAt");
CREATE INDEX "study_sessions_userId_createdAt_idx"
    ON "study_sessions"("userId", "createdAt");


-- Migration: 20260805000000_add_privacy_compliance
-- Privacy & Compliance Center
-- Versioned policy acknowledgement records are additive and do not infer
-- acceptance for existing users. Existing accounts remain usable and can
-- acknowledge the current versions explicitly from Settings.

CREATE TABLE "policy_acceptances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "privacyVersion" VARCHAR(32) NOT NULL,
    "termsVersion" VARCHAR(32) NOT NULL,
    "ageAssuranceVersion" VARCHAR(32) NOT NULL,
    "source" VARCHAR(32) NOT NULL DEFAULT 'REGISTRATION',
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "policy_acceptance_versions_key"
ON "policy_acceptances"(
    "userId",
    "privacyVersion",
    "termsVersion",
    "ageAssuranceVersion"
);

CREATE INDEX "policy_acceptances_userId_acceptedAt_idx"
ON "policy_acceptances"("userId", "acceptedAt");

ALTER TABLE "policy_acceptances"
ADD CONSTRAINT "policy_acceptances_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- The disclosure changed materially in this phase. Do not silently upgrade
-- existing consent rows; version mismatch forces explicit re-confirmation.
ALTER TABLE "focus_contracts"
ALTER COLUMN "consentVersion" SET DEFAULT '2026-08-05';


-- Migration: 20260805010000_add_auth_session_version
-- Revoke stale JWT sessions after password, role or ban-state changes.
ALTER TABLE "users"
ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0;


-- Migration: 20260805020000_add_academic_issue_reports
-- Student-to-expert academic correction loop.
CREATE TYPE "AcademicReportReason" AS ENUM (
  'WRONG_ANSWER',
  'FACTUAL_ERROR',
  'EXPLANATION_ERROR',
  'TYPO_FORMATTING',
  'OUTDATED_SOURCE',
  'DUPLICATE',
  'NOTE_FORMULA_ERROR',
  'OTHER'
);

CREATE TABLE "academic_content_reports" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" "ContentReviewTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "contentHash" VARCHAR(64) NOT NULL,
  "reason" "AcademicReportReason" NOT NULL,
  "details" TEXT,
  "status" "ContentReportStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "resolutionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "academic_content_reports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_report_exact_issue_key"
ON "academic_content_reports"(
  "userId", "targetType", "targetId", "contentHash", "reason"
);

CREATE INDEX "academic_content_reports_status_createdAt_idx"
ON "academic_content_reports"("status", "createdAt");

CREATE INDEX "academic_content_reports_targetType_targetId_status_idx"
ON "academic_content_reports"("targetType", "targetId", "status");

CREATE INDEX "academic_content_reports_userId_createdAt_idx"
ON "academic_content_reports"("userId", "createdAt");

CREATE INDEX "academic_content_reports_reviewedById_reviewedAt_idx"
ON "academic_content_reports"("reviewedById", "reviewedAt");

ALTER TABLE "academic_content_reports"
ADD CONSTRAINT "academic_content_reports_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academic_content_reports"
ADD CONSTRAINT "academic_content_reports_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;


-- Migration: 20260805030000_add_multi_ai_academic_review
-- Multi-provider AI academic review evidence and transparent reviewer identity.
ALTER TYPE "ContentReviewStatus" ADD VALUE IF NOT EXISTS 'AI_CONFLICT';
ALTER TYPE "ContentReviewStatus" ADD VALUE IF NOT EXISTS 'SOURCE_REQUIRED';

CREATE TYPE "ContentReviewerKind" AS ENUM ('ADMIN', 'AI');
CREATE TYPE "AIReviewVerdict" AS ENUM (
  'APPROVE', 'NEEDS_CORRECTION', 'SOURCE_REQUIRED', 'CONFLICT', 'ERROR'
);
CREATE TYPE "AIReviewBatchStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');

ALTER TABLE "content_reviews"
ADD COLUMN "reviewerKind" "ContentReviewerKind" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN "aiConfidence" DOUBLE PRECISION,
ADD COLUMN "aiEvidence" JSONB,
ADD COLUMN "reviewMethodVersion" VARCHAR(64);

ALTER TABLE "content_review_revisions"
ADD COLUMN "reviewerKind" "ContentReviewerKind" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN "aiConfidence" DOUBLE PRECISION,
ADD COLUMN "aiEvidence" JSONB,
ADD COLUMN "reviewMethodVersion" VARCHAR(64);

CREATE TABLE "ai_review_batches" (
  "id" TEXT NOT NULL,
  "status" "AIReviewBatchStatus" NOT NULL DEFAULT 'RUNNING',
  "targetType" "ContentReviewTargetType",
  "requestedCount" INTEGER NOT NULL,
  "processedCount" INTEGER NOT NULL DEFAULT 0,
  "approvedCount" INTEGER NOT NULL DEFAULT 0,
  "flaggedCount" INTEGER NOT NULL DEFAULT 0,
  "conflictCount" INTEGER NOT NULL DEFAULT 0,
  "errorCount" INTEGER NOT NULL DEFAULT 0,
  "methodVersion" VARCHAR(64) NOT NULL,
  "providers" JSONB NOT NULL,
  "confidenceThreshold" DOUBLE PRECISION NOT NULL,
  "lastErrorCode" VARCHAR(100),
  "initiatedById" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ai_review_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_content_review_runs" (
  "id" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "targetType" "ContentReviewTargetType" NOT NULL,
  "targetId" TEXT NOT NULL,
  "contentHash" VARCHAR(64) NOT NULL,
  "provider" VARCHAR(40) NOT NULL,
  "model" VARCHAR(120) NOT NULL,
  "verdict" "AIReviewVerdict" NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "answerFingerprint" VARCHAR(512),
  "rationale" TEXT NOT NULL,
  "issues" JSONB,
  "sourceRequired" BOOLEAN NOT NULL DEFAULT false,
  "responseHash" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_content_review_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ai_review_batches_status_createdAt_idx"
ON "ai_review_batches"("status", "createdAt");
CREATE INDEX "ai_review_batches_initiatedById_createdAt_idx"
ON "ai_review_batches"("initiatedById", "createdAt");
CREATE UNIQUE INDEX "ai_review_run_provider_key"
ON "ai_content_review_runs"("batchId", "targetType", "targetId", "provider");
CREATE INDEX "ai_content_review_runs_targetType_targetId_contentHash_idx"
ON "ai_content_review_runs"("targetType", "targetId", "contentHash");
CREATE INDEX "ai_content_review_runs_verdict_createdAt_idx"
ON "ai_content_review_runs"("verdict", "createdAt");

ALTER TABLE "ai_review_batches"
ADD CONSTRAINT "ai_review_batches_initiatedById_fkey"
FOREIGN KEY ("initiatedById") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ai_content_review_runs"
ADD CONSTRAINT "ai_content_review_runs_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "ai_review_batches"("id")
ON DELETE CASCADE ON UPDATE CASCADE;


