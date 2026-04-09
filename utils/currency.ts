export const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CAD: 'C$',
        AUD: 'A$',
        CHF: 'CHF',
        CNY: '¥',
        INR: '₹',
        LKR: 'Rs',
        SGD: 'S$',
        HKD: 'HK$',
        NZD: 'NZ$',
        ZAR: 'R',
        AED: 'د.إ',
        SAR: '﷼',
        THB: '฿',
        MYR: 'RM',
        IDR: 'Rp',
        PHP: '₱',
        VND: '₫',
    };
    
    return symbols[currency.toUpperCase()] || currency;
};
