import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/app/app(.*)",
  "/app$",
]);

const isPublicAppRoute = createRouteMatcher(["/app/pricing(.*)"]);

// Clerk middleware protects only /app and /app/app/* (dashboard routes).
// /app/pricing is explicitly excluded so logged-out users can view pricing.
// The matcher below captures all page routes plus /api and /trpc prefixes.
// Stripe webhook (/api/stripe/webhook) remains public — Clerk does not block
// API routes unless they call getOrCreateUser(), which the webhook does not.
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isPublicAppRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Match all routes except static assets (_next, images, fonts, etc.)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ensure API and tRPC routes are processed by middleware (auth checks happen per-route)
    "/(api|trpc)(.*)",
  ],
};
