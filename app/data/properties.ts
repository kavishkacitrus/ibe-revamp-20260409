export interface Room {
    id: string;
    name: string;
    type: string;
    price: number;
    capacity: number;
    image: string;
    features: string[];
    description: string;
}

export interface Property {
    id: number;
    slug: string;
    name: string;
    city: string;
    country: string;
    currencyCode: string;
    location: string;
    price: string;
    rating: number;
    image: string;
    ibeHomeImage?: string;
    tags: string[];
    description: string;
    rooms: Room[];
    unavailableDates?: string[];
    ibE_CancellationPolicy?: string;
    ibE_ChildPolicy?: string;
    ibE_TaxPolicy?: string;
    hotelPhone?: string;
    hotelEmail?: string;
    ibE_LogoURL?: string;
    ibE_Pay50?: boolean;
    ibeHeaderColour?: string;
    ibeLogoWidth?: number;
    ibeLogoHeight?: number;
    hotelCode?: string;
    hotelAddress?: string;
    ibE_AllowPayLater?: boolean;
    ibE_PayLater_Days?: number;
}

// Data will be fetched from API and stored in Redux
export const properties: Property[] = [];
