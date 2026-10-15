import type { MetadataRoute } from "next";

export const BASE_URL = "https://www.achieversjuniorcollege.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${BASE_URL}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [
        `${BASE_URL}/home-banner.webp`,
        `${BASE_URL}/college_logo.jpeg`,
      ],
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [
        `${BASE_URL}/about_image_1.png`,
        `${BASE_URL}/about_image_2.png`,
        `${BASE_URL}/about_image_3.png`,
        `${BASE_URL}/about_image_4.png`,
        `${BASE_URL}/campus-1.jpg`,
        `${BASE_URL}/campus-2.jpg`,
        `${BASE_URL}/campus-3.jpg`,
      ],
    },
    {
      url: `${BASE_URL}/services`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [
        `${BASE_URL}/cultivate-skills.png`,
      ],
    },
    {
      url: `${BASE_URL}/apply`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      images: [
        `${BASE_URL}/home-banner.webp`,
      ],
    },
    {
      url: `${BASE_URL}/alumni`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [
        `${BASE_URL}/alumini_header.png`,
      ],
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
      images: [
        `${BASE_URL}/home-banner.webp`,
      ],
    },
    {
      url: `${BASE_URL}/payments`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}