'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { useParams } from 'next/navigation';

const Footer = () => {
    const params = useParams();
    const { properties } = useAppSelector((state) => state.property);
    const reservation = useAppSelector((state) => state.reservation);

    // Identify active property from URL slug/id or reservation
    const slug = params.slug as string || params.id as string || reservation.items[0]?.hotelId;
    const property = properties.find(p => String(p.slug) === String(slug) || String(p.id) === String(slug));

    const logoUrl = property?.ibE_LogoURL || "https://hotelmate-internal.s3.us-east-1.amazonaws.com/logo/hotelmate_logo_bwhite.png";

    return (
        <footer className="bg-brand-charcoal text-white border-t border-brand-charcoal py-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="space-y-6">
                        <Link href={property?.slug ? `/hotels/${property.slug}` : "/"} className="flex items-center gap-2">
                            <div className="h-10 min-w-[150px] relative flex items-center">
                                <img
                                    src={logoUrl}
                                    alt={property?.name || "HotelMate"}
                                    className="h-full w-auto max-w-[200px] object-contain object-left"
                                />
                            </div>
                        </Link>
                        {/* <p className="text-brand-cream/60 text-sm leading-relaxed max-w-xs font-light">
                            {property?.description || "Redefining hospitality through seamless technology and curated luxury experiences across the globe."}
                        </p> */}
                        {property && (
                            <div className="space-y-2 text-brand-cream/60 text-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{property.location}, {property.city}, {property.country}</span>
                                </div>
                                {property.hotelPhone && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{property.hotelPhone}</span>
                                    </div>
                                )}
                                {property.hotelEmail && (
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>{property.hotelEmail}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-gold mb-6 uppercase text-xs tracking-[0.2em]">Hotel Information</h4>
                        <ul className="space-y-4">
                            {property && (
                                <>
                                    {/* <li><span className="text-sm text-brand-cream/60">Rating: {property.rating} Stars</span></li>
                                    <li><span className="text-sm text-brand-cream/60">Currency: {property.currencyCode}</span></li>
                                    <li><span className="text-sm text-brand-cream/60">Hotel Code: {property.hotelCode || 'N/A'}</span></li>
                                    <li><span className="text-sm text-brand-cream/60">Rooms: {property.rooms?.length || 0} Available</span></li> */}
                                </>
                            )}
                            <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">About {property?.name || 'HotelMate'}</Link></li>
                            <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-brand-gold mb-6 uppercase text-xs tracking-[0.2em]">Policies & Services</h4>
                        <ul className="space-y-4">
                            {property?.ibE_CancellationPolicy && (
                                <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Booking Policies</Link></li>
                            )}
                            {/* {property?.ibE_ChildPolicy && (
                                <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Child Policy</Link></li>
                            )}
                            {property?.ibE_TaxPolicy && (
                                <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Tax Policy</Link></li>
                            )} */}
                            {property?.ibE_Pay50 && (
                                <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Payment Options</Link></li>
                            )}
                            <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Guest Services</Link></li>
                            <li><Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors">Facilities</Link></li>
                        </ul>
                    </div>

                    <div>
                        {/* <h4 className="font-bold text-brand-gold mb-6 uppercase text-xs tracking-[0.2em]">Connect</h4> */}
                          <h5 className="font-semibold text-brand-gold mb-4 uppercase text-xs tracking-[0.2em]">Secure Payment Methods</h5>
                        <div className="space-y-4">
                            {/* <div className="flex gap-4">
                                {['Instagram', 'Twitter', 'Facebook', 'LinkedIn'].map(social => (
                                    <Link key={social} href="#" className="w-10 h-10 rounded-full border border-brand-cream/20 flex items-center justify-center text-brand-cream/60 hover:bg-brand-red hover:text-white transition-all">
                                        <span className="sr-only">{social}</span>
                                        <div className="w-4 h-4 rounded-sm bg-current opacity-70"></div>
                                    </Link>
                                ))}
                            </div> */}
                             {/* Payment Methods */}
                            <div className="mt-8">
                              
                                <div className="flex flex-wrap gap-3">
                                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center p-1">
                                        <img src="/images/visa-secure-badge-logo.svg" alt="Visa" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center p-1">
                                        <img src="/images/mastercard-id-check.svg" alt="Mastercard" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center p-1">
                                        <img src="/images/pci-dss-compliant-logo-vector.svg" alt="PCI DSS" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center p-1">
                                        <div 
                                            dangerouslySetInnerHTML={{
                                                __html: `<!-- PayPal Logo --><table border="0" cellpadding="10" cellspacing="0" align="center"><tr><td align="center"></td></tr><tr><td align="center"><a href="https://www.paypal.com/il/webapps/mpp/paypal-popup" title="How PayPal Works" onclick="javascript:window.open('https://www.paypal.com/il/webapps/mpp/paypal-popup','WIPaypal','toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=1060, height=700'); return false;"><img src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" border="0" alt="PayPal Logo"></a></td></tr></table><!-- PayPal Logo -->`
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-brand-cream/40 mt-3">Secure encrypted payments powered by HotelMate</p>
                            </div>
                            <div className="space-y-2">
                                <Link href="/locations" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors block">All Properties</Link>
                                <Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors block">Newsletter</Link>
                                <Link href="#" className="text-sm text-brand-cream/60 hover:text-brand-gold transition-colors block">Careers</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-brand-cream/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] uppercase tracking-widest text-brand-cream/40">
                        © 2026 {property?.name ? `${property.name} - ` : ''}HotelMate IBE. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-[10px] uppercase tracking-widest text-brand-cream/40 hover:text-brand-gold transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-[10px] uppercase tracking-widest text-brand-cream/40 hover:text-brand-gold transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
