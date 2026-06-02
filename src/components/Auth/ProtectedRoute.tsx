import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchUserPreferences } from '../../store/slices/authSlice';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { isAuthenticated, preferences } = useAppSelector((state) => state.auth);
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated && !preferences) {
            dispatch(fetchUserPreferences());
        }
    }, [isAuthenticated, preferences, dispatch]);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;