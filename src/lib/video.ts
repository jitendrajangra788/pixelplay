export type ParsedVideo = {
  provider: "youtube" | "vimeo" | "file";
  embedUrl: string;
  thumbnail: string | null;
};

export function parseVideo(url: string): ParsedVideo | null {
  const value = url.trim();
  const youtube = value.match(
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (youtube) {
    const id = youtube[1];
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}`,
      thumbnail: null,
    };
  }

  if (/^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i.test(value)) {
    return { provider: "file", embedUrl: value, thumbnail: null };
  }

  return null;
}

export function videoPoster(thumbnail: string, videoUrl: string) {
  if (thumbnail) return thumbnail;
  return parseVideo(videoUrl)?.thumbnail ?? null;
}
