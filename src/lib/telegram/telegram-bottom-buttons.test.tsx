import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TelegramAdapter } from "./adapter";
import { RealTelegramAdapter } from "./real-adapter";
import type { TelegramBottomButton, TelegramWebApp } from "./web-app";
import { useTelegramBottomButtons } from "./hooks";

const harness = vi.hoisted(() => ({
  state: { status: "loading" } as { status: "loading" } | { status: "ready"; adapter: TelegramAdapter },
}));

vi.mock("./telegram-provider", () => ({
  useTelegramState: () => harness.state,
}));

function fakeButton(): TelegramBottomButton & { label: string; hides: number } {
  const button = {
    label: "",
    hides: 0,
    show() {
      return button;
    },
    hide() {
      button.hides += 1;
      return button;
    },
    enable() {
      return button;
    },
    disable() {
      return button;
    },
    setText(text: string) {
      button.label = text;
      return button;
    },
    onClick() {
      return button;
    },
    offClick() {
      return button;
    },
    setParams(params: { text?: string; is_visible?: boolean }) {
      if (params.text !== undefined) button.label = params.text;
      if (params.is_visible === false) button.hides += 1;
      return button;
    },
  };
  return button;
}

function Probe({ text }: { text: string }) {
  useTelegramBottomButtons({
    active: true,
    main: { text, enabled: true, onClick: () => undefined },
    secondary: { text: "مشاركة", enabled: true, onClick: () => undefined },
  });
  return null;
}

describe("Telegram order button", () => {
  let main: ReturnType<typeof fakeButton>;

  beforeEach(() => {
    main = fakeButton();
    const secondary = fakeButton();
    harness.state = {
      status: "ready",
      adapter: new RealTelegramAdapter({
        MainButton: main,
        SecondaryButton: secondary,
      } as unknown as TelegramWebApp),
    };
  });

  it("replaces the visible price when the selected tier changes", () => {
    const view = render(<Probe text="اطلب بـ $15" />);

    expect(main.label).toBe("اطلب بـ $15");
    expect(main.hides).toBe(0);

    view.rerender(<Probe text="اطلب بـ $25" />);

    expect(main.label).toBe("اطلب بـ $25");
    expect(main.hides).toBe(0);

    view.unmount();
    expect(main.hides).toBe(1);
  });
});
