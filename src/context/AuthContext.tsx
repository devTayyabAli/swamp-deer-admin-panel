
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { loginUser, adminLoginUser, registerUser, logout as logoutAction } from '../store/slices/authSlice';
import type { LoginCredentials, RegisterCredentials } from '../types';

// Backward compatibility hook wrapper
export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

    const login = async (credentials: LoginCredentials) => {
        await dispatch(loginUser(credentials)).unwrap();
    };

    const adminLogin = async (credentials: LoginCredentials) => {
        await dispatch(adminLoginUser(credentials)).unwrap();
    };

    const register = async (credentials: RegisterCredentials) => {
        await dispatch(registerUser(credentials)).unwrap();
    };

    const logout = () => {
        dispatch(logoutAction());
        // Simple redirect handling if needed, though usually handled by component state or router
        window.location.href = '/';
    };

    return { user, isLoading, error, login, adminLogin, register, logout };
};
