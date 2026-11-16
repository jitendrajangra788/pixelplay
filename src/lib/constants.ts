export const PUBLIC_PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 10;

export const primaryNav = [
  { href: "/categories", label: "Categories" },
  { href: "/videos", label: "Videos" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const;

export const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/blogs", label: "Blog" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/settings", label: "Website settings" },
  { href: "/admin/seo", label: "SEO settings" },
] as const;
