import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bindClosingConfirmationHost,
  canConfirmAppClose,
  closingConfirmationHolds,
  holdClosingConfirmation,
  resetClosingConfirmation,
} from "./telegram-closing-confirmation";

describe("closing confirmation holds", () => {
  const enable = vi.fn();
  const disable = vi.fn();

  beforeEach(() => {
    resetClosingConfirmation();
    bindClosingConfirmationHost({
      enableClosingConfirmation: enable,
      disableClosingConfirmation: disable,
    });
    enable.mockClear();
    disable.mockClear();
  });

  it("enables Telegram close confirmation on the first unsaved hold", () => {
    holdClosingConfirmation(true);

    expect(closingConfirmationHolds()).toBe(1);
    expect(enable).toHaveBeenCalledTimes(1);
    expect(disable).not.toHaveBeenCalled();
  });

  it("keeps the native X protected while a second screen is still dirty", () => {
    const releaseFirst = holdClosingConfirmation(true);
    holdClosingConfirmation(true);
    releaseFirst();

    expect(closingConfirmationHolds()).toBe(1);
    expect(disable).not.toHaveBeenCalled();
  });

  it("disables confirmation after a successful save releases the last hold", () => {
    const release = holdClosingConfirmation(true);
    release();

    expect(closingConfirmationHolds()).toBe(0);
    expect(disable).toHaveBeenCalledTimes(1);
  });

  it("does not acquire a hold for a clean form", () => {
    const release = holdClosingConfirmation(false);
    release();

    expect(closingConfirmationHolds()).toBe(0);
    expect(enable).not.toHaveBeenCalled();
    expect(disable).not.toHaveBeenCalled();
  });

  it("ignores a second release of the same hold", () => {
    const release = holdClosingConfirmation(true);
    release();
    release();

    expect(closingConfirmationHolds()).toBe(0);
    expect(disable).toHaveBeenCalledTimes(1);
  });

  it("re-enables native X protection when the Telegram host binds after a hold", () => {
    resetClosingConfirmation();
    const release = holdClosingConfirmation(true);
    expect(enable).not.toHaveBeenCalled();

    bindClosingConfirmationHost({
      enableClosingConfirmation: enable,
      disableClosingConfirmation: disable,
    });

    expect(enable).toHaveBeenCalledTimes(1);
    release();
    expect(disable).toHaveBeenCalledTimes(1);
  });
});

describe("canConfirmAppClose", () => {
  it("requires both Telegram functions", () => {
    expect(canConfirmAppClose(null)).toBe(false);
    expect(canConfirmAppClose({})).toBe(false);
    expect(canConfirmAppClose({ enableClosingConfirmation: () => undefined })).toBe(false);
    expect(
      canConfirmAppClose({
        enableClosingConfirmation: () => undefined,
        disableClosingConfirmation: () => undefined,
      }),
    ).toBe(true);
  });
});
