/** Page title strip on the desktop shell; phones show the title in the top bar instead. */
export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="hidden border-b border-navy-800 px-6 py-4 lg:block text-sm font-medium text-navy-200">
      {title}
    </header>
  );
}
