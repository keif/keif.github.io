export const SITE = {
  website: "https://baker.is/", // replace this with your deployed domain
  author: "Keith Baker",
  profile: "https://github.com/keif",
  desc: "Side projects, scripts, systems, and snacks.",
  title: "baker.is/",
  tagline: "Side projects, scripts, systems, and snacks.",
  ogImage: "og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: false,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/keif/keif.github.io/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "America/New_York", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
