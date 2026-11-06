// A small label such as Manual, Edited or Deleted. Inline-block, so a deleted row's line-through doesn't cross it out.
function Tag({ children }) {
  return <span className="ml-1.5 inline-block rounded-md bg-tint px-1.5 text-xs font-semibold text-accent">{children}</span>;
}

export default Tag;
