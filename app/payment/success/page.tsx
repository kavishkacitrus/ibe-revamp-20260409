'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ScrollReveal from '@/app/components/ScrollReveal';
import { format, parseISO } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearReservation } from '@/store/slices/reservationSlice';
import { decryptData } from '@/app/utils/encryption';
import { processBookingFeed, BookingFeedRequest } from '@/store/slices/bookingFeedSlice';
import { differenceInDays } from 'date-fns';
import { sendEmail } from '@/store/slices/emailSlice';
import { selectEmailLoading, selectEmailError } from '@/store/slices/emailSlice';
import { fetchReservationById, selectReservation, selectReservationLoading, clearReservationApi } from '@/store/slices/reservationApiSlice';
import { selectBookingFeedResponse, clearBookingFeedResponse } from '@/store/slices/bookingFeedSlice';
import { capturePaypalOrder } from '@/store/slices/capturePaypalSlice';

const SuccessContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const reservation = useAppSelector((state) => state.reservation);
    const { checkIn, checkOut } = useAppSelector((state) => state.booking);
    const { properties } = useAppSelector((state) => state.property);
    const emailLoading = useAppSelector(selectEmailLoading);
    const emailError = useAppSelector(selectEmailError);
    const bookingFeedResponse = useAppSelector(selectBookingFeedResponse);
    const apiReservation = useAppSelector(selectReservation);
    const apiReservationLoading = useAppSelector(selectReservationLoading);

    const printRef = useRef<HTMLDivElement>(null);
    const hasEmailSent = useRef(false);
    const isCleaningUp = useRef(false);

    // Decrypt data from URL
    const encryptedData = searchParams.get('v');
    const decrypted = encryptedData ? decryptData(encryptedData) : null;

    const paymentMethod = decrypted?.method || searchParams.get('method');

    // Use a ref to store URL parameters so they don't disappear when router.replace clears the URL
    const paramsRef = useRef({
        orderId: decrypted?.orderId || searchParams.get('orderId'),
        amount: decrypted?.amount || searchParams.get('amount'),
        hotelIdParam: decrypted?.hotelId || searchParams.get('hotelId'),
        paidPercentage: String(decrypted?.paidPercentage || searchParams.get('paidPercentage') || '')
    });

    // Update ref if they exist in searchParams (handles initial load)
    useEffect(() => {
        const currentOrderId = decrypted?.orderId || searchParams.get('orderId');
        if (currentOrderId && !paramsRef.current.orderId) {
            paramsRef.current.orderId = currentOrderId;
        }
        const currentAmount = decrypted?.amount || searchParams.get('amount');
        if (currentAmount && !paramsRef.current.amount) {
            paramsRef.current.amount = currentAmount;
        }
        const currentHotelId = decrypted?.hotelId || searchParams.get('hotelId');
        if (currentHotelId && !paramsRef.current.hotelIdParam) {
            paramsRef.current.hotelIdParam = currentHotelId;
        }
        const currentPaidPercentage = String(decrypted?.paidPercentage || searchParams.get('paidPercentage') || '');
        if (currentPaidPercentage && !paramsRef.current.paidPercentage) {
            paramsRef.current.paidPercentage = currentPaidPercentage;
        }
    }, [searchParams, decrypted]);

    const { orderId, amount, hotelIdParam, paidPercentage } = paramsRef.current;

    const [displayReservation, setDisplayReservation] = useState(reservation);
    const [displayBooking, setDisplayBooking] = useState({ checkIn, checkOut });
    const [isPayAtHotelFromStorage, setIsPayAtHotelFromStorage] = useState(false);

    useEffect(() => {
        // Check localStorage for selected payment method to determine if it's Pay at Hotel
        const selectedPaymentMethodId = localStorage.getItem('selectedPaymentMethod');
        const paymentMethodDetails = localStorage.getItem('paymentMethodDetails');

        let payAtHotel = false;
        if (paymentMethodDetails) {
            try {
                const details = JSON.parse(paymentMethodDetails);
                payAtHotel = details.ipgName?.toLowerCase().includes('hotel') || false;
            } catch (error) {
                console.error('Error parsing payment method details:', error);
            }
        } else if (selectedPaymentMethodId && paymentMethod === 'hotel') {
            payAtHotel = true;
        }
        setIsPayAtHotelFromStorage(payAtHotel);
    }, [paymentMethod]);

    const isTentative = paymentMethod === 'hotel' || isPayAtHotelFromStorage;
    const isValid = !!(orderId && amount);

    useEffect(() => {
        // Hydrate from localStorage if Redux is empty
        if (reservation.items.length === 0) {
            const savedRes = localStorage.getItem('hm_reservation');
            const savedBooking = localStorage.getItem('hm_booking');
            if (savedRes) setDisplayReservation(JSON.parse(savedRes));
            if (savedBooking) setDisplayBooking(JSON.parse(savedBooking));
        } else {
            // Keep in sync with Redux if it's there
            setDisplayReservation(reservation);
            setDisplayBooking({ checkIn, checkOut });
        }
    }, [reservation, checkIn, checkOut]);

    const property = properties.find(p =>
        String(p.id) === String(displayReservation.items[0]?.hotelId || hotelIdParam)
    );

    const hasCalledFeed = useRef(false);

    useEffect(() => {
        const isProcessed = orderId ? localStorage.getItem(`hm_processed_${orderId}`) : null;

        if (isValid && !hasCalledFeed.current && displayReservation.items.length > 0 && displayBooking.checkIn && !isProcessed) {
            hasCalledFeed.current = true;
            if (orderId) localStorage.setItem(`hm_processed_${orderId}`, 'true');

            // Clear URL parameters to prevent duplicate calls on reload
            router.replace('/payment/success', { scroll: false });

            const now = new Date().toISOString();
            const arrivalDate = displayBooking.checkIn || '';
            const departureDate = displayBooking.checkOut || '';
            const nights = arrivalDate && departureDate ? differenceInDays(parseISO(departureDate), parseISO(arrivalDate)) : 1;

            const remarks_guest = displayReservation.customerInfo?.specialRequests || "";
            const estimatedArrival = displayReservation.customerInfo?.estimatedArrivalTime || "";

            // Combine special requests and arrival time
            const combinedRemarks = estimatedArrival
                ? `${remarks_guest ? remarks_guest + ' | ' : ''}ETA: ${estimatedArrival}`
                : remarks_guest;

            // Calculate total amount from reservation data
            const totalAmount = reservation?.totalAmount || Number(amount || 0);

            const feedPayload: BookingFeedRequest = {
                data: [{
                    attributes: {
                        id: `IBE-REV-${orderId}`,
                        meta: {
                            ruid: `IBE-REV-${orderId}`,
                            is_genius: false
                        },
                        status: "new",
                        services: [],
                        currency: reservation?.currency || "USD",
                        amount: totalAmount.toFixed(2),
                        rate_code_id: 1,
                        created_by: `${displayReservation.customerInfo?.firstName || ''} ${displayReservation.customerInfo?.lastName || ''}`.trim() || "IBE User",
                        remarks_internal: "",
                        remarks_guest: combinedRemarks,
                        guest_profile_id: 0,
                        agent: "IBE",
                        inserted_at: now,
                        channel_id: "",
                        property_id: "",
                        hotel_id: Number(hotelIdParam),
                        unique_id: `IBE-BK-${orderId}`,
                        system_id: "FIT",
                        ota_name: "IBE",
                        booking_id: `IBE-BK-${orderId}`,
                        notes: combinedRemarks,
                        arrival_date: arrivalDate,
                        arrival_hour: estimatedArrival,
                        customer: {
                            meta: {
                                ruid: "",
                                is_genius: false
                            },
                            name: `${displayReservation.customerInfo?.firstName || ''} ${displayReservation.customerInfo?.lastName || ''}`.trim() || "IBE Guest",
                            zip: "",
                            address: "",
                            country: "Sri Lanka",
                            city: "",
                            language: "en",
                            mail: displayReservation.customerInfo?.email || "",
                            phone: displayReservation.customerInfo?.phone || "",
                            surname: "",
                            company: ""
                        },
                        departure_date: departureDate,
                        deposits: [],
                        ota_commission: "0",
                        ota_reservation_code: "",
                        payment_collect: isTentative ? "property" : "merchant",
                        payment_type: "",
                        rooms: displayReservation.items.map((item, idx) => {
                            const nightsForRoom = Math.max(nights, 1);
                            const nightlyRate = (item.price / nightsForRoom).toFixed(2);
                            const dailyRates: Record<string, string> = {};

                            if (arrivalDate && nights > 0) {
                                for (let i = 0; i < nights; i++) {
                                    const date = new Date(parseISO(arrivalDate));
                                    date.setDate(date.getDate() + i);
                                    dailyRates[format(date, 'yyyy-MM-dd')] = nightlyRate;
                                }
                            }

                            return {
                                reservation_status_id: 1,
                                is_foc: false,
                                taxes: [],
                                services: [],
                                amount: item.price.toFixed(2),
                                days: dailyRates,
                                guest_profile_id: 0,
                                ota_commission: "0",
                                guests: [],
                                occupancy: {
                                    children: item.children,
                                    adults: item.adults,
                                    ages: [],
                                    infants: 0
                                },
                                rate_plan_id: item.hotelRatePlanID?.toString() || "0",
                                room_type_id: "0",
                                hotel_room_type_id: item.roomTypeId || 0,
                                booking_room_id: `${orderId}-${idx}`,
                                checkin_date: arrivalDate,
                                checkout_date: departureDate,
                                is_cancelled: false,
                                ota_unique_id: "",
                                disc_percen: 0,
                                discount: 0,
                                child_rate: 0,
                                suppliment: 0,
                                net_rate: Number(nightlyRate),
                                is_day_room: false,
                                bed_type: "",
                                res_occupancy: "",
                                meta: {
                                    meal_plan: item.mealPlan,
                                    mapping_id: "",
                                    parent_rate_plan_id: "",
                                    policies: "",
                                    promotion: [],
                                    room_remarks: []
                                }
                            };
                        }),
                        occupancy: {
                            children: displayReservation.items.reduce((sum, i) => sum + i.children, 0),
                            adults: displayReservation.items.reduce((sum, i) => sum + i.adults, 0),
                            ages: [],
                            infants: 0
                        },
                        secondary_ota: "",
                        acknowledge_status: "pending",
                        raw_message: "{}",
                        is_crs_revision: false,
                        is_day_room: false,
                        ref_no: orderId || "",
                        group_name: "",
                        tour_no: "",
                        guarantee: {
                            token: "",
                            cardNumber: "",
                            cardType: "",
                            cardholderName: "",
                            cvv: "",
                            expirationDate: "",
                            isVirtual: false
                        },
                        release_date: now
                    },
                    id: `IBE-REV-${orderId}`,
                    type: "RESERVATION",
                    relationships: {
                        data: {
                            property: {
                                id: hotelIdParam?.toString() || "",
                                type: "property"
                            },
                            booking: {
                                id: `IBE-BK-${orderId}`,
                                type: "booking"
                            }
                        }
                    }
                }],
                meta: {
                    total: 1,
                    limit: 10,
                    order_by: "inserted_at",
                    page: 1,
                    order_direction: "asc"
                },
                dateTime: now
            };

            dispatch(processBookingFeed({ payload: feedPayload }));
        }
    }, [isValid, orderId, amount, hotelIdParam, isTentative, displayReservation, displayBooking, dispatch, router]);

    // Function to generate and send booking voucher email
    const sendBookingVoucher = async () => {
        const targetEmail = apiReservation?.email || displayReservation.customerInfo?.email;

        if (!targetEmail || !orderId || !property || !apiReservation) {
            console.error('Missing required data for voucher generation:', {
                hasEmail: !!targetEmail,
                hasOrderId: !!orderId,
                hasProperty: !!property,
                hasApiReservation: !!apiReservation
            });
            return;
        }

        try {
            // Use only API reservation data
            const reservationData = apiReservation;

            // Get the total from rate details (sum of all net rates)
            const totalFromRateDetails = reservationData.rateDetailsTotal || reservationData.totalAmount || 0;

            const nights = reservationData.totalNights;

            // Generate HTML voucher content
            const voucherHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Booking Confirmation - ${property.name}</title>
                    <style>
                        body { font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f8f8f8; }
                        .voucher { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
                        .header { background: #1D2B5B; color: white; padding: 30px; text-align: center; }
                        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
                        .header p { margin: 10px 0 0 0; opacity: 0.9; }
                        .content { padding: 40px; }
                        .section { margin-bottom: 30px; }
                        .section h3 { color: #B18B8B; font-size: 0.8em; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                        .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                        .detail-box { background: #f8f8f8; padding: 15px; border-radius: 10px; }
                        .detail-box strong { display: block; margin-bottom: 5px; color: #1D2B5B; }
                        .room-item { border-left: 3px solid #B18B8B; padding-left: 20px; margin-bottom: 20px; }
                        .total { background: linear-gradient(135deg, #f8f8f8, #e8e8e8); padding: 20px; border-radius: 10px; text-align: center; margin-top: 30px; }
                        .total .amount { font-size: 2em; font-weight: bold; color: #1D2B5B; }
                        .footer { text-align: center; padding: 20px; background: #f8f8f8; font-size: 0.9em; color: #666; }
                        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
                        .status.confirmed { background: #d4edda; color: #155724; }
                        .status.tentative { background: #fff3cd; color: #856404; }
                    </style>
                </head>
                <body>
                    <div class="voucher">
                        <div class="header">
                            <h1>${isTentative ? 'Tentative Reservation' : 'Booking Confirmed'}</h1>
                            <p>${property.name}</p>
                            <p>${property.location || (property as any)?.hotelAddress || ''}</p>
                        </div>
                        
                        <div class="content">
                            <div class="section">
                                <h3>Booking Reference</h3>
                                <div style="text-align: center; margin: 20px 0;">
                                    <div style="font-size: 2em; font-family: monospace; font-weight: bold; color: #B18B8B;">${reservationData.refNo}</div>
                                    <div class="status ${isTentative ? 'tentative' : 'confirmed'}">${isTentative ? 'Pay at Hotel' : (paidPercentage === '50' ? 'Partial Payment' : 'Fully Paid')}</div>
                                </div>
                            </div>

                            <div class="section">
                                <h3>Guest Details</h3>
                                <div class="booking-details">
                                    <div class="detail-box">
                                        <strong>Name</strong>
                                        ${reservationData.bookerFullName}
                                    </div>
                                    <div class="detail-box">
                                        <strong>Email</strong>
                                        ${reservationData.email}
                                    </div>
                                    <div class="detail-box">
                                        <strong>Phone</strong>
                                        ${reservationData.phone || 'Not provided'}
                                    </div>
                                    <div class="detail-box">
                                        <strong>Special Requests</strong>
                                        ${reservationData.remarksGuest || 'None'}
                                    </div>
                                </div>
                            </div>

                            ${reservationData.remarksGuest ? `
                                <div class="section" style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px;">
                                    <h3 style="color: #856404; margin-top: 0;">📝 Special Requests</h3>
                                    <p style="margin-bottom: 0;">${reservationData.remarksGuest}</p>
                                </div>
                            ` : ''}
                      
                      <div class="section">      <h3>Stay Duration</h3> </div>
                            <div class="booking-details" style="display: flex;">
                                <div class="detail-box">
                                    <strong>Check-In</strong>
                                    ${reservationData.resCheckIn ? format(parseISO(reservationData.resCheckIn), 'MMMM dd, yyyy') : 'TBD'}
                                </div>
                                <div class="detail-box" style="margin-left: auto;">
                                    <strong>Check-Out</strong>
                                    ${reservationData.resCheckOut ? format(parseISO(reservationData.resCheckOut), 'MMMM dd, yyyy') : 'TBD'}
                                </div>
                            </div>

                            <div class="section">
                                <h3>Room Details</h3>
                                ${reservationData.rooms.map((room, index) => {
                const roomTotal = (totalFromRateDetails / reservationData.rooms.length);
                return `
                                    <div class="room-item">
                                        <div style="display: flex; justify-content: space-between; align-items: start;">
                                            <div style="flex: 1;">
                                                <strong>${room.roomType}</strong>
                                                <p style="margin: 5px 0;">${room.basis} • ${room.adults} Adults ${room.child > 0 ? `• ${room.child} Children` : ''}</p>
                                                <p style="margin: 0; font-size: 0.9em; color: #666;">${nights > 1 ? `${nights} nights` : '1 night'}</p>
                                            </div>
                                            <div style="font-weight: bold; color: #1D2B5B;">
                                                ${reservationData.currencyCode} ${roomTotal.toFixed(2)}
                                                ${isTentative ? '<div style="font-size: 0.7em; font-weight: normal; color: #856404;">(Pay at Hotel)</div>' : ''}
                                            </div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>

                            <div class="total">
                                <div>${isTentative ? 'Total Amount' : (paidPercentage === '50' ? 'Paid Amount (50%)' : 'Total Investment')}</div>
                                <div class="amount">${reservationData.currencyCode || 'USD'} ${totalFromRateDetails.toFixed(2)}</div>
                                ${isTentative ? '<p>Payable at hotel upon arrival(non-paid)</p>' : (paidPercentage === '50' ? '<p>Remaining 50% payable at hotel</p>' : '<p>All taxes included</p>')}
                            </div>

                            ${isTentative && displayReservation.paymentMethod === 'pay_later' && property?.ibE_PayLater_Days ? `
                            <div class="section" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 14px;">Payment Reminder</h3>
                                <p style="color: #856404; margin: 0; font-size: 12px;">
                                    <strong>Payment should be made within ${property.ibE_PayLater_Days} days</strong><br>
                                    Please complete your payment before the deadline to secure your reservation.
                                </p>
                            </div>
                            ` : ''}

                            ${property.ibE_CancellationPolicy || property.ibE_ChildPolicy ? `
                                <div class="section">
                                    <h3>Policies</h3>
                                    ${property.ibE_CancellationPolicy ? `<p><strong>Cancellation:</strong> ${property.ibE_CancellationPolicy}</p>` : ''}
                                    ${property.ibE_ChildPolicy ? `<p><strong>Child Policy:</strong> ${property.ibE_ChildPolicy}</p>` : ''}
                                </div>
                            ` : ''}
                        </div>

                        <div class="footer">
                            <p>This is ${isTentative ? 'a tentative acknowledgement' : 'an official confirmation'} from ${property.name}.</p>
                            <p>${isTentative ? 'Confirmation is subject to availability upon arrival.' : 'Please present this confirmation upon arrival.'}</p>
                            <p>For inquiries, contact us at: ${property.hotelEmail || targetEmail}</p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await dispatch(sendEmail({
                toEmail: targetEmail,
                subject: `${property.name} - ${isTentative ? 'Tentative Booking' : 'Booking Confirmation'} (Ref: ${apiReservation.refNo || orderId})`,
                body: voucherHtml,
                isHtml: true,
                senderName: 'HotelMate Booking System'
            })).unwrap();

            console.log('Booking voucher sent successfully to:', targetEmail);

        } catch (error) {
            console.error('Failed to send booking voucher:', error);
        }
    };

    // Send voucher email after booking feed is processed and API reservation data is available
    useEffect(() => {
        const targetEmail = apiReservation?.email || displayReservation.customerInfo?.email;
        const emailSentKey = orderId ? `hm_email_sent_${orderId}` : null;
        const isEmailSent = emailSentKey ? localStorage.getItem(emailSentKey) === 'true' : false;

        if (!isEmailSent && !hasEmailSent.current && targetEmail && orderId && property && apiReservation) {
            hasEmailSent.current = true;
            if (emailSentKey) localStorage.setItem(emailSentKey, 'true');

            // Send voucher with a small delay to ensure all data is ready
            setTimeout(() => {
                sendBookingVoucher();
            }, 1000);
        }
    }, [displayReservation.customerInfo, apiReservation, orderId, property]);

    // Fetch reservation data from API when booking feed response is available
    useEffect(() => {
        const resIdKey = `hm_reservation_id_${orderId}`;
        const savedResId = orderId ? localStorage.getItem(resIdKey) : null;
        const currentResId = bookingFeedResponse?.reservationID || (savedResId ? Number(savedResId) : null);

        if (currentResId && !apiReservation && !apiReservationLoading) {
            if (bookingFeedResponse?.reservationID) {
                localStorage.setItem(resIdKey, bookingFeedResponse.reservationID.toString());
            }
            dispatch(fetchReservationById(currentResId));
        }
    }, [bookingFeedResponse?.reservationID, apiReservation, apiReservationLoading, dispatch, orderId]);

    useEffect(() => {
        // Only redirect if we don't have ANY data (initial load failure)
        if (!isValid && displayReservation.items.length === 0) {
            const timeout = setTimeout(() => {
                router.push('/');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [isValid, displayReservation.items.length, router]);

    const handleDownload = () => {
        window.print();
    };

    const handleCreateAnotherReservation = () => {
        if (isCleaningUp.current) return;
        isCleaningUp.current = true;

        // Clear all Redux states
        dispatch(clearReservation());
        dispatch(clearReservationApi());
        dispatch(clearBookingFeedResponse());

        // Clear all localStorage items
        localStorage.removeItem('hm_reservation');
        localStorage.removeItem('hm_booking');
        localStorage.removeItem('selectedPaymentMethod');
        localStorage.removeItem('paymentMethodDetails');

        // Clear any processed flags for the old reservation
        if (orderId) {
            localStorage.removeItem(`hm_processed_${orderId}`);
            localStorage.removeItem(`hm_email_sent_${orderId}`);
            localStorage.removeItem(`hm_reservation_id_${orderId}`);
        }

        // Clear session-specific items
        localStorage.removeItem('paypal_order_id');

        // Reset refs
        hasEmailSent.current = false;
        hasCalledFeed.current = false;

        // Navigate to the property page using slug if available, fallback to hotel ID
        if (property?.slug) {
            router.push(`/hotels/${property.slug}`);
        } else if (hotelIdParam) {
            router.push(`/hotels/${hotelIdParam}`);
        } else {
            // Fallback to home page if no slug or hotel ID is available
            router.push('/');
        }
    };

    useEffect(() => {
        if (hasCalledFeed.current && apiReservation) {
            const timer = setTimeout(() => {
                window.print();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [hasCalledFeed.current, apiReservation]);

    // Only show loading if we have NO valid parameters OR if we are waiting for API reservation data
    if ((!isValid && displayReservation.items.length === 0) || !apiReservation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="w-16 h-16 border-4 border-brand-red/20 border-t-brand-red rounded-full animate-spin"></div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse text-center px-6">
                    {!apiReservation ? 'Fetching your official sanctuary passage...' : 'Validating your sanctuary passage...'}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12">

            {/* Success Header */}
            <ScrollReveal className="text-center no-print">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-charcoal :text-brand-cream uppercase tracking-tight mb-4">
                    {isTentative ? 'Tentative Booking' : 'Booking Secured'}
                </h1>
                <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: property?.ibeHeaderColour || '#CC2229' }}></div>
                <p className="text-zinc-500 font-light italic text-lg uppercase tracking-widest leading-relaxed">
                    {isTentative ? 'Your booking is tentative and awaiting final confirmation.' : 'Your booking has been confirmed.'} <br className="hidden md:block" />
                    {isTentative ? 'A preliminary receipt has been dispatched to your email.' : 'A confirmation envoy has been dispatched to your email.'}
                </p>
            </ScrollReveal>

            {/* Printable Confirmation Card */}
            <ScrollReveal className="print-container overflow-hidden">
                <div id="voucher-content" ref={printRef} className="bg-white :bg-zinc-900 rounded-[2rem] border border-brand-gold/10 shadow-2xl overflow-hidden relative">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl -z-10 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-red/5 blur-3xl -z-10 rounded-full"></div>

                    {/* Ticket Header */}
                    <div className="bg-brand-charcoal p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b-4" style={{ borderBottomColor: property?.ibeHeaderColour || '#CC2229' }}>
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold">
                                {isTentative ? 'Tentative Booking' : 'Reservation Confirmed'}
                            </div>
                            <h2 className="text-3xl font-serif font-bold uppercase tracking-tight">{property?.name || 'Hotel Name'}</h2>
                            <p className="text-xs text-zinc-400 font-light italic">{property?.location || (property as any)?.hotelAddress || 'Hotel Location'}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Booking Reference</div>
                            <div className="text-2xl font-mono font-bold tracking-tighter text-brand-gold">
                                {apiReservation.refNo}
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 py-1 border-b border-brand-gold/10">Guest Details</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-[11px] uppercase text-zinc-400 font-bold">Primary Guest</span>
                                        <span className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                            {apiReservation.bookerFullName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[11px] uppercase text-zinc-400 font-bold">Contact</span>
                                        <span className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                            {apiReservation.email}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[11px] uppercase text-zinc-400 font-bold">Telephone</span>
                                        <span className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                            {apiReservation.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 py-1 border-b border-brand-gold/10">Stay Duration</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-50 :bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 :border-zinc-800">
                                        <div className="text-[9px] uppercase text-zinc-400 font-bold mb-1">Check-In</div>
                                        <div className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                            {format(parseISO(apiReservation.resCheckIn), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 :bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 :border-zinc-800">
                                        <div className="text-[9px] uppercase text-zinc-400 font-bold mb-1">Check-Out</div>
                                        <div className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                            {format(parseISO(apiReservation.resCheckOut), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-4 py-1 border-b border-brand-gold/10">Booking</h3>
                                <div className="space-y-6">
                                    {apiReservation.rooms.map((room, idx) => {
                                        const roomTotal = (apiReservation.rateDetailsTotal || apiReservation.totalAmount || 0) / apiReservation.rooms.length;
                                        return (
                                            <div key={idx} className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-bold text-brand-charcoal :text-brand-cream uppercase">{room.roomType}</div>
                                                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest">{room.basis}</div>
                                                    <div className="text-[9px] text-zinc-500 italic">{room.adults} Adults {room.child > 0 ? `• ${room.child} Children` : ''}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-brand-charcoal :text-brand-cream">
                                                        {apiReservation.currencyCode} {roomTotal.toFixed(2)}
                                                    </div>
                                                    {isTentative && (
                                                        <div className="text-[9px] text-amber-600 italic">(Pay at Hotel)</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-brand-gold/5 p-6 rounded-3xl border border-brand-gold/20">
                                <div className="flex justify-between items-end">
                                    {/* Payment Status (LEFT) */}
                                    <div>
                                        <div className="text-[9px] uppercase text-zinc-400 font-bold mb-1">
                                            Payment Status
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block ${isTentative
                                            ? 'bg-amber-500/10 text-amber-500'
                                            : (paidPercentage === '50'
                                                ? 'bg-brand-gold/10 text-brand-gold'
                                                : 'bg-emerald-500/10 text-emerald-500')
                                            }`}>
                                            {isTentative
                                                ? 'Pending (Pay at Hotel non-paid)'
                                                : (paidPercentage === '50'
                                                    ? 'Partial (50%)'
                                                    : 'Paid')}
                                        </div>
                                    </div>

                                    {/* Amount (RIGHT) */}
                                    <div className="text-right">
                                        <div className="text-[9px] uppercase text-zinc-400 font-bold mb-1">
                                            {isTentative
                                                ? 'Total Amount'
                                                : (paidPercentage === '50'
                                                    ? 'Paid Amount (50%)'
                                                    : 'Total Investment')}
                                        </div>
                                        <div
                                            className="text-4xl font-serif font-bold leading-none"
                                            style={{ color: property?.ibeHeaderColour || '#CC2229' }}
                                        >
                                            {apiReservation.currencyCode} {(apiReservation.rateDetailsTotal || apiReservation.totalAmount || 0).toFixed(2)}
                                        </div>

                                        {isTentative ? (
                                            <div className="text-[9px] text-amber-600 italic mt-2">
                                                Payable at hotel upon arrival (non-paid)
                                            </div>
                                        ) : paidPercentage === '50' && (
                                            <div className="text-[9px] text-zinc-500 italic mt-2">
                                                Remaining 50% payable at hotel
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Pay Later Note */}
                                {isTentative && displayReservation.paymentMethod === 'pay_later' && property?.ibE_PayLater_Days && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600 mt-0.5 flex-shrink-0">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div>
                                                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Payment Reminder</div>
                                                <div className="text-[9px] text-amber-700 mt-1">
                                                    <strong>Payment should be made within {property.ibE_PayLater_Days} days</strong><br />
                                                    Please complete your payment before the deadline to secure your reservation.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Policies Section */}
                {property && (
                    <div className="px-8 md:px-12 pb-8 space-y-6">
                        <div className="pt-8 border-t border-brand-gold/10">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 py-1 border-b border-brand-gold/10">Policies & Terms</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {property.ibE_CancellationPolicy && (
                                    <div className="space-y-2">
                                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Cancellation</h4>
                                        <div className="text-[10px] text-zinc-500 font-light leading-relaxed space-y-1" dangerouslySetInnerHTML={{ __html: property.ibE_CancellationPolicy }} />
                                    </div>
                                )}
                                {property.ibE_ChildPolicy && (
                                    <div className="space-y-2">
                                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Child Policy</h4>
                                        <div className="text-[10px] text-zinc-500 font-light leading-relaxed space-y-1" dangerouslySetInnerHTML={{ __html: property.ibE_ChildPolicy }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Note */}
                <div className="px-12 pb-12">
                    <div className="pt-8 border-t border-zinc-100 :border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 text-zinc-400">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-[10px] font-medium uppercase tracking-widest max-w-[200px]">
                                This is {isTentative ? 'a tentative acknowledgement' : 'an official confirmation'} from {property?.name || 'the sanctuary'}. {isTentative ? 'Confirmation is subject to availability upon arrival.' : 'Please present this upon arrival.'}
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 no-print">
                <button
                    onClick={handleDownload}
                    className="w-full md:w-auto px-12 py-5 border rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-lg hover:opacity-80"
                    style={{
                        borderColor: property?.ibeHeaderColour || '#CC2229',
                        color: property?.ibeHeaderColour || '#CC2229',
                    }}
                >
                    Download Voucher as PDF
                </button>
                <button
                    onClick={handleCreateAnotherReservation}
                    className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-brand-gold to-amber-600 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                >
                    ➕ Create Another Reservation
                </button>
            </div>
        </div>
    );
};

const SuccessPage = () => {
    return (
        <div className="bg-brand-cream :bg-brand-charcoal min-h-screen selection:bg-brand-red selection:text-white pb-12">
            <Header />

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    .print-container {
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    main {
                        padding-top: 0 !important;
                    }
                }
                .print-only {
                    display: none;
                }
            `}</style>

            <main className="container mx-auto px-6 pt-32 pb-24">
                <Suspense fallback={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                        <div className="w-16 h-16 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Sanctuary Details...</p>
                    </div>
                }>
                    <SuccessContent />
                </Suspense>
            </main>

            <div className="no-print">
                <Footer />
            </div>
        </div>
    );
};

export default SuccessPage;