import { ConvexHttpClient } from "convex/browser";
import authOptions from "@/app/api/auth/[...nextauth]";
import getServerSession from "next-auth";

export async function getAuthedConvex() {
  const session = getServerSession(authOptions);
  console.log("session", session);

  if (!session?.user) return null;

  const payload = {
    sub: session.user.id,
    email: session.user.email,
    role: session.user.role,
    status: session.user.status,
  };

  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
    auth: token,
  });
}
