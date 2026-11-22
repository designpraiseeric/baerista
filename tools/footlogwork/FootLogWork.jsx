
(function (thisObj) {
    var TOOL = "FootLogWork", VERSION = "1.1.1";

    // ── DesignPraise core (brand mark + update check) ── injected by build.py; edit lib/dp-core.jsxinc ──
    var DP = (function () {
        var REGISTRY = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/registry.json";
        var RAW_BASE = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/";
        var SITE = "https://designpraiseeric.pages.dev/soon";
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

    var NG_GREEN = "#03ee63", AMBER = "#ffa800", LILAC = "#a57bff", AQUA = "#03eed8", MUTE = "";

    // Ordered by priority: the first match wins when two days meet.
    function table(y) {
        var e = easter(y), adv = adventSunday(y);
        return [
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
              ref: "Psalm 127:3", verse: "Lo, children are an heritage of the LORD." }
        ];
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
            var t = row.add("statictext", undefined, s.title + "  \u00b7  " + s.ref);
            t.alignment = ["fill", "center"];
            t.helpTip = s.line + "\n\n\u201c" + s.verse + "\u201d\n\u2014 " + s.ref + " (KJV)";
            try {
                t.graphics.font = ScriptUI.newFont("dialog", "BOLD", 10);
                t.graphics.foregroundColor = s.accent ? hexPen(t.graphics, s.accent) : t.graphics.newPen(t.graphics.PenType.SOLID_COLOR, [0.7, 0.7, 0.75], 1);
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

    // ---------- UI Construction ----------
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? 
                    thisObj : 
                    new Window("palette", "FootLogWork", undefined, { resizeable: true });

        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 6;
        panel.margins = 10;

        // Title
        var titleGroup = panel.add("group");
        titleGroup.orientation = "row";
        titleGroup.alignChildren = "center";
        titleGroup.add("statictext", undefined, "FOOTLOGWORK", { font: "dialog", size: 16 });

        // Separator
        panel.add("panel", undefined, "").preferredSize.height = 2;

        // Source Layer dropdown
        var srcGroup = panel.add("group");
        srcGroup.orientation = "row";
        srcGroup.alignChildren = ["left", "center"];
        srcGroup.add("statictext", undefined, "Source Layer:");
        var srcDropdown = srcGroup.add("dropdownlist", undefined, []);
        srcDropdown.preferredSize.width = 180;

        // Reference Layer dropdown
        var refGroup = panel.add("group");
        refGroup.orientation = "row";
        refGroup.alignChildren = ["left", "center"];
        refGroup.add("statictext", undefined, "Reference Layer:");
        var refDropdown = refGroup.add("dropdownlist", undefined, []);
        refDropdown.preferredSize.width = 180;

        // Refresh layers button
        var refreshBtn = panel.add("button", undefined, "Refresh Layer List");
        refreshBtn.preferredSize.width = 140;

        // Buttons
        var btnGroup = panel.add("group");
        btnGroup.orientation = "row";
        btnGroup.spacing = 10;
        var logBtn = btnGroup.add("button", undefined, "Convert to Log");
        var matchBtn = btnGroup.add("button", undefined, "Color Match");

        // Progress bar
        var progressBar = panel.add("progressbar", undefined, 0, 100);
        progressBar.preferredSize.width = 300;
        var statusText = panel.add("statictext", undefined, "Ready");
        statusText.preferredSize.width = 300;

        DP.footer(panel, { id: "footlogwork", name: TOOL, version: VERSION });

        // ---------- Helper: Safely update UI ----------
        function safeUpdate() {
            if (panel instanceof Window) panel.update();
        }

        // ---------- Helper: populate dropdowns ----------
        function populateLayers() {
            var comp = app.project.activeItem;
            srcDropdown.removeAll();
            refDropdown.removeAll();
            
            if (!comp || !(comp instanceof CompItem)) {
                srcDropdown.add("item", "No comp active");
                refDropdown.add("item", "No comp active");
                return;
            }
            
            var layers = comp.layers;
            if (layers.length === 0) {
                srcDropdown.add("item", "No layers");
                refDropdown.add("item", "No layers");
                return;
            }
            
            for (var i = 1; i <= layers.length; i++) {
                var lyr = layers[i];
                var name = lyr.name;
                srcDropdown.add("item", i + ": " + name);
                refDropdown.add("item", i + ": " + name);
            }
            
            if (srcDropdown.items.length > 0) {
                srcDropdown.selection = 0;
                refDropdown.selection = 0;
            }
        }

        populateLayers();

        refreshBtn.onClick = function () {
            populateLayers();
        };

        // ---------- Helper: get selected layer by dropdown ----------
        function getLayerFromDropdown(dropdown) {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) return null;
            
            var sel = dropdown.selection;
            if (sel === null) return null; 
            
            var text = sel.text; 
            var indexStr = text.split(":")[0];
            var index = parseInt(indexStr, 10);
            if (isNaN(index)) return null;
            return comp.layer(index);
        }

        // ---------- Sampling function (progress bar) ----------
        function getLayerStats(layer, time) {
            var comp = layer.containingComp;
            
            var rect = layer.sourceRectAtTime(time, false);
            var left = rect.left, top = rect.top, width = rect.width, height = rect.height;
                
            if (width <= 0 || height <= 0) {
                width = comp.width;
                height = comp.height;
                left = 0;
                top = 0;
            }

            var gridX = 16, gridY = 16;
            var sumR = 0, sumG = 0, sumB = 0;
            var sumSqR = 0, sumSqG = 0, sumSqB = 0;
            var count = 0;
            var textLayer = null;

            try {
                textLayer = comp.layers.addText("__sampler__");
                textLayer.guideLayer = true;
                textLayer.opacity.setValue(0);
                var srcTextProp = textLayer.property("Source Text");
                statusText.text = "Sampling...";
                progressBar.value = 30;
                safeUpdate();

                // One evaluation for all gridX × gridY cells; each sample averages its whole cell.
                var cw = width / gridX, ch = height / gridY;
                srcTextProp.expression =
                    "var L = thisComp.layer(" + layer.index + "), out = [];\n" +
                    "for (var ix = 0; ix < " + gridX + "; ix++) for (var iy = 0; iy < " + gridY + "; iy++) {\n" +
                    "  var p = L.sampleImage([" + left + " + " + cw + " * (ix + 0.5), " + top + " + " + ch + " * (iy + 0.5)], [" + (cw / 2) + ", " + (ch / 2) + "], true, time);\n" +
                    "  out.push(p[0].toFixed(6) + ',' + p[1].toFixed(6) + ',' + p[2].toFixed(6));\n" +
                    "}\nout.join(';');";
                var str = srcTextProp.valueAtTime(time, false).text;
                var cells = str.split(";");
                for (var c = 0; c < cells.length; c++) {
                    var parts = cells[c].split(",");
                    if (parts.length < 3) continue;
                    var r = parseFloat(parts[0]), g = parseFloat(parts[1]), b = parseFloat(parts[2]);
                    if (isNaN(r) || isNaN(g) || isNaN(b)) continue;
                    sumR += r; sumG += g; sumB += b;
                    sumSqR += r * r; sumSqG += g * g; sumSqB += b * b;
                    count++;
                }
            } catch(e) {
                alert("Error during sampling: " + e.toString());
                return null;
            } finally {
                if (textLayer) {
                    textLayer.remove();
                }
            }

            if (count === 0) return null;

            var meanR = sumR / count, meanG = sumG / count, meanB = sumB / count;
            var varR = (sumSqR / count) - meanR * meanR;
            var varG = (sumSqG / count) - meanG * meanG;
            var varB = (sumSqB / count) - meanB * meanB;

            statusText.text = "Sampling complete.";
            progressBar.value = 100;
            safeUpdate();

            return {
                meanR: meanR, meanG: meanG, meanB: meanB,
                stdR: Math.sqrt(Math.max(0, varR)), 
                stdG: Math.sqrt(Math.max(0, varG)), 
                stdB: Math.sqrt(Math.max(0, varB))
            };
        }

        // ---------- Apply Levels match (Corrected Match Name) ----------
        function applyColorMatch(sourceLayer, srcStats, refStats) {
            var effectsGroup = sourceLayer.property("ADBE Effect Parade") || sourceLayer.property("Effects");
            
            var effect;
            try {
                // Modern AE Match Name for Levels (Individual Controls)
                effect = effectsGroup.addProperty("ADBE Pro Levels2");
            } catch(e) {
                try {
                    // Legacy AE Match Name fallback
                    effect = effectsGroup.addProperty("ADBE Pro Levels");
                } catch(e2) {
                    alert("Could not apply Levels. Missing correct effect match name in this AE version.");
                    return;
                }
            }

            function setChannel(channel, inBlack, inWhite, gamma, outBlack, outWhite) {
                effect.property(channel + " Input Black").setValue(inBlack);
                effect.property(channel + " Input White").setValue(inWhite);
                effect.property(channel + " Gamma").setValue(gamma);
                effect.property(channel + " Output Black").setValue(outBlack);
                effect.property(channel + " Output White").setValue(outWhite);
            }

            function calcOutParams(srcMean, srcStd, refMean, refStd) {
                if (srcStd < 0.0001) srcStd = 1.0; 
                var scale = refStd / srcStd;
                var outBlack = refMean - srcMean * scale;
                var outWhite = outBlack + scale;
                
                outBlack = Math.max(0, Math.min(1, outBlack));
                outWhite = Math.max(0, Math.min(1, outWhite));
                if (outBlack >= outWhite) {
                    outBlack = 0; outWhite = 1;
                }
                return { outBlack: outBlack, outWhite: outWhite };
            }

            var rPar = calcOutParams(srcStats.meanR, srcStats.stdR, refStats.meanR, refStats.stdR);
            var gPar = calcOutParams(srcStats.meanG, srcStats.stdG, refStats.meanG, refStats.stdG);
            var bPar = calcOutParams(srcStats.meanB, srcStats.stdB, refStats.meanB, refStats.stdB);

            setChannel("Red", 0, 1, 1, rPar.outBlack, rPar.outWhite);
            setChannel("Green", 0, 1, 1, gPar.outBlack, gPar.outWhite);
            setChannel("Blue", 0, 1, 1, bPar.outBlack, bPar.outWhite);
        }

        // ---------- Convert to Log ----------
        function convertToLog(layer) {
            var effectsGroup = layer.property("ADBE Effect Parade") || layer.property("Effects");
            var cineon = effectsGroup.addProperty("ADBE Cineon Converter");
            cineon.property("Conversion Type").setValue(2);
        }

        // ---------- Button Handlers ----------
        logBtn.onClick = function () {
            var srcLayer;
            try {
                srcLayer = getLayerFromDropdown(srcDropdown);
            } catch(e) {
                alert("Error getting layer: " + e.toString());
                return;
            }
            
            if (!srcLayer) {
                alert("Please select a valid source layer.");
                return;
            }
            
            app.beginUndoGroup("FootLogWork Convert to Log");
            try {
                progressBar.value = 0;
                statusText.text = "Applying Cineon Log...";
                safeUpdate();
                
                convertToLog(srcLayer);
                
                progressBar.value = 100;
                statusText.text = "Converted to Log.";
                safeUpdate();
            } catch(e) {
                alert("Error: " + e.toString() + "\nLine: " + e.line);
            } finally {
                app.endUndoGroup();
            }
        };

        matchBtn.onClick = function () {
            var srcLayer, refLayer;
            try {
                srcLayer = getLayerFromDropdown(srcDropdown);
                refLayer = getLayerFromDropdown(refDropdown);
            } catch(e) {
                alert("Error getting layers: " + e.toString());
                return;
            }

            if (!srcLayer || !refLayer) {
                alert("Please select both source and reference layers.");
                return;
            }
            if (srcLayer === refLayer) {
                alert("Source and reference must be different layers.");
                return;
            }

            app.beginUndoGroup("FootLogWork Color Match");
            try {
                progressBar.value = 0;
                statusText.text = "Sampling source...";
                safeUpdate();

                var currentTime = srcLayer.containingComp.time;
                var srcStats = getLayerStats(srcLayer, currentTime);
                if (!srcStats) {
                    alert("Source sampling failed (no pixels or expression error).");
                    return;
                }

                progressBar.value = 0;
                statusText.text = "Sampling reference...";
                safeUpdate();
                
                var refStats = getLayerStats(refLayer, currentTime);
                if (!refStats) {
                    alert("Reference sampling failed.");
                    return;
                }

                progressBar.value = 0;
                statusText.text = "Applying color match...";
                safeUpdate();

                applyColorMatch(srcLayer, srcStats, refStats);

                progressBar.value = 100;
                statusText.text = "Color match complete.";
                safeUpdate();
            } catch(e) {
                alert("Error: " + e.toString() + "\nLine: " + e.line);
            } finally {
                app.endUndoGroup();
            }
        };

        return panel;
    }

    // ---------- Launch ----------
    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) {
        myPanel.center();
        myPanel.show();
    } else {
        myPanel.layout.layout(true);
    }
})(this);
