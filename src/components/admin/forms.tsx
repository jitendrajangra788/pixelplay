"use client";

import { useActionState } from "react";
import { createBlog, updateBlog } from "@/lib/actions/blogs";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { createFaq, updateFaq } from "@/lib/actions/faqs";
import { createPhotos, updatePhoto } from "@/lib/actions/photos";
import { updateSeo, updateWebsite } from "@/lib/actions/settings";
import { createVideo, updateVideo } from "@/lib/actions/videos";
import { initialState } from "@/lib/action-state";
import type { Setting } from "@prisma/client";
import { CheckField, FormError, SelectField, SubmitButton, TextArea, TextField } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { LinkFields } from "@/components/admin/link-fields";
import { RichTextEditor } from "@/components/admin/rich-text";

type Option = { id: string; name: string };

function CategoryOptions({ categories }: { categories: Option[] }) {
  return (
    <>
      <option value="">Select a category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </>
  );
}

export function CategoryForm({
  category,
}: {
  category?: {
    id: string;
    name: string;
    description: string;
    coverImage: string;
    seoTitle: string;
    seoDescription: string;
    active: boolean;
    links: { title: string; url: string }[];
  };
}) {
  const [state, action] = useActionState(category ? updateCategory : createCategory, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Name" name="name" defaultValue={category?.name} error={errors.name} required />
      <TextArea label="Description" name="description" rows={4} defaultValue={category?.description} error={errors.description} required />
      <ImageField label="Cover image" current={category?.coverImage} error={errors.image} required={!category?.coverImage} />
      <TextField label="SEO title" name="seoTitle" defaultValue={category?.seoTitle} error={errors.seoTitle} maxLength={70} />
      <TextArea label="SEO description" name="seoDescription" rows={3} defaultValue={category?.seoDescription} error={errors.seoDescription} maxLength={160} />
      <CheckField label="Active" name="active" defaultChecked={category?.active ?? true} />
      <LinkFields links={category?.links ?? []} error={errors.links} />
      <SubmitButton>{category ? "Save category" : "Create category"}</SubmitButton>
    </form>
  );
}

export function VideoForm({
  categories,
  video,
}: {
  categories: Option[];
  video?: {
    id: string;
    title: string;
    videoUrl: string;
    description: string;
    thumbnail: string;
    categoryId: string;
    featured: boolean;
    published: boolean;
  };
}) {
  const [state, action] = useActionState(video ? updateVideo : createVideo, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {video ? <input type="hidden" name="id" value={video.id} /> : null}
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Title" name="title" defaultValue={video?.title} error={errors.title} required />
      <TextField label="Video URL" name="videoUrl" defaultValue={video?.videoUrl} error={errors.videoUrl} placeholder="YouTube, Vimeo, or a direct video file" required />
      <TextArea label="Description" name="description" rows={4} defaultValue={video?.description} error={errors.description} required />
      <SelectField label="Category" name="categoryId" defaultValue={video?.categoryId ?? ""} error={errors.categoryId} required>
        <CategoryOptions categories={categories} />
      </SelectField>
      <ImageField label="Thumbnail" current={video?.thumbnail} error={errors.image} />
      <div className="flex flex-wrap gap-5">
        <CheckField label="Featured" name="featured" defaultChecked={video?.featured ?? false} />
        <CheckField label="Published" name="published" defaultChecked={video?.published ?? false} />
      </div>
      <p className="text-xs text-muted">Unpublished videos stay off the public site. Leave the thumbnail empty to use the YouTube image.</p>
      <SubmitButton>{video ? "Save video" : "Create video"}</SubmitButton>
    </form>
  );
}

export function PhotoUploadForm({ categories }: { categories: Option[] }) {
  const [state, action] = useActionState(createPhotos, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Title" name="title" error={errors.title} required />
      <TextArea label="Description" name="description" rows={3} error={errors.description} />
      <SelectField label="Category" name="categoryId" defaultValue="" error={errors.categoryId} required>
        <CategoryOptions categories={categories} />
      </SelectField>
      <ImageField label="Images" name="images" multiple required error={errors.images} />
      <p className="text-xs text-muted">Upload up to 12 images. Multiple files are titled “Name 1”, “Name 2”, and so on.</p>
      <SubmitButton>Upload photos</SubmitButton>
    </form>
  );
}

export function PhotoEditForm({
  categories,
  photo,
}: {
  categories: Option[];
  photo: { id: string; title: string; description: string; imageUrl: string; categoryId: string };
}) {
  const [state, action] = useActionState(updatePhoto, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      <input type="hidden" name="id" value={photo.id} />
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Title" name="title" defaultValue={photo.title} error={errors.title} required />
      <TextArea label="Description" name="description" rows={3} defaultValue={photo.description} error={errors.description} />
      <SelectField label="Category" name="categoryId" defaultValue={photo.categoryId} error={errors.categoryId} required>
        <CategoryOptions categories={categories} />
      </SelectField>
      <ImageField label="Replace image" current={photo.imageUrl} error={errors.image} />
      <SubmitButton>Save photo</SubmitButton>
    </form>
  );
}

export function BlogForm({
  categories,
  blog,
}: {
  categories: Option[];
  blog?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    categoryId: string;
    seoTitle: string;
    seoDescription: string;
    published: boolean;
  };
}) {
  const [state, action] = useActionState(blog ? updateBlog : createBlog, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {blog ? <input type="hidden" name="id" value={blog.id} /> : null}
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Title" name="title" defaultValue={blog?.title} error={errors.title} required />
      <TextArea label="Short description" name="excerpt" rows={3} defaultValue={blog?.excerpt} error={errors.excerpt} required />
      <RichTextEditor defaultValue={blog?.content} error={errors.content} />
      <SelectField label="Category" name="categoryId" defaultValue={blog?.categoryId ?? ""} error={errors.categoryId} required>
        <CategoryOptions categories={categories} />
      </SelectField>
      <ImageField label="Featured image" current={blog?.featuredImage} error={errors.image} required={!blog?.featuredImage} />
      <TextField label="SEO title" name="seoTitle" defaultValue={blog?.seoTitle} error={errors.seoTitle} maxLength={70} />
      <TextArea label="SEO description" name="seoDescription" rows={3} defaultValue={blog?.seoDescription} error={errors.seoDescription} maxLength={160} />
      <CheckField label="Published" name="published" defaultChecked={blog?.published ?? false} />
      <SubmitButton>{blog ? "Save post" : "Create post"}</SubmitButton>
    </form>
  );
}

export function FaqForm({
  faq,
}: {
  faq?: { id: string; question: string; answer: string; sortOrder: number; active: boolean };
}) {
  const [state, action] = useActionState(faq ? updateFaq : createFaq, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Question" name="question" defaultValue={faq?.question} error={errors.question} required />
      <TextArea label="Answer" name="answer" rows={5} defaultValue={faq?.answer} error={errors.answer} required />
      <TextField label="Sort order" name="sortOrder" type="number" min={0} defaultValue={faq?.sortOrder ?? 0} error={errors.sortOrder} />
      <CheckField label="Active" name="active" defaultChecked={faq?.active ?? true} />
      <SubmitButton>{faq ? "Save question" : "Add question"}</SubmitButton>
    </form>
  );
}

export function WebsiteForm({ settings, saved }: { settings: Setting; saved?: boolean }) {
  const [state, action] = useActionState(updateWebsite, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {saved ? <p className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">Website settings saved.</p> : null}
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Site name" name="siteName" defaultValue={settings.siteName} error={errors.siteName} required />
      <TextField label="Tagline" name="tagline" defaultValue={settings.tagline} error={errors.tagline} required />
      <TextField label="Hero eyebrow" name="heroEyebrow" defaultValue={settings.heroEyebrow} error={errors.heroEyebrow} required />
      <TextField label="Hero title" name="heroTitle" defaultValue={settings.heroTitle} error={errors.heroTitle} required />
      <TextArea label="Hero subtitle" name="heroSubtitle" rows={3} defaultValue={settings.heroSubtitle} error={errors.heroSubtitle} required />
      <ImageField label="Hero image" name="heroImage" current={settings.heroImage} />
      <TextField label="About title" name="aboutTitle" defaultValue={settings.aboutTitle} error={errors.aboutTitle} required />
      <TextArea label="About text" name="aboutBody" rows={8} defaultValue={settings.aboutBody} error={errors.aboutBody} required />
      <ImageField label="About image" name="aboutImage" current={settings.aboutImage} />
      <TextField label="Contact email" name="contactEmail" type="email" defaultValue={settings.contactEmail} error={errors.contactEmail} required />
      <TextField label="Contact phone" name="contactPhone" defaultValue={settings.contactPhone} error={errors.contactPhone} required />
      <TextField label="Address" name="contactAddress" defaultValue={settings.contactAddress} error={errors.contactAddress} required />
      <TextField label="Facebook" name="facebook" defaultValue={settings.facebook} error={errors.facebook} />
      <TextField label="Instagram" name="instagram" defaultValue={settings.instagram} error={errors.instagram} />
      <TextField label="YouTube" name="youtube" defaultValue={settings.youtube} error={errors.youtube} />
      <TextField label="X" name="twitter" defaultValue={settings.twitter} error={errors.twitter} />
      <TextField label="Discord" name="discord" defaultValue={settings.discord} error={errors.discord} />
      <SubmitButton>Save website settings</SubmitButton>
    </form>
  );
}

export function SeoForm({ settings, saved }: { settings: Setting; saved?: boolean }) {
  const [state, action] = useActionState(updateSeo, initialState);
  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {saved ? <p className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">SEO settings saved.</p> : null}
      <FormError message={state.ok ? undefined : state.message} />
      <TextField label="Default title" name="seoTitle" defaultValue={settings.seoTitle} error={errors.seoTitle} maxLength={70} required />
      <TextArea label="Default description" name="seoDescription" rows={4} defaultValue={settings.seoDescription} error={errors.seoDescription} required />
      <TextField label="Keywords" name="seoKeywords" defaultValue={settings.seoKeywords} error={errors.seoKeywords} placeholder="esports, guides, galleries" />
      <SubmitButton>Save SEO settings</SubmitButton>
    </form>
  );
}
