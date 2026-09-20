export function categoryLabel(category) {
  return category.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function filterReceipts(receipts, { filter = 'all', query = '', sort = 'new' } = {}) {
  const normalizedQuery = query.toLowerCase();
  return receipts
    .filter((receipt) => {
      const searchableText = `${receipt.name} ${receipt.sub} ${receipt.category} ${receipt.place}`.toLowerCase();
      const matchesType = filter === 'all'
        || filter === 'music' && receipt.type === 'music'
        || filter === 'money' && receipt.type === 'money'
        || filter === 'places' && receipt.place;
      return matchesType && searchableText.includes(normalizedQuery);
    })
    .sort((left, right) => sort === 'new' ? right.date - left.date : left.date - right.date);
}