(async function () {
  const $ = (sel) => document.querySelector(sel);
  const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const regionById = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
  const bandById = Object.fromEntries(PRICE_BANDS.map((b) => [b.id, b]));
  const sellerByName = Object.fromEntries(SELLERS.map((s) => [s.name, s]));
  const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const waLink = (number, text) =>
    `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  const cedi = (n) => "GH₵ " + n.toLocaleString("en-GH");
  const escape = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = new URLSearchParams(location.search);
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}">${escape(c.name)}</option>`).join("");
  const regionOptions = REGIONS.map((r) => `<option value="${r.id}">${escape(r.name)}</option>`).join("");
  const siteLink = (path) => `https://${CONFIG.siteUrl}/${path}`;
  // Each product has its own page, built by tools/build-pages.mjs.
  const productUrl = (p) => `product-${p.id}.html`;
  const discountOf = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  // Photo over the category icon; if the photo fails to load, the icon shows instead.
  const photo = (src, alt) =>
    src ? `<img class="photo" src="${escape(src)}" alt="${escape(alt)}" loading="lazy" decoding="async" onerror="this.remove()">` : "";
  const stars = (rating) => "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  // ---------- per-viewer preferences (browser storage) ----------
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };
  const saved = new Set(store.get("yenton-saved", []));
  function toggleSaved(id) {
    saved.has(id) ? saved.delete(id) : saved.add(id);
    store.set("yenton-saved", [...saved]);
    updateSavedCount();
  }
  function updateSavedCount() {
    $("#savedCount").textContent = saved.size;
    $("#savedCount").hidden = saved.size === 0;
    if ($("#savedToggle")) $("#savedToggle").innerHTML = `❤ ${t("nav.saved")} (${saved.size})`;
  }

  // ---------- product card ----------
  function productCard(p) {
    const cat = catById[p.category];
    const seller = sellerByName[p.seller] || {};
    const discount = discountOf(p);
    const msg = `Hello ${p.seller}, I saw your "${p.title}" on Yɛntɔn Online. Is it still available?`;
    return `
      <article class="product">
        <div class="product-media cat-${p.category}">
          <span>${cat.icon}</span>${photo(p.image, p.title)}
          <a class="media-link" href="${productUrl(p)}" aria-label="${escape(p.title)}"></a>
          ${discount ? `<b class="badge-deal">-${discount}%</b>` : ""}
          ${p.featured ? `<b class="badge-feat">${t("badge.featured")}</b>` : ""}
          <button class="heart ${saved.has(p.id) ? "on" : ""}" data-save="${p.id}" aria-label="${t("card.save")}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id) ? "❤" : "♡"}</button>
          <button class="heart share-mini" data-share="${p.id}" aria-label="${t("card.share")} — WhatsApp Status" title="Share to WhatsApp Status">↗</button>
        </div>
        <div class="product-body">
          <p class="product-cat">${escape(cat.name)}</p>
          <h3><a href="${productUrl(p)}">${escape(p.title)}</a></h3>
          <p class="price">${cedi(p.price)} ${p.oldPrice ? `<s>${cedi(p.oldPrice)}</s>` : ""}</p>
          <p class="meta">📍 ${escape(p.location)}</p>
          <p class="seller-line">
            ${escape(p.seller)}
            ${seller.verified ? `<span class="verified" title="Checked by the Yɛntɔn team">✔ ${t("badge.verified")}</span>` : ""}
            ${seller.rating ? `<span class="rating" title="${seller.reviews} buyer ratings">★ ${seller.rating.toFixed(1)} <small>(${seller.reviews})</small></span>` : ""}
          </p>
          <div class="card-actions">
            <a class="btn btn-wa" href="${waLink(p.whatsapp, msg)}" target="_blank" rel="noopener">${t("card.contact")}</a>
          </div>
        </div>
      </article>`;
  }

  document.addEventListener("click", (e) => {
    const heart = e.target.closest("[data-save]");
    if (heart) {
      const id = Number(heart.dataset.save);
      toggleSaved(id);
      document.querySelectorAll(`[data-save="${id}"]`).forEach((h) => {
        h.classList.toggle("on", saved.has(id));
        h.textContent = saved.has(id) ? "❤" : "♡";
        h.setAttribute("aria-pressed", saved.has(id));
      });
      if (params.get("saved") && $("#productGrid")) renderListings();
    }
    const share = e.target.closest("[data-share]");
    if (share) shareToStatus(productById[Number(share.dataset.share)], share);
    const shareLink = e.target.closest("[data-share-link]");
    if (shareLink) shareProductLink(productById[Number(shareLink.dataset.shareLink)]);
  });

  // Send a friend the product's own page. The link shows as a preview card with the photo and price.
  async function shareProductLink(p) {
    const url = siteLink(productUrl(p));
    const text = `${p.title} — ${cedi(p.price)} on Yɛntɔn Online`;
    if (navigator.share) {
      try { await navigator.share({ title: p.title, text, url }); } catch {}
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank", "noopener");
    }
  }

  // ---------- WhatsApp Status share image ----------
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }
  let mascotImg;
  function loadMascot() {
    if (!mascotImg) mascotImg = loadImage("assets/mascot-face.jpg");
    return mascotImg;
  }

  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let line = "";
    for (const word of text.split(" ")) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
      else line = test;
    }
    lines.push(line);
    return lines;
  }

  async function makeStatusImage(p) {
    await document.fonts.load('80px "Lilita One"').catch(() => {});
    const face = await loadMascot();
    const W = 1080, H = 1920;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const display = '"Lilita One", sans-serif';
    const body = '"Plus Jakarta Sans", sans-serif';

    // sunburst background
    const g = ctx.createRadialGradient(W / 2, 520, 50, W / 2, 520, 1400);
    g.addColorStop(0, "#fff27a"); g.addColorStop(.45, "#ffdd2e"); g.addColorStop(1, "#f7c600");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, 520); ctx.fillStyle = "rgba(255,255,255,.18)";
    for (let i = 0; i < 24; i++) {
      ctx.rotate(Math.PI / 12);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1600, -120); ctx.lineTo(1600, 120); ctx.fill();
    }
    ctx.restore();

    // logo
    ctx.textAlign = "center"; ctx.lineJoin = "round";
    ctx.font = `110px ${display}`;
    ctx.lineWidth = 14; ctx.strokeStyle = "#053d1b"; ctx.strokeText("YƐNTƆN", W / 2, 190);
    ctx.fillStyle = "#ffd21f"; ctx.fillText("YƐNTƆN", W / 2, 190);
    ctx.fillStyle = "#0a7a36"; roundRect(ctx, W / 2 - 170, 215, 340, 86, 20); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = `64px ${display}`; ctx.fillText("ONLINE", W / 2, 280);

    // product card
    const cx = 90, cy = 380, cw = W - 180, ch = 1150;
    ctx.fillStyle = "#053d1b"; roundRect(ctx, cx, cy + 14, cw, ch, 48); ctx.fill();
    ctx.fillStyle = "#fff"; roundRect(ctx, cx, cy, cw, ch, 48); ctx.fill();
    const tint = getComputedStyle(document.querySelector(`.cat-${p.category}`) || document.body).getPropertyValue("--tint").trim() || "#fff4dc";
    ctx.fillStyle = tint; roundRect(ctx, cx + 30, cy + 30, cw - 60, 520, 32); ctx.fill();
    const pic = p.image ? await loadImage(p.image) : null;
    if (pic) {
      // cover-fit the product photo into the rounded box
      const bw = cw - 60, bh = 520, scale = Math.max(bw / pic.width, bh / pic.height);
      const sw = bw / scale, sh = bh / scale;
      ctx.save(); roundRect(ctx, cx + 30, cy + 30, bw, bh, 32); ctx.clip();
      ctx.drawImage(pic, (pic.width - sw) / 2, (pic.height - sh) / 2, sw, sh, cx + 30, cy + 30, bw, bh);
      ctx.restore();
    } else {
      ctx.font = `300px ${body}`; ctx.textBaseline = "middle";
      ctx.fillText(catById[p.category].icon, W / 2, cy + 300);
      ctx.textBaseline = "alphabetic";
    }

    const discount = discountOf(p);
    if (discount) {
      ctx.fillStyle = "#d7141f"; roundRect(ctx, cx + 60, cy + 60, 210, 84, 42); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = `56px ${display}`; ctx.fillText(`-${discount}%`, cx + 165, cy + 122);
    }

    ctx.fillStyle = "#14211a"; ctx.font = `bold 62px ${body}`;
    const lines = wrapText(ctx, p.title, cw - 120).slice(0, 3);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, cy + 650 + i * 76));
    let y = cy + 650 + lines.length * 76 + 40;
    ctx.fillStyle = "#0a7a36"; ctx.font = `110px ${display}`; ctx.fillText(cedi(p.price), W / 2, y + 60);
    if (p.oldPrice) {
      ctx.fillStyle = "#5b6b62"; ctx.font = `48px ${body}`;
      const old = cedi(p.oldPrice), ow = ctx.measureText(old).width;
      ctx.fillText(old, W / 2, y + 130);
      ctx.fillRect(W / 2 - ow / 2, y + 115, ow, 5);
    }
    ctx.fillStyle = "#5b6b62"; ctx.font = `44px ${body}`;
    ctx.fillText(`📍 ${p.location} · ${p.seller}`, W / 2, cy + ch - 60);

    // mascot + call to action
    if (face) {
      ctx.save(); ctx.beginPath(); ctx.arc(200, 1680, 120, 0, Math.PI * 2); ctx.closePath();
      ctx.lineWidth = 16; ctx.strokeStyle = "#053d1b"; ctx.stroke(); ctx.clip();
      ctx.drawImage(face, 80, 1560, 240, 240); ctx.restore();
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#053d1b"; ctx.font = `72px ${display}`; ctx.fillText("Yɛtɔn Bebiaa!", 360, 1650);
    ctx.font = `bold 42px ${body}`; ctx.fillText("Chat the seller on WhatsApp", 360, 1715);
    // shrink the web address until it fits beside the mascot
    let urlSize = 42;
    do { ctx.font = `bold ${urlSize}px ${body}`; urlSize -= 2; } while (ctx.measureText(CONFIG.siteUrl).width > W - 400 && urlSize > 20);
    ctx.fillStyle = "#0a7a36"; ctx.fillText(CONFIG.siteUrl, 360, 1772);

    // flag stripe
    [["#d7141f", 0], ["#ffd21f", W / 3], ["#0a7a36", (2 * W) / 3]].forEach(([col, x]) => {
      ctx.fillStyle = col; ctx.fillRect(x, H - 40, W / 3 + 1, 40);
    });
    return new Promise((resolve) => c.toBlob(resolve, "image/png"));
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  async function shareToStatus(p, button) {
    const label = button.innerHTML;
    button.disabled = true; button.textContent = "…";
    try {
      const blob = await makeStatusImage(p);
      const file = new File([blob], `yenton-${p.id}.png`, { type: "image/png" });
      const text = `${p.title} — ${cedi(p.price)} on Yɛntɔn Online. ${siteLink(productUrl(p))}`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        toast("Image saved — post it on your WhatsApp Status!");
      }
    } catch (err) {
      if (err.name !== "AbortError") toast("Couldn't make the image. Try again.");
    } finally {
      button.disabled = false; button.innerHTML = label;
    }
  }

  function toast(text) {
    const el = document.createElement("div");
    el.className = "toast"; el.innerHTML = mascot(text);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // ---------- Deal of the Day ----------
  function dealOfTheDay() {
    const deals = PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => a.id - b.id);
    if (CONFIG.dealOfTheDay && productById[CONFIG.dealOfTheDay]) return productById[CONFIG.dealOfTheDay];
    return deals[Math.floor(Date.now() / 86400000) % deals.length];
  }

  function renderDealOfDay() {
    const p = dealOfTheDay();
    if (!p) return;
    const cat = catById[p.category];
    const msg = `Hello ${p.seller}, I saw your Deal of the Day "${p.title}" on Yɛntɔn Online. Is it still available?`;
    $("#dealOfDay").innerHTML = `
      <div class="dotd">
        <div class="dotd-media cat-${p.category}"><span>${cat.icon}</span>${photo(p.image, p.title)}<b class="badge-deal">-${discountOf(p)}%</b></div>
        <div class="dotd-body">
          <p class="dotd-tag">🔥 ${t("deal.title")}</p>
          <h2><a href="${productUrl(p)}">${escape(p.title)}</a></h2>
          <p class="price big">${cedi(p.price)} <s>${cedi(p.oldPrice)}</s></p>
          <p class="meta">📍 ${escape(p.location)} · ${escape(p.seller)}</p>
          <div class="countdown"><span>${t("deal.ends")}</span> <b id="countdown">--:--:--</b></div>
          <div class="card-actions">
            <a class="btn btn-wa" href="${waLink(p.whatsapp, msg)}" target="_blank" rel="noopener">${t("card.contact")}</a>
            <button class="btn btn-share" data-share="${p.id}">↗ ${t("card.share")}</button>
          </div>
        </div>
      </div>`;
    const tick = () => {
      // Ghana time is UTC+0, so the deal changes at UTC midnight.
      const left = 86400000 - (Date.now() % 86400000);
      const h = Math.floor(left / 3600000), m = Math.floor(left / 60000) % 60, s = Math.floor(left / 1000) % 60;
      $("#countdown").textContent = [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- product page ----------
  function renderProduct() {
    const p = productById[Number(document.body.dataset.product)];
    if (!p) {
      $("#productView").innerHTML = `<div class="empty">${mascot("Sorry, we can't find that page. It may have been sold or removed.")}
        <p><a class="btn btn-primary" href="shop.html">Browse the shop →</a></p></div>`;
      $("#relatedGrid").innerHTML = PRODUCTS.filter((x) => x.featured).slice(0, 4).map(productCard).join("");
      return;
    }
    const cat = catById[p.category];
    const seller = sellerByName[p.seller] || {};
    const discount = discountOf(p);
    const msg = `Hello ${p.seller}, I saw your "${p.title}" (${cedi(p.price)}) on Yɛntɔn Online: ${siteLink(productUrl(p))} Is it still available?`;
    $("#productView").innerHTML = `
      <article class="dotd product-detail">
        <div class="dotd-media cat-${p.category}">
          <span>${cat.icon}</span>${p.image ? `<img class="photo" src="${escape(p.image)}" alt="${escape(p.title)}" fetchpriority="high" onerror="this.remove()">` : ""}
          ${discount ? `<b class="badge-deal">-${discount}%</b>` : ""}
          <button class="heart ${saved.has(p.id) ? "on" : ""}" data-save="${p.id}" aria-label="${t("card.save")}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id) ? "❤" : "♡"}</button>
        </div>
        <div class="dotd-body">
          <p class="product-cat">${escape(cat.name)}</p>
          <h1>${escape(p.title)}</h1>
          <p class="price big">${cedi(p.price)} ${p.oldPrice ? `<s>${cedi(p.oldPrice)}</s>` : ""}</p>
          <p class="meta">📍 ${escape(p.location)}</p>
          <div class="seller-box">
            <p class="seller-line">
              ${escape(p.seller)}
              ${seller.verified ? `<span class="verified" title="Checked by the Yɛntɔn team">✔ ${t("badge.verified")}</span>` : ""}
              ${seller.rating ? `<span class="rating">★ ${seller.rating.toFixed(1)} <small>(${seller.reviews})</small></span>` : ""}
            </p>
            ${seller.blurb ? `<p class="seller-blurb">${escape(seller.blurb)}</p>` : ""}
            <a class="text-link" href="shop.html?q=${encodeURIComponent(p.seller)}">More from this seller →</a>
          </div>
          <div class="card-actions">
            <a class="btn btn-wa" href="${waLink(p.whatsapp, msg)}" target="_blank" rel="noopener">${t("card.contact")}</a>
          </div>
          <div class="card-actions">
            <button class="btn btn-outline btn-sm" data-share-link="${p.id}">🔗 Send to a friend</button>
            <button class="btn btn-share btn-sm" data-share="${p.id}">↗ WhatsApp Status image</button>
          </div>
        </div>
      </article>`;
    const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id);
    const others = PRODUCTS.filter((x) => x.category !== p.category && x.featured);
    $("#relatedGrid").innerHTML = [...related, ...others].slice(0, 4).map(productCard).join("");
  }

  // ---------- buyer safety ----------
  function renderSafetyTips() {
    const report = waLink(CONFIG.whatsapp, "Hello Yɛntɔn Online, I want to report a problem with a seller: ");
    document.querySelectorAll("#safetyTips").forEach((el) => (el.innerHTML = `
      <div class="safety">
        <h2>🛡️ Buy safely</h2>
        <ul>
          <li><b>See it before you pay.</b> Meet in a busy public place, or use a delivery service you trust.</li>
          <li><b>Check it works</b> and matches the photos before handing over money.</li>
          <li><b>Avoid deposits to strangers.</b> Look for the <span class="verified">✔ Verified</span> badge, checked by our team.</li>
          <li><b>Never share your MoMo PIN</b> or codes sent to your phone. Yɛntɔn Online will never ask for them.</li>
        </ul>
        <p class="safety-note">Sellers handle their own sales. If something goes wrong, tell us and we'll look into the seller.</p>
        <a class="btn btn-outline btn-sm" href="${report}" target="_blank" rel="noopener">⚠ Report a seller</a>
      </div>`));
  }

  // ---------- Seller Spotlight ----------
  function renderSpotlight() {
    const s = sellerByName[SPOTLIGHT.seller] || { name: SPOTLIGHT.seller, category: "services", location: "" };
    const cat = catById[s.category];
    $("#spotlight").innerHTML = `
      <article class="spotlight">
        <div class="spotlight-avatar cat-${s.category}"><span>${cat.icon}</span>${photo(SPOTLIGHT.image, s.name)}</div>
        <div>
          <p class="eyebrow">⭐ Seller Spotlight</p>
          <h2>${escape(SPOTLIGHT.headline)}</h2>
          <p>${escape(SPOTLIGHT.story)}</p>
          <blockquote>“${escape(SPOTLIGHT.quote)}” <cite>— ${escape(s.name)}${s.location ? ", " + escape(s.location) : ""}</cite></blockquote>
          <div class="card-actions">
            <a class="btn btn-outline btn-sm" href="shop.html?q=${encodeURIComponent(s.name)}">See their products →</a>
            ${SPOTLIGHT.video ? `<a class="btn btn-gold btn-sm" href="${SPOTLIGHT.video}" target="_blank" rel="noopener">▶ Watch their story</a>` : ""}
          </div>
        </div>
      </article>`;
  }

  // ---------- home ----------
  function renderCategories() {
    $("#categoryGrid").innerHTML = CATEGORIES.map((c) => {
      const count = PRODUCTS.filter((p) => p.category === c.id).length;
      return `
        <a class="category cat-${c.id}" href="shop.html?cat=${c.id}">
          <div class="category-photo">${photo(c.image, c.name)}<span class="category-icon">${c.icon}</span></div>
          <strong>${escape(c.name)}</strong>
          <small>${escape(c.desc)}</small>
          <em>${count} listing${count === 1 ? "" : "s"} →</em>
        </a>`;
    }).join("");
  }

  function renderHero() {
    $("#heroGrid").innerHTML = PRODUCTS.filter((p) => p.featured).slice(0, 4).map((p) => `
      <a class="mini cat-${p.category}" href="shop.html?cat=${p.category}">
        <span class="mini-thumb">${catById[p.category].icon}${photo(p.image, p.title)}</span>
        <p>${escape(p.title)}</p>
        <strong>${cedi(p.price)}</strong>
      </a>`).join("");
  }

  // ---------- shop ----------
  const filters = {
    cat: catById[params.get("cat")] ? params.get("cat") : "all",
    q: params.get("q") || "",
    region: regionById[params.get("region")] ? params.get("region") : store.get("yenton-region", "all"),
    price: bandById[params.get("price")] ? params.get("price") : "all",
    verified: params.get("verified") === "1",
    saved: params.get("saved") === "1",
  };

  function setupShop() {
    $("#filterChips").innerHTML =
      `<button class="chip" data-cat="all">All</button>` +
      CATEGORIES.map((c) => `<button class="chip" data-cat="${c.id}">${c.icon} ${escape(c.name.split(" ")[0])}</button>`).join("");
    $("#priceChips").innerHTML =
      `<button class="chip" data-price="all">Any price</button>` +
      PRICE_BANDS.map((b) => `<button class="chip" data-price="${b.id}">${b.label}</button>`).join("");
    $("#regionSelect").insertAdjacentHTML("beforeend", regionOptions);

    $("#filterChips").addEventListener("click", (e) => {
      const chip = e.target.closest("[data-cat]");
      if (chip) { filters.cat = chip.dataset.cat; renderListings(); }
    });
    $("#priceChips").addEventListener("click", (e) => {
      const chip = e.target.closest("[data-price]");
      if (chip) { filters.price = chip.dataset.price; renderListings(); }
    });
    $("#regionSelect").addEventListener("change", (e) => {
      filters.region = e.target.value;
      store.set("yenton-region", filters.region);
      renderListings();
    });
    $("#verifiedToggle").addEventListener("click", () => { filters.verified = !filters.verified; renderListings(); });
    $("#savedToggle").addEventListener("click", () => { filters.saved = !filters.saved; renderListings(); });
    $("#searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      filters.q = $("#searchInput").value;
      filters.cat = $("#searchCategory").value;
      renderListings();
    });
    renderListings();
  }

  function renderListings() {
    const q = filters.q.trim().toLowerCase();
    const band = bandById[filters.price];
    const items = PRODUCTS.filter((p) => {
      if (filters.cat !== "all" && p.category !== filters.cat) return false;
      if (filters.region !== "all" && p.region !== filters.region) return false;
      if (band && (p.price < band.min || p.price >= band.max)) return false;
      if (filters.verified && !sellerByName[p.seller]?.verified) return false;
      if (filters.saved && !saved.has(p.id)) return false;
      if (!q) return true;
      return [p.title, p.seller, p.location, catById[p.category].name].join(" ").toLowerCase().includes(q);
    }).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.id - a.id);

    $("#productGrid").innerHTML = items.map(productCard).join("");
    $("#emptyState").hidden = items.length > 0;
    if (!items.length) {
      $("#emptyState").innerHTML = mascot(filters.saved && !saved.size
        ? "You haven't saved anything yet. Tap ♡ on a product to keep it here."
        : `Charlie, we no get am yet! Tell us what you need and we'll find a seller for you.`, "mascot-big") +
        `<div class="card-actions center"><a class="btn btn-gold" href="find.html${q ? "?want=" + encodeURIComponent(filters.q.trim()) : ""}">${t("path.find")} →</a>
         <a class="btn btn-outline" href="advertise.html">Selling this? Advertise with us</a></div>`;
    }

    const parts = [];
    if (filters.saved) parts.push("Your saved products");
    else if (q) parts.push(`Results for “${filters.q.trim()}”`);
    else parts.push(filters.cat === "all" ? "Featured & recently listed" : catById[filters.cat].name);
    if (q && filters.cat !== "all") parts.push("in " + catById[filters.cat].name);
    if (filters.region !== "all") parts.push("· " + regionById[filters.region].name);
    $("#listingsTitle").textContent = parts.join(" ");
    $("#resultCount").textContent = `${items.length} listing${items.length === 1 ? "" : "s"}`;

    document.querySelectorAll("#filterChips .chip").forEach((el) => el.classList.toggle("active", el.dataset.cat === filters.cat));
    document.querySelectorAll("#priceChips .chip").forEach((el) => el.classList.toggle("active", el.dataset.price === filters.price));
    $("#verifiedToggle").classList.toggle("active", filters.verified);
    $("#verifiedToggle").setAttribute("aria-pressed", filters.verified);
    $("#savedToggle").classList.toggle("active", filters.saved);
    $("#savedToggle").setAttribute("aria-pressed", filters.saved);
    $("#savedToggle").innerHTML = `❤ ${t("nav.saved")} (${saved.size})`;
    $("#regionSelect").value = filters.region;
    $("#searchCategory").value = filters.cat;
    $("#searchInput").value = filters.q;

    const url = new URLSearchParams();
    if (filters.q.trim()) url.set("q", filters.q.trim());
    if (filters.cat !== "all") url.set("cat", filters.cat);
    if (filters.price !== "all") url.set("price", filters.price);
    if (filters.region !== "all") url.set("region", filters.region);
    if (filters.verified) url.set("verified", "1");
    if (filters.saved) url.set("saved", "1");
    history.replaceState(null, "", url.toString() ? "?" + url : location.pathname);
  }

  // ---------- deals ----------
  function renderDeals() {
    const deals = PRODUCTS.filter((p) => p.oldPrice).sort((a, b) => discountOf(b) - discountOf(a));
    $("#dealsGrid").innerHTML = deals.map(productCard).join("");
  }

  // ---------- directory + ratings ----------
  function renderDirectory() {
    const list = [...SELLERS].sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0) || (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
    $("#directoryGrid").innerHTML = list.map((b) => {
      const cat = catById[b.category];
      return `
        <article class="biz ${b.premium ? "biz-premium" : ""}">
          <div class="biz-avatar cat-${b.category}">${escape(b.name.charAt(0))}</div>
          <div class="biz-body">
            <h3>${escape(b.name)} ${b.premium ? `<span class="pill">Premium</span>` : ""}</h3>
            <p class="meta">${cat.icon} ${escape(cat.name)} · 📍 ${escape(b.location)}</p>
            <p class="seller-line">
              ${b.verified ? `<span class="verified">✔ ${t("badge.verified")}</span>` : ""}
              ${b.rating ? `<span class="rating"><span class="stars">${stars(b.rating)}</span> ${b.rating.toFixed(1)} <small>(${b.reviews})</small></span>` : `<small class="muted-small">No ratings yet</small>`}
            </p>
            <p>${escape(b.blurb)}</p>
            <div class="rate" data-seller="${escape(b.name)}">
              <span>Bought from them? Rate:</span>
              ${[1, 2, 3, 4, 5].map((n) => `<button data-rate="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}
            </div>
            <a class="link" href="shop.html?q=${encodeURIComponent(b.name)}">See products →</a>
          </div>
        </article>`;
    }).join("");

    $("#directoryGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-rate]");
      if (!btn) return;
      const n = Number(btn.dataset.rate);
      const name = btn.closest("[data-seller]").dataset.seller;
      const text = `Hello Yɛntɔn Online, I bought from ${name}.\nMy rating: ${"⭐".repeat(n)} (${n}/5)\nWhat I bought:\nComment:`;
      window.open(waLink(CONFIG.whatsapp, text), "_blank", "noopener");
    });
    $("#directoryGrid").addEventListener("mouseover", (e) => {
      const btn = e.target.closest("[data-rate]");
      if (!btn) return;
      const n = Number(btn.dataset.rate);
      btn.parentElement.querySelectorAll("[data-rate]").forEach((b) => b.classList.toggle("lit", Number(b.dataset.rate) <= n));
    });
    $("#directoryGrid").addEventListener("mouseout", (e) => {
      const box = e.target.closest(".rate");
      if (box && !box.contains(e.relatedTarget)) box.querySelectorAll("[data-rate]").forEach((b) => b.classList.remove("lit"));
    });
  }

  // ---------- forms that send to WhatsApp ----------
  function thankYou(form, text) {
    form.insertAdjacentHTML("afterend", `<div class="thanks">${mascot(text, "mascot-big")}</div>`);
    form.hidden = true;
  }

  function setupAdvertiseForm() {
    $("#formCategory").innerHTML = `<option value="">Select…</option>` + catOptions;
    const plan = params.get("plan");
    if (plan && [...$("#formPlan").options].some((o) => o.value === plan)) $("#formPlan").value = plan;
    if (params.get("ref")) $("#formRef").value = params.get("ref");

    const quickText = "Hello Yɛntɔn Online, I want to advertise my product. I'm sending 3 photos, the price and my location.";
    $("#quickSell").href = waLink(CONFIG.whatsapp, quickText);
    $("#voiceNote").href = waLink(CONFIG.whatsapp, "Hello Yɛntɔn Online, I'm sending a voice note about my product. 🎤");

    $("#advertiseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const text = [
        "Hello Yɛntɔn Online, I'd like to advertise.",
        `Name: ${d.name}`,
        d.business && `Business: ${d.business}`,
        `Phone: ${d.phone}`,
        d.location && `Location: ${d.location}`,
        `Category: ${catById[d.category]?.name || d.category}`,
        `Package: ${d.plan}`,
        d.ref && `Referred by: ${d.ref}`,
        `Details: ${d.details}`,
      ].filter(Boolean).join("\n");
      window.open(waLink(CONFIG.whatsapp, text), "_blank", "noopener");
      thankYou(e.target, `Medaase, ${escape(d.name)}! Your details are ready in WhatsApp — just press send and add your photos. We'll reply soon.`);
    });
  }

  function setupFindForm() {
    $("#findRegion").insertAdjacentHTML("beforeend", regionOptions);
    $("#findCategory").insertAdjacentHTML("beforeend", catOptions);
    if (params.get("want")) $("#findWant").value = params.get("want");
    $("#findForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const text = [
        "Hello Yɛntɔn Online, please help me find:",
        `What: ${d.want}`,
        d.category && `Category: ${catById[d.category]?.name}`,
        d.budget && `Budget: GH₵ ${d.budget}`,
        d.region && `Area: ${regionById[d.region]?.name}`,
        d.when && `Needed: ${d.when}`,
        `Name: ${d.name}`,
      ].filter(Boolean).join("\n");
      window.open(waLink(CONFIG.whatsapp, text), "_blank", "noopener");
      thankYou(e.target, `We dey on am! Send the message in WhatsApp and we'll look for a seller for you.`);
    });
  }

  // ---------- packages: referrals + Mobile Money ----------
  function setupPackages() {
    document.querySelectorAll("[data-momo]").forEach((el) => (el.textContent = CONFIG.momo[el.dataset.momo]));
    $("#momoProof").href = waLink(CONFIG.whatsapp, "Hello Yɛntɔn Online, I've paid my advertising fee by Mobile Money. Business name: \nPackage: \n(Screenshot attached)");
    $("#referForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#referName").value.trim();
      const link = siteLink("advertise.html?ref=" + encodeURIComponent(name));
      const text = `I advertise my business with Yɛntɔn Online and they bring me customers. Try them — mention my name (${name}) when you sign up: ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });
  }

  // ---------- campaign reports (data lives only in the link) ----------
  // URL-safe base64 of UTF-8 JSON (so names like "Yɛntɔn" survive).
  const encodeReport = (obj) =>
    btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const decodeReport = (str) =>
    JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))));

  function setupReport() {
    const hash = location.hash.startsWith("#d=") ? location.hash.slice(3) : "";
    if (hash) {
      let r;
      try { r = decodeReport(hash); } catch { r = null; }
      if (r) return showReport(r);
    }
    addEventListener("hashchange", () => location.reload());
    $("#reportMaker").hidden = false;
    $("#reportForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      ["reach", "views", "clicks", "spend"].forEach((k) => (d[k] = Number(d[k]) || 0));
      const url = location.href.split("#")[0] + "#d=" + encodeReport(d);
      $("#reportLink").value = url;
      $("#reportOut").hidden = false;
      $("#reportOpen").href = url;
      $("#reportSend").href = `https://wa.me/?text=${encodeURIComponent(`Hello ${d.seller}, here is your Yɛntɔn Online campaign report: ${url}`)}`;
    });
    $("#reportCopy").addEventListener("click", () => {
      navigator.clipboard?.writeText($("#reportLink").value).then(() => toast("Link copied!"), () => {});
    });
  }

  function showReport(r) {
    const perClick = r.clicks ? (r.spend / r.clicks).toFixed(2) : "–";
    $("#reportView").hidden = false;
    $("#reportView").innerHTML = `
      <div class="report-head">
        <p class="eyebrow">Campaign report</p>
        <h2>${escape(r.seller)}</h2>
        <p class="meta">${escape(r.campaign || "")}${r.period ? " · " + escape(r.period) : ""}</p>
      </div>
      <div class="stat-grid">
        <div class="stat"><span>People reached</span><strong>${r.reach.toLocaleString()}</strong></div>
        <div class="stat"><span>Ad views</span><strong>${r.views.toLocaleString()}</strong></div>
        <div class="stat stat-green"><span>WhatsApp enquiries</span><strong>${r.clicks.toLocaleString()}</strong></div>
        <div class="stat"><span>Ad budget spent</span><strong>${cedi(r.spend)}</strong><small>${perClick === "–" ? "" : "GH₵ " + perClick + " per enquiry"}</small></div>
      </div>
      ${r.notes ? `<div class="card report-notes"><h3>Notes from the Yɛntɔn team</h3><p>${escape(r.notes)}</p></div>` : ""}
      ${mascot("Ready for your next campaign? Let's bring you more customers!", "mascot-big")}
      <div class="card-actions center">
        <a class="btn btn-gold" href="${waLink(CONFIG.whatsapp, `Hello Yɛntɔn Online, I'd like to renew my campaign for ${r.seller}.`)}" target="_blank" rel="noopener">Renew my campaign</a>
      </div>`;
  }

  // ---------- shared ----------
  function renderShared() {
    document.querySelectorAll("[data-config]").forEach((el) => (el.textContent = CONFIG[el.dataset.config]));
    const hello = "Hello Yɛntɔn Online, I'd like to make an enquiry.";
    $("#waFloat").href = waLink(CONFIG.whatsapp, hello);
    if ($("#contactWhatsApp")) {
      $("#contactWhatsApp").href = waLink(CONFIG.whatsapp, hello);
      $("#contactPhone").href = "tel:+" + CONFIG.phone;
      $("#contactEmail").href = "mailto:" + CONFIG.email;
    }
    if ($("#fbProof")) $("#fbProof").href = CONFIG.socials.Facebook;
    $("#socials").innerHTML = Object.entries(CONFIG.socials).filter(([, url]) => url)
      .map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener">${name}</a>`).join("");
    $("#year").textContent = new Date().getFullYear();
    updateSavedCount();

    const menuToggle = $("#menuToggle");
    menuToggle.addEventListener("click", () => {
      const open = $("#nav").classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // ---------- products from the Google Sheet ----------
  // Shows the last copy saved on this phone straight away and refreshes it in the background,
  // so new rows appear on the next page a visitor opens. First visits wait up to 5 seconds.
  async function loadSheetProducts() {
    if (!CONFIG.productsSheet || typeof Sheet === "undefined") return;
    const use = (csv) => {
      const list = Sheet.toProducts(csv, CATEGORIES, REGIONS, CONFIG.whatsapp);
      if (!list.length) return false;
      PRODUCTS.splice(0, PRODUCTS.length, ...list);
      for (const id in productById) delete productById[id];
      list.forEach((p) => (productById[p.id] = p));
      return true;
    };
    const fresh = fetch(CONFIG.productsSheet, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((csv) => { store.set("yenton-sheet", csv); return csv; });
    const cached = store.get("yenton-sheet", null);
    if (cached && use(cached)) { fresh.catch(() => {}); return; }
    try {
      use(await Promise.race([fresh, new Promise((_, fail) => setTimeout(fail, 5000))]));
    } catch {}
  }

  // ---------- init ----------
  renderShared();
  await loadSheetProducts();
  if ($("#searchCategory")) $("#searchCategory").insertAdjacentHTML("beforeend", catOptions);
  if ($("#categoryGrid")) renderCategories();
  if ($("#heroGrid")) renderHero();
  if ($("#dealOfDay")) renderDealOfDay();
  if ($("#spotlight")) renderSpotlight();
  if ($("#productGrid")) setupShop();
  if ($("#productView")) renderProduct();
  if ($("#safetyTips")) renderSafetyTips();
  if ($("#dealsGrid")) renderDeals();
  if ($("#directoryGrid")) renderDirectory();
  if ($("#advertiseForm")) setupAdvertiseForm();
  if ($("#findForm")) setupFindForm();
  if ($("#referForm")) setupPackages();
  if ($("#reportForm")) setupReport();
})();
