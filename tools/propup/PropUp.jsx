/*
 * Shape Property Revealer – Dockable Panel (Zero Index Calls)
 * Lists leaf properties from selected shape groups.
 * Checkboxes toggle selection and reveal in Timeline.
 * Scrollable, dockable, and robust.
 */

(function(thisObj) {
    var TOOL = "Prop Up", VERSION = "1.1.2";
    var COLUMNS = 4;

    // ── DesignPraise core (brand mark + update check) ── injected by build.py; edit lib/dp-core.jsxinc ──
    var DP = (function () {
        var REGISTRY = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/registry.json";
        var RAW_BASE = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/";
        var SITE = "https://designpraiseeric.pages.dev/soon";
        var ART_BASE = "https://designpraiseeric.pages.dev/img/seasons/icon/";
        var SECTION = "DesignPraise_Updates";
        var CHECK_EVERY_HOURS = 12;
        var IS_WIN = $.os.indexOf("Windows") !== -1;
        var SELF = File($.fileName);
        var MARK_LILAC = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A\x00\x00\x00\x0D\x49\x48\x44\x52\x00\x00\x00\x11\x00\x00\x00\x14\x08\x06\x00\x00\x00\x6B\xA0\xD6\x49\x00\x00\x00\x06\x62\x4B\x47\x44\x00\xFF\x00\xFF\x00\xFF\xA0\xBD\xA7\x93\x00\x00\x01\xB7\x49\x44\x41\x54\x38\x8D\xED\x92\xBD\x6B\x14\x61\x18\xC4\x7F\xCF\x7B\xBB\xC2\x19\x85\xC4\x10\x0B\x0B\xED\x63\x25\x56\x41\x3C\xB0\xB0\x11\xC4\x46\x83\x64\x4F\xA2\xCD\x06\xC4\xC2\x13\x34\x5E\xB6\x49\xC4\x05\x2B\x03\x89\x08\xA7\x95\x92\x0D\x72\x8A\x12\x10\x05\xC5\x22\xA5\x76\x56\x5A\xC4\x46\x10\xB1\x50\xFC\xCC\xC1\xED\xC7\xD8\x28\x84\xBB\xCB\xFD\x05\x99\x76\x86\x79\x86\x99\x07\xB6\xD0\x09\xEB\x47\x36\x67\xB5\x2B\x4D\x59\x02\xBE\x01\x2B\x41\x6C\x0F\x7B\xE9\x5C\x3F\x93\x76\x9B\x29\xC4\x83\x20\xB6\xAA\x8C\x1F\x49\xA4\x0B\x42\x5D\x87\x3D\x80\x66\x4D\xE5\xB4\xCC\x15\x8C\xE3\x40\x09\xE3\xBD\x3C\x2E\x5B\xCA\x41\x8C\x47\x00\xAE\x60\x50\x46\x90\x44\x9C\x5F\x46\x5F\x0A\x58\xA8\xC6\xF6\x04\xC0\x35\x42\xF9\xD9\x76\x9E\x61\xFC\xF1\xD7\x39\x1C\xC4\x76\x40\x39\xB7\xD4\x26\x07\x06\xFD\x9C\xEF\x49\xA4\x19\xE0\x54\x06\x27\xAB\xB1\x8D\x66\x19\x93\x4E\x9C\x5D\x8E\x74\x09\xC0\x92\x48\x21\xB0\x2F\x88\x2D\xEA\x8C\x99\x44\x7A\x65\xA2\x26\xE3\xEE\x1E\x9F\x43\x47\x66\x2D\xFB\xCF\x35\x42\xF9\x3B\x46\x78\xED\xFB\x1C\x73\x26\x8E\xAA\x20\xD9\xA4\x96\xA1\xDC\xA8\x20\x1E\x6F\x34\x00\x98\xBA\x63\x29\x62\x25\x6B\x53\xE9\x5B\x2C\x22\x73\xC6\x6E\x0C\xBF\x9F\xCC\xC9\x78\x69\x8E\xA0\x93\x58\xAA\x6B\x14\xC7\x3A\xF0\x19\xE3\x6B\x27\xDF\x08\xE5\x63\x9C\x00\x56\xAD\x11\xCA\xDF\x39\xC2\x8B\x42\x3C\xDD\xD6\xE2\xF6\xF8\xBC\xB5\x92\x48\x15\x60\xB1\x10\xE7\xCC\x31\x86\xC8\x5D\xC1\xDB\xD4\xF1\x71\x32\xB6\x4F\xF7\xA7\xB5\xD7\x2B\xB1\x88\xB1\x3A\x11\xDB\x4D\xEB\x9A\x58\x0C\x01\x6F\x4A\x8E\x6B\xA7\xAF\xDB\xBB\x24\xD2\x8C\xE0\x03\xE2\xA7\x19\x57\x81\x01\x83\x5F\x1B\x27\xF6\x00\xC6\xE7\xAD\x05\xCC\x01\x73\xF7\xEA\x1A\xF6\x1C\x17\x25\x7E\xFF\x4B\x3E\xA6\x9C\xE6\x99\x1B\xB6\x06\x3C\xEF\xD5\x49\xCF\xB7\x6F\xD6\x54\x4E\x07\xA8\x53\xB0\xDF\x8C\xB5\x89\xD8\xA6\xFB\x0E\xB0\x85\x2E\xFC\x05\x4D\xC0\xAC\x92\xFB\x83\x0E\x54\x00\x00\x00\x00\x49\x45\x4E\x44\xAE\x42\x60\x82";
        var MARK_WHITE = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A\x00\x00\x00\x0D\x49\x48\x44\x52\x00\x00\x00\x11\x00\x00\x00\x14\x08\x06\x00\x00\x00\x6B\xA0\xD6\x49\x00\x00\x00\x06\x62\x4B\x47\x44\x00\xFF\x00\xFF\x00\xFF\xA0\xBD\xA7\x93\x00\x00\x01\x2B\x49\x44\x41\x54\x38\x8D\xED\x92\xAD\x4B\xC3\x51\x18\x85\x9F\xFB\xC3\x85\x35\x3F\x50\x14\x3F\x92\x45\x05\x8B\x49\x85\x35\x05\x93\x18\xC4\x20\x18\x4D\xA6\x29\xC8\x56\x0C\xE2\xDF\x61\x99\x2C\x28\xC2\x10\x2C\x2A\xB2\x24\x82\x68\xB2\x69\x16\x83\xD5\xE2\xE0\xB1\xDC\xC1\xCF\x7D\x89\xE6\x9D\x74\xEF\x7B\x0E\xE7\x7D\xEF\x79\x2F\x74\xF1\x27\xA8\xFD\xEA\xA5\x5A\x52\xD7\xFF\x6B\x52\x50\xB7\xE2\x79\x59\xDD\x51\x43\xA3\x2E\x89\x82\xAC\x7A\xA0\x3E\xA8\x4F\x6A\x59\x1D\x03\xE6\x80\xBB\xA8\xED\x05\x36\x81\x67\xF5\x56\x5D\x4B\x77\xCB\xC4\xE2\x9E\x9A\x8D\xB5\x45\x75\x44\xBD\x56\x07\xD5\xA2\x7A\xAA\x8E\x46\x7E\x42\xAD\xA8\xF9\xBA\xC9\xB6\x7A\xD4\xE6\x39\x37\xEA\xAC\x7A\xAF\xF6\x34\x70\x19\xF5\x51\x1D\x4E\x80\x25\xE0\xA4\x4D\x2C\x7D\x40\x0E\x38\x0F\x21\xD4\xD2\x44\x08\xE1\x0B\xA8\x00\xB9\xE4\x97\x6C\x6B\xC0\x10\x90\xE9\x24\x4A\x80\xAB\x18\x58\xE3\x53\xA6\x81\x4F\xE0\x0D\xF8\x68\xC1\x67\x80\x55\xA0\x9A\x00\xC7\xC0\x82\xBA\x9B\x0A\x36\x07\x94\x81\x7C\x6C\xA4\x3A\x9F\x0E\x16\x38\x03\x4A\x21\x84\xF7\xBA\x6B\x7A\xC5\xAF\x71\xC5\x53\x91\x2B\xAA\x1B\xEA\x8A\x5A\x8D\x9A\x9F\x2B\x6E\x31\xE6\x80\x7A\xA8\x8E\xC7\xFB\x85\x3A\xD9\x29\x93\xA6\xDF\x57\x9F\x0C\x28\x00\x33\xC0\x4B\x08\x61\xBF\x93\x49\x17\xCD\xF8\x06\xA5\x9D\xF5\xDC\x62\x8A\x2B\xB7\x00\x00\x00\x00\x49\x45\x4E\x44\xAE\x42\x60\x82";

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

        function sh(cmd) { try { return system.callSystem(cmd) || ""; } catch (e) { return ""; } }

        function netAllowed() {
            try { return app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY") === 1; }
            catch (e) { return false; }
        }

        function openURL(url) {
            if (!netAllowed()) {
                alert("To open links, turn on Preferences > Scripting & Expressions >\n\"Allow Scripts to Write Files and Access Network\".\n\n" + url);
                return;
            }
            if (IS_WIN) sh('cmd.exe /c start "" "' + url + '"');
            else sh('open "' + url + '"');
        }

        function fetchText(url) {
            return sh((IS_WIN ? "curl.exe" : "curl") + ' -fsSL -m 8 "' + url + '"');
        }

        function cmpVersion(a, b) {
            var x = String(a).split("."), y = String(b).split(".");
            for (var i = 0; i < Math.max(x.length, y.length); i++) {
                var p = parseInt(x[i] || "0", 10), q = parseInt(y[i] || "0", 10);
                if (p !== q) return p > q ? 1 : -1;
            }
            return 0;
        }

        // Reads one tool's entry from registry.json without eval.
        function findEntry(json, id) {
            var start = json.indexOf('"id": "' + id + '"');
            if (start < 0) start = json.indexOf('"id":"' + id + '"');
            if (start < 0) return null;
            var next = json.indexOf('"id":', start + 6);
            var block = json.substring(start, next < 0 ? json.length : next);
            function grab(key) {
                var m = new RegExp('"' + key + '"\\s*:\\s*"([^"]*)"').exec(block);
                return m ? m[1] : null;
            }
            return { version: grab("version"), path: grab("path"), sha256: grab("sha256"), changelog: grab("changelog") || "" };
        }

        function sha256Of(file) {
            var out;
            if (IS_WIN) {
                out = sh('certutil -hashfile "' + file.fsName + '" SHA256');
                var lines = out.split(/\r?\n/);
                return lines.length > 1 ? lines[1].replace(/\s/g, "").toLowerCase() : "";
            }
            out = sh('shasum -a 256 "' + file.fsName + '"');
            return out.split(" ")[0].toLowerCase();
        }

        function installUpdate(meta, entry) {
            var msg = meta.name + " " + entry.version + " is available (you have " + meta.version + ").";
            if (entry.changelog) msg += "\n\n" + entry.changelog;
            if (!confirm(msg + "\n\nUpdate now?")) return;

            var tmp = File(Folder.temp.fsName + "/dp_" + meta.id + "_" + entry.version + ".jsx");
            sh((IS_WIN ? "curl.exe" : "curl") + ' -fsSL -m 30 -o "' + tmp.fsName + '" "' + RAW_BASE + entry.path + '"');
            if (!tmp.exists) { alert("The download didn't complete. Check your connection and try again."); return; }
            if (entry.sha256 && sha256Of(tmp) !== entry.sha256.toLowerCase()) {
                tmp.remove();
                alert("The downloaded file didn't match its checksum, so nothing was changed.");
                return;
            }
            if (tmp.copy(SELF.fsName)) {
                tmp.remove();
                alert(meta.name + " is now " + entry.version + ".\nClose this panel and reopen it from the Window menu.");
            } else {
                alert("After Effects couldn't overwrite the script (the folder may need admin rights).\n" +
                      "The new version is saved here — copy it over the old one:\n\n" + tmp.fsName);
                if (!IS_WIN) sh('open -R "' + tmp.fsName + '"');
            }
        }

        function check(meta, badge, force) {
            if (!netAllowed()) return;
            var key = meta.id + "_last";
            var now = new Date().getTime();
            try {
                if (!force && app.settings.haveSetting(SECTION, key)) {
                    var last = parseFloat(app.settings.getSetting(SECTION, key));
                    if (now - last < CHECK_EVERY_HOURS * 3600000) {
                        // Still show a known pending update without hitting the network.
                        if (app.settings.haveSetting(SECTION, meta.id + "_pending")) {
                            var pv = app.settings.getSetting(SECTION, meta.id + "_pending");
                            if (cmpVersion(pv, meta.version) > 0) showBadge(badge, pv);
                        }
                        return;
                    }
                }
                app.settings.saveSetting(SECTION, key, String(now));
            } catch (e) {}

            var json = fetchText(REGISTRY);
            if (!json) return;
            var entry = findEntry(json, meta.id);
            if (!entry || !entry.version) return;
            try { app.settings.saveSetting(SECTION, meta.id + "_pending", entry.version); } catch (e2) {}
            badge._entry = entry;
            if (cmpVersion(entry.version, meta.version) > 0) showBadge(badge, entry.version);
        }

        function showBadge(badge, v) {
            badge.text = "Update to " + v;
            badge.visible = true;
            try { badge.parent.layout.layout(true); } catch (e) {}
        }

        function lum(hex) {
            var n = parseInt(String(hex || "#000").replace("#", ""), 16);
            return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
        }
        function hexPen(g, hex) {
            var n = parseInt(String(hex).replace("#", ""), 16);
            return g.newPen(g.PenType.SOLID_COLOR, [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255], 1);
        }

        // Today's greeting (Christian year + Nigerian public days), or null.
        // To preview a date: app.settings.saveSetting("DesignPraise_Updates", "season_date", "2026-12-25").
        function season() {
            var when = null;
            try { if (app.settings.haveSetting(SECTION, "season_date")) when = DPSeasons.parse(app.settings.getSetting(SECTION, "season_date")); } catch (e) {}
            try { return DPSeasons.get(when || new Date()); } catch (e2) { return null; }
        }

        /** A quiet one-line greeting above the footer on special days. Click it for the verse. */
        function greeting(parent) {
            var s = season();
            if (!s) return null;
            var row = parent.add("group");
            row.orientation = "row";
            row.alignment = ["fill", "bottom"];
            row.alignChildren = ["left", "center"];
            row.margins = [0, 4, 0, 0];
            // The day's picture: downloaded once from the site into the user's data folder, shown from then on.
            var key = s.id === "advent" ? "advent-" + Math.max(1, Math.min(4, s.week || 1)) : s.id;
            var dir = Folder(Folder.userData.fsName + "/DesignPraise/seasons");
            var png = File(dir.fsName + "/" + key + ".png");
            if (png.exists && png.length > 100) {
                try { var im = row.add("image", undefined, png); im.helpTip = s.title; } catch (eI) {}
            } else if (netAllowed()) {
                var cb = "__dpSeasonArt_" + key;
                $.global[cb] = function () {
                    try { if (!dir.exists) dir.create(); } catch (eD) {}
                    sh((IS_WIN ? "curl.exe" : "curl") + ' -fsSL -m 6 -o "' + png.fsName + '" "' + ART_BASE + key + '.png"');
                };
                try { app.scheduleTask("try{$.global." + cb + "();}catch(e){}", 2500, false); } catch (eS) {}
            }
            var t = row.add("statictext", undefined, s.title + "  \u00b7  " + s.ref);
            t.alignment = ["fill", "center"];
            t.helpTip = s.line + "\n\n\u201c" + s.verse + "\u201d\n\u2014 " + s.ref + " (KJV)";
            try {
                t.graphics.font = ScriptUI.newFont("dialog", "BOLD", 10);
                // AE panels are dark: use the day's brightest colour so the line stays readable.
                var pick = null, best = 0, cs = s.colors || [s.accent];
                for (var ci = 0; ci < cs.length; ci++) { var L = lum(cs[ci]); if (L > best && L < 0.95) { best = L; pick = cs[ci]; } if (ci === 0 && L > 0.3) break; }
                t.graphics.foregroundColor = pick ? hexPen(t.graphics, pick) : t.graphics.newPen(t.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.75], 1);
            } catch (e) {}
            t.addEventListener("click", function () {
                alert(s.title + "\n\n" + s.line + "\n\n\u201c" + s.verse + "\u201d\n\u2014 " + s.ref + " (KJV)\n\nFrom DesignPraise");
            });
            return row;
        }

        /** Adds the footer (update button + dp mark) to a ScriptUI container. */
        function footer(parent, meta) {
            greeting(parent);
            var row = parent.add("group");
            row.orientation = "row";
            row.alignment = ["fill", "bottom"];
            row.alignChildren = ["left", "center"];
            row.margins = [0, 2, 0, 0];

            var badge = row.add("button", undefined, "Update");
            badge.visible = false;
            badge.helpTip = "A newer version is available";
            badge.onClick = function () {
                if (!badge._entry) {
                    var json = fetchText(REGISTRY);
                    badge._entry = json ? findEntry(json, meta.id) : null;
                }
                if (badge._entry) installUpdate(meta, badge._entry);
            };

            var ver = row.add("statictext", undefined, meta.name + " " + meta.version);
            ver.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 9);
            try { ver.graphics.foregroundColor = ver.graphics.newPen(ver.graphics.PenType.SOLID_COLOR, [0.55, 0.55, 0.6], 1); } catch (e) {}

            var spacer = row.add("group");
            spacer.alignment = ["fill", "center"];

            var mark = row.add("iconbutton", undefined, ScriptUI.newImage(MARK_LILAC, MARK_LILAC, MARK_WHITE, MARK_WHITE), { style: "toolbutton" });
            mark.alignment = ["right", "center"];
            mark.helpTip = "designpraise — click to visit the site";
            mark.onClick = function () { openURL(SITE); };

            // Test harness hook (only defined while Baerista's test script runs).
            if (typeof $.global.__dpTestHook === "function") { try { $.global.__dpTestHook(meta.id, parent); } catch (eH) {} }

            // Check after the panel has drawn, so opening it never waits on the network.
            var cbName = "__dpUpd_" + meta.id;
            $.global[cbName] = function () { check(meta, badge, false); };
            try { app.scheduleTask("try{$.global." + cbName + "();}catch(e){}", 1500, false); } catch (e3) {}
            return row;
        }

        return { footer: footer, openURL: openURL, site: SITE, season: season };
    })();
    // ── end DesignPraise core ──


    // Property groups report INDEXED_GROUP or NAMED_GROUP.
    function isGroupType(t) { return t === PropertyType.INDEXED_GROUP || t === PropertyType.NAMED_GROUP; }
    var DEFAULT_DEPTH = 2;

    // ---- Main window ----
    var win = (thisObj && thisObj.add) ? thisObj : new Window('palette', 'Shape Property Revealer', undefined, { resizeable: true });
    win.orientation = 'column';
    win.alignChildren = 'left';
    win.spacing = 5;
    win.margins = 10;
    win.preferredSize.width = 420;
    win.preferredSize.height = 500;

    // ---- Top controls ----
    var topGroup = win.add('group');
    topGroup.orientation = 'row';
    topGroup.alignChildren = 'center';
    topGroup.spacing = 5;
    topGroup.add('statictext', undefined, 'Depth:');
    var depthDD = topGroup.add('dropdownlist', undefined, ['1','2','3','4','5','All']);
    depthDD.selection = Math.min(DEFAULT_DEPTH, depthDD.items.length - 1);
    var refreshBtn = topGroup.add('button', undefined, '⟳ Refresh');

    // ---- Status label ----
    var statusText = win.add('statictext', undefined, 'Status: Ready');
    statusText.alignment = 'left';

    // ---- Scrollable container ----
    var scrollGroup = win.add('group');
    scrollGroup.orientation = 'row';
    scrollGroup.alignChildren = 'fill';
    scrollGroup.preferredSize.height = 350;

    var contentPanel = scrollGroup.add('panel', undefined, 'Properties');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = 'left';
    contentPanel.preferredSize.height = 350;

    var scrollBar = scrollGroup.add('scrollbar', undefined, 0, 0, 100);
    scrollBar.preferredSize.width = 16;
    scrollBar.preferredSize.height = 350;

    var innerGroup = contentPanel.add('group');
    innerGroup.orientation = 'column';
    innerGroup.alignChildren = 'left';

    // ---- Logging ----
    function log(msg) {
        try { $.writeln('[ShapeRevealer] ' + msg); } catch(e) {}
    }

    // ---- Safe property access ----
    function safeGetProperty(obj, key) {
        try {
            if (!obj) return null;
            if (typeof obj.property !== 'function') return null;
            return obj.property(key);
        } catch(e) {
            log('safeGetProperty error for key "' + key + '": ' + e);
            return null;
        }
    }

    function safeNumProperties(obj) {
        try {
            if (!obj) return 0;
            return obj.numProperties || 0;
        } catch(e) {
            log('safeNumProperties error: ' + e);
            return 0;
        }
    }

    function safePropertyType(prop) {
        try {
            if (!prop) return -1;
            return prop.propertyType;
        } catch(e) {
            log('safePropertyType error: ' + e);
            return -1;
        }
    }

    function safeMatchName(prop) {
        try {
            if (!prop) return '';
            return prop.matchName || '';
        } catch(e) {
            log('safeMatchName error: ' + e);
            return '';
        }
    }

    function safeName(prop) {
        try {
            if (!prop) return '';
            return prop.name || '';
        } catch(e) {
            log('safeName error: ' + e);
            return '';
        }
    }

    function safeSelected(prop) {
        try {
            if (!prop) return false;
            return prop.selected || false;
        } catch(e) {
            log('safeSelected error: ' + e);
            return false;
        }
    }

    // ---- Get containing layer ----
    function getContainingLayer(prop) {
        try { return prop.propertyGroup(prop.propertyDepth); } catch (e) { return null; }
    }

    // ---- Get matchName path ----
    function getMatchNamePath(prop) {
        var path = [];
        try {
            var current = prop;
            while (current && current.parentProperty) {
                var mn = safeMatchName(current);
                if (mn) path.unshift(mn);
                current = current.parentProperty;
            }
        } catch(e) {
            log('getMatchNamePath error: ' + e);
        }
        return path;
    }

    // ---- Search for property by matchName path ----
    function findPropertyByMatchPath(rootGroup, path, depth) {
        try {
            if (!rootGroup || !path || depth >= path.length) return null;
            var targetName = path[depth];
            if (!targetName) return null;
            var num = safeNumProperties(rootGroup);
            for (var i = 1; i <= num; i++) {
                var p = safeGetProperty(rootGroup, i);
                if (!p) continue;
                if (safeMatchName(p) === targetName) {
                    if (depth === path.length - 1) {
                        return p;
                    } else {
                        if (isGroupType(safePropertyType(p))) {
                            return findPropertyByMatchPath(p, path, depth + 1);
                        }
                    }
                }
            }
        } catch(e) {
            log('findPropertyByMatchPath error: ' + e);
        }
        return null;
    }

    // ---- Collect leaf properties up to depth ----
    function collectProperties(propGroup, depth, currentDepth) {
        var result = [];
        try {
            if (!propGroup) return result;
            if (!isGroupType(safePropertyType(propGroup))) return result;
            var num = safeNumProperties(propGroup);
            for (var i = 1; i <= num; i++) {
                var p = safeGetProperty(propGroup, i);
                if (!p) continue;
                var type = safePropertyType(p);
                if (type === PropertyType.PROPERTY) {
                    result.push(p);
                } else if (isGroupType(type)) {
                    if (depth === -1 || currentDepth < depth) {
                        result = result.concat(collectProperties(p, depth, currentDepth + 1));
                    }
                }
            }
        } catch(e) {
            log('collectProperties error: ' + e);
        }
        return result;
    }

    // ---- Get selected shape groups ----
    function getSelectedShapeGroups() {
        var activeItem = app.project.activeItem;
        if (!activeItem || !(activeItem instanceof CompItem)) {
            log('No active composition');
            return [];
        }

        var groups = [];

        try {
            // 1. Check selected properties
            var selected = activeItem.selectedProperties;
            if (selected && selected.length > 0) {
                for (var i = 0; i < selected.length; i++) {
                    var p = selected[i];
                    if (!p) continue;
                    if (isGroupType(safePropertyType(p))) {
                        var mn = safeMatchName(p);
                        if (mn && (mn.indexOf('ADBE Vector') !== -1 || mn.indexOf('ADBE Shape') !== -1)) {
                            var layer = getContainingLayer(p);
                            groups.push({ layer: layer, group: p });
                        }
                    }
                }
                if (groups.length > 0) return groups;
            }

            // 2. Check selected layers
            var layers = activeItem.selectedLayers;
            if (layers && layers.length > 0) {
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if (!layer) continue;
                    var contents = null;

                    // Try standard match name
                    contents = safeGetProperty(layer, "ADBE Root Vectors Group");
                    if (!contents) {
                        var num = safeNumProperties(layer);
                        for (var j = 1; j <= num; j++) {
                            var prop = safeGetProperty(layer, j);
                            if (!prop) continue;
                            if (isGroupType(safePropertyType(prop))) {
                                var mn = safeMatchName(prop);
                                if (mn === 'ADBE Root Vectors Group' || mn === 'ADBE Shape Layer' || (mn && mn.indexOf('ADBE Vector') !== -1)) {
                                    contents = prop;
                                    break;
                                }
                            }
                        }
                    }
                    if (contents) {
                        groups.push({ layer: layer, group: contents });
                    } else {
                        log('No Contents group for layer: ' + safeName(layer));
                    }
                }
            } else {
                log('No layers selected.');
            }
        } catch(e) {
            log('getSelectedShapeGroups error: ' + e);
        }
        return groups;
    }

    // ---- Rebuild grid ----
    function rebuild() {
        try {
            // Clear innerGroup
            while (innerGroup.children.length > 0) {
                innerGroup.remove(innerGroup.children[0]);
            }

            var shapeData = getSelectedShapeGroups();
            statusText.text = 'Groups found: ' + shapeData.length;
            log('Groups: ' + shapeData.length);

            if (shapeData.length === 0) {
                innerGroup.add('statictext', undefined, 'Select a shape layer or shape group(s).');
                updateScrollbar();
                return;
            }

            var depthText = depthDD.selection.text;
            var depth = depthText === 'All' ? -1 : parseInt(depthText, 10);

            var allProps = [];
            var propMeta = [];

            for (var g = 0; g < shapeData.length; g++) {
                var data = shapeData[g];
                var group = data.group;
                var props = collectProperties(group, depth, 1);
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    allProps.push(prop);
                    propMeta.push({
                        matchPath: getMatchNamePath(prop),
                        name: safeName(prop)
                    });
                }
            }

            statusText.text = 'Groups: ' + shapeData.length + ' | Properties: ' + allProps.length;
            log('Properties: ' + allProps.length);

            if (allProps.length === 0) {
                innerGroup.add('statictext', undefined, 'No properties found at this depth.');
                updateScrollbar();
                return;
            }

            // Combine and sort
            var combined = [];
            for (var ci = 0; ci < allProps.length; ci++) combined.push({ prop: allProps[ci], meta: propMeta[ci] });
            combined.sort(function(a, b) { return safeName(a.prop).localeCompare(safeName(b.prop)); });

            var grid = innerGroup.add('group');
            grid.orientation = 'column';
            grid.alignChildren = 'left';

            var row;
            for (var i = 0; i < combined.length; i++) {
                if (i % COLUMNS === 0) {
                    row = grid.add('group');
                    row.orientation = 'row';
                    row.alignChildren = 'left';
                    row.spacing = 5;
                }
                var prop = combined[i].prop;
                var meta = combined[i].meta;
                var cb = row.add('checkbox', undefined, safeName(prop));
                cb.value = safeSelected(prop);
                cb.data = {
                    matchPath: meta.matchPath
                };

                cb.onClick = function() {
                    try {
                        var activeItem = app.project.activeItem;
                        if (!activeItem || !(activeItem instanceof CompItem)) {
                            alert('No active composition.');
                            this.value = !this.value;
                            return;
                        }
                        var layers = activeItem.selectedLayers;
                        if (!layers || layers.length === 0) {
                            alert('Select a shape layer.');
                            this.value = !this.value;
                            return;
                        }
                        var layer = layers[0];
                        var contents = safeGetProperty(layer, "ADBE Root Vectors Group");
                        if (!contents) {
                            var num = safeNumProperties(layer);
                            for (var j = 1; j <= num; j++) {
                                var p = safeGetProperty(layer, j);
                                if (!p) continue;
                                if (isGroupType(safePropertyType(p))) {
                                    var mn = safeMatchName(p);
                                    if (mn === 'ADBE Root Vectors Group' || mn === 'ADBE Shape Layer' || (mn && mn.indexOf('ADBE Vector') !== -1)) {
                                        contents = p;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!contents) {
                            alert('Could not find Contents group. Click Refresh.');
                            this.value = !this.value;
                            return;
                        }
                        var liveProp = findPropertyByMatchPath(contents, this.data.matchPath, 0);
                        if (!liveProp) {
                            alert('Property not found. Click Refresh.');
                            this.value = !this.value;
                            return;
                        }
                        liveProp.selected = this.value;
                        try { app.executeCommand(26); } catch(e) {}
                    } catch(e) {
                        log('Checkbox click error: ' + e);
                        alert('Error: ' + e.message + '\nClick Refresh.');
                        this.value = !this.value;
                    }
                };
            }

            try { app.executeCommand(26); } catch(e) {}
            updateScrollbar();

        } catch(e) {
            log('Rebuild error: ' + e);
            alert('Rebuild error: ' + e.message + '\nCheck Console for details.');
            statusText.text = 'Error: ' + e.message;
        }
    }

    // ---- Scrollbar logic ----
    function updateScrollbar() {
        try {
            // Safely get content height, fallback to 0
            var contentHeight = 0;
            try {
                var ps = innerGroup.preferredSize;
                if (ps && !(ps instanceof Error)) {
                    contentHeight = ps.height || 0;
                }
            } catch(e) {}

            // Safely get view height, fallback to default
            var viewHeight = 350;
            try {
                var ps2 = contentPanel.preferredSize;
                if (ps2 && !(ps2 instanceof Error)) {
                    viewHeight = ps2.height || 350;
                }
            } catch(e) {}

            var maxScroll = Math.max(0, contentHeight - viewHeight);
            scrollBar.maxvalue = Math.max(0, maxScroll);
            scrollBar.value = 0;
            innerGroup.location.y = 0;
            scrollBar.enabled = (maxScroll > 0);
        } catch(e) {
            log('updateScrollbar error: ' + e);
        }
    }

    scrollBar.onChanging = function() {
        var yOffset = -this.value;
        innerGroup.location.y = yOffset;
    };

    win.onResize = function() {
        updateScrollbar();
    };

    // ---- Events ----
    refreshBtn.onClick = rebuild;
    depthDD.onChange = rebuild;

    DP.footer(win, { id: "propup", name: TOOL, version: VERSION });

    // ---- Show if floating, THEN build ----
    if (!(thisObj && thisObj.add)) {
        win.show();
    }
    rebuild();

})(this);