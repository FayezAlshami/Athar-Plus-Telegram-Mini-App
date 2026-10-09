import { describe, expect, it } from "vitest";
import { notificationTone } from "./notification-tone";

describe("notificationTone", () => {
  it("uses the stored status even when the title says the opposite", () => {
    expect(notificationTone({
      type: "order_status",
      tone: undefined,
      data: { status: "completed" },
    })).toBe("success");

    expect(notificationTone({
      type: "order_status",
      tone: undefined,
      data: { status: "rejected" },
    })).toBe("danger");

    expect(notificationTone({
      type: "order_status",
      tone: undefined,
      data: { status: "cancelled" },
    })).toBe("danger");

    expect(notificationTone({
      type: "order_status",
      tone: undefined,
      data: { status: "processing" },
    })).toBe("warning");
  });

  it("treats announcements as informational and successful events as success", () => {
    expect(notificationTone({ type: "promotion", data: {} })).toBe("info");
    expect(notificationTone({ type: "admin_message", data: {} })).toBe("info");
    expect(notificationTone({ type: "deposit_status", data: {} })).toBe("success");
    expect(notificationTone({ type: "membership_changed", data: {} })).toBe("success");
  });

  it("prefers the tone sent by the API", () => {
    expect(notificationTone({ type: "order_status", tone: "danger", data: { status: "completed" } })).toBe("danger");
  });
});
