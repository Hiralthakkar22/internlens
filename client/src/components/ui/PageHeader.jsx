export default function PageHeader({ title, text, children }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-muted">{text}</p>}
      </div>
      {children}
    </header>
  );
}
