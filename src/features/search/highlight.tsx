/** Emphasizes the matched part of a result without altering the text itself. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim().toLocaleLowerCase();
  const index = needle ? text.toLocaleLowerCase().indexOf(needle) : -1;
  if (index < 0) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[4px] bg-accent-soft px-0.5 text-accent">{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}
