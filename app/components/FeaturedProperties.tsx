import Link from 'next/link';
import { Property } from '../data/properties';
import ScrollReveal from './ScrollReveal';

interface FeaturedPropertiesProps {
    properties: Property[];
}

const FeaturedProperties = ({ properties }: FeaturedPropertiesProps) => {
    return (
        <section className="py-24 bg-white :bg-black overflow-hidden">
            <div className="container mx-auto px-6">
                <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-brand-charcoal :text-brand-cream mb-6 font-serif uppercase">Featured properties</h2>
                        <p className="text-lg text-zinc-500 :text-zinc-400 font-light tracking-wide">Carefully curated selections for your next unforgettable escape.</p>
                    </div>
                    <Link href="/hotels">
                        <button className="text-sm font-bold border-b-2 border-brand-red pb-1 text-brand-charcoal :text-brand-gold hover:text-brand-red :hover:text-brand-cream transition-colors uppercase tracking-[0.2em] cursor-pointer">
                            View all properties
                        </button>
                    </Link>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {properties.map((property, index) => (
                        <ScrollReveal
                            key={property.id}
                            stagger={index * 0.1}
                            className="group"
                        >
                            <Link href={`/hotels/${property.slug}`} className="block cursor-pointer">
                                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-6 bg-zinc-100 :bg-zinc-900 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-2xl group-hover:-translate-y-4">
                                    <img
                                        src={property.image}
                                        alt={property.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 :bg-brand-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg border border-brand-gold/20">
                                        <span className="text-xs font-bold text-brand-charcoal :text-brand-cream">{property.rating}</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-brand-gold">
                                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                        {property.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-brand-charcoal/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/10">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 px-1">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-xl font-bold text-brand-charcoal :text-brand-cream group-hover:text-brand-red transition-colors uppercase tracking-tight font-serif">{property.name}</h3>
                                        <span className="text-lg font-bold text-brand-charcoal :text-brand-gold font-serif">{property.price}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-zinc-500 :text-zinc-400">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="text-sm font-medium">{property.location}</span>
                                    </div>
                                </div>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProperties;

