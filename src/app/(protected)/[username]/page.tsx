// NEED TO REPLACE "LOADING..." TEXT WITH A LOADING COMPONENT

"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Users {
  id: string;
  full_name: string;
  email: string;
  username: string;
}

export default function Profile({ params }: { params: { username: string } }) {
  const { username } = useParams() as { username: string };
  const [users, setUsers] = useState<Users | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await axios.post(
          "http://localhost:3000/api/graphql",
          {
            query: `
                        query($username: String!) {
                            userByUsername(username: $username) {
                                id
                                full_name
                                email
                                username
                            }
                        }
                    `,
            variables: {
              username: username,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (res.data.errors) {
          throw new Error(res.data.errors[0].message);
        }

        setUsers(res.data.data.userByUsername);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch users data.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      {loading && <p className="text-white">Loading profile...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && users && (
        <div className="space-y-4 text-white">
          <h1 className="text-2xl font-bold">
            Welcome, {Array.isArray(users) ? "User" : users.username}
          </h1>
          {!Array.isArray(users) && (
            <>
              <p>
                <strong>Full Name:</strong> {users.full_name}
              </p>
              <p>
                <strong>Email:</strong> {users.email}
              </p>
              <p>
                <strong>Username:</strong>
                {users.username}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
