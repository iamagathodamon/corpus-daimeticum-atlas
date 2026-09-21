export type BuyLink = {
  partner: string;
  url: string;
};

export type Book = {
  title: string;
  author: string;
  slug: string;
  cover: string;
  note: string;
  readUrl?: string;
  buyLinks: BuyLink[];
};
