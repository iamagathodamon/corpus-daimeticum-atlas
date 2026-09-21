# Corpus Daemeticum

A private Three.js reading room. The shelves begin empty — awaiting the collection.

This replaces the former atlas / catalogue surface. There are no sample books.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

`npm run build` type-checks and writes a production bundle to `dist/`.

## How to add a book later

The collection is a single array in [`src/data/books.ts`](src/data/books.ts). It ships as `[]`. Do not invent placeholder works.

Each entry uses this shape:

```ts
{
  title: "Title of the work",
  author: "Author or translator",
  slug: "title-of-the-work",
  cover: "/covers/title-of-the-work.jpg",
  note: "A short private note.",
  readUrl: "https://example.com/read", // optional
  buyLinks: [
    { partner: "Partner name", url: "https://example.com/buy" },
  ],
}
```

Put cover images in `public/covers/`. A volume is drawn onto the next empty shelf slot in order. The overlay’s Read / Buy / Lectern controls stay dormant until a real volume is selected.

Affiliate or partner tracking on `buyLinks` comes next. Do not add tracking parameters until that programme is ready.

## Notes

- WebGL is required for the room. Browsers without it see a quiet fallback message.
- Narrow or low-memory devices get a reduced scene: fewer effects, no intro dolly, simpler glass.
- The brand spelling is **Daemeticum** (with *e*).
