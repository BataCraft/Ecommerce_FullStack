import { NextResponse } from "next/server";

export function Middleware(req)
{
    const token = req.cookies.get("token");

    if(!token && req.nextUrl.pathname !== "/signin")
    {
        return NextResponse.redirect(new URL("/signin", req.url));
    }
    return NextResponse.next();
};


export const config = {
    matcher: ["/dashboard/:path*"], // Protect dashboard route
};