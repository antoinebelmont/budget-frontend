// src/components/Auth/RegisterForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerUser } from '../../store/slices/authSlice';
import { RegisterForm as RegisterFormType } from '../../types/api';
import toast from 'react-hot-toast';

const schema = yup.object({
    first_name: yup.string().required('First name is required'),
    last_name: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    password_confirmation: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Password confirmation is required'),
});

const RegisterForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error } = useAppSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormType>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: RegisterFormType) => {
        try {
            await dispatch(registerUser(data)).unwrap();
            toast.success('Registration successful!');
            navigate('/budget');
        } catch (err) {
            // Error handled by slice
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-[var(--text-primary)]">Create your account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        Or{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            sign in to existing account
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">First name</label>
                                <input {...register('first_name')} className="input mt-1" />
                                {errors.first_name && <p className="mt-1 text-sm text-danger-600">{errors.first_name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">Last name</label>
                                <input {...register('last_name')} className="input mt-1" />
                                {errors.last_name && <p className="mt-1 text-sm text-danger-600">{errors.last_name.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">Email</label>
                            <input {...register('email')} type="email" className="input mt-1" />
                            {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">Password</label>
                            <input {...register('password')} type="password" className="input mt-1" />
                            {errors.password && <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)]">Confirm password</label>
                            <input {...register('password_confirmation')} type="password" className="input mt-1" />
                            {errors.password_confirmation && <p className="mt-1 text-sm text-danger-600">{errors.password_confirmation.message}</p>}
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full">
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;