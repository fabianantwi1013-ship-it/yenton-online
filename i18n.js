// English / Twi switch for the main menu, buttons and headings.
// Elements with data-i18n="key" are translated; scripts use t("key").
// NOTE: Twi wording is a first draft — have a Twi speaker check it before launch.
const I18N = {
  en: {
    "nav.home": "Home", "nav.shop": "Shop", "nav.deals": "Deals", "nav.directory": "Directory",
    "nav.how": "How it works", "nav.packages": "Packages", "nav.contact": "Contact",
    "nav.advertise": "Advertise With Us", "nav.saved": "Saved",
    "search.button": "Search", "search.placeholder": "Search phones, rice, apartments, photographers…",
    "card.contact": "Contact seller on WhatsApp", "card.share": "Share", "card.save": "Save",
    "badge.verified": "Verified", "badge.featured": "Featured",
    "deal.title": "Deal of the Day", "deal.ends": "Ends in",
    "path.buy": "I want to buy", "path.deal": "I want a good deal", "path.sell": "I want to sell", "path.find": "Find it for me",
    "find.title": "Can't find it? We'll find it for you",
    "quick.title": "Too busy for forms?", "quick.button": "Send photos on WhatsApp", "quick.voice": "Send a voice note",
    "next": "Next step",
    "footer.tagline": "Shop Online · Buy Ghanaian · Support Local",
  },
  tw: {
    "nav.home": "Fie", "nav.shop": "Tɔ", "nav.deals": "Ɛho yɛ mmerɛ", "nav.directory": "Aguadifo",
    "nav.how": "Sɛnea ɛyɛ", "nav.packages": "Nhyehyɛe", "nav.contact": "Frɛ yɛn",
    "nav.advertise": "Bɔ dawuro", "nav.saved": "Nea woakora",
    "search.button": "Hwehwɛ", "search.placeholder": "Hwehwɛ fon, ɛmo, dan, mfoninitwafo…",
    "card.contact": "Kasa kyerɛ tɔnfo no wɔ WhatsApp so", "card.share": "Kyɛ", "card.save": "Kora",
    "badge.verified": "Yɛahwɛ mu", "badge.featured": "Ɛda adi",
    "deal.title": "Ɛnnɛ Deal", "deal.ends": "Ɛbɛba awiei",
    "path.buy": "Mepɛ sɛ metɔ", "path.deal": "Mepɛ deɛ ɛho yɛ mmerɛ", "path.sell": "Mepɛ sɛ metɔn", "path.find": "Hwehwɛ ma me",
    "find.title": "Wonhu? Yɛbɛhwehwɛ ama wo",
    "quick.title": "Wonni bere?", "quick.button": "Fa mfonini fa WhatsApp so", "quick.voice": "Fa nne nkra",
    "next": "Anammɔn a ɛdi hɔ",
    "footer.tagline": "Tɔ wɔ intanɛt so · Tɔ Ghana nneɛma · Boa yɛn nkurɔfo",
  },
};

const LANG = (() => {
  try { return localStorage.getItem("yenton-lang") === "tw" ? "tw" : "en"; } catch { return "en"; }
})();

function t(key) {
  return I18N[LANG][key] || I18N.en[key] || key;
}

function setLang(lang) {
  try { localStorage.setItem("yenton-lang", lang); } catch {}
  location.reload();
}

function applyI18n(root = document) {
  document.documentElement.lang = LANG === "tw" ? "tw" : "en";
  root.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
}
