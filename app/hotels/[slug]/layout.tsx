import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(
    props: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params;
    const { slug } = params;

    try {
        const url = process.env.NEXT_PUBLIC_API_URL + 'api/admin/all-hotels';
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            // Cache the response since hotel basic data doesn't change every second.
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch hotels: ${response.statusText}`);
        }

        const data = await response.json();

        const hotel = data.find((h: any) => {
            const hSlug = h.slug ? (h.slug.replace(/\/$/, '').split('/').pop() || h.hotelID.toString()) : h.hotelID.toString();
            return hSlug === slug;
        });

        if (hotel) {
            const propertyName = hotel.hotelName || "HotelMate";
            // In API sometimes location is not directly returned, we can use city + country
            const location = hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : (hotel.city || propertyName);
            const name = `${propertyName} - ${location}`;

            const description = hotel.hotelDesc || `Experience luxury at ${propertyName} in ${location}. Book your stay with HotelMate for an unforgettable journey.`;
            const imageUrl = (hotel.hotelImage?.imageFileName || hotel.logoURL || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop').split('?')[0];

            return {
                title: name,
                description: description,
                openGraph: {
                    title: name,
                    description: description,
                    url: `./`,
                    images: [
                        {
                            url: imageUrl,
                            width: 1200,
                            height: 630,
                            alt: name,
                        }
                    ],
                    type: "website",
                    siteName: "HotelMate",
                },
                twitter: {
                    card: 'summary_large_image',
                    title: name,
                    description: description,
                    images: [imageUrl],
                }
            };
        }
    } catch (error) {
        console.error("Error generating metadata for property mapping:", error);
    }

    // Fallback if not found or error occurs
    return {
        title: "HotelMate | Luxury Booking Engine",
        description: "Experience the pinnacle of luxury with HotelMate's elite booking sanctuary.",
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
