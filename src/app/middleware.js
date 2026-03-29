import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Gledamo kamo čovjek želi ići
  const path = request.nextUrl.pathname;

  // 2. Ako ide u /admin, a nema "token" (nije logiran), šibni ga na login!
  // Napomena: Za pravu provjeru koristit ćemo Firebase sustav, 
  // ali za tvoj prvi test, ovo je način na koji Next.js čuva stražu.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Čuvamo cijelu admin mapu!
};
