import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma"; 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) return done(new Error("No email found"), undefined);

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // Otherwise, create new user
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              authProvider: "GOOGLE",

            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as any, undefined);
      }
    }
  )
);

export default passport;
