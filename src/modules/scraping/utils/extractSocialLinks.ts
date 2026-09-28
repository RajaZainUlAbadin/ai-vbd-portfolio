export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
}

export function extractSocialLinks(links: string[] = []): SocialLinks {
  const socials: SocialLinks = {};

  for (const link of links) {
    const lower = link.toLowerCase();

    if (lower.includes('linkedin.com') && !socials.linkedin) {
      socials.linkedin = link;
    }

    if (lower.includes('facebook.com') && !socials.facebook) {
      socials.facebook = link;
    }

    if (lower.includes('instagram.com') && !socials.instagram) {
      socials.instagram = link;
    }

    if (lower.includes('youtube.com') && !socials.youtube) {
      socials.youtube = link;
    }

    if (lower.includes('twitter.com') && !socials.twitter) {
      socials.twitter = link;
    }

    if (lower.includes('tiktok.com') && !socials.tiktok) {
      socials.tiktok = link;
    }
  }

  return socials;
}
