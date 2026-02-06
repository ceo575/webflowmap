import { prisma } from "@/lib/prisma";

export interface FocusOption {
  id: string;
  content: string;
}

export interface FocusQuestionSnapshot {
  questionId: string;
  content: string;
  options: FocusOption[];
  correctOptionIndex: number;
  correctOptionId: string;
  solution: string | null;
  videoUrl: string | null;
  difficulty: string;
  level: string | null;
  progress: {
    current: number;
    total: number;
  };
}

export interface FocusSessionSnapshot {
  sessionId: string;
  topicId: string;
  topicName: string;
  score: number;
  streak: number;
  currentIndex: number;
  totalQuestions: number;
  question: FocusQuestionSnapshot | null;
  completed: boolean;
}

export function parseQuestionOptions(optionsRaw: string | null): FocusOption[] {
  if (!optionsRaw) return [];

  try {
    const parsed = JSON.parse(optionsRaw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, idx) => {
        if (typeof item === "string") {
          return { id: String.fromCharCode(65 + idx), content: item };
        }

        if (item && typeof item === "object") {
          const id = typeof item.id === "string" ? item.id : String.fromCharCode(65 + idx);
          const content =
            typeof item.content === "string"
              ? item.content
              : typeof item.text === "string"
                ? item.text
                : null;

          if (!content) return null;
          return { id, content };
        }

        return null;
      })
      .filter((item): item is FocusOption => item !== null);
  } catch {
    return [];
  }
}

function resolveCorrectOptionIndex(correctAnswer: string, options: FocusOption[]): number {
  const normalized = correctAnswer.trim();

  const byId = options.findIndex((option) => option.id.toUpperCase() === normalized.toUpperCase());
  if (byId >= 0) return byId;

  const byNumber = Number(normalized);
  if (!Number.isNaN(byNumber)) {
    if (byNumber >= 0 && byNumber < options.length) return byNumber;
    if (byNumber > 0 && byNumber <= options.length) return byNumber - 1;
  }

  const byContent = options.findIndex((option) => option.content.trim() === normalized);
  if (byContent >= 0) return byContent;

  return 0;
}

function levelWeight(level: string | null): number {
  if (!level) return 0;
  const normalized = level.toUpperCase();
  if (normalized === "VDC") return 4;
  if (normalized === "VD") return 3;
  if (normalized === "TH") return 2;
  if (normalized === "NB") return 1;
  return 0;
}

async function getQuestionPool(userId: string, topicId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { grade: true } });

  const pool = await prisma.question.findMany({
    where: {
      type: "MCQ",
      exam: {
        isPublic: true,
        topicId,
        ...(user?.grade ? { OR: [{ grade: user.grade }, { grade: null }] } : {}),
      },
    },
    select: {
      id: true,
      options: true,
      correctAnswer: true,
      level: true,
      explanation: true,
      videoUrl: true,
      content: true,
      exam: {
        select: {
          id: true,
          subject: true,
          title: true,
        },
      },
    },
  });

  return pool.filter((question) => parseQuestionOptions(question.options).length >= 2);
}

async function pickWeakQuestionIds(userId: string, topicId: string, take: number) {
  const pool = await getQuestionPool(userId, topicId);
  if (!pool.length) return [] as string[];

  const questionIds = pool.map((question) => question.id);

  const attempts = await prisma.practiceAttempt.findMany({
    where: {
      questionId: { in: questionIds },
      session: {
        studentId: userId,
      },
    },
    select: {
      questionId: true,
      isCorrect: true,
      answeredAt: true,
    },
    orderBy: { answeredAt: "desc" },
  });

  const recentAttempts = await prisma.practiceAttempt.findMany({
    where: {
      session: {
        studentId: userId,
        topicId,
      },
    },
    select: {
      questionId: true,
    },
    orderBy: { answeredAt: "desc" },
    take: take,
  });
  const recentSet = new Set(recentAttempts.map((item) => item.questionId));

  const stats = new Map<string, { total: number; correct: number; lastWrong: boolean }>();
  for (const attempt of attempts) {
    const current = stats.get(attempt.questionId) ?? { total: 0, correct: 0, lastWrong: false };
    current.total += 1;
    if (attempt.isCorrect) current.correct += 1;
    if (current.total === 1) current.lastWrong = !attempt.isCorrect;
    stats.set(attempt.questionId, current);
  }

  const ranked = pool
    .map((question) => {
      const stat = stats.get(question.id);
      const total = stat?.total ?? 0;
      const correct = stat?.correct ?? 0;
      const wrongRate = total === 0 ? 1 : (total - correct) / total;
      const neverCorrect = total > 0 && correct === 0;
      const unseen = total === 0;

      let priority = wrongRate * 100;
      if (unseen) priority += 30;
      if (neverCorrect) priority += 20;
      if (stat?.lastWrong) priority += 15;
      priority += levelWeight(question.level) * 5;
      if (recentSet.has(question.id)) priority -= 120;

      return {
        id: question.id,
        priority,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  return ranked.slice(0, take).map((item) => item.id);
}

export async function getSessionSnapshot(userId: string, sessionId: string): Promise<FocusSessionSnapshot | null> {
  const session = await prisma.practiceSession.findFirst({
    where: { id: sessionId, studentId: userId },
    include: {
      topic: { select: { id: true, name: true } },
      items: {
        orderBy: { orderIndex: "asc" },
        include: {
          question: {
            select: {
              id: true,
              content: true,
              options: true,
              correctAnswer: true,
              explanation: true,
              videoUrl: true,
              level: true,
            },
          },
        },
      },
    },
  });

  if (!session) return null;

  const completed = Boolean(session.endedAt || session.completedAt) || session.currentIndex >= session.totalQuestions;
  const item = completed ? null : session.items.find((entry) => entry.orderIndex === session.currentIndex) ?? null;

  let question: FocusQuestionSnapshot | null = null;
  if (item) {
    const options = parseQuestionOptions(item.question.options);
    const correctOptionIndex = resolveCorrectOptionIndex(item.question.correctAnswer, options);

    question = {
      questionId: item.question.id,
      content: item.question.content,
      options,
      correctOptionIndex,
      correctOptionId: options[correctOptionIndex]?.id ?? "A",
      solution: item.question.explanation,
      videoUrl: item.question.videoUrl,
      difficulty: item.question.level ?? "TH",
      level: item.question.level,
      progress: {
        current: session.currentIndex + 1,
        total: session.totalQuestions,
      },
    };
  }

  return {
    sessionId: session.id,
    topicId: session.topicId,
    topicName: session.topic.name,
    score: session.score,
    streak: session.streak,
    currentIndex: session.currentIndex,
    totalQuestions: session.totalQuestions,
    completed,
    question,
  };
}

export async function startOrResumeFocusSession(userId: string, topicId: string): Promise<FocusSessionSnapshot> {
  const ongoing = await prisma.practiceSession.findFirst({
    where: {
      studentId: userId,
      topicId,
      endedAt: null,
      completedAt: null,
    },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });

  if (ongoing) {
    const snapshot = await getSessionSnapshot(userId, ongoing.id);
    if (snapshot) return snapshot;
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true, name: true } });
  if (!topic) {
    throw new Error("Topic not found");
  }

  const selectedQuestionIds = await pickWeakQuestionIds(userId, topicId, 10);
  if (!selectedQuestionIds.length) {
    const emptySession = await prisma.practiceSession.create({
      data: {
        studentId: userId,
        topicId,
        totalQuestions: 0,
        completedAt: new Date(),
        endedAt: new Date(),
      },
      select: { id: true },
    });

    return {
      sessionId: emptySession.id,
      topicId: topic.id,
      topicName: topic.name,
      score: 0,
      streak: 0,
      currentIndex: 0,
      totalQuestions: 0,
      question: null,
      completed: true,
    };
  }

  const created = await prisma.$transaction(async (tx) => {
    const session = await tx.practiceSession.create({
      data: {
        studentId: userId,
        topicId,
        totalQuestions: selectedQuestionIds.length,
      },
      select: { id: true },
    });

    await tx.practiceSessionItem.createMany({
      data: selectedQuestionIds.map((questionId, index) => ({
        sessionId: session.id,
        questionId,
        orderIndex: index,
      })),
    });

    return session;
  });

  const snapshot = await getSessionSnapshot(userId, created.id);
  if (!snapshot) throw new Error("Unable to start session");
  return snapshot;
}
