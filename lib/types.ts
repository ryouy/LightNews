export type NewsItem = {
  title: string;
  url: string;
  body: string;
  source: "yahoo";
  /** 配信元・媒体名（一覧から抽出。無い場合は空） */
  outlet: string;
  publishedAt: string;
};
