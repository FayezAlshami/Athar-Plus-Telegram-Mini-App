import type { StructuredTextBlock } from "@/entities/shared";

/**
 * Renders server-parsed text blocks, preserving the author's paragraphs,
 * line breaks and lists. Each block picks its own direction (dir="auto")
 * so mixed Arabic/English content stays readable.
 */
export function StructuredText({ blocks }: { blocks: StructuredTextBlock[] }) {
  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 text-body break-words text-foreground/90 [overflow-wrap:anywhere]">
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index} dir="auto" className="max-w-full">
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex} className="block max-w-full">
                {line}
              </span>
            ))}
          </p>
        ) : block.ordered ? (
          <ol key={index} dir="auto" className="max-w-full list-decimal space-y-1 ps-5 marker:text-accent marker:font-semibold">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="max-w-full">{item}</li>
            ))}
          </ol>
        ) : (
          <ul key={index} dir="auto" className="max-w-full list-disc space-y-1 ps-5 marker:text-accent">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex} className="max-w-full">{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
