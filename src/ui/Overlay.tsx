import { useLibrary } from "../state/library";
import { useTraversalLocked } from "../state/traversal";

export function Overlay() {
  const { books, selected, openOnLectern } = useLibrary();
  const locked = useTraversalLocked();
  const canRead = Boolean(selected?.readUrl);
  const canBuy = Boolean(selected && selected.buyLinks.length > 0);
  const canLectern = Boolean(selected);
  const empty = books.length === 0;
  const count = String(books.length).padStart(2, "0");

  return (
    <div className={`overlay${locked ? " is-locked" : ""}`}>
      <header className="masthead">
        <p className="index">{count} / ∞</p>
        <h1>Corpus Daemeticum</h1>
        <p className="eyebrow">Private library of living texts</p>
      </header>

      <p className="click-hint">
        {locked
          ? "WASD · look · Shift"
          : "Click to enter · WASD to walk · Shift"}
      </p>

      <div className="overlay-base">
        <p className="status">
          {empty
            ? "The hall is open. The collection has not yet been placed."
            : selected
              ? `${selected.title}${selected.author ? ` — ${selected.author}` : ""}`
              : "A work may be opened when one is placed."}
        </p>
        {selected?.note ? <p className="note">{selected.note}</p> : null}

        <div className="actions" role="group" aria-label="Reading actions">
          <button
            type="button"
            disabled={!canRead}
            title={
              canRead
                ? "Read this work"
                : "Read will be available when a volume is placed"
            }
            onClick={() => {
              if (selected?.readUrl) {
                window.open(selected.readUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            Read
          </button>
          <button
            type="button"
            disabled={!canBuy}
            title={
              canBuy
                ? "Open a purchase link"
                : "Buy links will be added with the collection"
            }
            onClick={() => {
              const link = selected?.buyLinks[0];
              if (link) {
                window.open(link.url, "_blank", "noopener,noreferrer");
              }
            }}
          >
            Buy
          </button>
          <button
            type="button"
            disabled={!canLectern}
            title={canLectern ? "Open on the lectern" : "Nothing is open yet"}
            onClick={() => openOnLectern(selected)}
          >
            Lectern
          </button>
        </div>
      </div>
    </div>
  );
}
