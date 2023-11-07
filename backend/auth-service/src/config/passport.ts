import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { getJWTSecret } from "../lib/utils";
import HttpStatusCode from "../common/HttpStatusCode";
import { UserProfile } from "../common/types";
import { Request } from "express";
import passport from "passport";
import { UserService } from "../lib/user_api_helpers";
import db from "../lib/db";

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

const options: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: getJWTSecret(),
};

interface JwtPayload {
  sub: string;
  iat: number;
}

const authenticateWithJWT = async (
  jwt_payload: JwtPayload
): Promise<UserProfile | undefined> => {
  const user = await db.user.findFirst({
    where: {
      id: jwt_payload.sub,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      bio: true,
      gender: true,
      preferences: {
        select: {
          languages: true,
          topics: true,
          difficulties: true,
        },
      },
      createdOn: true,
      updatedOn: true,
    },
  });

  // check if the user exists, if not, return undefined to fail the authentication
  return user ? (user as UserProfile) : undefined;
};

const jwtStrategy = new JwtStrategy(options, async (jwt_payload, done) => {
  // if code is here, JWT is authenticated and valid
  // now, check if user exists
  let result: object | UserProfile | undefined = {};
  try {
    result = await authenticateWithJWT(jwt_payload);

    // if user does not exist, return false
    if (!result) {
      return done(null, false);
    }
  } catch (error) {
    console.log(error);
  }

  // if user db throws an error, return empty object, so that the error can be handled in the route
  return done(null, result);
});

passport.use("jwt", jwtStrategy);
