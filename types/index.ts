export type SearchSuggestion = (chrome.history.HistoryItem | chrome.bookmarks.BookmarkTreeNode) & {
  type: 'history' | 'bookmark';
}
