import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchPromoCodes,
  validatePromoCode,
  clearPromoCode,
  clearValidationError,
  setAppliedPromoCode,
  selectPromoCodes,
  selectCurrentPromoCode,
  selectPromoCodeLoading,
  selectPromoCodeError,
  selectPromoCodeValidationError,
  selectPromoCodeIsValidating,
  selectAppliedPromoCode,
  PromoCode,
} from '@/store/slices/promoCodeSlice';
import { AppDispatch } from '@/store/store';

export const usePromoCode = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const promoCodes = useSelector(selectPromoCodes);
  const currentPromoCode = useSelector(selectCurrentPromoCode);
  const loading = useSelector(selectPromoCodeLoading);
  const error = useSelector(selectPromoCodeError);
  const validationError = useSelector(selectPromoCodeValidationError);
  const isValidating = useSelector(selectPromoCodeIsValidating);
  const appliedPromoCode = useSelector(selectAppliedPromoCode);

  // Actions
  const fetchPromos = useCallback((params?: {
    hotelCode?: string;
    isActive?: boolean;
    isShowOnIBE?: boolean;
    fromDate?: string;
    toDate?: string;
    promoCode?: string;
  }) => {
    return dispatch(fetchPromoCodes(params || {}));
  }, [dispatch]);

  const validatePromo = useCallback((promoCode: string, hotelCode?: string) => {
    return dispatch(validatePromoCode({ promoCode, hotelCode }));
  }, [dispatch]);

  const clearCurrentPromo = useCallback(() => {
    dispatch(clearPromoCode());
  }, [dispatch]);

  const clearValidationErr = useCallback(() => {
    dispatch(clearValidationError());
  }, [dispatch]);

  const setApplied = useCallback((promoCode: string) => {
    dispatch(setAppliedPromoCode(promoCode));
  }, [dispatch]);

  // Computed values
  const hasValidPromo = !!currentPromoCode && !validationError;
  const promoDiscount = currentPromoCode?.value || 0;
  const promoDescription = currentPromoCode?.description || '';

  return {
    // State
    promoCodes,
    currentPromoCode,
    loading,
    error,
    validationError,
    isValidating,
    appliedPromoCode,
    
    // Computed
    hasValidPromo,
    promoDiscount,
    promoDescription,
    
    // Actions
    fetchPromos,
    validatePromo,
    clearCurrentPromo,
    clearValidationErr,
    setApplied,
  };
};

export type { PromoCode };
