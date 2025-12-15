type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "gray" | "gradient";
};

export default function Section({
  children,
  className = "",
  id,
  background = "white"
}: SectionProps) {
  const backgrounds = {
    white: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-b from-primary-50 to-white",
  };

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
