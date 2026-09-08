// ===================================================================
// Account privacy — portable export + irreversible account deletion
// -------------------------------------------------------------------
// Export includes account-linked learning/AI/PDF/Focus/community/consent
// records while intentionally excluding credentials, vectors and another
// person's private identity. Deletion handles both relational cascade data and
// non-FK operational references, then de-identifies retained security facts.
// ===================================================================
import { prisma } from "@/lib/prisma";
import { leaveStudyGroup } from "@/lib/study-group";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "@/lib/privacy-compliance";

function pushServiceHost(endpoint: string): string {
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "unavailable";
  }
}

/** Builds a user-portable JSON object. No password/token/key/vector is returned. */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      hscBatch: true,
      board: true,
      examDate: true,
      preferredLanguage: true,
      targetGpa: true,
      xp: true,
      level: true,
      streakCount: true,
      longestStreak: true,
      lastActiveAt: true,
      streakFreezes: true,
      lastFreezeRefillAt: true,
      leagueTier: true,
      weeklyXp: true,
      weekStartDate: true,
      aiTutorMode: true,
      publicProfileEnabled: true,
      profileSlug: true,
      emailDigestEnabled: true,
      lastDigestSentAt: true,
      isBanned: true,
      banReason: true,
      bannedAt: true,
      currentActivityAt: true,
      currentActivityType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new Error("ইউজার পাওয়া যায়নি");

  const [
    quizAttempts,
    cqAttempts,
    mockExamAttempts,
    flashcardDecks,
    tasks,
    studySessions,
    userBadges,
    chatMessages,
    notifications,
    bookmarks,
    bookmarkFolders,
    notes,
    topicProgress,
    forumPosts,
    forumReplies,
    forumVotes,
    contentReports,
    academicReports,
    noteHelpfulVotes,
    studyPet,
    habits,
    examChecklistItems,
    pdfDocuments,
    customQuestionSets,
    liveExamSessions,
    admissionMockAttempts,
    routineSlots,
    studyPlans,
    quizBattlesOwned,
    quizBattleParticipations,
    duelsAsChallenger,
    duelsAsOpponent,
    studyGroupMember,
    readingRoomSessions,
    focusContract,
    focusSessions,
    focusSchedules,
    nativeDevices,
    policyAcceptances,
    pushSubscriptions,
    contentReviews,
    contentReviewRevisions,
    aiReviewBatches,
    broadcastRecipients,
    broadcastCampaigns,
    broadcastTemplates,
    ownAuditEvents,
  ] = await Promise.all([
    prisma.quizAttempt.findMany({ where: { userId }, include: { answers: true } }),
    prisma.cQAttempt.findMany({ where: { userId } }),
    prisma.mockExamAttempt.findMany({ where: { userId } }),
    prisma.flashcardDeck.findMany({ where: { userId }, include: { flashcards: true } }),
    prisma.task.findMany({ where: { userId } }),
    prisma.studySession.findMany({ where: { userId } }),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
    prisma.chatMessage.findMany({ where: { userId } }),
    prisma.notification.findMany({ where: { userId } }),
    prisma.bookmark.findMany({ where: { userId } }),
    prisma.bookmarkFolder.findMany({ where: { userId } }),
    prisma.note.findMany({ where: { userId } }),
    prisma.topicProgress.findMany({ where: { userId } }),
    prisma.forumPost.findMany({ where: { userId } }),
    prisma.forumReply.findMany({ where: { userId } }),
    prisma.forumVote.findMany({
      where: { userId },
      select: { id: true, postId: true, replyId: true, value: true, createdAt: true },
    }),
    prisma.contentReport.findMany({
      where: { userId },
      select: {
        id: true,
        postId: true,
        replyId: true,
        reason: true,
        details: true,
        status: true,
        reviewedAt: true,
        createdAt: true,
      },
    }),
    prisma.academicContentReport.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        contentHash: true,
        reason: true,
        details: true,
        status: true,
        resolutionNote: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.noteHelpfulVote.findMany({
      where: { userId },
      select: { id: true, noteId: true, createdAt: true },
    }),
    prisma.studyPet.findUnique({ where: { userId } }),
    prisma.habit.findMany({ where: { userId }, include: { logs: true } }),
    prisma.examChecklistItem.findMany({ where: { userId } }),
    prisma.pdfDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        originalFileName: true,
        pageCount: true,
        totalChunks: true,
        status: true,
        errorMessage: true,
        summary: true,
        summaryGeneratedAt: true,
        mindMap: true,
        mindMapGeneratedAt: true,
        createdAt: true,
        updatedAt: true,
        chunks: {
          orderBy: { chunkIndex: "asc" },
          select: {
            id: true,
            chunkIndex: true,
            pageNumber: true,
            content: true,
            createdAt: true,
          },
        },
        chatMessages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            role: true,
            content: true,
            citedPages: true,
            provider: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.customQuestionSet.findMany({
      where: { userId },
      include: { questions: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.liveExamSession.findMany({ where: { userId } }),
    prisma.admissionMockAttempt.findMany({ where: { userId } }),
    prisma.routineSlot.findMany({ where: { userId } }),
    prisma.studyPlan.findMany({ where: { userId }, include: { items: true } }),
    prisma.quizBattle.findMany({ where: { ownerId: userId } }),
    prisma.quizBattleParticipant.findMany({
      where: { userId },
      select: {
        id: true,
        battleId: true,
        answers: true,
        score: true,
        timeTakenSec: true,
        submittedAt: true,
        joinedAt: true,
        battle: {
          select: { title: true, status: true, createdAt: true, completedAt: true },
        },
      },
    }),
    prisma.quizDuel.findMany({
      where: { challengerId: userId },
      select: {
        id: true,
        subjectId: true,
        customSetId: true,
        questionIds: true,
        challengerAnswers: true,
        challengerScore: true,
        challengerTimeSec: true,
        winnerId: true,
        status: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
      },
    }),
    prisma.quizDuel.findMany({
      where: { opponentId: userId },
      select: {
        id: true,
        subjectId: true,
        customSetId: true,
        questionIds: true,
        opponentAnswers: true,
        opponentScore: true,
        opponentTimeSec: true,
        winnerId: true,
        status: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
      },
    }),
    prisma.studyGroupMember.findUnique({
      where: { userId },
      select: {
        id: true,
        role: true,
        weeklyXpContributed: true,
        weekStartDate: true,
        joinedAt: true,
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            weeklyGoalXp: true,
            maxMembers: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.readingRoomSession.findMany({ where: { userId } }),
    prisma.focusContract.findUnique({ where: { userId } }),
    prisma.focusSession.findMany({
      where: { userId },
      select: {
        id: true,
        focusScheduleId: true,
        source: true,
        status: true,
        durationMinutes: true,
        subjectCode: true,
        focusLabel: true,
        startedAt: true,
        endsAt: true,
        completedAt: true,
        nativeEnforcementRequested: true,
        nativeEnforcementActive: true,
        lastHeartbeatAt: true,
        emergencyExitedAt: true,
        emergencyReason: true,
        cancelledAt: true,
        cancelReason: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.focusSchedule.findMany({
      where: { userId },
      select: {
        id: true,
        durationMinutes: true,
        subjectCode: true,
        focusLabel: true,
        repeat: true,
        status: true,
        timeZone: true,
        scheduledFor: true,
        nextRunAt: true,
        lastRunAt: true,
        reminderSentAt: true,
        lastResult: true,
        cancelledAt: true,
        cancelReason: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.nativeDevice.findMany({
      where: { userId },
      select: {
        id: true,
        platform: true,
        appVersion: true,
        deviceModel: true,
        remoteFocusCapable: true,
        accessibilityEnabled: true,
        lastSeenAt: true,
        lastPushAttemptAt: true,
        lastPushSuccessAt: true,
        lastPushFailureAt: true,
        lastPushErrorCode: true,
        lastReceiptAt: true,
        lastReceiptStatus: true,
        disabledAt: true,
        disabledReason: true,
        createdAt: true,
        updatedAt: true,
        pushDeliveries: {
          orderBy: { createdAt: "asc" },
          select: {
            sessionId: true,
            type: true,
            status: true,
            issuedAt: true,
            expiresAt: true,
            sentAt: true,
            receiptAt: true,
            errorCode: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.policyAcceptance.findMany({
      where: { userId },
      orderBy: { acceptedAt: "asc" },
      select: {
        privacyVersion: true,
        termsVersion: true,
        ageAssuranceVersion: true,
        source: true,
        acceptedAt: true,
      },
    }),
    prisma.pushSubscription.findMany({
      where: { userId },
      select: { endpoint: true, createdAt: true },
    }),
    prisma.contentReview.findMany({
      where: { reviewerId: userId },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        status: true,
        reviewerKind: true,
        reviewNote: true,
        sourceUrl: true,
        contentHash: true,
        aiConfidence: true,
        aiEvidence: true,
        reviewMethodVersion: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.contentReviewRevision.findMany({
      where: { reviewerId: userId },
      select: {
        id: true,
        reviewId: true,
        status: true,
        contentHash: true,
        reviewerKind: true,
        reviewNote: true,
        sourceUrl: true,
        aiConfidence: true,
        aiEvidence: true,
        reviewMethodVersion: true,
        createdAt: true,
      },
    }),
    prisma.aIReviewBatch.findMany({
      where: { initiatedById: userId },
      orderBy: { createdAt: "asc" },
      include: { runs: true },
    }),
    prisma.broadcastRecipient.findMany({
      where: { userId },
      select: {
        id: true,
        inAppDelivered: true,
        inAppRead: true,
        pushDelivered: true,
        emailDelivered: true,
        nativePushDelivered: true,
        deliveredAt: true,
        readAt: true,
        failedReason: true,
        createdAt: true,
        campaign: {
          select: {
            title: true,
            body: true,
            link: true,
            icon: true,
            sendInApp: true,
            sendPush: true,
            sendEmail: true,
            sendNativePush: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.broadcastCampaign.findMany({
      where: { sentById: userId },
      select: {
        id: true,
        title: true,
        body: true,
        link: true,
        icon: true,
        targetType: true,
        targetFilter: true,
        sendInApp: true,
        sendPush: true,
        sendEmail: true,
        sendNativePush: true,
        status: true,
        totalRecipients: true,
        sentCount: true,
        failedCount: true,
        readCount: true,
        scheduledFor: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.broadcastTemplate.findMany({
      where: { createdById: userId },
      select: {
        id: true,
        name: true,
        title: true,
        body: true,
        link: true,
        icon: true,
        targetType: true,
        variables: true,
        usageCount: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: "asc" },
      select: { action: true, targetType: true, createdAt: true },
    }),
  ]);

  return {
    exportMetadata: {
      exportedAt: new Date().toISOString(),
      exportVersion: 2,
      currentPolicyVersions: {
        privacy: CURRENT_PRIVACY_VERSION,
        terms: CURRENT_TERMS_VERSION,
      },
      exclusions: [
        "password hash and reset tokens",
        "web/native push endpoint credentials and raw device tokens",
        "PDF vector embeddings",
        "rate-limit identifiers and authentication/session secrets",
        "another user's private identity, answers or group invite code",
        "raw IP address and internal security-only metadata",
      ],
    },
    profile: user,
    learning: {
      quizAttempts,
      cqAttempts,
      mockExamAttempts,
      liveExamSessions,
      admissionMockAttempts,
      topicProgress,
      studySessions,
      readingRoomSessions,
    },
    planningAndRevision: {
      flashcardDecks,
      tasks,
      routineSlots,
      studyPlans,
      habits,
      examChecklistItems,
      bookmarks,
      bookmarkFolders,
      notes,
    },
    achievements: { badges: userBadges, studyPet },
    aiAndDocuments: { chatMessages, pdfDocuments, customQuestionSets },
    community: {
      forumPosts,
      forumReplies,
      forumVotes,
      contentReports,
      noteHelpfulVotes,
      studyGroupMembership: studyGroupMember,
      quizBattlesOwned,
      quizBattleParticipations,
      quizDuels: {
        asChallenger: duelsAsChallenger.map(({ winnerId, ...duel }) => ({
          ...duel,
          outcome: winnerId === null ? "DRAW_OR_UNDECIDED" : winnerId === userId ? "WON" : "LOST",
        })),
        asOpponent: duelsAsOpponent.map(({ winnerId, ...duel }) => ({
          ...duel,
          outcome: winnerId === null ? "DRAW_OR_UNDECIDED" : winnerId === userId ? "WON" : "LOST",
        })),
      },
    },
    academicFeedback: { reports: academicReports },
    focus: { contract: focusContract, sessions: focusSessions, schedules: focusSchedules },
    notificationsAndDevices: {
      notifications,
      webPushRegistrations: pushSubscriptions.map((subscription) => ({
        serviceHost: pushServiceHost(subscription.endpoint),
        createdAt: subscription.createdAt,
      })),
      nativeDevices,
      broadcastDeliveries: broadcastRecipients,
    },
    policyAcceptances,
    adminAuthoredRecords: {
      contentReviews,
      contentReviewRevisions,
      aiReviewBatches,
      broadcastCampaigns,
      broadcastTemplates,
      auditEvents: ownAuditEvents,
    },
  };
}

export interface DeleteAccountResult {
  deleted: true;
  studyGroupHandled: "left" | "group_deleted" | "not_in_group";
  directReferencesHandled: true;
}

/**
 * Deletes account-linked rows and scrubs non-relational operational references.
 * Callers must verify authorization/password before invoking this function.
 */
export async function deleteUserAccount(userId: string): Promise<DeleteAccountResult> {
  let studyGroupHandled: DeleteAccountResult["studyGroupHandled"] = "not_in_group";

  const identity = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!identity) throw new Error("ACCOUNT_ALREADY_DELETED");

  const membership = await prisma.studyGroupMember.findUnique({ where: { userId } });
  if (membership) {
    const result = await leaveStudyGroup(userId);
    studyGroupHandled = result.groupDeleted ? "group_deleted" : "left";
  }

  await prisma.$transaction(async (tx) => {
    // These tables intentionally have no User FK because their operational
    // history may outlive an account. Delete or de-identify the direct link.
    await Promise.all([
      tx.passwordResetToken.deleteMany({ where: { email: identity.email } }),
      tx.broadcastRecipient.deleteMany({ where: { userId } }),
      tx.broadcastCampaign.updateMany({ where: { sentById: userId }, data: { sentById: null } }),
      tx.broadcastTemplate.updateMany({ where: { createdById: userId }, data: { createdById: null } }),
      tx.contentReport.updateMany({ where: { reviewedById: userId }, data: { reviewedById: null } }),
      tx.user.updateMany({ where: { bannedBy: userId }, data: { bannedBy: null } }),
      tx.systemSetting.updateMany({ where: { updatedBy: userId }, data: { updatedBy: null } }),
      tx.auditLog.updateMany({
        where: { actorId: userId },
        data: {
          actorId: null,
          actorName: null,
          actorEmail: null,
          ipAddress: null,
          metadata: { redacted: true, reason: "account_deleted" },
        },
      }),
      tx.auditLog.updateMany({
        where: { metadata: { path: ["targetUserId"], equals: userId } },
        data: { metadata: { redacted: true, reason: "account_deleted" } },
      }),
      tx.auditLog.updateMany({
        where: { targetType: "User", targetId: userId },
        data: {
          targetType: "DeletedUser",
          targetId: null,
          metadata: { redacted: true, reason: "account_deleted" },
        },
      }),
    ]);

    // All normal account data, including PolicyAcceptance, Focus, PDF vectors,
    // devices and push delivery rows, is protected by onDelete: Cascade/SetNull.
    const deleted = await tx.user.deleteMany({ where: { id: userId } });
    if (deleted.count === 0) throw new Error("ACCOUNT_ALREADY_DELETED");
  });

  return { deleted: true, studyGroupHandled, directReferencesHandled: true };
}
