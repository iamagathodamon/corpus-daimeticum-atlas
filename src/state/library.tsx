import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { books } from "../data/books";
import type { Book } from "../types/book";

type LibraryState = {
  books: Book[];
  selected: Book | null;
  onLectern: Book | null;
  select: (book: Book | null) => void;
  openOnLectern: (book: Book | null) => void;
};

const LibraryContext = createContext<LibraryState | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Book | null>(null);
  const [onLectern, setOnLectern] = useState<Book | null>(null);

  const select = useCallback((book: Book | null) => {
    setSelected(book);
  }, []);

  const openOnLectern = useCallback((book: Book | null) => {
    setOnLectern(book);
    setSelected(book);
  }, []);

  const value = useMemo(
    () => ({
      books,
      selected,
      onLectern,
      select,
      openOnLectern,
    }),
    [selected, onLectern, select, openOnLectern],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryState {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return context;
}
