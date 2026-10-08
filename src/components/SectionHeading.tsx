import { Reveal } from "./Reveal";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

export default function SectionHeading({ id, eyebrow, title, children }: Props) {
  return (
    <Reveal className="mb-10 max-w-[40rem]">
      <p className="mb-2 text-body font-semibold uppercase tracking-wider text-brand">
        {eyebrow}
      </p>
      <h2 id={id} className="text-title1 font-semibold tracking-tight">
        {title}
      </h2>
      {children && (
        <p className="mt-3 text-body-lg text-muted">{children}</p>
      )}
    </Reveal>
  );
}
