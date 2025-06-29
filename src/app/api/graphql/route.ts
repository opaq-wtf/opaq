// IF ADDING NEW QUERIES DO INFORM

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

const typeDefs = gql`
  type User {
    id: ID!
    full_name: String!
    email: String!
    username: String
    bio: String
    location: String
    website: String
    contact_visible: Boolean
    profile_picture: String
    profile_picture_data: String
    date_of_birth: String
    createdAt: String
  }

  type Query {
    user(id: ID!): User
    userByUsername(username: String): User
  }
`;

const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    },

    userByUsername: async (_: any, { username }: { username: string }) => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      const user = result[0];
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        full_name: user.fullName,
        email: user.email,
        username: user.username,
        bio: user.bio,
        location: user.location,
        website: user.website,
        contact_visible: user.contactVisible,
        profile_picture: user.profilePicture,
        profile_picture_data: user.profilePictureData,
        date_of_birth: user.dateOfBirth?.toISOString() || null,
        createdAt: user.createdAt?.toISOString() || null,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export async function POST(req: NextRequest) {
  return handler(req);
}
