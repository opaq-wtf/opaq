/*
v1 :
// IF ADDING NEW QUERIES DO INFORM

import { pool } from "@/lib/db/pool";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { NextRequest } from "next/server";

const typeDefs = gql`
  type User {
    id: ID!
    full_name: String!
    email: String!
    username: String!
  }

  type Query {
    user(id: ID!): User
    userByUsername(username: String!): User
  }
`;

const resolvers = {
  Query: {
    user: async (_: any, { id }: { id: string }) => {
      const client = await pool.connect();

      try {
        const result = await client.query(
          "SELECT id, full_name, email, username FROM users WHERE id = $1;",
          [id],
        );

        return result.rows[0] || null;
      } finally {
        client.release();
      }
    },

    userByUsername: async (_: any, { username }: { username: string }) => {
      const client = await pool.connect();

      try {
        const result = await client.query(
          "SELECT id, full_name, email, username FROM users WHERE username = $1;",
          [username],
        );

        return result.rows[0] || null;
      } finally {
        client.release();
      }
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
*/

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
    username: String!
  }

  type Query {
    user(id: ID!): User
    userByUsername(username: String!): User
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

      return result[0] || null;
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
