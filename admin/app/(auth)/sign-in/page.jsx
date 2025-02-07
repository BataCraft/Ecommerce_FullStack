"use client";
import { Button } from "@/components/ui/button";
import LoadingPage from "@/components/ui/custom/Loading";
import useAuthStore from "@/Store/authStore"; // ✅ Zustand store
import { useRouter } from "next/navigation"; 
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Signin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, checkAuth, loading, error, user } = useAuthStore();
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true); // ✅ Prevents redirect before auth check

    // ✅ Restore authentication on page load
    useEffect(() => {
        const verifyAuth = async () => {
            await checkAuth();
            setAuthLoading(false);
        };
        verifyAuth();
    }, [checkAuth]);

    // ✅ Redirect authenticated users after auth check
    useEffect(() => {
        if (!authLoading && user) {
            router.push("/dashboard");
        }
    }, [user, authLoading, router]);

    // ✅ Show error toast when error state updates
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const success = await login(email, password);
            if (success) {
                router.push("/dashboard");
                toast.success("Login successful");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (authLoading) return <div>
        <LoadingPage/>
    </div>; // ✅ Prevents flashing sign-in page

    return (
        <div className="w-full h-svh flex items-center justify-center">
            <div className="w-full sm:w-1/2 md:w-1/3 bg-white shadow-md p-8 text-center rounded-lg">
                <h1 className="text-3xl font-bold">Admin Panel Sign In</h1>

                <form onSubmit={handleLogin}>
                    <div className="flex flex-col gap-4 mt-8">
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            placeholder="Email Address"
                            className="border border-gray-300 w-full px-4 rounded-md py-3 outline-none focus:ring-2 focus:ring-primaryColor"
                            autoComplete="email"
                            required
                        />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="border border-gray-300 w-full px-4 rounded-md py-3 outline-none focus:ring-2 focus:ring-primaryColor"
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <div className="mt-10">
                        <Button className="w-2/5 bg-primaryColor hover:bg-primaryColor/90 text-white" type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Sign In"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signin;
