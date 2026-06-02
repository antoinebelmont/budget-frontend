import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { LoginForm as LoginFormType } from '../../types/apiTypes';
import toast from 'react-hot-toast';

const schema: yup.ObjectSchema<LoginFormType> = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
    remember: yup.boolean().optional(),
}).required();

const LoginForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const onSubmit = async (data: LoginFormType) => {
        try {
            await dispatch(loginUser(data)).unwrap();
            toast.success('Login successful!');
            navigate('/budget');
        } catch (err) {
            // Error handled by slice
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-[var(--text-primary)]">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        Or{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="bg-danger-50 dark:bg-red-900/20 border border-danger-200 dark:border-red-800 text-danger-700 dark:text-red-400 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">
                                Email address
                            </label>
                            <input {...register('email')} type="email" className="input mt-1" placeholder="you@example.com" />
                            {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">
                                Password
                            </label>
                            <input {...register('password')} type="password" className="input mt-1" placeholder="••••••••" />
                            {errors.password && <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input {...register('remember')} type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-600 rounded" />
                                <label className="ml-2 block text-sm text-gray-900 dark:text-[var(--text-primary)]">Remember me</label>
                            </div>
                            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;