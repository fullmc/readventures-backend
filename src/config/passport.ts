import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "./prisma"; 

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) return done(new Error("No email found"), undefined);

        // Vérifier si l'utilisateur existe
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // Sinon, créer un nouveau user
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
