// ============================================================
// Yɛntɔn Online — site content
// Edit this file to update contact details, categories,
// product listings, deals, sellers, campaigns and more.
// ============================================================

const CONFIG = {
  // Main business WhatsApp number in international format, digits only (233 = Ghana).
  whatsapp: "233206674019",
  whatsappDisplay: "020 667 4019",
  // Number for phone calls (same format as above).
  phone: "233257527018",
  phoneDisplay: "025 752 7018",
  email: "yentnonline@gmail.com",
  // The live website address (no https://), used in shared links and Status images.
  // Change this when you get your own domain, e.g. "yentononline.com".
  siteUrl: "fabianantwi1013-ship-it.github.io/yenton-online",
  // Mobile Money details for paying advertising fees.
  // TODO: set `name` to the exact name registered on this MoMo line.
  momo: { network: "MTN MoMo", number: "025 752 7018", name: "Yɛntɔn Online" },
  // Shown on the home page. Update as the page grows.
  facebookFollowers: "68K",
  socials: {
    Facebook: "https://www.facebook.com/share/1MfzyT4FFR/",
    // Leave a link "" to hide it until the account exists.
    Instagram: "",
    TikTok: "https://www.tiktok.com/@sellonline49",
    YouTube: "",
    X: "",
  },
  // Google Sheet of products (File → Share → Publish to web → CSV link).
  // When set, the site shows the sheet's products instead of PRODUCTS below. Leave "" to use PRODUCTS.
  productsSheet: "",
  // Product id to force as Deal of the Day. Leave null to rotate daily through discounted items.
  dealOfTheDay: null,
};

const CATEGORIES = [
  { id: "food", image: "assets/photos/p16.webp", name: "Food & Groceries", icon: "🍚", desc: "Foodstuffs, fresh produce, meat & fish, restaurants" },
  { id: "electronics", image: "assets/photos/p3.webp", name: "Electronics & Tech", icon: "📱", desc: "Phones, laptops, TVs, appliances, gadgets" },
  { id: "fashion", image: "assets/photos/p6.webp", name: "Fashion & Beauty", icon: "👗", desc: "Clothes, footwear, cosmetics, hair, beauty services" },
  { id: "auto", image: "assets/photos/p8.webp", name: "Automobiles", icon: "🚗", desc: "Cars, motorbikes, spare parts, car rental" },
  { id: "property", image: "assets/photos/p10.webp", name: "Property & Real Estate", icon: "🏠", desc: "Houses, apartments, land, commercial space" },
  { id: "home", image: "assets/photos/p12.webp", name: "Home & Lifestyle", icon: "🛋️", desc: "Furniture, building materials, décor" },
  { id: "services", image: "assets/photos/p14.webp", name: "Services", icon: "📸", desc: "Events, photography, cleaning, travel, professionals" },
];

// Areas buyers can filter by. Each product's `region` must be one of these ids.
const REGIONS = [
  { id: "accra", name: "Accra & Tema" },
  { id: "kumasi", name: "Kumasi" },
  { id: "central", name: "Cape Coast & Kasoa" },
  { id: "western", name: "Takoradi" },
  { id: "north", name: "Tamale & North" },
];

// Price bands for the shop filter (GH₵).
const PRICE_BANDS = [
  { id: "u100", label: "Under GH₵100", min: 0, max: 100 },
  { id: "100-500", label: "GH₵100–500", min: 100, max: 500 },
  { id: "500-5k", label: "GH₵500–5,000", min: 500, max: 5000 },
  { id: "5k+", label: "GH₵5,000+", min: 5000, max: Infinity },
];

// SAMPLE LISTINGS — placeholders to show the layout. Replace with real seller listings.
// image: put the seller's photo in assets/photos/ (about 600×450, .webp or .jpg). Leave it out to show the category icon.
// Sample photos are free stock photos from Unsplash.
// `seller` must match a name in SELLERS below to show its Verified badge and rating.
// Once CONFIG.productsSheet is set, products come from the Google Sheet instead and this list is only a backup.
// After editing this list, run:  node tools/build-pages.mjs
// (it makes each product's own page and its WhatsApp/Facebook link preview).
const PRODUCTS = [
  { id: 1, image: "assets/photos/p1.webp", title: "Jasmine Rice, 25kg bag", category: "food", price: 650, oldPrice: 720, location: "Kumasi", region: "kumasi", seller: "Sample Foods Ltd", whatsapp: "233206674019", featured: true },
  { id: 2, image: "assets/photos/p2.webp", title: "Pure Vegetable Cooking Oil, 5L", category: "food", price: 165, location: "Accra", region: "accra", seller: "Sample Foods Ltd", whatsapp: "233206674019" },
  { id: 3, image: "assets/photos/p3.webp", title: "Smartphone 128GB, Dual SIM", category: "electronics", price: 2400, oldPrice: 2800, location: "Accra, Circle", region: "accra", seller: "Sample Phones", whatsapp: "233206674019", featured: true },
  { id: 4, image: "assets/photos/p4.webp", title: "Laptop Core i5, 8GB RAM, 256GB SSD", category: "electronics", price: 5200, location: "Kumasi, Adum", region: "kumasi", seller: "Sample Tech Hub", whatsapp: "233206674019" },
  { id: 5, image: "assets/photos/p5.webp", title: "43\" Smart LED TV", category: "electronics", price: 3100, oldPrice: 3500, location: "Takoradi", region: "western", seller: "Sample Electronics", whatsapp: "233206674019" },
  { id: 6, image: "assets/photos/p6.webp", title: "Ladies' Kente Print Dress", category: "fashion", price: 280, location: "Accra, Osu", region: "accra", seller: "Sample Boutique", whatsapp: "233206674019", featured: true },
  { id: 7, image: "assets/photos/p7.webp", title: "Shea Butter Skincare Set", category: "fashion", price: 120, oldPrice: 150, location: "Tamale", region: "north", seller: "Sample Naturals", whatsapp: "233206674019" },
  { id: 8, image: "assets/photos/p8.webp", title: "Toyota Corolla 2016, Automatic", category: "auto", price: 145000, location: "Accra, Abossey Okai", region: "accra", seller: "Sample Motors", whatsapp: "233206674019" },
  { id: 9, image: "assets/photos/p9.webp", title: "Car Rental — Daily from", category: "auto", price: 450, location: "Kumasi", region: "kumasi", seller: "Sample Rentals", whatsapp: "233206674019" },
  { id: 10, image: "assets/photos/p10.webp", title: "2-Bedroom Apartment for Rent (per month)", category: "property", price: 3500, location: "East Legon", region: "accra", seller: "Sample Realty", whatsapp: "233206674019", featured: true },
  { id: 11, image: "assets/photos/p11.webp", title: "Plot of Land, Documented", category: "property", price: 85000, location: "Kasoa", region: "central", seller: "Sample Lands", whatsapp: "233206674019" },
  { id: 12, image: "assets/photos/p12.webp", title: "3-Seater Fabric Sofa", category: "home", price: 2800, oldPrice: 3300, location: "Kumasi", region: "kumasi", seller: "Sample Furniture", whatsapp: "233206674019" },
  { id: 13, image: "assets/photos/p13.webp", title: "Cement, 50kg bag", category: "home", price: 98, location: "Tema", region: "accra", seller: "Sample Building Supplies", whatsapp: "233206674019" },
  { id: 14, image: "assets/photos/p14.webp", title: "Wedding Photography & Video Package", category: "services", price: 4500, oldPrice: 5200, location: "Accra", region: "accra", seller: "Sample Studios", whatsapp: "233206674019" },
  { id: 15, image: "assets/photos/p15.webp", title: "Home Deep Cleaning", category: "services", price: 600, location: "Accra & Tema", region: "accra", seller: "Sample Cleaners", whatsapp: "233206674019" },
  { id: 16, image: "assets/photos/p16.webp", title: "Catering for Events (per head from)", category: "food", price: 85, location: "Cape Coast", region: "central", seller: "Sample Catering", whatsapp: "233206674019" },
];

// SAMPLE SELLERS — the Business Directory. Replace with real registered businesses.
// verified: checked by the Yɛntɔn team. rating/reviews: from ratings buyers send you on WhatsApp.
// premium: paid enhanced directory listing.
const SELLERS = [
  { name: "Sample Phones", category: "electronics", location: "Accra, Circle", blurb: "Phones, accessories and repairs.", verified: true, premium: true, rating: 4.8, reviews: 23 },
  { name: "Sample Boutique", category: "fashion", location: "Accra, Osu", blurb: "African prints and ready-to-wear.", verified: true, rating: 4.6, reviews: 11 },
  { name: "Sample Motors", category: "auto", location: "Abossey Okai", blurb: "Quality used cars and spare parts.", verified: true, premium: true, rating: 4.5, reviews: 8 },
  { name: "Sample Realty", category: "property", location: "East Legon", blurb: "Rentals, sales and property management.", verified: true, rating: 4.7, reviews: 6 },
  { name: "Sample Studios", category: "services", location: "Accra", blurb: "Weddings, events and product shoots.", rating: 4.9, reviews: 15 },
  { name: "Sample Foods Ltd", category: "food", location: "Kumasi", blurb: "Wholesale rice, oil and foodstuffs.", verified: true, rating: 4.4, reviews: 19 },
  { name: "Sample Naturals", category: "fashion", location: "Tamale", blurb: "Handmade shea butter skincare." },
  { name: "Sample Furniture", category: "home", location: "Kumasi", blurb: "Sofas, beds and dining sets made to order.", rating: 4.3, reviews: 4 },
];

// Weekly Seller Spotlight shown on the home page and directory.
const SPOTLIGHT = {
  seller: "Sample Naturals",
  headline: "From Tamale shea nuts to skincare sold across Ghana",
  story: "Sample Naturals started with one woman making shea butter at home. Today her skincare sets reach buyers in Accra, Kumasi and beyond — sample story, replace with a real one.",
  quote: "Customers now find me without me going to the market every day.",
  image: "assets/photos/spotlight.webp",
  // Optional: link to a Facebook/TikTok/YouTube video about the business.
  video: "",
};

// Seasonal campaigns. The first one whose dates include today shows as a banner on every page.
// Dates are "MM-DD". Ramadan and Eid move every year — add them with that year's dates.
const CAMPAIGNS = [
  { name: "Back to School", start: "01-02", end: "01-20", emoji: "🎒", text: "Back to School deals — bags, shoes, books & more" },
  { name: "Valentine's", start: "02-01", end: "02-14", emoji: "💝", text: "Valentine's gifts from Ghanaian sellers" },
  { name: "Independence Day", start: "03-01", end: "03-07", emoji: "🇬🇭", text: "Independence Day — celebrate & buy Ghanaian" },
  { name: "Back to School", start: "08-25", end: "09-15", emoji: "🎒", text: "Back to School deals — bags, shoes, books & more" },
  { name: "Christmas", start: "11-01", end: "12-31", emoji: "🎄", text: "Christmas is coming — gift deals & end-of-year offers" },
];
