#!/usr/bin/env python3
"""Build shipping tools from src/ and refresh registry.json checksums.

For each src/<id>/<File>.jsx: replaces the //@@DP_CORE@@ line with lib/dp-core.jsxinc,
embeds the PNG marks, writes tools/<id>/<File>.jsx, then updates that tool's sha256
in registry.json. Bump "version" in registry.json by hand when you release.
"""
import hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

def png_literal(name):
    data = open(os.path.join(ROOT, "assets", name), "rb").read()
    return '"' + "".join("\\x%02X" % b for b in data) + '"'

def build_core():
    core = open(os.path.join(ROOT, "lib", "dp-core.jsxinc"), encoding="utf-8").read()
    return re.sub(r'"@@PNG:([^@]+)@@"', lambda m: png_literal(m.group(1)), core)

CEP_SKIP = {".debug", "README.md", ".DS_Store"}   # must match what the signing workflow strips

def build_cep(reg):
    """Copy cep/_shared into each extension's dp/ folder, then list every file with its checksum."""
    shared = os.path.join(ROOT, "cep", "_shared")
    wordmark = open(os.path.join(ROOT, "cep", "Baerista", "img", "wordmark.svg"), encoding="utf-8").read()
    wordmark = wordmark.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "")
    # Tool icons for the bar, from the same source as the website (site/icons.py).
    sys.path.insert(0, os.path.join(ROOT, "site")); import icons as ICONS
    idir = os.path.join(ROOT, "cep", "Baerista", "img", "icons"); os.makedirs(idir, exist_ok=True)
    for k in ICONS.ORDER:
        open(os.path.join(idir, k + ".svg"), "w", encoding="utf-8", newline="\n").write(ICONS.tile(k))
    entries = [t for t in reg["tools"] if t.get("kind") == "cep"]
    if reg.get("bar", {}).get("dir"):
        entries.append(reg["bar"])
    for entry in entries:
        ext_dir = os.path.join(ROOT, entry["dir"])
        dp = os.path.join(ext_dir, "dp")
        os.makedirs(os.path.join(dp, "fonts"), exist_ok=True)
        for rel in ["dp-brand.css", "dp-brand.js", "fonts/DesignPraiseSans.woff2", "fonts/GoogleSansCode.woff2"]:
            data = open(os.path.join(shared, rel), "rb").read()
            if rel == "dp-brand.js":
                data = data.decode("utf-8").replace("@@WORDMARK@@", wordmark).encode("utf-8")
            open(os.path.join(dp, rel), "wb").write(data)
        files = []
        name = os.path.basename(entry["dir"])
        prefix = "SELF" if entry is reg.get("bar") else "CEP/" + name
        for folder, _, names in sorted(os.walk(ext_dir)):
            for n in sorted(names):
                if n in CEP_SKIP:
                    continue
                full = os.path.join(folder, n)
                rel = os.path.relpath(full, ext_dir).replace(os.sep, "/")
                files.append({"path": entry["dir"] + "/" + rel, "installAs": prefix + "/" + rel,
                              "sha256": hashlib.sha256(open(full, "rb").read()).hexdigest()})
        # Platform signatures from the signing workflow (cep/_signed/<Ext>/<mac|win>/signatures.xml).
        for plat in ("mac", "win"):
            sig = os.path.join(ROOT, "cep", "_signed", name, plat, "signatures.xml")
            if os.path.exists(sig):
                files.append({"path": f"cep/_signed/{name}/{plat}/signatures.xml", "installAs": prefix + "/META-INF/signatures.xml",
                              "platform": plat, "sha256": hashlib.sha256(open(sig, "rb").read()).hexdigest()})
        entry["files"] = files
        print(f"built {entry['dir']}  {entry['version']}  {len(files)} files")

def main():
    core = build_core()
    reg_path = os.path.join(ROOT, "registry.json")
    reg = json.load(open(reg_path))
    by_id = {t["id"]: t for t in reg["tools"]}
    for tool_id in sorted(os.listdir(os.path.join(ROOT, "src"))):
        src_dir = os.path.join(ROOT, "src", tool_id)
        for name in os.listdir(src_dir):
            if not name.endswith(".jsx"):
                continue
            src = open(os.path.join(src_dir, name), encoding="utf-8").read()
            if src.count("//@@DP_CORE@@") != 1:
                sys.exit(f"{tool_id}/{name}: needs exactly one //@@DP_CORE@@ marker")
            out = src.replace("//@@DP_CORE@@", core)
            os.makedirs(os.path.join(ROOT, "tools", tool_id), exist_ok=True)
            rel = f"tools/{tool_id}/{name}"
            with open(os.path.join(ROOT, rel), "w", encoding="utf-8", newline="\n") as f:
                f.write(out)
            sha = hashlib.sha256(out.encode("utf-8")).hexdigest()
            entry = by_id.get(tool_id)
            if not entry:
                sys.exit(f"{tool_id}: add an entry to registry.json first")
            for f in entry["files"]:
                if f["path"] == rel:
                    f["sha256"] = sha
            print(f"built {rel}  {entry['version']}  {sha[:12]}")
    build_cep(reg)
    with open(reg_path, "w") as f:
        json.dump(reg, f, indent=2)
        f.write("\n")

if __name__ == "__main__":
    main()
