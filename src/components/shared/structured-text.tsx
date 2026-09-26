import type { StructuredTextBlock } from "@/entities/shared";

/**
 * Renders server-parsed text blocks, preserving the author's paragraphs,
 * line breaks and lists. Each block picks its own direction (dir="auto")
 * so mixed Arabic/English content stays readable.
 */
export function StructuredText({ blocks }: { blocks: StructuredTextBlock[] }) {
  return (
    <div className="flex flex-col gap-3 text-body text-foreground/90">
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index} dir="auto">
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex} className="block">
                {line}
              </span>
            ))}
          </p>
        ) : block.ordered ? (
          <ol key={index} dir="auto" className="list-decimal space-y-1 ps-5 marker:text-accent marker:font-semibold">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ol>
        ) : (
          <ul key={index} dir="auto" className="list-disc space-y-1 ps-5 marker:text-accent">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
