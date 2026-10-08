"""Render the same CV model used by /cv into two one-page, text-based PDFs."""
from html import escape
from pathlib import Path
import json
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Flowable, Frame, KeepTogether, PageTemplate, Paragraph, Spacer
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
OUTPUT.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
if (FONT_DIR / "times.ttf").exists():
    for name, file in [("CVSerif", "times.ttf"), ("CVSerif-Bold", "timesbd.ttf"), ("CVSerif-Italic", "timesi.ttf"), ("CVSerif-BoldItalic", "timesbi.ttf")]:
        pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / file)))
    pdfmetrics.registerFontFamily("CVSerif", normal="CVSerif", bold="CVSerif-Bold", italic="CVSerif-Italic", boldItalic="CVSerif-BoldItalic")
else:
    pdfmetrics.registerFontFamily("CVSerif", normal="Times-Roman", bold="Times-Bold", italic="Times-Italic", boldItalic="Times-BoldItalic")

FONT = "CVSerif" if (FONT_DIR / "times.ttf").exists() else "Times-Roman"
BOLD = "CVSerif-Bold" if FONT == "CVSerif" else "Times-Bold"
ITALIC = "CVSerif-Italic" if FONT == "CVSerif" else "Times-Italic"
WIDTH = A4[0] - 32 * mm


def clean(value):
    return escape(str(value).replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-"))


def link(label, href, underline=False):
    body = clean(label)
    if underline:
        body = f"<u>{body}</u>"
    return f'<link href="{escape(href, quote=True)}" color="#111111">{body}</link>'


def style(name, size=11, leading=13, **kwargs):
    return ParagraphStyle(name, fontName=FONT, fontSize=size, leading=leading, textColor=colors.HexColor("#111111"), **kwargs)


BODY = style("body", spaceAfter=0)
SUBTITLE = ParagraphStyle("subtitle", parent=BODY, fontName=ITALIC, fontSize=10.5, leading=12.5)
BULLET = style("bullet", leftIndent=13, firstLineIndent=0, bulletIndent=1, bulletFontName=FONT, bulletFontSize=9, spaceBefore=1.5)
HEADING = ParagraphStyle("heading", parent=BODY, fontName=BOLD, fontSize=11, leading=13, spaceAfter=0)
NAME = ParagraphStyle("name", parent=BODY, fontName=BOLD, fontSize=20, leading=23, alignment=TA_CENTER)
CONTACT = style("contact", size=10, leading=12, alignment=TA_CENTER)
LINKS = style("links", size=9, leading=11, alignment=TA_CENTER)


class SectionHeading(Flowable):
    def __init__(self, title):
        super().__init__()
        self.text = title.upper()
        self.height = 21
        self.keepWithNext = True

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        return avail_width, self.height

    def draw(self):
        self.canv.setFont(BOLD, 11)
        self.canv.setFillColor(colors.HexColor("#111111"))
        self.canv.drawString(0, 9, self.text)
        self.canv.setLineWidth(.65)
        self.canv.line(0, 5, self.width, 5)


class EntryHeading(Flowable):
    def __init__(self, entry):
        super().__init__()
        self.entry = entry

    def wrap(self, avail_width, avail_height):
        self.width = avail_width
        date_width = pdfmetrics.stringWidth(self.entry["date"], FONT, 10)
        title = f'<b>{clean(self.entry["title"])}</b>'
        if self.entry.get("link"):
            item = self.entry["link"]
            title += f' <font size="9">{link(item["label"], item["href"], True)}</font>'
        self.paragraph = Paragraph(title, BODY)
        self.title_width = avail_width - date_width - 12 if date_width else avail_width
        _, self.height = self.paragraph.wrap(self.title_width, avail_height)
        return avail_width, self.height

    def draw(self):
        self.paragraph.drawOn(self.canv, 0, 0)
        self.canv.setFont(FONT, 10)
        self.canv.drawRightString(self.width, self.height - BODY.leading + 2, self.entry["date"])


def render(model):
    filename = "Matias-Meneclier-CV-ES.pdf" if model["locale"] == "es" else "Matias-Meneclier-Resume-EN.pdf"
    output = OUTPUT / filename
    document = BaseDocTemplate(str(output), pagesize=A4, leftMargin=16*mm, rightMargin=16*mm, topMargin=15*mm, bottomMargin=15*mm,
                                 title=f'{model["name"]} - {"CV" if model["locale"] == "es" else "Resume"}', author=model["name"],
                                 subject="Education, technical projects, work experience and skills", pageCompression=1)
    # Frame padding is zero so A4 margins match the print view exactly.
    document.addPageTemplates([PageTemplate(id="cv", frames=Frame(16*mm, 15*mm, WIDTH, A4[1]-30*mm,
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0))])
    story = [Paragraph(clean(model["name"]), NAME), Spacer(1, 5)]
    contacts = [link(x["label"], x["href"]) if x.get("href") else clean(x["label"]) for x in model["contact"]]
    story += [Paragraph(" · ".join(contacts), CONTACT), Spacer(1, 3)]
    story += [Paragraph(" · ".join(link(x["label"], x["href"]) for x in model["links"]), LINKS), Spacer(1, 7)]
    for section in model["sections"]:
        story += [Spacer(1, 5), SectionHeading(section["title"])]
        for index, entry in enumerate(section["entries"]):
            group = [EntryHeading(entry)]
            if entry["subtitle"] or entry["technologies"]:
                subtitle = clean(entry["subtitle"])
                if entry["technologies"]:
                    if subtitle:
                        subtitle += " | "
                    subtitle += f'<font name="{FONT}" size="10">{clean(entry["technologies"])}</font>'
                group += [Spacer(1, 1), Paragraph(subtitle, SUBTITLE)]
            if entry["note"]:
                group += [Spacer(1, 2), Paragraph(clean(entry["note"]), BODY)]
            if entry["bullets"]:
                group += [Spacer(1, 1)]
                for bullet in entry["bullets"]:
                    group.append(Paragraph(clean(bullet), BULLET, bulletText="•"))
            story.append(KeepTogether(group))
            if index < len(section["entries"]) - 1:
                story.append(Spacer(1, 6))
    story += [Spacer(1, 5), SectionHeading(model["skillsTitle"])]
    for row in model["skills"]:
        label = f'<b>{clean(row["label"])}:</b> ' if row["label"] else ""
        story += [Paragraph(label + clean(row["text"]), BODY), Spacer(1, 2)]
    document.build(story)
    reader = PdfReader(output)
    if len(reader.pages) != 1:
        raise RuntimeError(f"Expected one page for {filename}; received {len(reader.pages)}")
    text = reader.pages[0].extract_text()
    expected = [model["name"], *[entry["title"] for section in model["sections"] for entry in section["entries"]]]
    if not all(word in text for word in expected):
        raise RuntimeError(f"Missing required CV text in {filename}")
    print(json.dumps({"file":str(output), "pages":len(reader.pages), "characters":len(text), "links":len(reader.pages[0].get("/Annots", []))}, ensure_ascii=False))


for locale in ["es", "en"]:
    render(json.loads((ROOT / "work" / "harvard-cv" / f"cv-{locale}.json").read_text(encoding="utf-8")))
