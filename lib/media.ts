// Reconstruct a deliberately small static SVG subset. Never preserve raw markup,
// external references, CSS, text, scripting, animation, or entity definitions.
export function sanitizeSVG(input: string): string {
  if (
    input.length > 500000 ||
    /<!|<\?|&|\bon\w+\s*=|javascript:|data:/i.test(input)
  )
    throw new Error("SVG no seguro. Exportalo como PNG o WEBP.");
  const tags = new Set([
    "svg",
    "g",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "defs",
    "linearGradient",
    "radialGradient",
    "stop",
    "clipPath",
  ]);
  const attrs = new Set([
    "viewBox",
    "width",
    "height",
    "x",
    "y",
    "x1",
    "x2",
    "y1",
    "y2",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "d",
    "points",
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "fill-rule",
    "clip-rule",
    "opacity",
    "fill-opacity",
    "stroke-opacity",
    "transform",
    "id",
    "offset",
    "stop-color",
    "stop-opacity",
    "gradientUnits",
    "gradientTransform",
    "clip-path",
  ]);
  const stack: string[] = [];
  let output = "",
    root = false;
  const tokens = input.match(/<[^>]*>|[^<]+/g) || [];
  for (const token of tokens) {
    if (!token.startsWith("<")) {
      if (token.trim()) throw new Error("SVG: solo geometría estática.");
      continue;
    }
    const match = /^<(\/)?([A-Za-z]+)([\s\S]*?)(\/?)>$/.exec(token);
    if (!match || !tags.has(match[2]))
      throw new Error("SVG contiene elementos no permitidos.");
    const [, closing, name, raw, selfClosing] = match;
    if (closing) {
      if (raw.trim() || selfClosing || stack.pop() !== name)
        throw new Error("SVG inválido");
      output += `</${name}>`;
      continue;
    }
    if (!root) {
      if (name !== "svg") throw new Error("Falta raíz SVG");
      root = true;
    } else if (stack.length === 0 || name === "svg")
      throw new Error("SVG inválido");
    let attributes = "";
    const matches = [...raw.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)];
    let rest = raw;
    for (const attr of matches) {
      rest = rest.replace(attr[0], "");
      const key = attr[1],
        value = attr[3];
      if (key === "xmlns" && value === "http://www.w3.org/2000/svg") continue;
      if (!attrs.has(key))
        throw new Error("SVG contiene atributos no permitidos.");
      if (!/^[a-z0-9\s.,+\-%#()]*$/i.test(value))
        throw new Error("Valor SVG inválido");
      if (/url/i.test(value) && !/^url\(#[a-z][\w-]*\)$/i.test(value))
        throw new Error("Referencia SVG no permitida");
      attributes += ` ${key}="${value}"`;
    }
    if (rest.trim()) throw new Error("SVG inválido");
    output += `<${name}${name === "svg" ? ' xmlns="http://www.w3.org/2000/svg"' : ""}${attributes}${selfClosing ? "/" : ""}>`;
    if (!selfClosing) stack.push(name);
  }
  if (!root || stack.length) throw new Error("SVG incompleto");
  return output;
}
