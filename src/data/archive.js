import { clean, parseCsv, safeDate } from './csv.js';

export const sources = {
  transactions: 'Augmented_IndiaTransactMultiFacet2024.csv',
  music: 'spotify_history.csv',
  household: 'Daily Household Transactions.csv'
};

function asTransaction(item) {
  return {
    type: 'money',
    date: safeDate(item.trans_date_trans_time),
    name: clean(item.merchant, `${clean(item.category, 'Everyday')} receipt`),
    sub: `${clean(item.category, 'uncategorised')} · ${clean(item.city, clean(item.state, 'somewhere'))}`,
    amount: item.amt ? `₹${Number(item.amt).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '',
    category: clean(item.category, 'other'),
    icon: '₹',
    place: clean(item.city, clean(item.state, ''))
  };
}

function asMusic(item) {
  const date = safeDate(item.ts);
  return {
    type: 'music',
    date,
    name: clean(item.track_name, 'Untitled track'),
    sub: `${clean(item.artist_name, 'Unknown artist')} · ${Math.round(Number(item.ms_played || 0) / 60000)} min listen`,
    amount: '',
    category: 'music',
    icon: '♫',
    place: '',
    night: date.getHours() >= 20 || date.getHours() < 5
  };
}

function asHousehold(item) {
  return {
    type: 'money',
    date: safeDate(item.Date),
    name: clean(item.Note, clean(item.Subcategory, clean(item.Category, 'Household receipt'))),
    sub: `${clean(item.Category, 'daily life')} · ${clean(item.Mode, 'cash')}`,
    amount: item.Amount ? `₹${Number(item.Amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '',
    category: clean(item.Category, 'other'),
    icon: '₹',
    place: ''
  };
}

async function fetchCsv(path, rowLimit) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}: ${response.status}`);
  if (!rowLimit || !response.body) return parseCsv(await response.text());

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let completeRows = 0;

  while (completeRows <= rowLimit) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    completeRows = text.split('\n').length - 1;
    if (completeRows > rowLimit) {
      reader.releaseLock();
      break;
    }
  }

  const lines = text.split(/\r?\n/).slice(0, rowLimit + 1).join('\n');
  return parseCsv(lines);
}

export async function loadArchive() {
  const [transactionRows, musicRows, householdRows] = await Promise.all([
    fetchCsv(sources.transactions, 420),
    fetchCsv(sources.music, 420),
    fetchCsv(sources.household, 240)
  ]);
  const transactions = transactionRows.filter((item) => safeDate(item.trans_date_trans_time)).map(asTransaction);
  const music = musicRows.filter((item) => safeDate(item.ts)).slice(0, 420).map(asMusic);
  const household = householdRows.filter((item) => safeDate(item.Date)).slice(0, 240).map(asHousehold);

  return [...transactions.slice(0, 420), ...music, ...household]
    .map((receipt, index) => ({ ...receipt, id: index, night: receipt.night || receipt.date.getHours() >= 20 || receipt.date.getHours() < 5 }))
    .sort((left, right) => right.date - left.date);
}