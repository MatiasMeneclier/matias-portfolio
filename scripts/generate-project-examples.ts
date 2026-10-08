import { mkdirSync, writeFileSync } from "node:fs";
import { projectExamples } from "../lib/project-examples.ts";

const themes = [
  ["#bcccf4", "#e6eaff", "#4864c5"],
  ["#f1c3ac", "#f9eadf", "#b86b4e"],
  ["#a4c5b3", "#dceae0", "#377d60"],
  ["#aaa0dc", "#e0d9f7", "#7963c2"],
  ["#ddcfab", "#f3ecda", "#a38147"],
  ["#152135", "#435976", "#9cc7e5"],
];
const text = (
  x: number,
  y: number,
  content: string,
  color = "#28313d",
  fontSize = 18,
  weight = 400,
) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-weight="${weight}" font-family="Arial, sans-serif">${content}</text>`;
const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  radius = 10,
) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
const line = (x: number, y: number, w: number, fill = "#d7dbe3") =>
  rect(x, y, w, 7, fill, 3);
const content = (index: number, accent: string) => {
  if (index === 0)
    return (
      text(240, 240, "Your space. Your pace.", "#202735", 34, 600) +
      text(
        240,
        277,
        "A little more focus, a little less noise.",
        "#828999",
        17,
      ) +
      ["Today", "In progress", "Done"]
        .map(
          (label, i) =>
            text(240 + i * 250, 331, label, "#6b7382", 15, 600) +
            [0, 1, 2]
              .map(
                (row) =>
                  rect(
                    240 + i * 250,
                    350 + row * 76,
                    224,
                    63,
                    row === 1 && i === 0 ? "#e8edff" : "#f4f5f8",
                  ) +
                  line(257 + i * 250, 368 + row * 76, 105 + row * 20) +
                  rect(
                    257 + i * 250,
                    392 + row * 76,
                    43,
                    8,
                    [accent, "#c4a6b5", "#9db3a6"][row],
                    4,
                  ),
              )
              .join(""),
        )
        .join("")
    );
  if (index === 1)
    return (
      text(240, 244, "A clearer picture.", "#313036", 33, 600) +
      text(240, 292, "Monthly overview", "#929198", 15) +
      text(240, 341, "$12,840", "#313036", 42, 600) +
      `<path d="M240 495 C290 498 314 414 364 444 S445 458 492 413 S580 456 629 378 S726 404 762 350" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>` +
      [0, 1, 2, 3]
        .map(
          (i) =>
            `<path d="M240 ${380 + i * 55} H770" stroke="#ece9e6" stroke-width="1"/>`,
        )
        .join("") +
      `<circle cx="888" cy="395" r="82" fill="none" stroke="#f0e8e0" stroke-width="27"/><circle cx="888" cy="395" r="82" fill="none" stroke="${accent}" stroke-width="27" stroke-dasharray="320 515" transform="rotate(-90 888 395)"/>` +
      text(858, 402, "68%", "#313036", 27, 600) +
      text(828, 523, "Sample budget", "#929198", 15)
    );
  if (index === 2)
    return (
      text(240, 240, "Every path starts somewhere.", "#213e34", 29, 600) +
      Array.from({ length: 24 }, (_, i) =>
        rect(
          240 + (i % 6) * 122,
          278 + Math.floor(i / 6) * 69,
          100,
          49,
          i % 3 === 0 ? "#dce8df" : "#edf2ed",
          8,
        ),
      ).join("") +
      `<path d="M285 451 H406 V321 H650 V451 H892 V520" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>` +
      [
        [285, 451],
        [406, 321],
        [650, 451],
        [892, 520],
      ]
        .map(
          ([x, y], i) =>
            `<circle cx="${x}" cy="${y}" r="14" fill="${i === 3 ? "#d3a56b" : accent}" stroke="white" stroke-width="5"/>`,
        )
        .join("") +
      rect(742, 227, 252, 65, "#ffffff") +
      text(767, 253, "Route preview", "#7d8c83", 13) +
      text(767, 277, "04 nodes / 01 path", "#213e34", 17, 600)
    );
  if (index === 3)
    return (
      text(240, 240, "See what moves.", "#222136", 33, 600) +
      ["Overview", "Activity", "Sessions"]
        .map(
          (label, i) =>
            rect(
              240 + i * 250,
              277,
              226,
              102,
              ["#e9e3fa", "#e7edf6", "#eee9f1"][i],
            ) +
            text(259 + i * 250, 309, label, "#817991", 14) +
            text(
              259 + i * 250,
              353,
              ["12.4k", "+18%", "4,280"][i],
              "#332a50",
              31,
              600,
            ),
        )
        .join("") +
      rect(240, 402, 726, 145, "#f8f6fc") +
      [44, 61, 51, 87, 73, 100, 90, 114, 103, 124, 118, 128]
        .map((h, i) =>
          rect(
            258 + i * 58,
            533 - h,
            34,
            h,
            i % 3 === 0 ? accent : "#c7b9e6",
            5,
          ),
        )
        .join("")
    );
  if (index === 4)
    return (
      rect(215, 200, 202, 369, "#f6f2e9") +
      text(240, 240, "Collections", "#8b826f", 16, 600) +
      ["Everyday ideas", "Learning", "Bookmarks", "Sketchbook"]
        .map((s, i) =>
          text(240, 294 + i * 52, s, i === 0 ? accent : "#8b826f", 16),
        )
        .join("") +
      text(453, 239, "Make room for an idea.", "#39352b", 32, 600) +
      text(453, 276, "A notebook for the things that matter.", "#9c927d", 16) +
      Array.from({ length: 7 }, (_, i) =>
        line(
          453,
          326 + i * 30,
          [470, 440, 485, 315, 462, 390, 270][i],
          "#e4ddce",
        ),
      ).join("") +
      rect(828, 487, 115, 35, "#ebdfbd", 17) +
      text(850, 510, "New idea", "#8b7048", 14)
    );
  return (
    text(240, 243, "kernel / sandbox", "#c6d7e8", 28, 600) +
    text(240, 291, "$ run scheduler --preview", "#a8d6bc", 17) +
    [
      "[ready] process_01",
      "[running] process_02",
      "[waiting] process_03",
      "[ready] process_04",
    ]
      .map((s, i) =>
        text(240, 343 + i * 39, s, i === 1 ? "#dac5e8" : "#7d94af", 17),
      )
      .join("") +
    text(704, 293, "MEMORY MAP", "#7d94af", 13, 600) +
    Array.from({ length: 40 }, (_, i) =>
      rect(
        704 + (i % 8) * 32,
        313 + Math.floor(i / 8) * 32,
        24,
        24,
        ["#577f9a", "#759587", "#786a96", "#263b52"][i % 4],
        4,
      ),
    ).join("") +
    line(240, 528, 700, "#263b52") +
    rect(240, 524, 190, 15, "#a8d6bc", 6) +
    rect(439, 524, 144, 15, "#a6b7d7", 6) +
    rect(592, 524, 130, 15, "#c7a6d4", 6)
  );
};
mkdirSync("public/projects/examples", { recursive: true });
for (const [index, example] of projectExamples.entries()) {
  const [a, b, accent] = themes[index];
  const dark = index === 5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    ${rect(0, 0, 1200, 750, "url(#bg)", 0)}
    <circle cx="1080" cy="85" r="255" fill="white" opacity="0.09"/><circle cx="80" cy="725" r="260" fill="${accent}" opacity="0.1"/>
    ${rect(181, 151, 848, 468, "#000000", 26).replace('fill="#000000"', 'fill="#000000" opacity="0.08"')}
    ${rect(170, 130, 860, 470, dark ? "#172435" : "#fffdfb", 24)}
    <path d="M170 187 H1030" stroke="${dark ? "#304358" : "#e9e8e6"}"/>
    <circle cx="198" cy="159" r="5" fill="#dca6a5"/><circle cx="216" cy="159" r="5" fill="#e3c294"/><circle cx="234" cy="159" r="5" fill="#a8bfa4"/>
    ${text(269, 165, String(example.data.title), dark ? "#9baec2" : "#85858b", 14, 600)}
    ${content(index, accent)}
  </svg>`;
  writeFileSync(`public${example.data.cover}`, svg);
}
const quote = (value: unknown) =>
  "'" + String(value).replaceAll("'", "''") + "'";
let sql =
  "-- Six explicitly fictional, editable project examples requested for design preview.\n-- Existing projects and matching slugs are preserved.\nbegin;\n";
for (const example of projectExamples) {
  sql += `insert into public.projects(id,data,sort_order,is_visible) select ${quote(example.id)},${quote(JSON.stringify(example.data))}::jsonb,(select coalesce(max(sort_order),-1)+1 from public.projects),true where not exists(select 1 from public.projects where data->>'slug'=${quote(example.data.slug)}) on conflict(id) do nothing;\n`;
}
sql += "commit;\n";
writeFileSync("supabase/migrations/202610060007_project_examples.sql", sql);
console.log("Generated six project covers and their migration.");
