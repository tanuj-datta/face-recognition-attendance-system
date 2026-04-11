import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Roll Number or Faculty Username", type: "text" },
        password: { label: "Password", type: "password" },
        isFaculty: { label: "Is Faculty", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.identifier || !credentials?.password) return null;
        
        // Demo Faculty Login Logic
        if (credentials.isFaculty === 'true') {
          if (credentials.identifier === 'faculty' && credentials.password === 'faculty123') {
            return { id: 'faculty-1', name: 'Professor Admin', role: 'faculty' };
          }
          return null;
        }

        // Standard Student Login
        const student = await prisma.student.findUnique({
          where: { roll_no: credentials.identifier }
        });

        if (!student || !student.password_hash) return null;

        const isMatch = await bcrypt.compare(credentials.password, student.password_hash);
        if (!isMatch) return null;

        return { id: student.id, name: student.name, roll_no: student.roll_no, role: 'student' };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roll_no = user.roll_no;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.roll_no = token.roll_no;
        session.user.role = token.role;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev",
  pages: {
    signIn: "/student/login",
  }
};
