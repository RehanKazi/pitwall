export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="border-b border-navy-800 px-6 py-4 text-sm font-medium text-navy-200">
      {title}
    </header>
  );
}
