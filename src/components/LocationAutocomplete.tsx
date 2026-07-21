'use client';

import React, { useRef, useEffect, useState } from 'react';

// Google Maps type declaration
declare global {
  interface Window {
    google?: any;
  }
}

interface LocationAutocompleteProps {
  onAddressSelect: (address: {
    street: string;
    subpremise: string;
    premise: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    formatted: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onAddressSelect,
  placeholder = 'Search for an address...',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!document.querySelector('#google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => setLoaded(true);
      document.head.appendChild(script);
    } else if (window.google?.maps?.places) {
      setLoaded(true);
    } else {
      // Wait for existing script to load
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          setLoaded(true);
          clearInterval(check);
        }
      }, 500);
      return () => clearInterval(check);
    }
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ZA' },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      let streetNumber = '';
      let route = '';
      let subpremise = '';
      let premise = '';
      let suburb = '';
      let city = '';
      let province = '';
      let postalCode = '';

      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('subpremise')) subpremise = component.long_name;
        if (types.includes('premise')) premise = component.long_name;
        if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
          suburb = component.long_name;
        }
        if (types.includes('locality') || types.includes('sublocality') || types.includes('postal_town')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) province = component.long_name;
        if (types.includes('postal_code')) postalCode = component.long_name;
      }

      let street = [streetNumber, route].filter(Boolean).join(' ') || route;

      // Build a formatted address that includes complex/building info
      const extraLines = [premise, subpremise].filter(Boolean);
      const fullFormatted = extraLines.length > 0
        ? [street, ...extraLines, suburb, city, province, postalCode].filter(Boolean).join(', ')
        : place.formatted_address || '';

      setInputValue(fullFormatted);
      onAddressSelect({
        street,
        subpremise,
        premise,
        suburb,
        city,
        province,
        postalCode,
        formatted: fullFormatted || place.formatted_address || '',
      });
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [loaded, onAddressSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none ${className}`}
    />
  );
};

export default LocationAutocomplete;