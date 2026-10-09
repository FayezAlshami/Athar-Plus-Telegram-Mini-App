import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { FaqAudioPlayer } from "./faq-audio-player";

const messages = {
  faq: {
    voiceAnswer: "إجابة صوتية",
    audioLoading: "جارٍ تحميل التسجيل…",
    audioError: "تعذّر تشغيل التسجيل.",
    audioRetry: "إعادة المحاولة",
    play: "تشغيل",
    pause: "إيقاف",
    scrub: "موضع",
  },
};

describe("FaqAudioPlayer", () => {
  it("shows a loading label while metadata is pending", () => {
    render(
      <NextIntlClientProvider locale="ar" messages={messages}>
        <FaqAudioPlayer src="https://example.com/note.m4a" durationSeconds={12} active={true} onPlayRequest={vi.fn()} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText("إجابة صوتية")).toBeTruthy();
    expect(screen.getByText("جارٍ تحميل التسجيل…")).toBeTruthy();
  });
});
