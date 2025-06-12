export const USER_ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  plotOwner: "Plot Owner",
  communityMember: "Community Member",
};

export const USER_PROFILE_LABELS = {
  // Base user fields
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email Address",
  role: "Role",
  createdAt: "Member Since",
  updatedAt: "Last Updated",

  // Profile section
  profile: {
    bio: "Biography",
    skills: "Skills",
    interests: "Interests",
  },

  // Address section
  address: {
    street: "Street Address",
    city: "City",
    region: "Region",
    postCode: "Postal Code",
  },
} as const;

// Type helper for accessing nested labels
export type UserProfileLabels = typeof USER_PROFILE_LABELS;
