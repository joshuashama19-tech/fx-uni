"use client";

import { useEffect, useState, useTransition } from "react";
import type { QuizQuestionPublic } from "@/lib/course-content-activities";
import {
  startQuizAttemptAction,
  submitQuizAction,
  selfAssessQuizAnswerAction,
  type QuizAnswerInput,
  type QuizResult,
  type QuizReviewQuestion,
} from "@/lib/progress/activity-actions";
import { IconCheckCircle, IconAlert } from "@/components/icons";

const TYPE_LABEL: Record<QuizQuestionPublic["type"], string> = {
  mc: "Multiple choice",
  tf: "True or False",
  open: "Short answer",
};

export function QuizRunner({
  moduleSlug,
  questions,
  initialResult,
}: {
  moduleSlug: string;
  questions: QuizQuestionPublic[];
  initialResult: QuizResult | null;
}) {
  const [result, setResult] = useState<QuizResult | null>(initialResult);
  const [answers, setAnswers] = useState<Record<number, QuizAnswerInput>>({});
  const [index, setIndex] = useState(0);
  const [submitting, startSubmitTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) {
      startQuizAttemptAction(moduleSlug).catch(() => {});
    }
    // Only ever fire once per mount of the "taking" view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (result) {
    return (
      <QuizReview
        moduleSlug={moduleSlug}
        result={result}
        onRetake={() => {
          setResult(null);
          setIndex(0);
        }}
      />
    );
  }

  const total = questions.length;
  const current = questions[index];
  const answeredCount = Object.keys(answers).length;
  const isLast = index === total - 1;

  function setAnswer(num: number, input: QuizAnswerInput) {
    setAnswers((prev) => ({ ...prev, [num]: input }));
  }

  function handleSubmit() {
    setSubmitError(null);
    startSubmitTransition(async () => {
      try {
        const payload = questions.map((q) => answers[q.num] ?? { num: q.num });
        const graded = await submitQuizAction(moduleSlug, payload);
        setResult(graded);
      } catch {
        setSubmitError("Couldn't submit the quiz. Check your connection and try again.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-500">
          <span>
            Question {index + 1} of {total}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-[width]"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <QuestionInput question={current} value={answers[current.num]} onChange={(a) => setAnswer(current.num, a)} />

      {submitError ? (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {submitError}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="min-h-11 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:border-ink-300 disabled:opacity-40"
        >
          ← Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="min-h-11 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Quiz"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            className="min-h-11 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Next →
          </button>
        )}
      </div>

      {/* A row of question dots doubles as a jump-to-question nav — useful
          once a student has gone back and forth, and gives a persistent
          sense of the whole quiz's shape (never just a lone progress bar). */}
      <div className="mt-6 flex flex-wrap gap-1.5" role="list" aria-label="Jump to question">
        {questions.map((q, i) => {
          const answered = answers[q.num] !== undefined;
          const isCurrent = i === index;
          return (
            <button
              key={q.num}
              type="button"
              role="listitem"
              aria-label={`Question ${i + 1}${answered ? ", answered" : ""}`}
              aria-current={isCurrent}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 flex-none rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                isCurrent ? "bg-brand-600" : answered ? "bg-brand-300" : "bg-ink-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: QuizQuestionPublic;
  value: QuizAnswerInput | undefined;
  onChange: (a: QuizAnswerInput) => void;
}) {
  return (
    <div className="rounded-xl border border-ink-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{TYPE_LABEL[question.type]}</p>
      <p className="mt-2 text-base font-medium leading-relaxed text-ink-900">{question.prompt}</p>

      {question.type === "mc" && question.options ? (
        <div className="mt-4 flex flex-col gap-2">
          {question.options.map((opt) => (
            <button
              key={opt.letter}
              type="button"
              onClick={() => onChange({ num: question.num, selectedLetter: opt.letter })}
              aria-pressed={value?.selectedLetter === opt.letter}
              className={`min-h-11 rounded-lg border px-4 py-2.5 text-left text-sm leading-relaxed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                value?.selectedLetter === opt.letter
                  ? "border-brand-600 bg-brand-50 text-ink-900"
                  : "border-ink-200 bg-white text-ink-800 hover:border-brand-200 hover:bg-brand-50/30"
              }`}
            >
              <span className="font-semibold text-ink-500">{opt.letter}) </span>
              {opt.text}
            </button>
          ))}
        </div>
      ) : null}

      {question.type === "tf" ? (
        <div className="mt-4 flex gap-3">
          {[
            { label: "True", val: true },
            { label: "False", val: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange({ num: question.num, selectedBool: opt.val })}
              aria-pressed={value?.selectedBool === opt.val}
              className={`min-h-11 flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                value?.selectedBool === opt.val
                  ? "border-brand-600 bg-brand-50 text-ink-900"
                  : "border-ink-200 bg-white text-ink-800 hover:border-brand-200 hover:bg-brand-50/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}

      {question.type === "open" ? (
        <p className="mt-3 text-sm text-ink-500">
          Work this out on paper or in your head — you&apos;ll compare it against the model answer after submitting.
        </p>
      ) : null}
    </div>
  );
}

function QuizReview({
  moduleSlug,
  result,
  onRetake,
}: {
  moduleSlug: string;
  result: QuizResult;
  onRetake: () => void;
}) {
  const [current, setCurrent] = useState(result);
  const [pending, startTransition] = useTransition();
  const [showReview, setShowReview] = useState(false);
  const [assessError, setAssessError] = useState<string | null>(null);

  function selfAssess(num: number, correct: boolean) {
    setAssessError(null);
    startTransition(async () => {
      try {
        const updated = await selfAssessQuizAnswerAction(moduleSlug, num, correct);
        setCurrent(updated);
      } catch {
        setAssessError("Couldn't save that. Check your connection and try again.");
      }
    });
  }

  const openTotal = current.questions.filter((q) => q.type === "open").length;
  const openAssessed = current.questions.filter((q) => q.type === "open" && q.selfCorrect !== null).length;
  const percent = current.total > 0 ? Math.round((current.score / current.total) * 100) : 0;

  return (
    <div>
      {/* A distinct result step before the per-question review, matching how
          the course's own answer keys already frame these checkpoints as a
          signal to act on, not just a score to see: read the number, then
          choose to go look at why. */}
      <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-6 text-center sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Result</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-ink-950">
          {current.score} / {current.total}
        </p>
        <p className="mt-1 text-sm text-ink-600">{percent}%</p>
        {openTotal > 0 ? (
          <p className="mt-3 text-sm text-ink-600">
            {openAssessed} of {openTotal} short-answer questions self-reviewed — your score updates as you go.
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          {!showReview ? (
            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="min-h-11 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Review Your Answers
            </button>
          ) : null}
          <button type="button" onClick={onRetake} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Retake this quiz
          </button>
        </div>
      </div>

      {showReview ? (
        <div className="mt-6 space-y-6">
          {assessError ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
              {assessError}
            </p>
          ) : null}
          {current.questions.map((q) => (
            <ReviewQuestion key={q.num} question={q} pending={pending} onSelfAssess={(c) => selfAssess(q.num, c)} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ReviewQuestion({
  question,
  pending,
  onSelfAssess,
}: {
  question: QuizReviewQuestion;
  pending: boolean;
  onSelfAssess: (correct: boolean) => void;
}) {
  const graded = question.type === "mc" || question.type === "tf";
  const isCorrect = graded ? question.autoCorrect === true : question.selfCorrect === true;
  const isIncorrect = graded ? question.autoCorrect === false : question.selfCorrect === false;

  return (
    <div className="rounded-xl border border-ink-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        Question {question.num} · {TYPE_LABEL[question.type]}
      </p>
      <p className="mt-2 text-base font-medium leading-relaxed text-ink-900">{question.prompt}</p>

      {question.type === "mc" && question.options ? (
        <div className="mt-4 flex flex-col gap-2">
          {question.options.map((opt) => {
            const wasSelected = question.studentSelectedLetter === opt.letter;
            const isTheCorrectOne = question.correctLetter === opt.letter;
            return (
              <div
                key={opt.letter}
                className={`rounded-lg border px-4 py-2.5 text-sm leading-relaxed ${
                  isTheCorrectOne
                    ? "border-brand-600 bg-brand-50 text-ink-900"
                    : wasSelected
                      ? "border-ink-300 bg-ink-50 text-ink-600"
                      : "border-ink-100 text-ink-600"
                }`}
              >
                <span className="font-semibold text-ink-500">{opt.letter}) </span>
                {opt.text}
                {wasSelected ? <span className="ml-2 text-xs font-semibold text-ink-500">(your answer)</span> : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {question.type === "tf" ? (
        <p className="mt-3 text-sm text-ink-700">
          Your answer: <span className="font-semibold">{question.studentSelectedBool === undefined ? "—" : question.studentSelectedBool ? "True" : "False"}</span>
          {" · "}Correct answer: <span className="font-semibold">{question.correctBool ? "True" : "False"}</span>
        </p>
      ) : null}

      {question.explanation ? (
        <p className="mt-3 rounded-lg bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">{question.explanation}</p>
      ) : null}

      {graded ? (
        <p
          className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${
            isCorrect ? "text-brand-700" : "text-ink-500"
          }`}
        >
          {isCorrect ? <IconCheckCircle className="h-4 w-4" /> : <IconAlert className="h-4 w-4" />}
          {isCorrect ? "Correct" : "Not quite"}
        </p>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-medium text-ink-700">Compare your own answer to the model answer above — did you get it right?</p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => onSelfAssess(true)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                isCorrect ? "border-brand-600 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-700 hover:border-brand-300"
              }`}
            >
              ✓ I got this right
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => onSelfAssess(false)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                isIncorrect ? "border-ink-400 bg-ink-100 text-ink-700" : "border-ink-200 text-ink-700 hover:border-ink-300"
              }`}
            >
              Review needed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
