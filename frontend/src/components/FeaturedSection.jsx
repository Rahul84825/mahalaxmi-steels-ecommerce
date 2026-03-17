import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useProducts } from "../context/ProductContext";

const OFFER_GRADIENTS = [
  "from-slate-900 via-slate-800 to-slate-700",
  "from-blue-900 via-blue-800 to-cyan-700",
  "from-orange-700 via-amber-600 to-yellow-500",
  "from-emerald-800 via-emerald-700 to-teal-600",
];

const SectionTitle = ({ eyebrow, title, subtitle, cta, onCta }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700 mb-2">{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-2xl">{subtitle}</p>}
    </div>
    {cta ? (
      <button
        onClick={onCta}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-800 hover:text-blue-700 rounded-full text-sm font-bold transition-all"
      >
        {cta}
        <ArrowRight className="w-4 h-4" />
      </button>
    ) : null}
  </div>
);

const OffersSection = () => {
  const navigate = useNavigate();
  const { offers, products } = useProducts();

  const activeOffers = (offers || [])
    .filter((offer) => offer.is_active ?? offer.isActive ?? offer.active)
    .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));

  if (!activeOffers.length) return null;

  const resolveOfferUrl = (offer) => {
    const linkedProduct = offer.linked_product_id ?? offer.targetProduct;
    const linkedCategory = offer.linked_category ?? offer.targetCategory ?? offer.category;

    if (linkedProduct) {
      const id = linkedProduct?._id || linkedProduct?.id || linkedProduct;
      return `/products/${id}`;
    }
    if (linkedCategory) {
      return `/products?category=${linkedCategory}`;
    }
    return "/products";
  };

  const resolveOfferImage = (offer) => {
    if (offer.banner_image || offer.image) return offer.banner_image || offer.image;
    const linkedProduct = offer.linked_product_id ?? offer.targetProduct;
    if (!linkedProduct) return "";

    if (typeof linkedProduct === "object") {
      return linkedProduct.image || linkedProduct.images?.[0] || "";
    }

    const product = (products || []).find((p) => (p._id || p.id) === linkedProduct);
    return product?.image || product?.images?.[0] || "";
  };

  return (
    <section className="py-14 sm:py-16 bg-slate-100 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Offers"
          title="Live Promotions"
          subtitle="Only active offers are shown here, automatically ordered by admin priority."
          cta="Explore Catalog"
          onCta={() => navigate("/products")}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {activeOffers.map((offer, index) => {
            const image = resolveOfferImage(offer);
            const discount = Number(offer.discount_percentage ?? offer.discountPercent ?? 0);
            const isHero = index === 0;
            const gradient = OFFER_GRADIENTS[index % OFFER_GRADIENTS.length];

            return (
              <article
                key={offer._id || offer.id || index}
                onClick={() => navigate(resolveOfferUrl(offer))}
                className={`relative overflow-hidden rounded-3xl border border-white/30 shadow-lg cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-linear-to-br ${gradient} ${isHero ? "lg:col-span-7 min-h-80" : "lg:col-span-5 min-h-55"}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_55%)]" />
                <div className="absolute -bottom-12 -right-10 w-52 h-52 rounded-full bg-white/20 blur-3xl group-hover:scale-125 transition-transform duration-700" />

                <div className="relative z-10 p-6 sm:p-7 h-full flex flex-col justify-between">
                  <div>
                    <p className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 text-white border border-white/30">
                      <Sparkles className="w-3 h-3" /> Priority {Number(offer.priority || 0)}
                    </p>
                    <h3 className={`text-white font-black tracking-tight mt-3 ${isHero ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{offer.title}</h3>
                    {!!offer.description && <p className="text-white/85 mt-2 text-sm max-w-xl line-clamp-2">{offer.description}</p>}
                  </div>

                  <div className="flex items-end justify-between gap-3 mt-6">
                    <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">{discount > 0 ? `${discount}% OFF` : "Special Offer"}</p>
                    <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-white text-slate-900 group-hover:bg-blue-50">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {image ? (
                  <img
                    src={image}
                    alt={offer.title}
                    className={`absolute right-3 bottom-3 rounded-2xl border border-white/30 shadow-xl object-cover ${isHero ? "w-36 h-36 sm:w-48 sm:h-48" : "w-28 h-28 sm:w-36 sm:h-36"}`}
                  />
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const DynamicFeaturedProducts = () => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const featured = (products || []).filter((p) => p.is_featured ?? p.featured);
  const fallback = (products || []).filter((p) => (p.is_bestseller ?? p.bestseller) || (p.is_new ?? p.isNew));

  const list = (featured.length ? featured : fallback)
    .filter((p) => p.inStock)
    .slice(0, 8);

  if (!list.length) return null;

  return (
    <section className="py-14 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow={featured.length ? "Featured Picks" : "Trending Picks"}
          title={featured.length ? "Featured Collection" : "Bestsellers & New Arrivals"}
          subtitle={featured.length ? "This section is fully admin-driven using Featured toggles." : "No featured products were marked, so we are showing bestseller/new fallback automatically."}
          cta="View All Products"
          onCta={() => navigate("/products")}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {list.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          Real-time visibility updates from admin panel toggles
        </div>
      </div>
    </section>
  );
};

const FeaturedSection = () => (
  <div className="flex flex-col w-full">
    <OffersSection />
    <DynamicFeaturedProducts />
  </div>
);

export default FeaturedSection;
