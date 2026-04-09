'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProperties } from '@/store/slices/propertySlice';

export default function DataInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { initialized, loading } = useAppSelector((state) => state.property);

    useEffect(() => {
        if (!initialized && !loading) {
            dispatch(fetchProperties());
        }
    }, [dispatch, initialized, loading]);

    return <>{children}</>;
}
