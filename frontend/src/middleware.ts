import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "./helpers/auth/auth_api_wrappers";
import { getLogger } from "./helpers/logger";

export const config = {
  // consume middleware for all API routes
  matcher: "/:path*",
};

export async function middleware(request: NextRequest) {
  const publicRoutes = ["/_next", "/assets", "/logout", "/forgotpassword"];
  const rerouteContents = ["/login", "/", "/verify", "/error"];

  // no need to validate the token for these routes
  if (publicRoutes.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    const jwtCookieString = request.cookies.get("jwt")?.value as string;
    const isAuthenticated = await authenticate(jwtCookieString);

    //authenticated
    if (isAuthenticated) {
      if (rerouteContents.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(
          new URL("/dashboard", request.nextUrl.origin)
        );
      }
      return NextResponse.next();
    }

    //not authenticated
    if (rerouteContents.includes(request.nextUrl.pathname)) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  } catch (err) {
    // handles error when auth service is down
    if (request.nextUrl.pathname !== "/error") {
      return NextResponse.redirect(new URL("/error", request.nextUrl.origin));
    }
  }
}

async function authenticate(jwt: string): Promise<boolean> {
  try {
    if (jwt) {
      if (await AuthService.validateUser(jwt)) {
        return true;
      }
    }
  } catch (error) {
    getLogger().error(error);
    throw error;
  }
  return false;
}