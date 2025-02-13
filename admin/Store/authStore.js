import { create } from "zustand";
import axios from "axios";

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true } // Ensures cookies are sent
            );

            if (response.status === 200) {
                const { user, token } = response.data;

                if(user.role !== "admin") {
                    set({ user: null, token: null, loading: false, error: "You are not an admin" });
                    return null;
                };


                set({ user, token, loading: false });
                localStorage.setItem("token", token);
                return true;
            };

 
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Login failed",
            });
            console.error("Login error:", error);
        }
    },

    checkAuth: async () => {
        set({ loading: true, error: null }); // Ensure loading is set to true

        const token = localStorage.getItem("token");

        if (!token) {
            set({ user: null, token: null, loading: false });
            return null;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-user`, // Use backticks to interpolate the env variable
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                const user = response.data.user;

                if(user.role !== "admin") {
                    set({ user: null, token: null, loading: false, error: "You are not an admin" });
                    return null;
                };
                
                set({ user: response.data.user, token });
                return response.data.user;
            };

         
           
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || "Authentication failed",
            });
            console.error("Authentication error:", error);
        } finally {
            set({ loading: false }); // Set loading to false after check is done
        }
    },
}));

export default useAuthStore;
