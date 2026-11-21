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
    with open(reg_path, "w") as f:
        json.dump(reg, f, indent=2)
        f.write("\n")

if __name__ == "__main__":
    main()
