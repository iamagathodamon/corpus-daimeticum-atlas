# Corpus Daemeticum

A navigable WebGL hall for a private library of living texts. The hall holds Damon Rolnick’s twenty-five-title collection.

You move through a vast architectural volume — threshold, atrium, light well, grand stair — rather than sitting in a room or orbiting a field. This replaces the former atlas, the rejected wooden reading room, and the rejected cosmic field.

There are no sampler stand-ins. The catalogue is the twenty-five titles Damon named.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Click the hall, then walk with WASD (Shift to move faster).

```bash
npm run build
npm run preview
```

`npm run build` type-checks and writes a production bundle to `dist/`.

Capture views:

- `/?view=atrium` — standing in the hall, looking toward the light
- `/?view=traverse` — mid-ascent on the processional stair
- `/?fallback=1` — the non-WebGL page

## How to add a book later

The collection is a single array in [`src/data/books.ts`](src/data/books.ts). It holds the twenty-five titles from Damon’s catalogue. Do not add works that are not in that catalogue.

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

Put cover images in `public/covers/`. A volume appears as an architectural locus in the hall, not a shelf object. The overlay’s Read / Buy / Lectern controls stay dormant until a real volume is selected.

Affiliate or partner tracking on `buyLinks` comes next. Do not add tracking parameters until that programme is ready.

## Notes

- WebGL is required. Browsers without it see a quiet fallback.
- Narrow or low-memory devices drop the reflector floor, shadow maps, and post.
- The brand spelling is **Daemeticum** (with *e*).
