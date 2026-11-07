// The button that opens Me: the toolbar's initials and the sidebar's name row. App owns the one Me sheet,
// so it stays open when the layout changes under it.
function MeButton({ className, onClick, children }) {
  return (
    <button type="button" aria-label="Me" aria-haspopup="dialog" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export default MeButton;
