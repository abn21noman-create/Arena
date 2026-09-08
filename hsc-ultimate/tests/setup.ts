import "@testing-library/jest-dom/vitest";
import { afterAll, vi } from "vitest";

Object.assign(process.env, {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  DIRECT_URL: "postgresql://test:test@localhost:5432/test",
  NEXTAUTH_SECRET: "test-secret-for-unit-tests-only",
  NEXTAUTH_URL: "http://localhost:3000",
  GROQ_API_KEY: "test-groq-key",
  MISTRAL_API_KEY: "test-mistral-key",
  CEREBRAS_API_KEY: "test-cerebras-key",
  OPENROUTER_API_KEY: "test-openrouter-key",
  RESEND_API_KEY: "test-resend-key",
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test-vapid-public",
  VAPID_PRIVATE_KEY: "test-vapid-private",
  VAPID_SUBJECT: "mailto:test@test.com",
});

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(),
    refresh: vi.fn(), prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next-auth", () => ({ default: vi.fn(), getServerSession: vi.fn() }));

afterAll(() => vi.clearAllMocks());
