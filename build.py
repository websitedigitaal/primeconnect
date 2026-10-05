#!/usr/bin/env python3
"""Bouwt de statische site uit src/ naar de projectroot.

  src/partials/*.html   gedeelde stukken ({% include naam %})
  src/pages/*.html      pagina's, met front matter tussen --- regels
  src/project.html      sjabloon voor elke projectpagina
  src/projects.json     projectdata

Gebruik: python3 build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
PROJECTS = json.loads((SRC / "projects.json").read_text(encoding="utf-8"))


def esc(text):
    return html.escape(text, quote=True)


def parse(path):
    text = path.read_text(encoding="utf-8")
    meta = {}
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
        text = text[m.end():]
    return meta, text


def render(template, context):
    def include(m):
        return render((SRC / "partials" / f"{m.group(1)}.html").read_text(encoding="utf-8"), context)

    out = re.sub(r"{%\s*include\s+([\w-]+)\s*%}", include, template)
    out = re.sub(r"{{\s*(\w+)\s*}}", lambda m: str(context.get(m.group(1), m.group(0))), out)
    leftover = re.findall(r"{{\s*\w+\s*}}", out)
    if leftover:
        raise ValueError(f"Onbekende variabelen: {set(leftover)}")
    nav = context.get("nav")
    if nav:
        out = out.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"')
    return out


# ---------- Projectfragmenten ----------

def img_tag(root, p, cls=""):
    fit = ' data-fit="contain"' if p.get("image_fit") == "contain" else ""
    return f'<img src="{root}assets/img/{p["image"]}" alt="" loading="lazy"{fit}{cls}>'


def project_card(root, p, i, extra_class=""):
    return f'''<a class="card{extra_class}" href="{root}projecten/{p["slug"]}.html" data-type="{esc(p["type"])}">
      {img_tag(root, p)}
      <span class="card-top"><span class="card-idx">{i:02d}</span><span class="card-tag">{esc(p["type"])}</span></span>
      <span class="card-body">
        <span class="card-title">{esc(p["title"])}</span>
        <span class="card-text">{esc(p["short"])}</span>
      </span>
      <span class="card-go" aria-hidden="true">→</span>
    </a>'''


def project_bento(root):
    cards = "\n    ".join(project_card(root, p, i + 1, f" b{i + 1}") for i, p in enumerate(PROJECTS))
    return f'<div class="bento">\n    {cards}\n    </div>'


def project_index(root):
    rows = []
    for i, p in enumerate(PROJECTS, 1):
        domains = "".join(f"<li>{esc(d)}</li>" for d in p["domains"])
        rows.append(f'''<a class="pj-row reveal" href="{root}projecten/{p["slug"]}.html" data-type="{esc(p["type"])}">
        <span class="pj-idx">{i:02d}</span>
        <span class="pj-media">{img_tag(root, p)}</span>
        <span class="pj-main">
          <span class="pj-tag">{esc(p["type"])}</span>
          <span class="pj-title">{esc(p["title"])}</span>
          <span class="pj-sub">{esc(p["subtitle"])}</span>
        </span>
        <ul class="pj-domains">{domains}</ul>
        <span class="pj-go" aria-hidden="true">→</span>
      </a>''')
    return "\n      ".join(rows)


def project_context(root, i, p):
    body = "\n".join(f'<p class="reveal">{esc(t)}</p>' for t in p["body"])
    # eerste alinea groter als intro
    body = body.replace('<p class="reveal">', '<p class="lede reveal">', 1)
    gallery = ""
    if p.get("gallery"):
        items = []
        for g in p["gallery"]:
            fit = ' data-fit="contain"' if g.get("fit") == "contain" else ""
            items.append(f'''<figure class="reveal"><img src="{root}assets/img/{g["src"]}" alt="{esc(g["caption"])}" loading="lazy"{fit}><figcaption>{esc(g["caption"])}</figcaption></figure>''')
        heading = ""
        if p.get("extra_title"):
            heading = f'<div class="gallery-head"><h2 class="h-xl reveal">{esc(p["extra_title"])}</h2><p class="reveal">{esc(p["extra_text"])}</p></div>'
        gallery = f'<section class="pd-gallery" data-theme="light"><div class="wrap">{heading}<div class="gallery g{len(items)}">{"".join(items)}</div></div></section>'
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    status = f'<div><dt>Status</dt><dd>{esc(p["status"])}</dd></div>' if p.get("status") else ""
    return {
        "p_title": esc(p["title"]),
        "p_type": esc(p["type"]),
        "p_subtitle": esc(p["subtitle"]),
        "p_index": f"{i + 1:02d}",
        "p_total": f"{len(PROJECTS):02d}",
        "p_hero": img_tag(root, p),
        "p_domains": "".join(f"<li>{esc(d)}</li>" for d in p["domains"]),
        "p_status": status,
        "p_body": body,
        "p_gallery": gallery,
        "next_slug": nxt["slug"],
        "next_title": esc(nxt["title"]),
        "next_hero": img_tag(root, nxt),
    }


# ---------- Bouwen ----------

def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("  ", path.relative_to(ROOT))


def main():
    print("Bouwen…")
    for page in sorted((SRC / "pages").glob("*.html")):
        meta, template = parse(page)
        root = ""
        ctx = {**meta, "root": root, "project_bento": project_bento(root), "project_index": project_index(root)}
        ctx.setdefault("body_class", "")
        write(ROOT / page.name, render(template, ctx))

    meta, template = parse(SRC / "project.html")
    for i, p in enumerate(PROJECTS):
        root = "../"
        ctx = {
            **meta,
            "root": root,
            "title": f'{p["title"]} – PrimeConnect',
            "description": p["short"],
            "nav": "projecten",
            "body_class": "page-project",
            **project_context(root, i, p),
        }
        write(ROOT / "projecten" / f'{p["slug"]}.html', render(template, ctx))


if __name__ == "__main__":
    main()
