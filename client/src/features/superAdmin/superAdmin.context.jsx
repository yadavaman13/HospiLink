import React, { createContext, useContext } from 'react';
import useSuperAdmin from './hooks/useSuperAdmin';

const SuperAdminContext = createContext(null);

export const SuperAdminProvider = ({ children }) => {
	const value = useSuperAdmin();
	return <SuperAdminContext.Provider value={value}>{children}</SuperAdminContext.Provider>;
};

export const useSuperAdminContext = () => useContext(SuperAdminContext);

export default SuperAdminContext;
