import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { StructuredText } from "./structured-text";

describe("StructuredText", () => {
  it("keeps line breaks and lists instead of collapsing text", () => {
    const { container } = render(
      <StructuredText
        blocks={[
          { type: "paragraph", lines: ["سطر أول", "Second line"] },
          { type: "list", ordered: false, items: ["A", "B"] },
        ]}
      />,
    );

    expect(container.querySelectorAll("p > span")).toHaveLength(2);
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
    expect(container.querySelector("p")?.getAttribute("dir")).toBe("auto");
  });
});
