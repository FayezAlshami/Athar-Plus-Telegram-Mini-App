import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSubmitState } from "./use-submit-state";

describe("useSubmitState", () => {
  it("reaches success only when succeed is called", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSubmitState());
    act(() => result.current.start());
    expect(result.current.phase).toBe("loading");
    act(() => result.current.fail());
    expect(result.current.phase).toBe("error");
    act(() => result.current.start());
    act(() => result.current.succeed());
    expect(result.current.phase).toBe("success");
    act(() => vi.advanceTimersByTime(1600));
    expect(result.current.phase).toBe("idle");
    vi.useRealTimers();
  });
});
