"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AdminPage() {
  // redirect to edit page when user unverified
  const router = useRouter();
  const { data: session, status } = useSession();

  // redirect to edit page when user unverified
  useEffect(() => {
    if (status === "authenticated") {
      const userId = session?.user?.id;
      const isVerified = session?.user?.verified;

      if (userId && isVerified === false) {
        router.push(`/profile/${userId}/edit`);
      }
    }
  }, [session, status, router]);

  const [userId, setUserId] = useState("");
  const [points, setPoints] = useState("");
  const [message, setMessage] = useState<string>("");

  const updatePoints = api.user.updatePoints.useMutation({
    onSuccess: () => {
      setMessage("Points updated successfully!");
      setUserId("");
      setPoints("");
    },
    onError: (error) => {
      setMessage(`Error: ${error.message}`);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !points) {
      setMessage("Error: All fields are required");
      return;
    }

    const pointsNumber = Number(points);
    if (pointsNumber < 0) {
      setMessage("Error: Points cannot be negative");
      return;
    }

    updatePoints.mutate({
      id: userId,
      action: {
        type: "set",
        value: pointsNumber,
      },
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Update User Points</h1>

      <form onSubmit={onSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="userId" className="mb-1 block text-sm font-medium">
            User ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label htmlFor="points" className="mb-1 block text-sm font-medium">
            Points
          </label>
          <input
            id="points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <button
          type="submit"
          disabled={updatePoints.isPending}
          className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
        >
          {updatePoints.isPending ? "Updating..." : "Update Points"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 rounded p-4 ${message.startsWith("Error") ? "bg-red-100" : "bg-green-100"}`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
