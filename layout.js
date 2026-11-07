// Shared header, footer, campaign banner and mascot, injected into every page.
// Each page sets <body data-page="..."> so the current link is highlighted,
// and optionally data-mascot="..." for what the mascot says in the page header.
(function () {
  const page = document.body.dataset.page;
  const links = [
    ["home", "index.html", "nav.home"],
    ["shop", "shop.html", "nav.shop"],
    ["deals", "deals.html", "nav.deals"],
    ["directory", "directory.html", "nav.directory"],
    ["how", "how-it-works.html", "nav.how"],
    ["packages", "packages.html", "nav.packages"],
    ["contact", "contact.html", "nav.contact"],
  ];
  const logo = (extra = "") => `
    <a href="index.html" class="logo ${extra}" aria-label="Yɛntɔn Online home">
      <span class="logo-mark">Y</span>
      <span class="logo-text">Yɛntɔn<span>Online</span></span>
    </a>`;

  // Seasonal campaign banner
  const today = new Date().toISOString().slice(5, 10);
  const campaign = CAMPAIGNS.find((c) => today >= c.start && today <= c.end);
  const banner = campaign
    ? `<a class="campaign" href="deals.html"><span>${campaign.emoji}</span> ${campaign.text} <b>→</b></a>`
    : "";

  document.getElementById("site-header").outerHTML = `
    ${banner}
    <header class="topbar">
      <div class="container topbar-inner">
        ${logo()}
        <nav class="nav" id="nav">
          ${links.map(([id, href, key]) =>
            `<a href="${href}"${id === page ? ' class="active" aria-current="page"' : ""} data-i18n="${key}"></a>`).join("")}
          <a href="advertise.html" class="btn btn-gold btn-sm${page === "advertise" ? " active" : ""}" data-i18n="nav.advertise"></a>
        </nav>
        <div class="topbar-tools">
          <a href="shop.html?saved=1" class="saved-link" aria-label="Saved products">❤<b id="savedCount">0</b></a>
          <div class="lang" role="group" aria-label="Language">
            <button data-lang="en" class="${LANG === "en" ? "on" : ""}">EN</button>
            <button data-lang="tw" class="${LANG === "tw" ? "on" : ""}">TWI</button>
          </div>
          <button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>`;

  document.getElementById("site-footer").outerHTML = `
    <footer class="footer">
      <div class="container footer-inner">
        <div>
          ${logo("logo-light")}
          <p>Give every business an opportunity to be seen, discovered and patronised.</p>
        </div>
        <div>
          <h4>Marketplace</h4>
          <a href="shop.html">Shop all products</a>
          <a href="deals.html">Affordable Deals</a>
          <a href="directory.html">Business Directory</a>
          <a href="find.html">Find it for me</a>
        </div>
        <div>
          <h4>Sellers</h4>
          <a href="how-it-works.html">How it works</a>
          <a href="packages.html">Packages &amp; payment</a>
          <a href="advertise.html">Advertise With Us</a>
          <a href="report.html">Campaign reports</a>
        </div>
        <div>
          <h4>Follow us</h4>
          <div class="socials" id="socials"></div>
        </div>
      </div>
      <div class="container footer-bottom">
        <p class="footer-tagline"><span data-i18n="footer.tagline"></span> — <strong>Yɛtɔn Bebiaa!</strong></p>
        <p>© <span id="year"></span> Yɛntɔn Online. Sellers handle their own transactions. All listings are subject to our advertising policy and applicable Ghanaian laws. <span class="photo-credit">Sample photos from <a href="https://unsplash.com" target="_blank" rel="noopener" style="display:inline">Unsplash</a>.</span></p>
      </div>
    </footer>
    <a class="wa-float" id="waFloat" target="_blank" rel="noopener" aria-label="Chat with Yɛntɔn Online on WhatsApp">💬</a>`;

  // Mascot speech bubble in the page header
  const says = document.body.dataset.mascot;
  const hero = document.querySelector(".page-hero .container");
  if (says && hero) {
    hero.classList.add("with-mascot");
    hero.insertAdjacentHTML("beforeend", mascot(says));
  }

  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.lang)));

  applyI18n();

  // Installable app + offline support
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();

// The Yɛntɔn mascot with a speech bubble. Used in page headers, empty states and thank-you messages.
function mascot(text, extra = "") {
  return `<div class="mascot ${extra}"><img src="assets/mascot-face.jpg" alt="" width="72" height="72"><p>${text}</p></div>`;
}
