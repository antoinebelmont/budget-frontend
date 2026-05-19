import { createSlice } from '@reduxjs/toolkit';
import { UIState } from '../../types/redux';

const getInitialTheme = (): 'light' | 'dark' => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: UIState = {
    sidebarOpen: true,
    currentPage: 'budget',
    theme: getInitialTheme(),
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            if (action.payload === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
    },
});

export const { toggleSidebar, setCurrentPage, setTheme } = uiSlice.actions;
export default uiSlice.reducer;