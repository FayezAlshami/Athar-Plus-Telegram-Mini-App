import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bindVerticalSwipeHost,
  resetVerticalSwipes,
  suppressVerticalSwipes,
  verticalSwipeHolds,
} from "./telegram-vertical-swipes";

describe("vertical swipe suppression", () => {
  const setVerticalSwipes = vi.fn();

  beforeEach(() => {
    resetVerticalSwipes();
    setVerticalSwipes.mockClear();
    bindVerticalSwipeHost({ setVerticalSwipes });
    setVerticalSwipes.mockClear();
  });

  it("keeps swipes enabled until a sheet holds them", () => {
    expect(setVerticalSwipes).not.toHaveBeenCalled();
    const release = suppressVerticalSwipes(true);
    expect(verticalSwipeHolds()).toBe(1);
    expect(setVerticalSwipes).toHaveBeenLastCalledWith(false);
    release();
    expect(setVerticalSwipes).toHaveBeenLastCalledWith(true);
  });
});
