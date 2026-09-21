export function BackendPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="pt-24 min-h-screen px-4 md:px-8">
      <div className="max-w-5xl mx-auto glass rounded-xl p-8 md:p-10">
        <p className="mono text-xs text-cyber">// {eyebrow}</p>
        <h1 className="display text-4xl md:text-5xl mt-2">{title}</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">{description}</p>
        <p className="mono text-[0.65rem] text-muted-foreground mt-8">
          BACKEND DATA WILL APPEAR HERE WHEN CONFIGURED
        </p>
      </div>
    </main>
  );
}
