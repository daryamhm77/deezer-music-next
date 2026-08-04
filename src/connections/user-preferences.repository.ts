import type { Artist } from "@/contracts";
import { getMongoDb } from "@/lib/mongodb";

type UserPreferencesDoc = {
  userId: string;
  onboardingCompleted: boolean;
  selectedArtists: Artist[];
  completedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
};

export async function getUserPreferences(userId: string) {
  const db = getMongoDb();
  const doc = await db
    .collection<UserPreferencesDoc>("user_preferences")
    .findOne({ userId });

  if (!doc) {
    return {
      onboardingCompleted: false,
      selectedArtists: [] as Artist[],
    };
  }

  return {
    onboardingCompleted: doc.onboardingCompleted,
    selectedArtists: doc.selectedArtists,
  };
}

export async function completeOnboarding(
  userId: string,
  selectedArtists: Artist[],
) {
  const db = getMongoDb();
  const now = new Date();

  await db.collection<UserPreferencesDoc>("user_preferences").updateOne(
    { userId },
    {
      $set: {
        userId,
        onboardingCompleted: true,
        selectedArtists,
        completedAt: now,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return {
    onboardingCompleted: true,
    selectedArtists,
  };
}
