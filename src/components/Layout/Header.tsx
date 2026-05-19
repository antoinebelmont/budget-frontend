import React from 'react';
import { useAppSelector } from '../../store';

const Header: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);

    return (
        <div className="bg-[var(--bg-surface)] shadow-sm border-b border-[var(--border-default)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-1 flex justify-end">
                        <span className="text-sm text-[var(--text-secondary)]">Welcome back, {user?.first_name}!</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;