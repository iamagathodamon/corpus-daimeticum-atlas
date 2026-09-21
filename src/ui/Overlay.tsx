import { useLibrary } from "../state/library";

export function Overlay() {
  const { books, selected, openOnLectern } = useLibrary();
  const canRead = Boolean(selected?.readUrl);
  const canBuy = Boolean(selected && selected.buyLinks.length > 0);
  const canLectern = Boolean(selected);
  const empty = books.length === 0;

  return (
    <div className="overlay">
      <header className="masthead">
        <p className="eyebrow">Private library</p>
        <h1>Corpus Daemeticum</h1>
      </header>

      <div className="overlay-base">
        <p className="status">
          {empty
            ? "The shelves are empty. Awaiting the collection."
            : selected
              ? `${selected.title}${selected.author ? ` — ${selected.author}` : ""}`
              : "A volume may be drawn when one is placed."}
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
            title={
              canLectern
                ? "Open on the lectern"
                : "The lectern is empty"
            }
            onClick={() => openOnLectern(selected)}
          >
            Lectern
          </button>
        </div>
      </div>
    </div>
  );
}
