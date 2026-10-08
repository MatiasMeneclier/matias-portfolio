import type { Content } from "../types/content.ts";

export const profilePhoto = "/images/matias-portrait.png";

export function applyProfilePhoto(content: Content) {
  const profile = content.profiles[0];
  if (profile && !profile.data.photo) profile.data.photo = profilePhoto;
}
