export interface TranslationKeys {
  // Header
  header: {
    locations: string;
    specialOffers: string;
    aboutUs: string;
    signIn: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    close: string;
    search: string;
    filter: string;
    sort: string;
    next: string;
    previous: string;
    select: string;
    selected: string;
    total: string;
    subtotal: string;
    taxes: string;
    taxesAndFees: string;
    includingAllTaxes: string;
    perNight: string;
    adults: string;
    adult: string;
    children: string;
    child: string;
    guests: string;
    rooms: string;
    room: string;
    available: string;
    left: string;
    bookNow: string;
    reserve: string;
    reservation: string;
    booking: string;
    checkout: string;
    payment: string;
    contact: string;
    needHelp: string;
    support: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    more: string;
    less: string;
    details: string;
    amenities: string;
    features: string;
    photos: string;
    reviews: string;
    rating: string;
    price: string;
    from: string;
    to: string;
    dates: string;
    checkIn: string;
    checkOut: string;
    duration: string;
    nights: string;
    night: string;
    currency: string;
    language: string;
  };

  // Home
  home: {
    curatedCollection: string;
    ourRetreats: string;
    discoverDescription: string;
  };

  // Property
  property: {
    notFound: string;
    returnToHome: string;
    exploreRooms: string;
    roomsDescription: string;
    available: string;
    people: string;
    capacity: string;
    noRoomsMatch: string;
    tryDifferentSearch: string;
    aboutRetreat: string;
    startingPrice: string;
    checkRooms: string;
  };

  // Locations
  locations: {
    globalPresence: string;
    ourDestinations: string;
    exploreDescription: string;
    discoverCities: string;
    sanctuary: string;
    sanctuaries: string;
  };

  // Rooms Compact
  roomsCompact: {
    adjustGuestsOrDates: string;
    soldOut: string;
    unavailable: string;
    bookNow: string;
    stayInsightHighDemand: string;
    sleeps: string;
    premiumRoom: string;
    left: string;
    fullyBooked: string;
    chooseYourExperience: string;
    explorePremiumRooms: string;
    notAvailable: string;
    tryDifferentDatesOrContact: string;
    yourSelection: string;
    totalValue: string;
    confirmReservation: string;
    allRoomsCleared: string;
    clearAllSelections: string;
    basketEmpty: string;
  };

  // Navigation
  nav: {
    home: string;
    hotels: string;
    rooms: string;
    bookings: string;
    profile: string;
    settings: string;
  };

  // Search
  search: {
    destination: string;
    checkInDate: string;
    checkOutDate: string;
    guests: string;
    searchHotels: string;
    searchResults: string;
    noResults: string;
    filters: string;
    priceRange: string;
    starRating: string;
    amenities: string;
    propertyType: string;
    sortBy: string;
    recommended: string;
    priceLowToHigh: string;
    priceHighToLow: string;
    rating: string;
    distance: string;
    allDestinations: string;
    exploreDestinations: string;
    clearFilters: string;
  };

  // Hotel Details
  hotel: {
    about: string;
    description: string;
    policies: string;
    cancellationPolicy: string;
    childPolicy: string;
    taxPolicy: string;
    petPolicy: string;
    checkInTime: string;
    checkOutTime: string;
    reception: string;
    facilities: string;
    services: string;
    location: string;
    map: string;
    directions: string;
    nearby: string;
    attractions: string;
    restaurants: string;
    shopping: string;
    transportation: string;
    airport: string;
    trainStation: string;
    busStation: string;
    parking: string;
    wifi: string;
    breakfast: string;
    pool: string;
    gym: string;
    spa: string;
    restaurant: string;
    bar: string;
    meetingRooms: string;
    businessCenter: string;
    petFriendly: string;
    familyFriendly: string;
    accessible: string;
  };

  // Room Details
  room: {
    roomTypes: string;
    roomDetails: string;
    occupancy: string;
    bedType: string;
    roomSize: string;
    view: string;
    balcony: string;
    terrace: string;
    kitchen: string;
    kitchenette: string;
    livingArea: string;
    workspace: string;
    bathroom: string;
    shower: string;
    bathtub: string;
    airConditioning: string;
    heating: string;
    tv: string;
    miniBar: string;
    safe: string;
    coffee: string;
    tea: string;
    iron: string;
    hairdryer: string;
    toiletries: string;
    bathrobes: string;
    slippers: string;
  };

  // Booking Flow
  booking: {
    yourSelection: string;
    personalInformation: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    specialRequests: string;
    estimatedArrivalTime: string;
    stayPeriod: string;
    totalValue: string;
    processToPayment: string;
    promoCode: string;
    havePromoCode: string;
    enterPromoCode: string;
    apply: string;
    remove: string;
    promoApplied: string;
    invalidPromoCode: string;
    pleaseEnterPromoCode: string;
    consent: string;
    consentText: string;
    termsAndConditions: string;
    privacyPolicy: string;
    agree: string;
    iAgree: string;
    confirmReservation: string;
    clearSelection: string;
    basketEmpty: string;
    selectExperience: string;
    needHelpConcierge: string;
    conciergeAvailable: string;
    confirmYourJourney: string;
    almostThere: string;
    policiesAndTerms: string;
    cancellationPolicy: string;
    childPolicy: string;
    taxPolicy: string;
    room: string;
    adultsAndChildren: string;
    adult: string;
    adults: string;
    child: string;
    children: string;
  };

  // Payment
  payment: {
    paymentMethod: string;
    retrievingGateways: string;
    paymentSecure: string;
    finalSummary: string;
    reviewReservation: string;
    paymentOption: string;
    fullPayment: string;
    pay50Now: string;
    stayDuration: string;
    subtotal: string;
    discount: string;
    amountPayableAtHotel: string;
    amountToPay50: string;
    totalInvestment: string;
    noImmediatePayment: string;
    remaining50Payable: string;
    allTaxesIncluded: string;
    processing: string;
    pay50Confirm: string;
    confirmTentative: string;
    completeFullPayment: string;
    secureSanctuaryPayment: string;
    loadingSecureGateway: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    billingAddress: string;
    sameAsGuest: string;
    differentAddress: string;
    country: string;
    state: string;
    city: string;
    postalCode: string;
    streetAddress: string;
    apartment: string;
    saveCard: string;
    payNow: string;
    paymentSuccessful: string;
    paymentFailed: string;
    securePayment: string;
    sslEncrypted: string;
    acceptedCards: string;
  };

  // Confirmation
  confirmation: {
    bookingConfirmed: string;
    confirmationNumber: string;
    bookingDetails: string;
    thankYou: string;
    emailSent: string;
    checkYourEmail: string;
    modifyBooking: string;
    cancelBooking: string;
    printConfirmation: string;
    downloadPdf: string;
    addToCalendar: string;
    shareBooking: string;
    rateYourStay: string;
    leaveReview: string;
    bookAgain: string;
    exploreMore: string;
  };

  // Errors
  errors: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    minLength: string;
    maxLength: string;
    invalidDate: string;
    dateInPast: string;
    dateBeforeCheckIn: string;
    invalidGuests: string;
    maxOccupancy: string;
    roomUnavailable: string;
    paymentFailed: string;
    networkError: string;
    serverError: string;
    somethingWentWrong: string;
    tryAgain: string;
    contactSupport: string;
  };

  // Success Messages
  success: {
    bookingConfirmed: string;
    paymentProcessed: string;
    promoApplied: string;
    profileUpdated: string;
    settingsSaved: string;
    emailSent: string;
    messageSent: string;
    reviewSubmitted: string;
  };
}

export const translations: Record<string, TranslationKeys> = {
  en: {
    header: {
      locations: 'Locations',
      specialOffers: 'Special Offers',
      aboutUs: 'About Us',
      signIn: 'Sign In'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      select: 'Select',
      selected: 'Selected',
      total: 'Total',
      subtotal: 'Subtotal',
      taxes: 'Taxes',
      taxesAndFees: 'Taxes & Service Fees',
      includingAllTaxes: 'Including all applicable taxes',
      perNight: '/ night',
      adults: 'Adults',
      adult: 'Adult',
      children: 'Children',
      child: 'Child',
      guests: 'Guests',
      rooms: 'Rooms',
      room: 'Room',
      available: 'Available',
      left: 'left',
      bookNow: 'Book Now',
      reserve: 'Reserve',
      reservation: 'Reservation',
      booking: 'Booking',
      checkout: 'Checkout',
      payment: 'Payment',
      contact: 'Contact',
      needHelp: 'Need Help?',
      support: 'Support',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      website: 'Website',
      more: 'More',
      less: 'Less',
      details: 'Details',
      amenities: 'Amenities',
      features: 'Features',
      photos: 'Photos',
      reviews: 'Reviews',
      rating: 'Rating',
      price: 'Price',
      from: 'From',
      to: 'to',
      dates: 'Dates',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      duration: 'Duration',
      nights: 'nights',
      night: 'night',
      currency: 'Currency',
      language: 'Language'
    },
    nav: {
      home: 'Home',
      hotels: 'Hotels',
      rooms: 'Rooms',
      bookings: 'Bookings',
      profile: 'Profile',
      settings: 'Settings'
    },
    home: {
      curatedCollection: 'Curated Collection',
      ourRetreats: 'Our Retreats',
      discoverDescription: 'Discover our handpicked selection of ultra-luxury properties across the globe, each offering a unique sanctuary for the discerning traveler.'
    },
    property: {
      notFound: 'Property Not Found',
      returnToHome: 'Return to Home',
      exploreRooms: 'Explore Our Rooms',
      roomsDescription: 'Discover our curated collection of luxury sanctuaries designed for comfort and elegance.',
      available: 'available',
      people: 'People',
      capacity: 'Capacity',
      noRoomsMatch: 'No rooms match your search',
      tryDifferentSearch: 'Try reducing the number of guests or exploring other dates for this property.',
      aboutRetreat: 'About this retreat',
      startingPrice: 'Starting price',
      checkRooms: 'Check Rooms'
    },
    locations: {
      globalPresence: 'Global Presence',
      ourDestinations: 'Our Destinations',
      exploreDescription: 'Explore our curated collection of extraordinary sanctuaries, organized by country and city for your convenience.',
      discoverCities: 'Discover {{count}} {{count, plural, one {city} other {cities}} in {{country}}',
      sanctuary: 'Sanctuary',
      sanctuaries: 'Sanctuaries'
    },
    roomsCompact: {
      adjustGuestsOrDates: 'Adjust guests or try different dates',
      soldOut: 'Sold Out',
      unavailable: 'Unavailable',
      bookNow: 'Book Now',
      stayInsightHighDemand: 'Stay Insight: High Demand',
      sleeps: 'Sleeps',
      premiumRoom: 'Premium Room',
      left: 'Left',
      fullyBooked: 'Fully Booked',
      chooseYourExperience: 'Choose Your Experience',
      explorePremiumRooms: 'Explore premium rooms and suites at {{hotelName}}',
      notAvailable: 'Not Available',
      tryDifferentDatesOrContact: 'Please try different dates or contact the hotel directly.',
      yourSelection: 'Your Selection',
      totalValue: 'Total Value',
      confirmReservation: 'Confirm Reservation',
      allRoomsCleared: 'All rooms cleared',
      clearAllSelections: 'Clear All Selections',
      basketEmpty: 'Your basket is empty. Select an experience to continue.'
    },
    search: {
      destination: 'Destination',
      checkInDate: 'Check-in Date',
      checkOutDate: 'Check-out Date',
      guests: 'Guests',
      searchHotels: 'Search Hotels',
      searchResults: 'Search Results',
      noResults: 'No results found',
      filters: 'Filters',
      priceRange: 'Price Range',
      starRating: 'Star Rating',
      amenities: 'Amenities',
      propertyType: 'Property Type',
      sortBy: 'Sort by',
      recommended: 'Recommended',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      rating: 'Rating',
      distance: 'Distance',
      allDestinations: 'All Destinations',
      exploreDestinations: 'Explore {{count}} destinations',
      clearFilters: 'Clear Filters'
    },
    hotel: {
      about: 'About',
      description: 'Description',
      policies: 'Policies',
      cancellationPolicy: 'Cancellation Policy',
      childPolicy: 'Child Policy',
      taxPolicy: 'Tax Policy',
      petPolicy: 'Pet Policy',
      checkInTime: 'Check-in Time',
      checkOutTime: 'Check-out Time',
      reception: 'Reception',
      facilities: 'Facilities',
      services: 'Services',
      location: 'Location',
      map: 'Map',
      directions: 'Directions',
      nearby: 'Nearby',
      attractions: 'Attractions',
      restaurants: 'Restaurants',
      shopping: 'Shopping',
      transportation: 'Transportation',
      airport: 'Airport',
      trainStation: 'Train Station',
      busStation: 'Bus Station',
      parking: 'Parking',
      wifi: 'WiFi',
      breakfast: 'Breakfast',
      pool: 'Pool',
      gym: 'Gym',
      spa: 'Spa',
      restaurant: 'Restaurant',
      bar: 'Bar',
      meetingRooms: 'Meeting Rooms',
      businessCenter: 'Business Center',
      petFriendly: 'Pet Friendly',
      familyFriendly: 'Family Friendly',
      accessible: 'Accessible'
    },
    room: {
      roomTypes: 'Room Types',
      roomDetails: 'Room Details',
      occupancy: 'Occupancy',
      bedType: 'Bed Type',
      roomSize: 'Room Size',
      view: 'View',
      balcony: 'Balcony',
      terrace: 'Terrace',
      kitchen: 'Kitchen',
      kitchenette: 'Kitchenette',
      livingArea: 'Living Area',
      workspace: 'Workspace',
      bathroom: 'Bathroom',
      shower: 'Shower',
      bathtub: 'Bathtub',
      airConditioning: 'Air Conditioning',
      heating: 'Heating',
      tv: 'TV',
      miniBar: 'Mini Bar',
      safe: 'Safe',
      coffee: 'Coffee',
      tea: 'Tea',
      iron: 'Iron',
      hairdryer: 'Hairdryer',
      toiletries: 'Toiletries',
      bathrobes: 'Bathrobes',
      slippers: 'Slippers'
    },
    booking: {
      yourSelection: 'Your Selection',
      personalInformation: 'Personal Information',
      firstName: 'First Name',
      lastName: 'Last Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      specialRequests: 'Special Requests',
      estimatedArrivalTime: 'Estimated Arrival Time',
      stayPeriod: 'Stay Period',
      totalValue: 'Total Value',
      processToPayment: 'Process to Payment',
      promoCode: 'Promo Code',
      havePromoCode: 'Do you have a promo code?',
      enterPromoCode: 'Enter promo code',
      apply: 'Apply',
      remove: 'Remove',
      promoApplied: 'Promo code applied successfully!',
      invalidPromoCode: 'Invalid promo code',
      pleaseEnterPromoCode: 'Please enter a promo code',
      consent: 'Consent',
      consentText: 'I give my Consent to receive news and information about special offers\n\nI give my Consent to personal data processing and confirm that I have read the Terms and policies and the Privacy policy',
      termsAndConditions: 'Terms and Conditions',
      privacyPolicy: 'Privacy Policy',
      agree: 'Agree',
      iAgree: 'I Agree',
      confirmReservation: 'Confirm Reservation',
      clearSelection: 'Clear All Selections',
      basketEmpty: 'Your basket is empty. Select an experience to continue.',
      selectExperience: 'Select an experience to continue',
      needHelpConcierge: 'Need Help?',
      conciergeAvailable: 'Our concierge is available 24/7 to assist with your journey',
      confirmYourJourney: 'Confirm Your Journey',
      almostThere: 'Almost there, your booking awaits',
      policiesAndTerms: 'Policies & Terms',
      cancellationPolicy: 'Cancellation Policy',
      childPolicy: 'Child Policy',
      taxPolicy: 'Tax Policy',
      room: 'Room',
      adultsAndChildren: '{{adults}} {{adultText}}, {{children}} {{childText}} • {{mealPlan}}',
      adult: 'Adult',
      adults: 'Adults',
      child: 'Child',
      children: 'Children'
    },
    payment: {
      paymentMethod: 'Payment Method',
      retrievingGateways: 'Retrieving secure payment gateways...',
      paymentSecure: 'Your payment information is encrypted and secure.',
      finalSummary: 'Final Summary',
      reviewReservation: 'Review your reservation before proceeding',
      paymentOption: 'Payment Option',
      fullPayment: 'Full Payment',
      pay50Now: 'Pay 50% Now',
      stayDuration: 'Stay Duration',
      subtotal: 'Subtotal',
      discount: 'Discount',
      amountPayableAtHotel: 'Amount Payable at Hotel',
      amountToPay50: 'Amount to Pay (50%)',
      totalInvestment: 'Total Investment',
      noImmediatePayment: 'No immediate payment required',
      remaining50Payable: 'Remaining 50% payable at hotel',
      allTaxesIncluded: 'All taxes included',
      processing: 'Processing...',
      pay50Confirm: 'Pay 50% & Confirm',
      confirmTentative: 'Confirm Tentative Booking',
      completeFullPayment: 'Complete Full Payment',
      secureSanctuaryPayment: 'Secure Sanctuary Payment',
      loadingSecureGateway: 'Loading Secure Gateway...',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      cvv: 'CVV',
      cardholderName: 'Cardholder Name',
      billingAddress: 'Billing Address',
      sameAsGuest: 'Same as Guest',
      differentAddress: 'Different Address',
      country: 'Country',
      state: 'State',
      city: 'City',
      postalCode: 'Postal Code',
      streetAddress: 'Street Address',
      apartment: 'Apartment',
      saveCard: 'Save Card',
      payNow: 'Pay Now',
      paymentSuccessful: 'Payment Successful',
      paymentFailed: 'Payment Failed',
      securePayment: 'Secure Payment',
      sslEncrypted: 'SSL Encrypted',
      acceptedCards: 'Accepted Cards'
    },
    confirmation: {
      bookingConfirmed: 'Booking Confirmed',
      confirmationNumber: 'Confirmation Number',
      bookingDetails: 'Booking Details',
      thankYou: 'Thank You',
      emailSent: 'Confirmation Email Sent',
      checkYourEmail: 'Please check your email for booking confirmation',
      modifyBooking: 'Modify Booking',
      cancelBooking: 'Cancel Booking',
      printConfirmation: 'Print Confirmation',
      downloadPdf: 'Download PDF',
      addToCalendar: 'Add to Calendar',
      shareBooking: 'Share Booking',
      rateYourStay: 'Rate Your Stay',
      leaveReview: 'Leave a Review',
      bookAgain: 'Book Again',
      exploreMore: 'Explore More Hotels'
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPhone: 'Please enter a valid phone number',
      minLength: 'Must be at least {{count}} characters',
      maxLength: 'Must be no more than {{count}} characters',
      invalidDate: 'Please enter a valid date',
      dateInPast: 'Date cannot be in the past',
      dateBeforeCheckIn: 'Check-out date must be after check-in date',
      invalidGuests: 'Please enter valid number of guests',
      maxOccupancy: 'Maximum occupancy exceeded',
      roomUnavailable: 'Room is no longer available',
      paymentFailed: 'Payment failed. Please try again.',
      networkError: 'Network error. Please check your connection.',
      serverError: 'Server error. Please try again later.',
      somethingWentWrong: 'Something went wrong',
      tryAgain: 'Please try again',
      contactSupport: 'Contact Support'
    },
    success: {
      bookingConfirmed: 'Booking confirmed successfully',
      paymentProcessed: 'Payment processed successfully',
      promoApplied: 'Promo code applied successfully',
      profileUpdated: 'Profile updated successfully',
      settingsSaved: 'Settings saved successfully',
      emailSent: 'Email sent successfully',
      messageSent: 'Message sent successfully',
      reviewSubmitted: 'Review submitted successfully'
    }
  },
  
  es: {
    header: {
      locations: 'Ubicaciones',
      specialOffers: 'Ofertas Especiales',
      aboutUs: 'Acerca de Nosotros',
      signIn: 'Iniciar Sesión'
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      close: 'Cerrar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      next: 'Siguiente',
      previous: 'Anterior',
      select: 'Seleccionar',
      selected: 'Seleccionado',
      total: 'Total',
      subtotal: 'Subtotal',
      taxes: 'Impuestos',
      taxesAndFees: 'Impuestos y Tarifas de Servicio',
      includingAllTaxes: 'Incluyendo todos los impuestos aplicables',
      perNight: '/ noche',
      adults: 'Adultos',
      adult: 'Adulto',
      children: 'Niños',
      child: 'Niño',
      guests: 'Huéspedes',
      rooms: 'Habitaciones',
      room: 'Habitación',
      available: 'Disponible',
      left: 'disponible',
      bookNow: 'Reservar Ahora',
      reserve: 'Reservar',
      reservation: 'Reserva',
      booking: 'Reserva',
      checkout: 'Finalizar Compra',
      payment: 'Pago',
      contact: 'Contacto',
      needHelp: '¿Necesita Ayuda?',
      support: 'Soporte',
      phone: 'Teléfono',
      email: 'Correo Electrónico',
      address: 'Dirección',
      website: 'Sitio Web',
      more: 'Más',
      less: 'Menos',
      details: 'Detalles',
      amenities: 'Comodidades',
      features: 'Características',
      photos: 'Fotos',
      reviews: 'Reseñas',
      rating: 'Calificación',
      price: 'Precio',
      from: 'Desde',
      to: 'hasta',
      dates: 'Fechas',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      duration: 'Duración',
      nights: 'noches',
      night: 'noche',
      currency: 'Moneda',
      language: 'Idioma'
    },
    nav: {
      home: 'Inicio',
      hotels: 'Hoteles',
      rooms: 'Habitaciones',
      bookings: 'Reservas',
      profile: 'Perfil',
      settings: 'Configuración'
    },
    home: {
      curatedCollection: 'Colección Curada',
      ourRetreats: 'Nuestros Retiros',
      discoverDescription: 'Descubra nuestra selección de propiedades de ultra lujo en todo el mundo, cada una ofrece un santuario único para el viajero exigente.'
    },
    property: {
      notFound: 'Propiedad No Encontrada',
      returnToHome: 'Volver al Inicio',
      exploreRooms: 'Explore Nuestras Habitaciones',
      roomsDescription: 'Descubra nuestra colección curada de santuarios de lujo diseñados para comodidad y elegancia.',
      available: 'disponibles',
      people: 'Personas',
      capacity: 'Capacidad',
      noRoomsMatch: 'No hay habitaciones que coincidan con su búsqueda',
      tryDifferentSearch: 'Intente reducir el número de huéspedes o explorar otras fechas para esta propiedad.',
      aboutRetreat: 'Acerca de este retiro',
      startingPrice: 'Precio inicial',
      checkRooms: 'Ver Habitaciones'
    },
    locations: {
      globalPresence: 'Presencia Global',
      ourDestinations: 'Nuestros Destinos',
      exploreDescription: 'Explore nuestra colección curada de santuarios extraordinarios, organizados por país y ciudad para su conveniencia.',
      discoverCities: 'Descubra {{count}} {{count, plural, one {ciudad} other {ciudades}} en {{country}}',
      sanctuary: 'Santuario',
      sanctuaries: 'Santuarios'
    },
    roomsCompact: {
      adjustGuestsOrDates: 'Ajuste los huéspedes o pruebe fechas diferentes',
      soldOut: 'Agotado',
      unavailable: 'No Disponible',
      bookNow: 'Reservar Ahora',
      stayInsightHighDemand: 'Perspectiva de Estancia: Alta Demanda',
      sleeps: 'Aloja',
      premiumRoom: 'Habitación Premium',
      left: 'Disponibles',
      fullyBooked: 'Completamente Ocupado',
      chooseYourExperience: 'Elija Su Experiencia',
      explorePremiumRooms: 'Explore habitaciones y suites premium en {{hotelName}}',
      notAvailable: 'No Disponible',
      tryDifferentDatesOrContact: 'Por favor intente fechas diferentes o contacte directamente con el hotel.',
      yourSelection: 'Su Selección',
      totalValue: 'Valor Total',
      confirmReservation: 'Confirmar Reserva',
      allRoomsCleared: 'Todas las habitaciones eliminadas',
      clearAllSelections: 'Eliminar Todas las Selecciones',
      basketEmpty: 'Su cesta está vacía. Seleccione una experiencia para continuar.'
    },
    search: {
      destination: 'Destino',
      checkInDate: 'Fecha de Check-in',
      checkOutDate: 'Fecha de Check-out',
      guests: 'Huéspedes',
      searchHotels: 'Buscar Hoteles',
      searchResults: 'Resultados de Búsqueda',
      noResults: 'No se encontraron resultados',
      filters: 'Filtros',
      priceRange: 'Rango de Precios',
      starRating: 'Clasificación por Estrellas',
      amenities: 'Comodidades',
      propertyType: 'Tipo de Propiedad',
      sortBy: 'Ordenar por',
      recommended: 'Recomendado',
      priceLowToHigh: 'Precio: Menor a Mayor',
      priceHighToLow: 'Precio: Mayor a Menor',
      rating: 'Calificación',
      distance: 'Distancia',
      allDestinations: 'Todos los Destinos',
      exploreDestinations: 'Explorar {{count}} destinos',
      clearFilters: 'Limpiar Filtros'
    },
    hotel: {
      about: 'Acerca de',
      description: 'Descripción',
      policies: 'Políticas',
      cancellationPolicy: 'Política de Cancelación',
      childPolicy: 'Política de Niños',
      taxPolicy: 'Política de Impuestos',
      petPolicy: 'Política de Mascotas',
      checkInTime: 'Hora de Check-in',
      checkOutTime: 'Hora de Check-out',
      reception: 'Recepción',
      facilities: 'Instalaciones',
      services: 'Servicios',
      location: 'Ubicación',
      map: 'Mapa',
      directions: 'Direcciones',
      nearby: 'Cerca',
      attractions: 'Atracciones',
      restaurants: 'Restaurantes',
      shopping: 'Compras',
      transportation: 'Transporte',
      airport: 'Aeropuerto',
      trainStation: 'Estación de Tren',
      busStation: 'Estación de Autobús',
      parking: 'Estacionamiento',
      wifi: 'WiFi',
      breakfast: 'Desayuno',
      pool: 'Piscina',
      gym: 'Gimnasio',
      spa: 'Spa',
      restaurant: 'Restaurante',
      bar: 'Bar',
      meetingRooms: 'Salas de Reunión',
      businessCenter: 'Centro de Negocios',
      petFriendly: 'Admite Mascotas',
      familyFriendly: 'Familiar',
      accessible: 'Accesible'
    },
    room: {
      roomTypes: 'Tipos de Habitación',
      roomDetails: 'Detalles de la Habitación',
      occupancy: 'Ocupación',
      bedType: 'Tipo de Cama',
      roomSize: 'Tamaño de Habitación',
      view: 'Vista',
      balcony: 'Balcón',
      terrace: 'Terraza',
      kitchen: 'Cocina',
      kitchenette: 'Cocineta',
      livingArea: 'Sala de Estar',
      workspace: 'Espacio de Trabajo',
      bathroom: 'Baño',
      shower: 'Ducha',
      bathtub: 'Bañera',
      airConditioning: 'Aire Acondicionado',
      heating: 'Calefacción',
      tv: 'TV',
      miniBar: 'Mini Bar',
      safe: 'Caja Fuerte',
      coffee: 'Café',
      tea: 'Té',
      iron: 'Plancha',
      hairdryer: 'Secador de Cabello',
      toiletries: 'Artículos de Aseo',
      bathrobes: 'Batas',
      slippers: 'Pantuflas'
    },
    booking: {
      yourSelection: 'Tu Selección',
      personalInformation: 'Información Personal',
      firstName: 'Nombre',
      lastName: 'Apellido',
      emailAddress: 'Correo Electrónico',
      phoneNumber: 'Número de Teléfono',
      specialRequests: 'Solicitudes Especiales',
      estimatedArrivalTime: 'Hora de Llegada Estimada',
      stayPeriod: 'Período de Estancia',
      totalValue: 'Valor Total',
      processToPayment: 'Procesar Pago',
      promoCode: 'Código Promocional',
      havePromoCode: '¿Tienes un código promocional?',
      enterPromoCode: 'Ingresa el código promocional',
      apply: 'Aplicar',
      remove: 'Eliminar',
      promoApplied: '¡Código promocional aplicado con éxito!',
      invalidPromoCode: 'Código promocional inválido',
      pleaseEnterPromoCode: 'Por favor ingresa un código promocional',
      consent: 'Consentimiento',
      consentText: 'Doy mi consentimiento para recibir noticias e información sobre ofertas especiales\n\nDoy mi consentimiento para el procesamiento de datos personales y confirmo que he leído los Términos y políticas y la Política de privacidad',
      termsAndConditions: 'Términos y Condiciones',
      privacyPolicy: 'Política de Privacidad',
      agree: 'Aceptar',
      iAgree: 'Acepto',
      confirmReservation: 'Confirmar Reserva',
      clearSelection: 'Limpiar Todas las Selecciones',
      basketEmpty: 'Tu canasta está vacía. Selecciona una experiencia para continuar.',
      selectExperience: 'Selecciona una experiencia para continuar',
      needHelpConcierge: '¿Necesitas Ayuda?',
      conciergeAvailable: 'Nuestro conserje está disponible 24/7 para asistirte en tu viaje',
      confirmYourJourney: 'Confirma tu Viaje',
      almostThere: 'Casi ahí, tu reserva te espera',
      policiesAndTerms: 'Políticas y Términos',
      cancellationPolicy: 'Política de Cancelación',
      childPolicy: 'Política de Niños',
      taxPolicy: 'Política de Impuestos',
      room: 'Habitación',
      adultsAndChildren: '{{adults}} {{adultText}}, {{children}} {{childText}} • {{mealPlan}}',
      adult: 'Adulto',
      adults: 'Adultos',
      child: 'Niño',
      children: 'Niños'
    },
    payment: {
      paymentMethod: 'Método de Pago',
      retrievingGateways: 'Recuperando pasarelas de pago seguras...',
      paymentSecure: 'Su información de pago está encriptada y segura.',
      finalSummary: 'Resumen Final',
      reviewReservation: 'Revise su reserva antes de continuar',
      paymentOption: 'Opción de Pago',
      fullPayment: 'Pago Completo',
      pay50Now: 'Pagar 50% Ahora',
      stayDuration: 'Duración de la Estancia',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      amountPayableAtHotel: 'Cantidad Pagable en el Hotel',
      amountToPay50: 'Cantidad a Pagar (50%)',
      totalInvestment: 'Inversión Total',
      noImmediatePayment: 'No se requiere pago inmediato',
      remaining50Payable: '50% restante pagadero en el hotel',
      allTaxesIncluded: 'Todos los impuestos incluidos',
      processing: 'Procesando...',
      pay50Confirm: 'Pagar 50% y Confirmar',
      confirmTentative: 'Confirmar Reserva Tentativa',
      completeFullPayment: 'Completar Pago Completo',
      secureSanctuaryPayment: 'Pago Seguro de Santuario',
      loadingSecureGateway: 'Cargando Pasarela Segura...',
      cardNumber: 'Número de Tarjeta',
      expiryDate: 'Fecha de Vencimiento',
      cvv: 'CVV',
      cardholderName: 'Nombre del Titular',
      billingAddress: 'Dirección de Facturación',
      sameAsGuest: 'Igual que el Huésped',
      differentAddress: 'Dirección Diferente',
      country: 'País',
      state: 'Estado',
      city: 'Ciudad',
      postalCode: 'Código Postal',
      streetAddress: 'Dirección de la Calle',
      apartment: 'Apartamento',
      saveCard: 'Guardar Tarjeta',
      payNow: 'Pagar Ahora',
      paymentSuccessful: 'Pago Exitoso',
      paymentFailed: 'Pago Fallido',
      securePayment: 'Pago Seguro',
      sslEncrypted: 'Encriptado SSL',
      acceptedCards: 'Tarjetas Aceptadas'
    },
    confirmation: {
      bookingConfirmed: 'Reserva Confirmada',
      confirmationNumber: 'Número de Confirmación',
      bookingDetails: 'Detalles de la Reserva',
      thankYou: 'Gracias',
      emailSent: 'Correo de Confirmación Enviado',
      checkYourEmail: 'Por favor revisa tu correo para la confirmación de la reserva',
      modifyBooking: 'Modificar Reserva',
      cancelBooking: 'Cancelar Reserva',
      printConfirmation: 'Imprimir Confirmación',
      downloadPdf: 'Descargar PDF',
      addToCalendar: 'Agregar al Calendario',
      shareBooking: 'Compartir Reserva',
      rateYourStay: 'Califica tu Estancia',
      leaveReview: 'Dejar una Reseña',
      bookAgain: 'Reservar de Nuevo',
      exploreMore: 'Explorar Más Hoteles'
    },
    errors: {
      required: 'Este campo es requerido',
      invalidEmail: 'Por favor ingresa un correo electrónico válido',
      invalidPhone: 'Por favor ingresa un número de teléfono válido',
      minLength: 'Debe tener al menos {{count}} caracteres',
      maxLength: 'No debe tener más de {{count}} caracteres',
      invalidDate: 'Por favor ingresa una fecha válida',
      dateInPast: 'La fecha no puede estar en el pasado',
      dateBeforeCheckIn: 'La fecha de check-out debe ser posterior al check-in',
      invalidGuests: 'Por favor ingresa un número válido de huéspedes',
      maxOccupancy: 'Capacidad máxima excedida',
      roomUnavailable: 'La habitación ya no está disponible',
      paymentFailed: 'El pago falló. Por favor intenta de nuevo.',
      networkError: 'Error de red. Por favor verifica tu conexión.',
      serverError: 'Error del servidor. Por favor intenta más tarde.',
      somethingWentWrong: 'Algo salió mal',
      tryAgain: 'Por favor intenta de nuevo',
      contactSupport: 'Contactar Soporte'
    },
    success: {
      bookingConfirmed: 'Reserva confirmada exitosamente',
      paymentProcessed: 'Pago procesado exitosamente',
      promoApplied: 'Código promocional aplicado exitosamente',
      profileUpdated: 'Perfil actualizado exitosamente',
      settingsSaved: 'Configuración guardada exitosamente',
      emailSent: 'Correo enviado exitosamente',
      messageSent: 'Mensaje enviado exitosamente',
      reviewSubmitted: 'Reseña enviada exitosamente'
    }
  },
  
  fr: {
    header: {
      locations: 'Destinations',
      specialOffers: 'Offres Spéciales',
      aboutUs: 'À Propos',
      signIn: 'Se Connecter'
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Sauvegarder',
      edit: 'Modifier',
      delete: 'Supprimer',
      close: 'Fermer',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      next: 'Suivant',
      previous: 'Précédent',
      select: 'Sélectionner',
      selected: 'Sélectionné',
      total: 'Total',
      subtotal: 'Sous-total',
      taxes: 'Taxes',
      taxesAndFees: 'Taxes et Frais de Service',
      includingAllTaxes: 'Incluant toutes les taxes applicables',
      perNight: '/ nuit',
      adults: 'Adultes',
      adult: 'Adulte',
      children: 'Enfants',
      child: 'Enfant',
      guests: 'Invités',
      rooms: 'Chambres',
      room: 'Chambre',
      available: 'Disponible',
      left: 'restant',
      bookNow: 'Réserver Maintenant',
      reserve: 'Réserver',
      reservation: 'Réservation',
      booking: 'Réservation',
      checkout: 'Finaliser la Commande',
      payment: 'Paiement',
      contact: 'Contact',
      needHelp: 'Besoin d\'aide?',
      support: 'Support',
      phone: 'Téléphone',
      email: 'Email',
      address: 'Adresse',
      website: 'Site Web',
      more: 'Plus',
      less: 'Moins',
      details: 'Détails',
      amenities: 'Équipements',
      features: 'Caractéristiques',
      photos: 'Photos',
      reviews: 'Avis',
      rating: 'Note',
      price: 'Prix',
      from: 'De',
      to: 'à',
      dates: 'Dates',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      duration: 'Durée',
      nights: 'nuits',
      night: 'nuit',
      currency: 'Devise',
      language: 'Langue'
    },
    nav: {
      home: 'Accueil',
      hotels: 'Hôtels',
      rooms: 'Chambres',
      bookings: 'Réservations',
      profile: 'Profil',
      settings: 'Paramètres'
    },
    home: {
      curatedCollection: 'Collection Sélectionnée',
      ourRetreats: 'Nos Retraites',
      discoverDescription: 'Découvrez notre sélection de propriétés de luxe dans le monde entier, chacune offrant un sanctuaire unique pour le voyageur exigeant.'
    },
    property: {
      notFound: 'Propriété Non Trouvée',
      returnToHome: 'Retour à l\'Accueil',
      exploreRooms: 'Explorez Nos Chambres',
      roomsDescription: 'Découvrez notre collection sélectionnée de sanctuaires de luxe conçus pour le confort et l\'élégance.',
      available: 'disponibles',
      people: 'Personnes',
      capacity: 'Capacité',
      noRoomsMatch: 'Aucune chambre ne correspond à votre recherche',
      tryDifferentSearch: 'Essayez de réduire le nombre d\'invités ou d\'explorer d\'autres dates pour cette propriété.',
      aboutRetreat: 'À propos de ce retraite',
      startingPrice: 'Prix de départ',
      checkRooms: 'Voir les Chambres'
    },
    locations: {
      globalPresence: 'Présence Mondiale',
      ourDestinations: 'Nos Destinations',
      exploreDescription: 'Explorez notre collection sélectionnée de sanctuaires extraordinaires, organisés par pays et ville pour votre commodité.',
      discoverCities: 'Découvrez {{count}} {{count, plural, one {ville} other {villes}} dans {{country}}',
      sanctuary: 'Sanctuaire',
      sanctuaries: 'Sanctuaires'
    },
    roomsCompact: {
      adjustGuestsOrDates: 'Ajustez les invités ou essayez des dates différentes',
      soldOut: 'Épuisé',
      unavailable: 'Indisponible',
      bookNow: 'Réserver Maintenant',
      stayInsightHighDemand: 'Perspective de Séjour: Forte Demande',
      sleeps: 'Accueille',
      premiumRoom: 'Chambre Premium',
      left: 'Disponibles',
      fullyBooked: 'Entièrement Réservé',
      chooseYourExperience: 'Choisissez Votre Expérience',
      explorePremiumRooms: 'Explorez les chambres et suites premium à {{hotelName}}',
      notAvailable: 'Indisponible',
      tryDifferentDatesOrContact: 'Veuillez essayer des dates différentes ou contacter directement l\'hôtel.',
      yourSelection: 'Votre Sélection',
      totalValue: 'Valeur Totale',
      confirmReservation: 'Confirmer la Réservation',
      allRoomsCleared: 'Toutes les chambres supprimées',
      clearAllSelections: 'Supprimer Toutes les Sélections',
      basketEmpty: 'Votre panier est vide. Sélectionnez une expérience pour continuer.'
    },
    search: {
      destination: 'Destination',
      checkInDate: 'Date de Check-in',
      checkOutDate: 'Date de Check-out',
      guests: 'Invités',
      searchHotels: 'Rechercher des Hôtels',
      searchResults: 'Résultats de Recherche',
      noResults: 'Aucun résultat trouvé',
      filters: 'Filtres',
      priceRange: 'Gamme de Prix',
      starRating: 'Classement par Étoiles',
      amenities: 'Équipements',
      propertyType: 'Type de Propriété',
      sortBy: 'Trier par',
      recommended: 'Recommandé',
      priceLowToHigh: 'Prix: Croissant',
      priceHighToLow: 'Prix: Décroissant',
      rating: 'Évaluation',
      distance: 'Distance',
      allDestinations: 'Toutes les Destinations',
      exploreDestinations: 'Explorer {{count}} destinations',
      clearFilters: 'Effacer les Filtres'
    },
    hotel: {
      about: 'À Propos',
      description: 'Description',
      policies: 'Politiques',
      cancellationPolicy: 'Politique d\'Annulation',
      childPolicy: 'Politique Enfants',
      taxPolicy: 'Politique Fiscale',
      petPolicy: 'Politique Animaux',
      checkInTime: 'Heure de Check-in',
      checkOutTime: 'Heure de Check-out',
      reception: 'Réception',
      facilities: 'Installations',
      services: 'Services',
      location: 'Emplacement',
      map: 'Carte',
      directions: 'Directions',
      nearby: 'À Proximité',
      attractions: 'Attractions',
      restaurants: 'Restaurants',
      shopping: 'Shopping',
      transportation: 'Transport',
      airport: 'Aéroport',
      trainStation: 'Gare',
      busStation: 'Station de Bus',
      parking: 'Parking',
      wifi: 'WiFi',
      breakfast: 'Petit-déjeuner',
      pool: 'Piscine',
      gym: 'Salle de Sport',
      spa: 'Spa',
      restaurant: 'Restaurant',
      bar: 'Bar',
      meetingRooms: 'Salles de Réunion',
      businessCenter: 'Centre d\'Affaires',
      petFriendly: 'Animaux Acceptés',
      familyFriendly: 'Familial',
      accessible: 'Accessible'
    },
    room: {
      roomTypes: 'Types de Chambre',
      roomDetails: 'Détails de la Chambre',
      occupancy: 'Occupation',
      bedType: 'Type de Lit',
      roomSize: 'Taille de la Chambre',
      view: 'Vue',
      balcony: 'Balcon',
      terrace: 'Terrasse',
      kitchen: 'Cuisine',
      kitchenette: 'Kitchenette',
      livingArea: 'Séjour',
      workspace: 'Espace de Travail',
      bathroom: 'Salle de Bain',
      shower: 'Douche',
      bathtub: 'Baignoire',
      airConditioning: 'Climatisation',
      heating: 'Chauffage',
      tv: 'TV',
      miniBar: 'Mini Bar',
      safe: 'Coffre-fort',
      coffee: 'Café',
      tea: 'Thé',
      iron: 'Fer à Repasser',
      hairdryer: 'Sèche-cheveux',
      toiletries: 'Produits de Toilette',
      bathrobes: 'Peignoirs',
      slippers: 'Chaussons'
    },
    booking: {
      yourSelection: 'Votre Sélection',
      personalInformation: 'Informations Personnelles',
      firstName: 'Prénom',
      lastName: 'Nom',
      emailAddress: 'Adresse Email',
      phoneNumber: 'Numéro de Téléphone',
      specialRequests: 'Demandes Spéciales',
      estimatedArrivalTime: 'Heure d\'Arrivée Estimée',
      stayPeriod: 'Période de Séjour',
      totalValue: 'Valeur Totale',
      processToPayment: 'Procéder au Paiement',
      promoCode: 'Code Promo',
      havePromoCode: 'Avez-vous un code promo?',
      enterPromoCode: 'Entrez le code promo',
      apply: 'Appliquer',
      remove: 'Supprimer',
      promoApplied: 'Code promo appliqué avec succès!',
      invalidPromoCode: 'Code promo invalide',
      pleaseEnterPromoCode: 'Veuillez entrer un code promo',
      consent: 'Consentement',
      consentText: 'Je consens à recevoir des nouvelles et des informations sur les offres spéciales\n\nJe consens au traitement des données personnelles et confirme avoir lu les Termes et politiques et la Politique de confidentialité',
      termsAndConditions: 'Termes et Conditions',
      privacyPolicy: 'Politique de Confidentialité',
      agree: 'Accepter',
      iAgree: 'J\'accepte',
      confirmReservation: 'Confirmer la Réservation',
      clearSelection: 'Effacer Toutes les Sélections',
      basketEmpty: 'Votre panier est vide. Sélectionnez une expérience pour continuer.',
      selectExperience: 'Sélectionnez une expérience pour continuer',
      needHelpConcierge: 'Besoin d\'aide?',
      conciergeAvailable: 'Notre concierge est disponible 24/7 pour vous assister dans votre voyage',
      confirmYourJourney: 'Confirmez votre Voyage',
      almostThere: 'Bientôt là, votre réservation vous attend',
      policiesAndTerms: 'Politiques et Termes',
      cancellationPolicy: 'Politique d\'Annulation',
      childPolicy: 'Politique Enfants',
      taxPolicy: 'Politique Fiscale',
      room: 'Chambre',
      adultsAndChildren: '{{adults}} {{adultText}}, {{children}} {{childText}} • {{mealPlan}}',
      adult: 'Adulte',
      adults: 'Adultes',
      child: 'Enfant',
      children: 'Enfants'
    },
    payment: {
      paymentMethod: 'Méthode de Paiement',
      retrievingGateways: 'Récupération des passerelles de paiement sécurisées...',
      paymentSecure: 'Vos informations de paiement sont cryptées et sécurisées.',
      finalSummary: 'Résumé Final',
      reviewReservation: 'Revoyez votre réservation avant de continuer',
      paymentOption: 'Option de Paiement',
      fullPayment: 'Paiement Complet',
      pay50Now: 'Payer 50% Maintenant',
      stayDuration: 'Durée du Séjour',
      subtotal: 'Sous-total',
      discount: 'Remise',
      amountPayableAtHotel: 'Montant Payable à l\'Hôtel',
      amountToPay50: 'Montant à Payer (50%)',
      totalInvestment: 'Investissement Total',
      noImmediatePayment: 'Aucun paiement immédiat requis',
      remaining50Payable: '50% restant payable à l\'hôtel',
      allTaxesIncluded: 'Tous taxes comprises',
      processing: 'Traitement...',
      pay50Confirm: 'Payer 50% et Confirmer',
      confirmTentative: 'Confirmer Réservation Tentative',
      completeFullPayment: 'Compléter Paiement Complet',
      secureSanctuaryPayment: 'Paiement Sécurisé du Sanctuaire',
      loadingSecureGateway: 'Chargement Passerelle Sécurisée...',
      cardNumber: 'Numéro de Carte',
      expiryDate: 'Date d\'Expiration',
      cvv: 'CVV',
      cardholderName: 'Nom du Titulaire',
      billingAddress: 'Adresse de Facturation',
      sameAsGuest: 'Identique à l\'Invité',
      differentAddress: 'Adresse Différente',
      country: 'Pays',
      state: 'État',
      city: 'Ville',
      postalCode: 'Code Postal',
      streetAddress: 'Adresse de la Rue',
      apartment: 'Appartement',
      saveCard: 'Sauvegarder la Carte',
      payNow: 'Payer Maintenant',
      paymentSuccessful: 'Paiement Réussi',
      paymentFailed: 'Paiement Échoué',
      securePayment: 'Paiement Sécurisé',
      sslEncrypted: 'Crypté SSL',
      acceptedCards: 'Cartes Acceptées'
    },
    confirmation: {
      bookingConfirmed: 'Réservation Confirmée',
      confirmationNumber: 'Numéro de Confirmation',
      bookingDetails: 'Détails de la Réservation',
      thankYou: 'Merci',
      emailSent: 'Email de Confirmation Envoyé',
      checkYourEmail: 'Veuillez vérifier votre email pour la confirmation de réservation',
      modifyBooking: 'Modifier la Réservation',
      cancelBooking: 'Annuler la Réservation',
      printConfirmation: 'Imprimer la Confirmation',
      downloadPdf: 'Télécharger PDF',
      addToCalendar: 'Ajouter au Calendrier',
      shareBooking: 'Partager la Réservation',
      rateYourStay: 'Évaluer votre Séjour',
      leaveReview: 'Laisser un Avis',
      bookAgain: 'Réserver à Nouveau',
      exploreMore: 'Explorer Plus d\'Hôtels'
    },
    errors: {
      required: 'Ce champ est requis',
      invalidEmail: 'Veuillez entrer une adresse email valide',
      invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
      minLength: 'Doit contenir au moins {{count}} caractères',
      maxLength: 'Ne doit pas contenir plus de {{count}} caractères',
      invalidDate: 'Veuillez entrer une date valide',
      dateInPast: 'La date ne peut pas être dans le passé',
      dateBeforeCheckIn: 'La date de check-out doit être postérieure au check-in',
      invalidGuests: 'Veuillez entrer un nombre valide d\'invités',
      maxOccupancy: 'Capacité maximale dépassée',
      roomUnavailable: 'La chambre n\'est plus disponible',
      paymentFailed: 'Le paiement a échoué. Veuillez réessayer.',
      networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
      serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
      somethingWentWrong: 'Quelque chose s\'est mal passé',
      tryAgain: 'Veuillez réessayer',
      contactSupport: 'Contacter le Support'
    },
    success: {
      bookingConfirmed: 'Réservation confirmée avec succès',
      paymentProcessed: 'Paiement traité avec succès',
      promoApplied: 'Code promo appliqué avec succès',
      profileUpdated: 'Profil mis à jour avec succès',
      settingsSaved: 'Paramètres sauvegardés avec succès',
      emailSent: 'Email envoyé avec succès',
      messageSent: 'Message envoyé avec succès',
      reviewSubmitted: 'Avis envoyé avec succès'
    }
  }
};

// Add more languages as needed...
export const useTranslation = (language: string) => {
  const t = translations[language] || translations.en;
  
  return {
    t: (key: string, params?: Record<string, any>) => {
      const keys = key.split('.');
      let value: any = t;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      let result = value || key;
      
      // Handle parameter substitution
      if (params && typeof result === 'string') {
        Object.entries(params).forEach(([param, val]) => {
          result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
        });
      }
      
      return result;
    },
    language,
    availableLanguages: Object.keys(translations)
  };
};
