"use client";
import LoadingPage from "@/components/ui/custom/Loading";
import useAuthStore from "@/Store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);
    const checkAuth = useAuthStore((state) => state.checkAuth); // Fetch user if missing
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            checkAuth().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, checkAuth]);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/sign-in");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="h-screen flex justify-center items-center"><LoadingPage/></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name || "User"}!</h1>
            <p>This is your dashboard.</p>
        </div>
    );
};

export default Dashboard;
