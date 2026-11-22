const S = require('../lib/dp-seasons.js');
const assert = require('assert');
const d = s => S.parse(s);
const id = s => (S.get(d(s)) || {}).id || null;
const fmt = x => x.toISOString().slice(0,10);
// Easter
const known = {2019:'2019-04-21',2022:'2022-04-17',2024:'2024-03-31',2025:'2025-04-20',2026:'2026-04-05',2027:'2027-03-28',2038:'2038-04-25',2285:'2285-03-22'};
for (const y in known) assert.strictEqual(fmt(S.easter(+y)).slice(0,10), known[y], 'easter '+y);
// Advent Sunday
const adv = {'2022-11-27':'advent','2022-11-26':null,'2023-12-03':'advent','2023-12-02':null,'2024-12-01':'advent','2026-11-29':'advent','2026-11-28':null,'2026-12-23':'advent'};
for (const k in adv) assert.strictEqual(id(k), adv[k], k);
assert.strictEqual(S.get(d('2026-12-13')).title, 'Advent · week 3');
const cases = {'2026-12-24':'christmas','2026-12-25':'christmas','2026-12-30':'christmas','2026-12-31':'watchnight','2027-01-01':'newyear','2027-01-03':'newyear','2027-01-04':null,'2027-01-06':'epiphany',
 '2026-04-03':'goodfriday','2026-04-04':null,'2026-04-05':'easter','2026-04-06':'easter','2026-03-29':'palmsunday','2026-03-15':'mothering','2026-05-14':'ascension','2026-05-24':'pentecost','2026-05-31':'trinity',
 '2026-06-21':'fathers','2026-06-12':'democracy','2026-10-01':'independence','2026-10-31':'reformation','2026-05-01':'workers','2027-05-27':'children','2026-11-22':null};
for (const k in cases) assert.strictEqual(id(k), cases[k], k);
// Every year 1990-2100: no greeting that starts after it ends, Easter always a Sunday in Mar/Apr
for (let y=1990;y<=2100;y++){ const e=S.easter(y); assert(e.getDay()===0 && (e.getMonth()===2||e.getMonth()===3), 'e'+y);
  for (const s of S.year(y)) assert(s.from<=s.to, s.id+y); }
// Solemn days never say Happy
for (const s of S.year(2026)) if (s.kind==='solemn') assert(!/happy|merry/i.test(s.title+s.line));
console.log('seasons: all tests passed');
for (const s of S.year(2027)) console.log(fmt(s.from), fmt(s.to), s.id.padEnd(13), s.title);
// Eid windows cover the official Nigerian dates
const eid = {'2025-03-30':'eidfitr','2025-03-31':'eidfitr','2025-06-06':'eidadha','2026-03-20':'eidfitr','2026-05-27':'eidadha','2026-05-28':'eidadha','2027-03-10':'eidfitr','2027-05-18':'eidadha','2027-05-16':'pentecost'};
for (const k in eid) assert.strictEqual(id(k), eid[k], k);
// Two Eid al-Fitrs in 2033 (Jan and Dec)
assert.strictEqual(S.year(2033).filter(s=>s.id==='eidfitr').length, 2);
assert.strictEqual(id('2027-01-15'),'remembrance'); assert.strictEqual(id('2027-10-05'),'teachers');
// Every greeting has three colours, and church feasts outrank Eid (Easter 2023 vs Eid Apr 21 2023 doesn't overlap, check a constructed overlap year)
for (let y=2000;y<=2060;y++) for (const s of S.year(y)) assert(s.colors && s.colors.length===3 && s.accent===s.colors[0], s.id+y);
for (let y=2000;y<=2060;y++) assert.strictEqual(S.get(S.easter(y)).id,'easter', 'easter wins '+y);
console.log('eid + colours: passed');
