export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 md:mb-6 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[.17em] text-[#987846]">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="text-[28px] font-extrabold leading-[1.04] tracking-[-.052em] sm:text-[32px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-5 text-black/47 sm:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
