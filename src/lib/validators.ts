import { z } from "zod";

const required = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

const httpUrl = z
  .string()
  .trim()
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http or https URL.");

export const categorySchema = z.object({
  name: required("Name", 2, 80),
  description: required("Description", 10, 600),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  active: z.boolean(),
});

export const linkSchema = z.object({
  title: required("Link title", 2, 80),
  url: httpUrl,
});

export const videoSchema = z.object({
  title: required("Title", 2, 140),
  videoUrl: httpUrl,
  description: required("Description", 10, 2000),
  categoryId: z.string().trim().min(1, "Choose a category."),
  featured: z.boolean(),
  published: z.boolean(),
});

export const photoSchema = z.object({
  title: required("Title", 2, 140),
  description: optionalText(500),
  categoryId: z.string().trim().min(1, "Choose a category."),
});

export const blogSchema = z.object({
  title: required("Title", 4, 160),
  excerpt: required("Short description", 10, 240),
  content: z
    .string()
    .trim()
    .min(20, "Write a little more in the article body.")
    .max(50000, "The article is too long."),
  categoryId: z.string().trim().min(1, "Choose a category."),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
  published: z.boolean(),
});

export const faqSchema = z.object({
  question: required("Question", 5, 200),
  answer: required("Answer", 5, 2000),
  sortOrder: z.coerce.number().int().min(0).max(999),
  active: z.boolean(),
});

export const enquirySchema = z.object({
  name: required("Name", 2, 80),
  email: z.string().trim().email("Enter a valid email address.").max(160),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => value === "" || /^[0-9+().\-\s]{7,30}$/.test(value), "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  subject: required("Subject", 3, 140),
  message: required("Message", 10, 4000),
});

export const websiteSchema = z.object({
  siteName: required("Site name", 2, 60),
  tagline: required("Tagline", 2, 140),
  heroEyebrow: required("Eyebrow", 2, 40),
  heroTitle: required("Hero title", 2, 120),
  heroSubtitle: required("Hero subtitle", 10, 400),
  aboutTitle: required("About title", 2, 120),
  aboutBody: required("About text", 20, 4000),
  contactEmail: z.string().trim().email("Enter a valid contact email.").max(160),
  contactPhone: required("Phone", 7, 30),
  contactAddress: required("Address", 4, 200),
  facebook: optionalText(200),
  instagram: optionalText(200),
  youtube: optionalText(200),
  twitter: optionalText(200),
  discord: optionalText(200),
});

export const seoSchema = z.object({
  seoTitle: required("SEO title", 2, 70),
  seoDescription: required("SEO description", 10, 200),
  seoKeywords: optionalText(240),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter the admin email.").max(160),
  password: z.string().min(8, "Password must be at least 8 characters.").max(200),
});

export function optionalSocial(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  const parsed = httpUrl.safeParse(trimmed);
  return parsed.success ? trimmed : null;
}
