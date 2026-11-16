import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import sharp from "sharp";

const prisma = new PrismaClient();
const mediaDir = path.join(process.cwd(), "public", "media");

async function storeImage(name: string, url: string, color: { r: number; g: number; b: number }) {
  await mkdir(mediaDir, { recursive: true });
  const destination = path.join(mediaDir, `${name}.webp`);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Image request failed (${response.status})`);
    const input = Buffer.from(await response.arrayBuffer());
    await sharp(input).rotate().resize(1600, 1000, { fit: "cover" }).webp({ quality: 78 }).toFile(destination);
  } catch (error) {
    console.warn(`Using a solid cover for ${name}: ${error instanceof Error ? error.message : "download failed"}`);
    await sharp({
      create: { width: 1600, height: 1000, channels: 3, background: color },
    })
      .webp({ quality: 80 })
      .toFile(destination);
  }
  return `/media/${name}.webp`;
}

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@nexora.gg").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Nexora Admin";
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: { email, name, passwordHash: await bcrypt.hash(password, 12) },
    });
  }

  if ((await prisma.category.count()) > 0) {
    console.log("Content already exists. Skipping the library seed.");
    return;
  }

  const [
    openWorld,
    action,
    fantasy,
    competitive,
    setups,
    retro,
    still1,
    still2,
    still3,
    still4,
    still5,
    still6,
    still7,
    still8,
  ] = await Promise.all([
    storeImage("open-world", photo("photo-1542751371-adc38448a05e"), { r: 28, g: 22, b: 68 }),
    storeImage("action", photo("photo-1538481199705-c710c4e965fc"), { r: 48, g: 18, b: 42 }),
    storeImage("fantasy", photo("photo-1511512578047-dfb367046420"), { r: 22, g: 32, b: 72 }),
    storeImage("competitive", photo("photo-1511882150382-421056c89033"), { r: 18, g: 28, b: 58 }),
    storeImage("setups", photo("photo-1593305841991-05c297ba4575"), { r: 32, g: 20, b: 64 }),
    storeImage("retro", photo("photo-1552820728-8b83bb6b773f"), { r: 64, g: 24, b: 48 }),
    storeImage("still-console", photo("photo-1606144042614-b2417e99c4e3"), { r: 20, g: 24, b: 60 }),
    storeImage("still-keys", photo("photo-1580327344181-c1163234e5a0"), { r: 36, g: 16, b: 58 }),
    storeImage("still-chair", photo("photo-1612287230202-1ff1d85d1bdf"), { r: 18, g: 22, b: 48 }),
    storeImage("still-pad", photo("photo-1486572788966-cfd3df1f5b42"), { r: 42, g: 18, b: 64 }),
    storeImage("still-arcade", photo("photo-1579373903781-fd5c0c30c4cd"), { r: 58, g: 22, b: 40 }),
    storeImage("still-color", photo("photo-1493711662062-fa541adb3fc8"), { r: 28, g: 18, b: 70 }),
    storeImage("still-night", photo("photo-1511512578047-dfb367046420"), { r: 14, g: 16, b: 40 }),
    storeImage("still-stage", photo("photo-1542751371-adc38448a05e"), { r: 30, g: 16, b: 54 }),
  ]);

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Open World",
        slug: "open-world",
        description: "Wide maps, long roads, and the trailers that convince a player to get lost on purpose.",
        coverImage: openWorld,
        seoTitle: "Open world games",
        seoDescription: "Trailers, stills, and links for open-world games promoted by Nexora.",
        active: true,
        links: {
          create: [
            { title: "Rockstar Games", url: "https://www.rockstargames.com/" },
            { title: "Steam", url: "https://store.steampowered.com/" },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Action Stories",
        slug: "action-stories",
        description: "Character-led action: story trailers, combat footage, and the stills that carry a campaign.",
        coverImage: action,
        seoTitle: "Action game stories",
        seoDescription: "Promotion footage and notes for story-driven action games.",
        active: true,
        links: { create: [{ title: "PlayStation", url: "https://www.playstation.com/en-us/" }] },
      },
    }),
    prisma.category.create({
      data: {
        name: "Fantasy Realms",
        slug: "fantasy-realms",
        description: "Swords, schools, and kingdoms. A shelf for fantasy worlds with a public trailer and a place to play.",
        coverImage: fantasy,
        seoTitle: "Fantasy game realms",
        seoDescription: "Fantasy game videos, galleries, and outbound links.",
        active: true,
        links: { create: [{ title: "Bandai Namco Europe", url: "https://en.bandainamcoent.eu/" }] },
      },
    }),
    prisma.category.create({
      data: {
        name: "Competitive",
        slug: "competitive",
        description: "Desks, brackets, and the sites players check before a match. Built for teams that need a clean public shelf.",
        coverImage: competitive,
        seoTitle: "Competitive gaming",
        seoDescription: "Esports footage, photos, and reference links.",
        active: true,
        links: {
          create: [
            { title: "HLTV", url: "https://www.hltv.org/" },
            { title: "Liquipedia", url: "https://liquipedia.net/" },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Setup Lab",
        slug: "setup-lab",
        description: "Headsets, keyboards, and the rooms where the footage is actually made.",
        coverImage: setups,
        seoTitle: "Gaming setups",
        seoDescription: "Photos and notes from gaming setups and production desks.",
        active: true,
        links: { create: [{ title: "PC Gamer", url: "https://www.pcgamer.com/" }] },
      },
    }),
    prisma.category.create({
      data: {
        name: "Retro Rooms",
        slug: "retro-rooms",
        description: "Cabinets, cartridges, and the neon that still pulls a crowd.",
        coverImage: retro,
        seoTitle: "Retro gaming rooms",
        seoDescription: "Retro arcade photos and links from the Nexora library.",
        active: true,
        links: { create: [{ title: "Internet Archive", url: "https://archive.org/" }] },
      },
    }),
  ]);

  const puzzles = await prisma.category.create({
    data: {
      name: "IQ Puzzles",
      slug: "iq-puzzles",
      description: "Wooden hand puzzles on the table. Shift Lock slides numbered tiles along a locked track. The letter wheel turns one spoke at a time.",
      coverImage: "/media/puzzle/img_1937.webp",
      seoTitle: "IQ puzzle photos",
      seoDescription: "Photographs of the Shift Lock board and the wooden letter wheel.",
      active: true,
    },
  });

  const bySlug = Object.fromEntries([...categories, puzzles].map((category) => [category.slug, category.id]));

  await prisma.video.createMany({
    data: [
      {
        title: "Grand Theft Auto VI — Trailer 1",
        slug: "gta-vi-trailer-1",
        videoUrl: "https://www.youtube.com/watch?v=QdBZY2fkU-0",
        description: "The first public trailer. Filed under Open World for the campaign shelf, with the original film left intact.",
        featured: true,
        published: true,
        categoryId: bySlug["open-world"],
      },
      {
        title: "Red Dead Redemption 2 — Official Trailer",
        slug: "red-dead-redemption-2-trailer",
        videoUrl: "https://www.youtube.com/watch?v=eaW0tYpxyp0",
        description: "A long-form story trailer used as the reference cut when the open-world shelf needs a slower pace.",
        featured: true,
        published: true,
        categoryId: bySlug["open-world"],
      },
      {
        title: "Elden Ring — Gameplay Reveal",
        slug: "elden-ring-gameplay-reveal",
        videoUrl: "https://www.youtube.com/watch?v=E3Huy2cdih0",
        description: "The gameplay reveal that still anchors the fantasy shelf. Featured on the homepage until a newer cut replaces it.",
        featured: true,
        published: true,
        categoryId: bySlug["fantasy-realms"],
      },
      {
        title: "Hogwarts Legacy — Reveal Trailer",
        slug: "hogwarts-legacy-reveal",
        videoUrl: "https://www.youtube.com/watch?v=1O6Qstncpnc",
        description: "A castle-scale fantasy reveal, kept with the realm shelf rather than mixed into action.",
        featured: false,
        published: true,
        categoryId: bySlug["fantasy-realms"],
      },
      {
        title: "God of War — Story Trailer",
        slug: "god-of-war-story-trailer",
        videoUrl: "https://www.youtube.com/watch?v=K0u_kAWLJOA",
        description: "A father-and-son story trailer. Published on the action shelf with the original YouTube cut.",
        featured: false,
        published: true,
        categoryId: bySlug["action-stories"],
      },
      {
        title: "Marvel's Spider-Man 2 — Reveal Trailer",
        slug: "spider-man-2-reveal",
        videoUrl: "https://www.youtube.com/watch?v=qIQ3xNqkVC4",
        description: "City-scale action, filed beside the other campaign trailers.",
        featured: false,
        published: true,
        categoryId: bySlug["action-stories"],
      },
      {
        title: "Cyberpunk 2077 — Cinematic trailer (draft)",
        slug: "cyberpunk-2077-cinematic-draft",
        videoUrl: "https://www.youtube.com/watch?v=LembwKDo1Dk",
        description: "Held as a draft so the public site only shows films an editor has marked published.",
        featured: false,
        published: false,
        categoryId: bySlug["action-stories"],
      },
    ],
  });

  await prisma.photo.createMany({
    data: [
      { title: "Shift Lock from the side", description: "The A3 iQ Puzzle board, with numbered tiles sitting in a dark wood track.", imageUrl: "/media/puzzle/img_1937.webp", categoryId: bySlug["iq-puzzles"] },
      { title: "Shift Lock overhead", description: "The same board from above, tiles held in the locked channels.", imageUrl: "/media/puzzle/img_1947.webp", categoryId: bySlug["iq-puzzles"] },
      { title: "The sliders underneath", description: "The wooden pieces that move the tiles, one of them pulled out to the side.", imageUrl: "/media/puzzle/img_1981.webp", categoryId: bySlug["iq-puzzles"] },
      { title: "Letter wheel overhead", description: "A round wooden puzzle with lettered spokes and a ring of metal pins.", imageUrl: "/media/puzzle/img_1991.webp", categoryId: bySlug["iq-puzzles"] },
      { title: "Letter wheel on its edge", description: "The wheel tipped up, showing how deep the spokes sit.", imageUrl: "/media/puzzle/img_1995.webp", categoryId: bySlug["iq-puzzles"] },
      { title: "Stage wash", description: "A floor lit for a reveal, before the seats fill.", imageUrl: still8, categoryId: bySlug["competitive"] },
      { title: "Night controller", description: "The last match of the evening, still in someone's hands.", imageUrl: still7, categoryId: bySlug["competitive"] },
      { title: "Console close-up", description: "Hardware, cropped tight for a product still.", imageUrl: still1, categoryId: bySlug["setup-lab"] },
      { title: "Keyboard row", description: "A desk detail used across setup features.", imageUrl: still2, categoryId: bySlug["setup-lab"] },
      { title: "Chair and glow", description: "The corner where most of the footage is reviewed.", imageUrl: still3, categoryId: bySlug["setup-lab"] },
      { title: "Pad in hand", description: "A simple still for posts that do not need a trailer.", imageUrl: still4, categoryId: bySlug["action-stories"] },
      { title: "Cabinet row", description: "Retro machines, photographed straight on.", imageUrl: still5, categoryId: bySlug["retro-rooms"] },
      { title: "Color pads", description: "A brighter frame for the fantasy and party shelves.", imageUrl: still6, categoryId: bySlug["fantasy-realms"] },
    ],
  });

  await prisma.blog.createMany({
    data: [
      {
        title: "How a category earns a place on the homepage",
        slug: "how-a-category-earns-the-homepage",
        excerpt: "Popularity here is not a vibe. It is the count of published films, stills, and stories sitting on a shelf.",
        featuredImage: openWorld,
        seoTitle: "How categories reach the homepage",
        seoDescription: "Why Nexora ranks categories by the work published inside them.",
        published: true,
        categoryId: bySlug["open-world"],
        content: `<p>The homepage does not guess. A category rises when it holds published videos, photos, and stories, because that is the work a visitor can actually open.</p><h2>What counts</h2><ul><li>Published videos, including the ones marked featured.</li><li>Photos assigned to the category.</li><li>Published journal posts.</li></ul><p>Inactive categories drop out of the public site entirely. Their files stay in the admin until an editor turns the shelf back on or moves the work.</p><h2>What we leave alone</h2><p>External links do not inflate the count. A link is a door, not a piece of media. Use it for the store, the wiki, or the team site, and keep the shelf itself full of things we can stand behind.</p>`,
      },
      {
        title: "Publish the film, then write the note",
        slug: "publish-the-film-then-write-the-note",
        excerpt: "A trailer without a sentence is a link. A sentence without the film is a promise. The shelf needs both.",
        featuredImage: action,
        seoTitle: "Publish the film, then write the note",
        seoDescription: "How Nexora pairs a video with a short description before it goes public.",
        published: true,
        categoryId: bySlug["action-stories"],
        content: `<p>Every public video needs a title, a supported URL, a description, and a category. Featured is optional. Published is the switch that matters.</p><h2>Supported players</h2><p>YouTube and Vimeo open in the page. A direct MP4, WebM, or OGG file plays in the browser. Anything else is rejected by the form, so a broken embed never reaches the site.</p><blockquote>Leave the thumbnail empty on a YouTube film and the public card uses the host image.</blockquote><p>Drafts remain in the admin list with a clear status. They do not appear in search, the sitemap, or the homepage.</p>`,
      },
      {
        title: "A gallery is a contact sheet, not a dump",
        slug: "a-gallery-is-a-contact-sheet",
        excerpt: "Batch uploads are welcome. Anonymous files are not. Give the set a title before it hits the lightbox.",
        featuredImage: setups,
        seoTitle: "How the photo gallery works",
        seoDescription: "Upload, title, and preview gaming photos before they reach the public lightbox.",
        published: true,
        categoryId: bySlug["setup-lab"],
        content: `<p>The upload form accepts up to twelve images. One title covers the batch, and each file is numbered so nothing lands without a name.</p><h2>After the upload</h2><p>Edit a single frame to replace the file, rewrite the caption, or move it to another category. Delete removes the database row and the optimized file.</p><p>On the public gallery, a click opens the lightbox. Arrow keys move through the set currently on the page.</p>`,
      },
      {
        title: "Season planning notes",
        slug: "season-planning-notes",
        excerpt: "An internal draft for the next shelf. It stays unpublished until the lineup is real.",
        featuredImage: retro,
        seoTitle: "",
        seoDescription: "",
        published: false,
        categoryId: bySlug["retro-rooms"],
        content: `<p>This draft is here so the admin list shows both states. It will not appear on the public journal, in search, or in the sitemap.</p><p>When the season is ready, tick Published and the post picks up a public URL from its title.</p>`,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      { question: "What belongs in a category?", answer: "A category is a public shelf. It can hold videos, photos, journal posts, and links out to a game or a team site.", sortOrder: 1, active: true },
      { question: "Why is a video missing from the site?", answer: "Only published videos on an active category are public. Drafts and inactive shelves stay in the admin.", sortOrder: 2, active: true },
      { question: "Which video links can I paste?", answer: "YouTube, Vimeo, and direct MP4, WebM, or OGG URLs. Other hosts are rejected so the player on the video page always has something it can open.", sortOrder: 3, active: true },
      { question: "Can I upload more than one photo?", answer: "Yes. The photo form accepts up to twelve images at once. Give the set a shared title and choose one category.", sortOrder: 4, active: true },
      { question: "Do blog drafts get a public URL?", answer: "No. A draft keeps its admin record and its slug, and the public journal ignores it until you mark it published.", sortOrder: 5, active: true },
      { question: "Where do contact messages go?", answer: "The contact form stores the name, email, phone, subject, and message. Editors read them in the admin inbox and can mark each one as handled.", sortOrder: 6, active: true },
    ],
  });

  await prisma.setting.create({
    data: {
      id: "site",
      siteName: "Nexora",
      tagline: "A quiet library for games worth gathering around.",
      heroEyebrow: "Wooden puzzles",
      heroTitle: "Shift Lock and the letter wheel.",
      heroSubtitle: "Numbered tiles on a locked track, and a round wooden wheel of letters. Photographed up close, the way the puzzles sit on the table.",
      heroImage: "/media/puzzle/img_1937.webp",
      aboutTitle: "A studio library, not a leaderboard.",
      aboutBody:
        "Nexora organizes promotion for games and the people who play them. Each category is a shelf: films, photographs, a short journal, and the links that lead out to the game itself.\n\nWe keep the public site plain on purpose. Editors work in a small admin. Visitors get a page they can read, watch, and send a message from.",
      aboutImage: "/media/puzzle/img_1995.webp",
      contactEmail: "studio@nexora.gg",
      contactPhone: "+1 415 555 0148",
      contactAddress: "120 Market Street, San Francisco",
      facebook: "https://www.facebook.com/",
      instagram: "https://www.instagram.com/",
      youtube: "https://www.youtube.com/",
      twitter: "https://x.com/",
      discord: "https://discord.com/",
      seoTitle: "Nexora — Gaming promotion",
      seoDescription: "A gaming promotion library of categories, videos, photos, and stories from the Nexora studio.",
      seoKeywords: "gaming, esports, trailers, galleries, game promotion",
    },
  });

  console.log("Seeded the Nexora library.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
