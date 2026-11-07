// Turns the Google Sheet of products into the same shape as PRODUCTS in data.js.
// The sheet is shared with File → Share → Publish to web → (Products tab) → CSV,
// and that link goes in CONFIG.productsSheet. Used by the website and tools/build-pages.mjs.
const Sheet = (() => {
  // Splits CSV text into rows of cells, allowing commas, quotes and new lines inside quoted cells.
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') quoted = false;
        else cell += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((v) => v.trim()));
  }

  const money = (v) => Number(String(v).replace(/[^\d.]/g, "")) || 0;
  const yes = (v) => /^(y|yes|true|1|✓|x)$/i.test(String(v).trim());

  // "024 412 3456", "0244123456" or "+233 24 412 3456" → "233244123456"
  function phone(v) {
    let d = String(v).replace(/\D/g, "");
    if (d.startsWith("0")) d = "233" + d.slice(1);
    else if (d.length === 9) d = "233" + d;
    return d;
  }

  // Google Drive share links don't show as images, so point them at Google's image server.
  // The file must be shared as "Anyone with the link".
  function image(v) {
    const url = String(v).trim();
    const id = (url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/) || [])[1];
    return id ? `https://lh3.googleusercontent.com/d/${id}=w800` : url;
  }

  // Accepts the id ("fashion") or the name, or the start of it ("Fashion", "fashion & beauty").
  function pick(list, v) {
    const s = String(v).trim().toLowerCase();
    if (!s) return "";
    const hit = list.find((x) => x.id === s || x.name.toLowerCase() === s)
      || list.find((x) => x.name.toLowerCase().startsWith(s) || s.startsWith(x.name.toLowerCase().split(/[ &]/)[0]));
    return hit ? hit.id : "";
  }

  function toProducts(csv, categories, regions, fallbackWhatsapp) {
    const [head = [], ...rows] = parseCSV(csv);
    const keys = head.map((h) => h.trim().toLowerCase().replace(/[^a-z]/g, ""));
    const products = [];
    rows.forEach((r, i) => {
      const o = Object.fromEntries(keys.map((k, j) => [k, (r[j] || "").trim()]));
      const p = {
        id: Number(o.id) || 1000 + i,
        title: o.title || o.product || o.name,
        category: pick(categories, o.category),
        price: money(o.price),
        oldPrice: money(o.oldprice || o.wasprice) || undefined,
        location: o.location || "",
        region: pick(regions, o.region || o.location),
        seller: o.seller || o.business || "",
        whatsapp: phone(o.whatsapp || o.phone || "") || fallbackWhatsapp,
        image: image(o.image || o.photo || o.picture || ""),
        featured: yes(o.featured),
        fromSheet: true,
      };
      if (o.hide && yes(o.hide)) return;
      if (!p.title || !p.category || !p.price) {
        if (typeof console !== "undefined") console.warn(`Sheet row ${i + 2} skipped: needs a title, a valid category and a price.`);
        return;
      }
      if (!p.oldPrice || p.oldPrice <= p.price) delete p.oldPrice;
      products.push(p);
    });
    return products;
  }

  return { parseCSV, toProducts };
})();
