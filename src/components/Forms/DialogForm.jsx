import Button from "../UI/Button";

// The frame of a form inside a Modal: a title bar, the fields, and Cancel and Save.
function DialogForm({ title, onSubmit, onCancel, canSave, children }) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-sep/60 px-6 py-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-label2">Fields marked with * are required</p>
      </header>
      <div className="grid gap-4 overflow-y-auto p-6">{children}</div>
      <footer className="flex justify-between gap-3 border-t border-sep/60 px-6 py-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" className="min-w-24" disabled={!canSave}>
          Save
        </Button>
      </footer>
    </form>
  );
}

export default DialogForm;
