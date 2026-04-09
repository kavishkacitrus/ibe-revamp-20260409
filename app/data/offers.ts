export interface Offer {
    id: string;
    title: string;
    description: string;
    discount: string;
    validUntil: string;
    image: string;
    terms: string[];
    category: 'Seasonal' | 'Member' | 'Package' | 'Early Bird';
}

export const offers: Offer[] = [
    {
        id: 'offer-1',
        title: 'Summer Serenity Package',
        description: 'Experience a 7-night stay in our Ocean View Suite with complimentary spa treatments and private beach dinners.',
        discount: '30% OFF',
        validUntil: 'August 31, 2026',
        image: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=800&auto=format&fit=crop',
        category: 'Package',
        terms: [
            'Minimum 7 nights stay required',
            'Subject to availability',
            'Cannot be combined with other offers'
        ]
    },
    {
        id: 'offer-2',
        title: 'Alpine Early Bird',
        description: 'Book your winter escape 6 months in advance and enjoy exclusive access to the VIP ski lounge and equipment rental.',
        discount: '20% OFF',
        validUntil: 'December 20, 2026',
        image: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=800&auto=format&fit=crop',
        category: 'Early Bird',
        terms: [
            'Booking must be made 180 days in advance',
            'Fully prepaid, non-refundable',
            'Blackout dates apply'
        ]
    },
    {
        id: 'offer-3',
        title: 'Luminous Membership Suite',
        description: 'Exclusive for our Luminous members: Stay in any penthouse and receive $500 resort credit per stay.',
        discount: 'MEMBERS ONLY',
        validUntil: 'Ongoing',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop',
        category: 'Member',
        terms: [
            'Valid for Luminous Gold and Platinum members only',
            'Credit must be used during stay',
            'Applicable to penthouse categories only'
        ]
    },
    {
        id: 'offer-4',
        title: 'Urban Escape Weekend',
        description: 'Recharge in the city with a 2-night stay including complimentary breakfast and late check-out till 4 PM.',
        discount: 'STAY 3 PAY 2',
        validUntil: 'September 30, 2026',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        category: 'Seasonal',
        terms: [
            'Valid for Friday-Sunday check-ins',
            'Late check-out subject to availability',
            'Includes daily buffet breakfast'
        ]
    }
];
