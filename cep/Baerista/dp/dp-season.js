/* DesignPraise seasons — greetings for the Christian year and Nigerian public days.
 *
 * One source for everything: build.py injects it into the ScriptUI core (ExtendScript, ES3),
 * copies it into every CEP panel (dp/dp-seasons.js) and into the website (/seasons.js).
 * Keep it ES3: no let/const, arrow functions, forEach, JSON or trailing commas.
 *
 * Which days: the evangelical feasts the Second Helvetic Confession (ch. 24) commends —
 * the Lord's nativity, passion, resurrection, ascension and the sending of the Spirit —
 * plus Advent, Reformation Day, the turn of the year and Nigerian civic days. Saints' days are left out.
 * Scripture is the King James Version (public domain).
 *
 * DPSeasons.get(date?) -> null or { id, kind, title, line, ref, verse, accent, from, to }
 *   kind: "feast" | "solemn" | "season" | "civic"   (solemn days never say "Happy")
 */
var DPSeasons = (function () {
    var DAY = 86400000;

    function ymd(y, m, d) { return new Date(y, m - 1, d, 12, 0, 0); }   // noon, so DST never shifts the day
    function add(dt, n) { return new Date(dt.getTime() + n * DAY); }
    function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function within(dt, a, b) { var t = ymd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()).getTime(); return t >= a.getTime() && t <= b.getTime(); }

    // Western Easter (Anonymous Gregorian algorithm).
    function easter(y) {
        var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
        var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
        var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
        var month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
        return ymd(y, month, day);
    }
    // nth Sunday of a month (n = 1..5)
    function nthSunday(y, m, n) { var first = ymd(y, m, 1); return add(first, (7 - first.getDay()) % 7 + (n - 1) * 7); }
    // Advent Sunday: the fourth Sunday before Christmas Day.
    function adventSunday(y) { var xmas = ymd(y, 12, 25); var back = xmas.getDay() === 0 ? 7 : xmas.getDay(); return add(xmas, -back - 21); }

    // Islamic (tabular) calendar -> local Date. Moon sighting in Nigeria can move the real day by one,
    // so the Eid greetings below run from the day before to the day after.
    function hijri(y, m, d) {
        var jd = d + Math.ceil(29.5 * (m - 1)) + (y - 1) * 354 + Math.floor((3 + 11 * y) / 30) + 1948438.5;
        var t = new Date((jd - 2440587.5) * DAY);
        return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
    }
    // Every date in Gregorian year gy that is month/day in the Hijri calendar (usually one; about every 33 years, two).
    function hijriIn(gy, m, d) {
        var hy = Math.floor((gy - 622) * 33 / 32), out = [];
        for (var k = hy - 1; k <= hy + 2; k++) { var dt = hijri(k, m, d); if (dt.getFullYear() === gy) out.push(dt); }
        return out;
    }

    var NG_GREEN = "#03ee63", AMBER = "#ffa800", LILAC = "#a57bff", AQUA = "#03eed8", MUTE = "";

    // Colours for each day: [main, second, third]. The main colour is the accent everywhere (gem, text, tints).
    // Church days follow the liturgical colours (violet, white and gold, red, black); civic days use Nigeria's green.
    var COLORS = {
        advent:      ["#7c4dff", "#ffc44d", "#2f9e64"],   // violet, candle flame, wreath
        christmas:   ["#ffb400", "#d6283f", "#1f9d6b"],   // gold, red, evergreen
        watchnight:  ["#ffd35a", "#27306e", "#a57bff"],   // lamp gold, midnight
        newyear:     ["#03d9c5", "#ffa800", "#7c4dff"],   // dawn aqua, sun
        epiphany:    ["#ffc93c", "#3a4fd0", "#a57bff"],   // star gold, night blue
        mothering:   ["#f06595", "#ffc2d6", "#40c057"],   // rose, blossom, stem
        palmsunday:  ["#2fb344", "#a9e34b", "#c92a2a"],   // palm greens, passion red
        goodfriday:  ["#9b2335", "#3b3546", "#b9b0d6"],   // crimson, ash
        easter:      ["#ffb400", "#2fb36b", "#ff8fa3"],   // gold, new life, dawn
        ascension:   ["#4dabf7", "#ffd35a", "#d0ebff"],   // sky, glory
        pentecost:   ["#f03e3e", "#ff922b", "#ffd43b"],   // flame reds
        trinity:     ["#7c4dff", "#4dabf7", "#ffc93c"],   // three in one
        reformation: ["#e03131", "#e9d8b4", "#5c3d1e"],   // Reformation red, parchment, ink
        remembrance: ["#e03131", "#2b2b33", "#2f9e64"],   // poppy, black, green
        workers:     ["#f76707", "#868e96", "#ffd43b"],   // safety orange, steel
        children:    ["#fab005", "#4dabf7", "#ff6b6b"],   // play colours
        democracy:   ["#12b886", "#ffffff", "#ffd43b"],   // green-white
        fathers:     ["#1c7ed6", "#2f9e44", "#ffa800"],   // blue, oak
        independence:["#12b886", "#ffffff", "#0b7a4b"],   // green-white-green
        teachers:    ["#ffa800", "#7c4dff", "#03d9c5"],   // chalk and light
        eidfitr:     ["#16a34a", "#ffc44d", "#e9d8b4"],   // green, gold, table
        eidadha:     ["#16a34a", "#ffc44d", "#e9d8b4"]
    };

    // Ordered by priority: the first match wins when two days meet.
    function table(y) {
        var e = easter(y), adv = adventSunday(y);
        var fitr = hijriIn(y, 10, 1), adha = hijriIn(y, 12, 10);
        var list = [
            { id: "goodfriday", kind: "solemn", from: add(e, -2), to: add(e, -2), title: "Good Friday", accent: MUTE,
              line: "Remembering the cross, where Christ gave himself for us.",
              ref: "Isaiah 53:5", verse: "He was wounded for our transgressions, he was bruised for our iniquities… and with his stripes we are healed." },
            { id: "easter", kind: "feast", from: e, to: add(e, 1), title: "Happy Easter", accent: AMBER,
              line: "Christ is risen. Death did not have the last word.",
              ref: "Matthew 28:6", verse: "He is not here: for he is risen, as he said." },
            { id: "palmsunday", kind: "feast", from: add(e, -7), to: add(e, -7), title: "Palm Sunday", accent: LILAC,
              line: "The King came riding in humility.",
              ref: "Matthew 21:9", verse: "Hosanna to the Son of David: Blessed is he that cometh in the name of the Lord." },
            { id: "ascension", kind: "feast", from: add(e, 39), to: add(e, 39), title: "Ascension Day", accent: LILAC,
              line: "Christ reigns, and he is coming again.",
              ref: "Acts 1:11", verse: "This same Jesus, which is taken up from you into heaven, shall so come in like manner as ye have seen him go into heaven." },
            { id: "pentecost", kind: "feast", from: add(e, 49), to: add(e, 50), title: "Pentecost", accent: AMBER,
              line: "Celebrating the gift of the Holy Spirit.",
              ref: "Acts 2:4", verse: "And they were all filled with the Holy Ghost." },
            { id: "trinity", kind: "feast", from: add(e, 56), to: add(e, 56), title: "Trinity Sunday", accent: LILAC,
              line: "One God, Father, Son and Holy Spirit.",
              ref: "2 Corinthians 13:14", verse: "The grace of the Lord Jesus Christ, and the love of God, and the communion of the Holy Ghost, be with you all." },
            { id: "christmas", kind: "feast", from: ymd(y, 12, 24), to: ymd(y, 12, 30), title: "Merry Christmas", accent: AMBER,
              line: "God with us. Joy to you and yours this Christmas.",
              ref: "Luke 2:11", verse: "For unto you is born this day in the city of David a Saviour, which is Christ the Lord." },
            { id: "advent", kind: "season", from: adv, to: ymd(y, 12, 23), title: "Advent", accent: LILAC,
              line: "Waiting, with hope, for the coming of Christ.",
              ref: "Isaiah 9:2", verse: "The people that walked in darkness have seen a great light." },
            { id: "watchnight", kind: "season", from: ymd(y, 12, 31), to: ymd(y, 12, 31), title: "Goodbye, " + y, accent: AQUA,
              line: "Thank you for this year. See you in the next.",
              ref: "Psalm 90:12", verse: "So teach us to number our days, that we may apply our hearts unto wisdom." },
            { id: "newyear", kind: "feast", from: ymd(y, 1, 1), to: ymd(y, 1, 3), title: "Happy New Year", accent: AQUA,
              line: "A new year to make good things, by God’s mercy.",
              ref: "Lamentations 3:22–23", verse: "His compassions fail not. They are new every morning: great is thy faithfulness." },
            { id: "epiphany", kind: "feast", from: ymd(y, 1, 6), to: ymd(y, 1, 6), title: "Epiphany", accent: AMBER,
              line: "The light of Christ, shown to every nation.",
              ref: "Isaiah 60:3", verse: "And the Gentiles shall come to thy light, and kings to the brightness of thy rising." },
            { id: "reformation", kind: "feast", from: ymd(y, 10, 31), to: ymd(y, 10, 31), title: "Reformation Day", accent: AMBER,
              line: "Giving thanks for the recovery of the gospel of grace.",
              ref: "Romans 1:17", verse: "The just shall live by faith." },
            { id: "mothering", kind: "civic", from: add(e, -21), to: add(e, -21), title: "Happy Mothering Sunday", accent: LILAC,
              line: "To every mother: thank you.",
              ref: "Proverbs 31:28", verse: "Her children arise up, and call her blessed." },
            { id: "fathers", kind: "civic", from: nthSunday(y, 6, 3), to: nthSunday(y, 6, 3), title: "Happy Father’s Day", accent: LILAC,
              line: "To every father: thank you.",
              ref: "Psalm 103:13", verse: "Like as a father pitieth his children, so the LORD pitieth them that fear him." },
            { id: "independence", kind: "civic", from: ymd(y, 10, 1), to: ymd(y, 10, 1), title: "Happy Independence Day, Nigeria", accent: NG_GREEN,
              line: "Praying for peace and good leadership across our land.",
              ref: "Psalm 33:12", verse: "Blessed is the nation whose God is the LORD." },
            { id: "democracy", kind: "civic", from: ymd(y, 6, 12), to: ymd(y, 6, 12), title: "Happy Democracy Day", accent: NG_GREEN,
              line: "Praying for justice and freedom in Nigeria.",
              ref: "Proverbs 14:34", verse: "Righteousness exalteth a nation." },
            { id: "workers", kind: "civic", from: ymd(y, 5, 1), to: ymd(y, 5, 1), title: "Happy Workers’ Day", accent: NG_GREEN,
              line: "Here’s to everyone who builds, mends and makes.",
              ref: "Colossians 3:23", verse: "And whatsoever ye do, do it heartily, as to the Lord, and not unto men." },
            { id: "children", kind: "civic", from: ymd(y, 5, 27), to: ymd(y, 5, 27), title: "Happy Children’s Day", accent: NG_GREEN,
              line: "Every child is a gift.",
              ref: "Psalm 127:3", verse: "Lo, children are an heritage of the LORD." },
            { id: "remembrance", kind: "solemn", from: ymd(y, 1, 15), to: ymd(y, 1, 15), title: "Armed Forces Remembrance Day", accent: "",
              line: "Remembering those who served and gave their lives for Nigeria.",
              ref: "John 15:13", verse: "Greater love hath no man than this, that a man lay down his life for his friends." },
            { id: "teachers", kind: "civic", from: ymd(y, 10, 5), to: ymd(y, 10, 5), title: "Happy Teachers\u2019 Day", accent: "",
              line: "To everyone who teaches, and to the ones who taught me: thank you.",
              ref: "Proverbs 9:9", verse: "Give instruction to a wise man, and he will be yet wiser: teach a just man, and he will increase in learning." }
        ];
        // Neighbourly greetings for Nigeria's Muslim public holidays: a wish of peace to neighbours,
        // with a verse on loving one's neighbour. (Eid-el-Maulud is left out: it honours Muhammad as prophet.)
        for (var f = 0; f < fitr.length; f++) list.push({ id: "eidfitr", kind: "neighbour", from: add(fitr[f], -1), to: add(fitr[f], 1), title: "Eid al-Fitr", accent: "",
              line: "Wishing our Muslim neighbours a peaceful holiday with family and friends.",
              ref: "Romans 12:18", verse: "If it be possible, as much as lieth in you, live peaceably with all men." });
        for (var a = 0; a < adha.length; a++) list.push({ id: "eidadha", kind: "neighbour", from: add(adha[a], -1), to: add(adha[a], 1), title: "Eid al-Adha", accent: "",
              line: "Wishing our Muslim neighbours a peaceful holiday with family and friends.",
              ref: "Matthew 22:39", verse: "Thou shalt love thy neighbour as thyself." });
        // Neighbour greetings sit after the church year but before the civic days (Children's Day can share a date with Eid).
        var ordered = [], late = [];
        for (var i = 0; i < list.length; i++) {
            var it = list[i];
            if (it.kind === "civic" || it.id === "remembrance") late.push(it); else ordered.push(it);
        }
        list = ordered.concat(late);
        for (var j = 0; j < list.length; j++) {
            var c = COLORS[list[j].id];
            list[j].colors = c;
            list[j].accent = c[0];
        }
        return list;
    }

    function get(date) {
        var dt = date || new Date();
        var list = table(dt.getFullYear());
        for (var i = 0; i < list.length; i++) {
            var s = list[i];
            if (within(dt, s.from, s.to)) {
                var out = {};
                for (var k in s) if (s.hasOwnProperty(k)) out[k] = s[k];
                if (s.id === "advent") {
                    var week = Math.floor((ymd(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()).getTime() - s.from.getTime()) / (7 * DAY)) + 1;
                    out.title = "Advent · week " + week;
                    out.week = week;
                }
                out.key = s.id + "-" + dt.getFullYear();   // stable per season per year (for "dismissed" flags)
                return out;
            }
        }
        return null;
    }

    // "2026-12-25" -> Date at local noon (for previews and tests).
    function parse(s) {
        var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || ""));
        return m ? ymd(+m[1], +m[2], +m[3]) : null;
    }

    // Every greeting in a year, in date order (handy for checking the calendar).
    function year(y) {
        var list = table(y), out = [];
        for (var i = 0; i < list.length; i++) out.push(list[i]);
        out.sort(function (a, b) { return a.from.getTime() - b.from.getTime(); });
        return out;
    }

    return { get: get, parse: parse, year: year, easter: easter, same: same };
})();
if (typeof module !== "undefined" && module.exports) module.exports = DPSeasons;

/* DesignPraise seasons — one small illustration per special day, drawn in that day's colours.
 * Shared by the CEP panels (dp/dp-season.js), the website (/js/seasons-art.js) and the PNGs build.py
 * makes for ScriptUI tools and emails. Original artwork; flat shapes on a 120 x 120 grid.
 *
 * DPSeasonArt.svg(season, ink?) -> "<svg …>" string. ink = colour for outlines (defaults to currentColor).
 */
var DPSeasonArt = (function () {
    function star4(cx, cy, r, w, fill) {   // four-point sparkle
        return '<path d="M' + cx + ' ' + (cy - r) + 'Q' + cx + ' ' + cy + ' ' + (cx + w) + ' ' + cy + 'Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy + r) +
            'Q' + cx + ' ' + cy + ' ' + (cx - w) + ' ' + cy + 'Q' + cx + ' ' + cy + ' ' + cx + ' ' + (cy - r) + 'Z" fill="' + fill + '"/>';
    }
    function flame(cx, base, h, fill) {
        var t = base - h;
        return '<path d="M' + cx + ' ' + t + 'C' + (cx + h * .42) + ' ' + (t + h * .45) + ' ' + (cx + h * .34) + ' ' + base + ' ' + cx + ' ' + base +
            'C' + (cx - h * .34) + ' ' + base + ' ' + (cx - h * .42) + ' ' + (t + h * .45) + ' ' + cx + ' ' + t + 'Z" fill="' + fill + '"/>';
    }
    function gear(cx, cy, r, teeth, fill) {
        var d = '', n = teeth * 2;
        for (var i = 0; i < n; i++) {
            var a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2, rr = i % 2 ? r * .8 : r;
            d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a0)).toFixed(1) + ' ' + (cy + rr * Math.sin(a0)).toFixed(1) +
                 'L' + (cx + rr * Math.cos(a1)).toFixed(1) + ' ' + (cy + rr * Math.sin(a1)).toFixed(1);
        }
        var h = r * .34;   // centre hole, cut out with even-odd so it works on any background
        d += 'Z M' + (cx + h) + ' ' + cy + 'A' + h + ' ' + h + ' 0 1 0 ' + (cx - h) + ' ' + cy + 'A' + h + ' ' + h + ' 0 1 0 ' + (cx + h) + ' ' + cy + 'Z';
        return '<path d="' + d + '" fill="' + fill + '" fill-rule="evenodd"/>';
    }
    function flower(cx, cy, r, petal, mid) {
        var s = '';
        for (var i = 0; i < 5; i++) {
            var a = -Math.PI / 2 + i * Math.PI * 2 / 5;
            s += '<circle cx="' + (cx + r * Math.cos(a)).toFixed(1) + '" cy="' + (cy + r * Math.sin(a)).toFixed(1) + '" r="' + (r * .78).toFixed(1) + '" fill="' + petal + '"/>';
        }
        return s + '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * .55).toFixed(1) + '" fill="' + mid + '"/>';
    }
    function frond(x0, y0, x1, y1, bend, col, n, len) {
        // a palm frond: a curved stem with leaflets on both sides
        var mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2 - bend * .3, s = '<path d="M' + x0 + ' ' + y0 + 'Q' + mx + ' ' + my + ' ' + x1 + ' ' + y1 + '" stroke="' + col + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
        for (var i = 2; i < n; i++) {
            var t = i / n, u = 1 - t;
            var px = u * u * x0 + 2 * u * t * mx + t * t * x1, py = u * u * y0 + 2 * u * t * my + t * t * y1;
            var dx = 2 * u * (mx - x0) + 2 * t * (x1 - mx), dy = 2 * u * (my - y0) + 2 * t * (y1 - my), L = Math.sqrt(dx * dx + dy * dy);
            var nx = -dy / L, ny = dx / L, l = len * (1 - t * .55);
            for (var k = -1; k <= 1; k += 2) {
                s += '<path d="M' + px.toFixed(1) + ' ' + py.toFixed(1) + 'L' + (px + (nx * k + dx / L * .55) * l).toFixed(1) + ' ' + (py + (ny * k + dy / L * .55) * l).toFixed(1) +
                    '" stroke="' + col + '" stroke-width="3" stroke-linecap="round"/>';
            }
        }
        return s;
    }

    var ART = {
        advent: function (c, ink, s) {
            var lit = Math.max(1, Math.min(4, s.week || 1)), xs = [30, 48, 66, 84], hs = [38, 46, 46, 38], out = '';
            for (var i = 0; i < 4; i++) {
                var top = 92 - hs[i], col = i === 2 ? '#f06595' : c[0];
                out += '<rect x="' + (xs[i] - 6) + '" y="' + top + '" width="12" height="' + hs[i] + '" rx="3" fill="' + col + '"/>';
                out += i < lit ? flame(xs[i], top - 2, 15, c[1]) : '<path d="M' + xs[i] + ' ' + (top - 1) + 'v-6" stroke="' + ink + '" stroke-width="2" stroke-linecap="round" opacity=".5"/>';
            }
            return out + '<ellipse cx="60" cy="94" rx="44" ry="11" fill="none" stroke="' + c[2] + '" stroke-width="8"/>' +
                '<circle cx="22" cy="98" r="3.2" fill="#d6283f"/><circle cx="98" cy="90" r="3.2" fill="#d6283f"/><circle cx="60" cy="105" r="3.2" fill="#d6283f"/>';
        },
        christmas: function (c, ink) {
            return '<path d="M60 4 L66 30 L90 36 L66 42 L60 72 L54 42 L30 36 L54 30 Z" fill="' + c[0] + '"/>' +
                star4(24, 18, 6, 4, c[0]) + star4(98, 54, 5, 3.5, c[0]) +
                '<path d="M30 110 V92 L60 74 L90 92 V110" fill="none" stroke="' + c[1] + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>' +
                '<ellipse cx="60" cy="94" rx="9" ry="5" fill="' + c[0] + '"/>' +
                '<path d="M45 96 H75 L70 104 H50 Z" fill="' + c[2] + '"/>' +
                '<path d="M52 103 L47 110 M68 103 L73 110" stroke="' + c[2] + '" stroke-width="4" stroke-linecap="round"/>';
        },
        watchnight: function (c, ink) {
            return '<circle cx="60" cy="60" r="50" fill="' + c[1] + '"/>' + star4(28, 34, 5, 3.5, c[2]) + star4(92, 30, 4, 3, c[2]) + star4(88, 86, 4, 3, c[2]) +
                '<path d="M40 30 H80 M40 90 H80" stroke="' + c[0] + '" stroke-width="5" stroke-linecap="round"/>' +
                '<path d="M45 31 C45 48 58 52 58 60 C58 68 45 72 45 89 M75 31 C75 48 62 52 62 60 C62 68 75 72 75 89" fill="none" stroke="' + c[0] + '" stroke-width="3.5" stroke-linecap="round"/>' +
                '<path d="M50 42 H70 C68 50 62 54 60 58 C58 54 52 50 50 42 Z" fill="' + c[0] + '" opacity=".55"/>' +
                '<path d="M60 64 V74 M48 88 C50 80 56 76 60 76 C64 76 70 80 72 88 Z" fill="' + c[0] + '" stroke="' + c[0] + '" stroke-width="2.5" stroke-linecap="round"/>';
        },
        newyear: function (c, ink) {
            var rays = '';
            for (var i = 0; i < 9; i++) {
                var a = Math.PI + (i + .5) * Math.PI / 9, x1 = 60 + 34 * Math.cos(a), y1 = 82 + 34 * Math.sin(a), x2 = 60 + 48 * Math.cos(a), y2 = 82 + 48 * Math.sin(a);
                rays += '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" stroke="' + c[1] + '" stroke-width="5" stroke-linecap="round"/>';
            }
            return rays + '<path d="M32 82 A28 28 0 0 1 88 82 Z" fill="' + c[1] + '"/>' +
                '<path d="M10 82 H110" stroke="' + c[0] + '" stroke-width="5" stroke-linecap="round"/><path d="M26 96 H94 M44 108 H76" stroke="' + c[0] + '" stroke-width="5" stroke-linecap="round" opacity=".55"/>' +
                star4(22, 26, 8, 5, c[2]) + star4(100, 20, 6, 4, c[0]) + star4(104, 54, 4, 3, c[2]);
        },
        epiphany: function (c, ink) {
            var big = '';
            for (var i = 0; i < 8; i++) {
                var a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 16 : 30;
                big += (i ? 'L' : 'M') + (64 + r * Math.cos(a)).toFixed(1) + ' ' + (36 + r * Math.sin(a)).toFixed(1) + 'L' + (64 + 6 * Math.cos(a + Math.PI / 8)).toFixed(1) + ' ' + (36 + 6 * Math.sin(a + Math.PI / 8)).toFixed(1);
            }
            return '<path d="' + big + 'Z" fill="' + c[0] + '"/>' +
                '<path d="M14 108 C34 104 40 90 56 86 C70 82 72 72 64 68" fill="none" stroke="' + c[1] + '" stroke-width="4" stroke-dasharray="1 9" stroke-linecap="round"/>' +
                '<circle cx="14" cy="108" r="5" fill="' + c[2] + '"/><circle cx="26" cy="106" r="5" fill="' + c[0] + '"/><circle cx="38" cy="100" r="5" fill="' + c[1] + '"/>' +
                star4(22, 22, 5, 3.5, c[2]) + star4(102, 70, 5, 3.5, c[2]);
        },
        mothering: function (c, ink) {
            return '<path d="M60 112 C60 90 58 70 60 52 M60 112 C58 96 44 84 34 70 M60 112 C64 96 78 82 88 66" fill="none" stroke="' + c[2] + '" stroke-width="4" stroke-linecap="round"/>' +
                '<path d="M60 92 C50 88 44 80 46 74 C54 76 58 84 60 92 Z" fill="' + c[2] + '"/>' +
                flower(60, 40, 12, c[0], c[1]) + flower(32, 62, 9, c[1], c[0]) + flower(90, 58, 9, c[1], c[0]);
        },
        palmsunday: function (c, ink) {
            return frond(30, 112, 86, 16, 18, c[0], 11, 18) + frond(92, 112, 40, 20, -18, c[1], 10, 16) +
                '<path d="M54 92 C60 86 66 86 70 92 C64 98 58 98 54 92 Z" fill="' + c[2] + '"/><path d="M58 96 L52 108 M66 96 L72 108" stroke="' + c[2] + '" stroke-width="4" stroke-linecap="round"/>';
        },
        goodfriday: function (c, ink) {
            return '<circle cx="60" cy="58" r="36" fill="' + c[0] + '"/>' +
                '<path d="M4 112 C30 94 50 88 60 88 C72 88 92 96 116 112 Z" fill="' + c[1] + '"/>' +
                '<rect x="56" y="18" width="8" height="74" rx="1.5" fill="' + c[1] + '"/><rect x="38" y="38" width="44" height="8" rx="1.5" fill="' + c[1] + '"/>';
        },
        easter: function (c, ink) {
            var rays = '';
            for (var i = 0; i < 7; i++) {
                var a = -Math.PI + (i + 1) * Math.PI / 8;
                rays += '<path d="M' + (60 + 26 * Math.cos(a)).toFixed(1) + ' ' + (58 + 26 * Math.sin(a)).toFixed(1) + 'L' + (60 + 44 * Math.cos(a)).toFixed(1) + ' ' + (58 + 44 * Math.sin(a)).toFixed(1) + '" stroke="' + c[0] + '" stroke-width="5" stroke-linecap="round"/>';
            }
            return rays + '<circle cx="60" cy="58" r="18" fill="' + c[0] + '"/>' +
                '<path d="M2 114 C20 74 100 74 118 114 Z" fill="' + c[1] + '"/>' +
                '<path d="M40 112 V98 A12 12 0 0 1 64 98 V112 Z" fill="#1a0d3e" opacity=".82"/>' +
                '<circle cx="82" cy="100" r="12" fill="#cfc8e6"/><circle cx="82" cy="100" r="5" fill="none" stroke="#a49cc4" stroke-width="2.5"/>' +
                flower(24, 104, 3.5, c[2], c[0]) + flower(104, 108, 3, c[2], c[0]);
        },
        ascension: function (c, ink) {
            var rays = '';
            for (var i = -2; i <= 2; i++) rays += '<path d="M' + (60 + i * 9) + ' 62 L' + (60 + i * 22) + ' ' + (14 + Math.abs(i) * 6) + '" stroke="' + c[1] + '" stroke-width="' + (i ? 4 : 5) + '" stroke-linecap="round"/>';
            return rays + star4(60, 10, 7, 5, c[1]) +
                '<path d="M20 98 C10 98 10 82 24 82 C24 70 42 66 48 76 C52 64 74 64 76 78 C90 72 102 84 96 98 Z" fill="' + c[2] + '" stroke="' + c[0] + '" stroke-width="4" stroke-linejoin="round"/>' +
                '<path d="M30 108 H90" stroke="' + c[0] + '" stroke-width="4" stroke-linecap="round" opacity=".5"/>';
        },
        pentecost: function (c, ink) {
            return flame(34, 102, 50, c[1]) + flame(86, 102, 50, c[1]) + flame(60, 104, 76, c[0]) +
                flame(60, 104, 40, c[2]) + flame(34, 102, 24, c[2]) + flame(86, 102, 24, c[2]) +
                '<path d="M22 110 H98" stroke="' + c[0] + '" stroke-width="4" stroke-linecap="round" opacity=".5"/>';
        },
        trinity: function (c, ink) {
            return '<g fill="none" stroke-width="7" style="mix-blend-mode:normal">' +
                '<circle cx="60" cy="42" r="26" stroke="' + c[0] + '"/><circle cx="44" cy="70" r="26" stroke="' + c[1] + '"/><circle cx="76" cy="70" r="26" stroke="' + c[2] + '"/></g>' +
                '<circle cx="60" cy="60" r="5" fill="' + c[0] + '"/>';
        },
        reformation: function (c, ink) {
            var rays = '';
            for (var i = -3; i <= 3; i++) {
                var a = -Math.PI / 2 + i * .32;
                rays += '<path d="M' + (60 + 30 * Math.cos(a)).toFixed(1) + ' ' + (60 + 30 * Math.sin(a)).toFixed(1) + 'L' + (60 + 50 * Math.cos(a)).toFixed(1) + ' ' + (60 + 50 * Math.sin(a)).toFixed(1) + '" stroke="' + c[0] + '" stroke-width="4.5" stroke-linecap="round"/>';
            }
            return rays + flame(60, 52, 22, c[0]) +
                '<path d="M60 70 C48 62 30 60 14 64 V104 C30 100 48 102 60 110 Z" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-width="3.5" stroke-linejoin="round"/>' +
                '<path d="M60 70 C72 62 90 60 106 64 V104 C90 100 72 102 60 110 Z" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-width="3.5" stroke-linejoin="round"/>' +
                '<path d="M24 76 C34 74 44 75 52 79 M24 86 C34 84 44 85 52 89 M68 79 C76 75 86 74 96 76 M68 89 C76 85 86 84 96 86" stroke="' + c[2] + '" stroke-width="2.5" stroke-linecap="round" opacity=".55" fill="none"/>' +
                '<path d="M64 106 V118 L68 114 L72 118 V103" fill="' + c[0] + '"/>';
        },
        remembrance: function (c, ink) {
            var petals = '';
            for (var i = 0; i < 4; i++) {
                var a = Math.PI / 4 + i * Math.PI / 2;
                petals += '<circle cx="' + (60 + 15 * Math.cos(a)).toFixed(1) + '" cy="' + (44 + 15 * Math.sin(a)).toFixed(1) + '" r="19" fill="' + c[0] + '"/>';
            }
            return '<path d="M60 64 C62 82 58 96 62 114" stroke="' + c[2] + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
                '<path d="M61 92 C70 82 84 82 90 86 C82 94 70 96 61 92 Z" fill="' + c[2] + '"/>' + petals +
                '<circle cx="60" cy="44" r="9" fill="' + c[1] + '"/>' + '<circle cx="60" cy="44" r="3" fill="' + c[0] + '" opacity=".6"/>';
        },
        workers: function (c, ink) {
            return gear(50, 54, 34, 9, c[1]) +
                '<g transform="rotate(40 88 82)"><rect x="84" y="70" width="8" height="46" rx="4" fill="' + c[0] + '"/>' +
                '<rect x="70" y="58" width="36" height="16" rx="4" fill="' + c[0] + '"/><rect x="70" y="58" width="10" height="16" rx="3" fill="' + c[2] + '"/></g>' +
                star4(18, 102, 6, 4, c[2]);
        },
        children: function (c, ink) {
            return '<path d="M74 10 L100 38 L74 66 L48 38 Z" fill="' + c[1] + '"/><path d="M74 10 V66 M48 38 H100" stroke="#ffffff" stroke-width="2.5" opacity=".7"/>' +
                '<path d="M74 66 C70 80 56 82 52 92 C48 102 36 104 28 112" fill="none" stroke="' + ink + '" stroke-width="2" stroke-linecap="round" opacity=".5"/>' +
                '<path d="M62 80 l-6 -5 l1 9 Z M48 98 l-6 -4 l2 8 Z" fill="' + c[2] + '"/><path d="M62 80 l7 -2 l-5 7 Z M48 98 l7 -1 l-5 6 Z" fill="' + c[0] + '"/>' +
                (function () { var r = '<circle cx="26" cy="28" r="11" fill="' + c[0] + '"/>';
                    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4;
                        r += '<path d="M' + (26 + 16 * Math.cos(a)).toFixed(1) + ' ' + (28 + 16 * Math.sin(a)).toFixed(1) + 'L' + (26 + 21 * Math.cos(a)).toFixed(1) + ' ' + (28 + 21 * Math.sin(a)).toFixed(1) + '" stroke="' + c[0] + '" stroke-width="3.5" stroke-linecap="round"/>'; }
                    return r; })();
        },
        democracy: function (c, ink) {
            return '<rect x="56" y="10" width="34" height="42" rx="4" fill="' + c[1] + '" stroke="' + ink + '" stroke-width="2" opacity=".95" transform="rotate(12 73 31)"/>' +
                '<path d="M64 32 L71 39 L84 24" stroke="' + c[0] + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(12 73 31)"/>' +
                '<rect x="22" y="58" width="76" height="52" rx="8" fill="' + c[0] + '"/><rect x="42" y="52" width="36" height="9" rx="4.5" fill="' + c[0] + '"/>' +
                '<rect x="46" y="55" width="28" height="3" rx="1.5" fill="#0b3d2b" opacity=".6"/><path d="M22 76 H98" stroke="#ffffff" stroke-width="3" opacity=".35"/>' +
                star4(22, 26, 6, 4, c[2]) + star4(104, 66, 5, 3.5, c[2]);
        },
        fathers: function (c, ink) {
            return '<path d="M6 108 H114" stroke="' + c[0] + '" stroke-width="5" stroke-linecap="round"/>' +
                '<path d="M50 108 C54 90 52 78 50 66 M66 108 C62 92 64 80 66 66" stroke="#8a5a2b" stroke-width="7" fill="none" stroke-linecap="round"/>' +
                '<circle cx="58" cy="44" r="26" fill="' + c[1] + '"/><circle cx="36" cy="56" r="18" fill="' + c[1] + '"/><circle cx="80" cy="56" r="18" fill="' + c[1] + '"/><circle cx="58" cy="24" r="16" fill="' + c[1] + '"/>' +
                '<path d="M96 108 V92" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><circle cx="96" cy="86" r="9" fill="' + c[1] + '" opacity=".75"/>' +
                star4(104, 22, 6, 4, c[2]);
        },
        independence: function (c, ink) {
            return '<path d="M24 112 V12" stroke="' + ink + '" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="10" r="5" fill="' + c[2] + '"/>' +
                '<path d="M27 18 C44 10 52 24 64 20 V68 C52 72 44 58 27 66 Z" fill="' + c[0] + '"/>' +
                '<path d="M64 20 C76 16 82 28 94 22 V70 C82 76 76 64 64 68 Z" fill="' + c[1] + '" stroke="' + ink + '" stroke-width="1.5" stroke-opacity=".25"/>' +
                '<path d="M94 22 C104 18 108 26 114 24 V72 C108 74 104 66 94 70 Z" fill="' + c[0] + '"/>' +
                star4(70, 94, 8, 5, c[0]) + star4(96, 104, 5, 3.5, c[2]) + star4(48, 104, 4, 3, c[0]);
        },
        teachers: function (c, ink) {
            return '<path d="M10 100 C26 84 38 108 54 92 C68 78 76 98 90 88" fill="none" stroke="' + c[2] + '" stroke-width="5" stroke-linecap="round"/>' +
                '<g transform="rotate(40 80 50)"><rect x="70" y="8" width="20" height="62" rx="3" fill="' + c[0] + '"/><rect x="70" y="8" width="20" height="10" rx="3" fill="' + c[1] + '"/>' +
                '<path d="M70 70 L80 92 L90 70 Z" fill="#f1e3c2"/><path d="M76.5 84 L80 92 L83.5 84 Z" fill="' + ink + '"/><path d="M80 18 V70" stroke="#ffffff" stroke-width="2" opacity=".35"/></g>' +
                star4(24, 28, 8, 5, c[1]) + star4(42, 52, 5, 3.5, c[2]);
        },
        eidfitr: function (c, ink) {
            return '<path d="M44 34 C38 26 50 22 44 14 M60 32 C54 22 66 18 60 8 M76 34 C70 26 82 22 76 14" fill="none" stroke="' + c[1] + '" stroke-width="3.5" stroke-linecap="round"/>' +
                '<path d="M22 56 H98 C98 80 82 94 60 94 C38 94 22 80 22 56 Z" fill="' + c[0] + '"/><rect x="18" y="50" width="84" height="8" rx="4" fill="' + c[0] + '"/>' +
                '<path d="M28 66 C40 70 80 70 92 66" stroke="' + c[1] + '" stroke-width="3" fill="none" opacity=".8"/>' +
                '<path d="M6 106 H114" stroke="' + c[2] + '" stroke-width="5" stroke-linecap="round"/>' +
                '<path d="M8 82 H24 L22 102 H10 Z M96 82 H112 L110 102 H98 Z" fill="' + c[2] + '" stroke="' + c[1] + '" stroke-width="2.5" stroke-linejoin="round"/>';
        }
    };
    ART.eidadha = ART.eidfitr;

    function svg(s, ink) {
        var f = s && ART[s.id];
        if (!f) return "";
        var c = s.colors || ["#a57bff", "#ffa800", "#03eed8"];
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="' + (s.title || "") + '">' + f(c, ink || "currentColor", s) + '</svg>';
    }
    return { svg: svg, ids: function () { var o = []; for (var k in ART) if (ART.hasOwnProperty(k)) o.push(k); return o; } };
})();
if (typeof module !== "undefined" && module.exports) module.exports = DPSeasonArt;

/* DesignPraise season strip for CEP panels. build.py writes dp/dp-season.js = lib/dp-seasons.js + this file.
 * DPSeasonUI.mount(footerEl) puts a one-line greeting just above the footer on special days.
 * Click it for the verse. Preview a date: localStorage.setItem("dp.seasonDate", "2026-12-25") then reload. */
(function () {
  "use strict";
  if (typeof DPSeasons === "undefined") return;

  var CSS =
    ".dp-season{display:flex;align-items:center;gap:8px;padding:6px 10px;border-top:1px solid var(--line);background:var(--bg);" +
    "font:600 11px/1.3 var(--sans,system-ui);color:var(--ink);cursor:pointer;user-select:none;flex:0 0 auto;position:relative;overflow:hidden}" +
    ".dp-season:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,var(--dp-s),var(--dp-s2) 60%,var(--dp-s3));opacity:.12;transition:opacity .4s cubic-bezier(.16,1,.3,1)}" +
    ".dp-season:hover:before{opacity:.2}" +
    ".dp-season:after{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,var(--dp-s),var(--dp-s2),var(--dp-s3))}" +
    ".dp-season i{width:22px;height:22px;flex:none;position:relative;animation:dpSeasonTurn .9s cubic-bezier(.7,0,.2,1) both}" +
    ".dp-season i svg{width:100%;height:100%;display:block}" +
    ".dp-season-more .art{float:left;width:54px;height:54px;margin:0 10px 4px 0}.dp-season-more .art svg{width:100%;height:100%}" +
    ".dp-season-more:after{content:'';display:block;clear:both}" +
    ".dp-season b{font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".dp-season small{margin-left:auto;font:500 10px var(--mono,monospace);color:var(--mute);white-space:nowrap}" +
    ".dp-season-more{display:none;padding:8px 10px 10px;border-top:1px dashed var(--line);background:var(--bg);font:11px/1.45 var(--sans,system-ui);color:var(--mute);flex:0 0 auto}" +
    ".dp-season-more q{display:block;color:var(--ink);margin-top:4px;quotes:'\\201C' '\\201D'}" +
    ".dp-season-more cite{display:block;font:500 10px var(--mono,monospace);margin-top:4px;font-style:normal}" +
    ".dp-season.open+.dp-season-more{display:block;animation:dpSeasonRise .35s cubic-bezier(.16,1,.3,1) both}" +
    "@keyframes dpSeasonTurn{from{transform:perspective(80px) rotateY(-90deg);opacity:0}}" +
    "@keyframes dpSeasonRise{from{opacity:0;transform:translateY(6px)}}" +
    "@media (prefers-reduced-motion:reduce){.dp-season i,.dp-season.open+.dp-season-more{animation:none}}";

  function today() {
    var when = null;
    try { when = DPSeasons.parse(localStorage.getItem("dp.seasonDate")); } catch (e) {}
    return DPSeasons.get(when || new Date());
  }

  function mount(footer) {
    var s = today();
    if (!s || !footer || !footer.parentNode) return null;
    if (!document.getElementById("dp-season-css")) {
      var st = document.createElement("style"); st.id = "dp-season-css"; st.textContent = CSS;
      document.head.appendChild(st);
    }
    var strip = document.createElement("div");
    strip.className = "dp-season";
    strip.setAttribute("role", "button");
    strip.setAttribute("tabindex", "0");
    strip.setAttribute("aria-expanded", "false");
    var c = s.colors || [s.accent, s.accent, s.accent];
    strip.style.setProperty("--dp-s", c[0]); strip.style.setProperty("--dp-s2", c[1]); strip.style.setProperty("--dp-s3", c[2]);
    var art = (typeof DPSeasonArt !== "undefined") ? DPSeasonArt.svg(s) : "";
    strip.innerHTML = "<i></i><b></b><small></small>";
    strip.querySelector("i").innerHTML = art;
    strip.querySelector("b").textContent = s.title;
    strip.querySelector("small").textContent = s.ref;
    strip.title = s.line;

    var more = document.createElement("div");
    more.className = "dp-season-more";
    more.innerHTML = (art ? '<div class="art"></div>' : "") + "<span></span><q></q><cite></cite>";
    if (art) more.querySelector(".art").innerHTML = art;
    more.querySelector("span").textContent = s.line;
    more.querySelector("q").textContent = s.verse;
    more.querySelector("cite").textContent = s.ref + " (KJV)";

    function toggle() {
      var open = strip.classList.toggle("open");
      strip.setAttribute("aria-expanded", open ? "true" : "false");
    }
    strip.addEventListener("click", toggle);
    strip.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });

    footer.parentNode.insertBefore(strip, footer);
    footer.parentNode.insertBefore(more, footer);
    return s;
  }

  window.DPSeasonUI = { mount: mount, today: today };
})();
