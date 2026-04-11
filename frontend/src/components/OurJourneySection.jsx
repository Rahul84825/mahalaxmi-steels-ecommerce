import { useEffect, useRef, useState } from "react";

const DEFAULT_MILESTONES = [
  {
    year: "2024",
    title: "A Humble Start",
    description: "We started as a family-run shop with one goal: bring reliable essentials to local homes.",
  },
  {
    year: "2025",
    title: "Growing With Trust",
    description: "Customer referrals and repeat purchases helped us expand while keeping service personal.",
  },
  {
    year: "Today",
    title: "Built For Modern Homes",
    description: "From steelware to pooja essentials, we continue to deliver practical quality with care.",
  },
];

const DEFAULT_IMAGES = [
  {
    src: "../assets/journey/journey-1.jpg",
    alt: "Store legacy products display",
  },
  {
    src: "../assets/journey/journey-2.jpg",
    alt: "Team packaging customer orders",
  },
  {
    src: "../assets/journey/journey-3.jpg",
    alt: "Happy customer with delivered order",
  },
];

const JourneyImage = ({ src, alt, className }) => {
  const [errored, setErrored] = useState(false);
  const shouldShowImage = Boolean(src) && !errored;

  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100 shadow-lg ${className}`}>
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-blue-50 via-slate-100 to-orange-50" aria-hidden="true" />
      )}
    </div>
  );
};

const OurJourneySection = ({
  title = "Our Journey",
  subtitle = "From one family store to thousands of happy homes",
  description = "Every chapter of our journey is built on honest pricing, reliable quality, and relationships that last for years.",
  milestones = DEFAULT_MILESTONES,
  images = DEFAULT_IMAGES,
}) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const leftAnimationClasses = isVisible
    ? "opacity-100 translate-x-0"
    : "opacity-0 -translate-x-12";

  const rightAnimationClasses = isVisible
    ? "opacity-100 translate-x-0"
    : "opacity-0 translate-x-12";

  const mainImage = images?.[0] || {};
  const topImage = images?.[1] || {};
  const bottomImage = images?.[2] || {};

  return (
    <section ref={sectionRef} className="section-shell bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div
            className={`transition-all duration-900 ease-out ${leftAnimationClasses}`}
          >
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 text-[var(--text-section)] font-extrabold tracking-tight text-[var(--color-text-strong)]">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-text-muted)] sm:text-lg">
              {subtitle}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-text-muted)] sm:text-base">
              {description}
            </p>

            <div className="mt-8 space-y-4">
              {milestones.map((item, index) => (
                <div
                  key={`${item.year}-${item.title}-${index}`}
                  className="interactive-card px-4 py-4"
                >
                  <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-primary-700)]">{item.year}</p>
                  <h3 className="mt-1 text-base font-bold text-[var(--color-text-strong)] sm:text-lg">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`transition-all duration-900 ease-out ${rightAnimationClasses}`}>
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <JourneyImage
                src={mainImage.src}
                alt={mainImage.alt || "Our journey main image"}
                className="col-span-2 h-[260px] sm:h-[320px]"
              />
              <JourneyImage
                src={topImage.src}
                alt={topImage.alt || "Our journey side image 1"}
                className="h-[170px] sm:h-[200px]"
              />
              <JourneyImage
                src={bottomImage.src}
                alt={bottomImage.alt || "Our journey side image 2"}
                className="h-[170px] sm:h-[200px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurJourneySection;
