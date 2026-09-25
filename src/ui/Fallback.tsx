import { books } from "../data/books";

export function Fallback() {
  const count = String(books.length).padStart(2, "0");
  const placed = books.length > 0;

  return (
    <main className="fallback">
      <p className="index">{count} / ∞</p>
      <h1>Corpus Daemeticum</h1>
      <p className="lede">
        This hall is a WebGL instrument. The present browser cannot open the
        volume of the library.
      </p>
      <p className="status">
        {placed
          ? `${count} works are placed in the hall.`
          : "The collection has not yet been placed."}
      </p>
    </main>
  );
}
