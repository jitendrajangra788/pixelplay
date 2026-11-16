export type SearchProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type SlugProps = {
  params: Promise<{ slug: string }>;
};

export type IdProps = {
  params: Promise<{ id: string }>;
};
