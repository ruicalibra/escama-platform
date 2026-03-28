import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { tenant: true },
        });

        if (!user || !user.passwordHash) return null;
        if (!user.active) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant?.slug ?? null,
          image: user.avatarUrl,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantSlug = token.tenantSlug as string | null;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For Google OAuth: create user in DB if doesn't exist
      if (account?.provider === "google") {
        const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "escama-ao";
        const tenant = await prisma.tenant.findUnique({
          where: { slug: tenantSlug },
        });
        if (!tenant) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name ?? "Utilizador",
              avatarUrl: user.image,
              role: "customer",
              tenantId: tenant.id,
              emailVerified: true,
              active: true,
            },
          });
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      // Track analytics
      if (user.id) {
        await prisma.analyticsEvent.create({
          data: {
            userId: user.id,
            event: "user_sign_in",
            properties: { timestamp: new Date().toISOString() },
          },
        });
      }
    },
  },
});
