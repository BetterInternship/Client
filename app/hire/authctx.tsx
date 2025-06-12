'use client'

import { PublicEmployerUser } from '@/lib/db/db.types';
import React, { createContext, useState, useContext, useEffect } from 'react';

interface IAuthContext {
	user: Partial<PublicEmployerUser> | null,
	recheck_authentication: () => Promise<Partial<PublicEmployerUser | null>>,
	register: (user: Partial<PublicEmployerUser>) => Promise<Partial<PublicEmployerUser> | null>,
	verify: (user_id: string, key: string) => Promise<Partial<PublicEmployerUser> | null>,
	send_otp_request: (email: string) => Promise<{ email: string }>,
	resend_otp_request: (email: string) => Promise<{ email: string }>
	verify_otp: (email: string, otp: string) => Promise<{ success: boolean, user?: Partial<PublicEmployerUser> }>,
	email_status: (email: string) => Promise<{ existing_user: boolean, verified_user: boolean }>,
	logout: () => Promise<void>,
	is_authenticated: () => boolean,
}

// Fake Google user data
const FAKE_GOOGLE_USER: Partial<PublicEmployerUser> = {
	id: "google-user-1",
	email: "hr@google.com",
	first_name: "Sarah",
	last_name: "Johnson",
	company_name: "Google",
	company_description: "Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies, a search engine, cloud computing, software, and hardware. We organize the world's information and make it universally accessible and useful.",
	company_locations: ["1600 Amphitheatre Parkway, Mountain View, CA", "Legazpi Village, Makati City, Philippines", "Marina One, Singapore"],
	hr_email: "hr@google.com",
	phone: "+1 (650) 253-0000",
	verified: true,
	created_at: "2024-01-15T08:00:00Z",
	updated_at: "2024-06-10T14:30:00Z"
};

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(() => {
		if (typeof window === 'undefined') return false;
		const isAuthed = sessionStorage.getItem('isAuthenticated')
		return isAuthed ? JSON.parse(isAuthed) : false;
	});
	const [user, setUser] = useState<Partial<PublicEmployerUser> | null>(() => {
		if (typeof window === 'undefined') return null;
		const user = sessionStorage.getItem('user')
		return user ? JSON.parse(user) : null;
	});

	// Whenever user is updated, cache in sessionStorage
	useEffect(() => {
		if (user) sessionStorage.setItem('user', JSON.stringify(user));
		else sessionStorage.removeItem('user');
		
		if(isAuthenticated) sessionStorage.setItem('isAuthenticated', JSON.stringify(true))
		else sessionStorage.removeItem('isAuthenticated');
	}, [user, isAuthenticated]);

	const recheck_authentication = async (): Promise<Partial<PublicEmployerUser> | null> => {
		// Fake authentication check - if user is in session, they're authenticated
		if (user && isAuthenticated) {
			return user;
		}
		return null;
	}

	const send_otp_request = async (email: string) => {
		// Simulate OTP sending delay
		await new Promise(resolve => setTimeout(resolve, 1000));
		return { email };
	}

	const resend_otp_request = async (email: string) => {
		// Simulate OTP resending delay
		await new Promise(resolve => setTimeout(resolve, 1000));
		return { email };
	}

	const verify_otp = async (email: string, otp: string) => {
		// Simulate verification delay
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		// Check if it's the Google account with correct OTP
		if (email === "hr@google.com" && otp === "312511") {
			setUser(FAKE_GOOGLE_USER);
			setIsAuthenticated(true);
			return { success: true, user: FAKE_GOOGLE_USER };
		}
		
		// For any other email, allow login but with generic data
		if (otp === "312511") {
			const genericUser = {
				...FAKE_GOOGLE_USER,
				email,
				hr_email: email,
				company_name: "Demo Company",
				company_description: "A demo company for testing purposes."
			};
			setUser(genericUser);
			setIsAuthenticated(true);
			return { success: true, user: genericUser };
		}
		
		return { success: false };
	}

	const email_status = async (email: string) => {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 800));
		
		// For demo purposes, all emails are considered existing and verified
		return { existing_user: true, verified_user: true };
	}

	const logout = async () => {
		setUser(null);
		setIsAuthenticated(false);
		sessionStorage.removeItem('user');
		sessionStorage.removeItem('isAuthenticated');
	}

	const is_authenticated = () => {
		return isAuthenticated;
	}

	return (
		// @ts-ignore
		<AuthContext.Provider value={{ user, recheck_authentication, send_otp_request, resend_otp_request, verify_otp, email_status, logout, is_authenticated }}>
			{ children }
		</AuthContext.Provider>
	)
}
