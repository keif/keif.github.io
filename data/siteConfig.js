const config = {
    siteTitle: "Keith Baker: Web Consultant", // Site title.
    siteTitleShort: "KB: Web Consultant", // Short site title for homescreen (PWA). Preferably should be under 12 characters to prevent truncation.
    siteTitleAlt: "Keith Baker: Web Consultant", // Alternative site title for SEO.
    siteUrl: "https://baker.af", // Domain of your website without pathPrefix.
    siteDescription: "A GatsbyJS generated blog about technology and whatever else.", // Website description used for RSS feeds/meta description tag.
    siteRss: "/rss.xml", // Path to the RSS file.
    dateFromFormat: "YYYY-MM-DD", // Date format used in the frontmatter.
    dateFormat: "DD/MM/YYYY", // Date format for display.
    userName: "Advanced User", // Username to display in the author segment.
    userEmail: "keith@baker.af", // Email used for RSS feed's author segment
    userTwitter: "ikeif", // Optionally renders "Follow Me" in the UserInfo segment.
    userLocation: "Ohio, USA, Earth", // User location to display in the author segment.
    // userAvatar: "https://api.adorable.io/avatars/150/test.png", // User avatar to display in the author segment.
    userDescription:
        "Yeah, I like animals better than people sometimes... Especially dogs. Dogs are the best. Every time you come home, they act like they haven't seen you in a year. And the good thing about dogs... is they got different dogs for different people.", // User description to display in the author segment.
    // Links to social profiles/projects you want to display in the author segment/navigation bar.
    userLinks: [
        {
            label: "GitHub",
            url: "https://github.com/keif",
            iconClassName: "fa fa-github",
        },
        {
            label: "Twitter",
            url: "https://twitter.com/ikeif",
            iconClassName: "fa fa-twitter",
        },
        {
            label: "Email",
            url: "mailto:keith@baker.af",
            iconClassName: "fa fa-envelope",
        },
    ],
    copyright: "Copyright © 2019. Advanced User", // Copyright string for the footer of the website and RSS feed.
    themeColor: "#c62828", // Used for setting manifest and progress theme colors.
    backgroundColor: "#e0e0e0", // Used for setting manifest background color.
};

// Validate

// Make sure pathPrefix is empty if not needed
if (config.pathPrefix === "/") {
    config.pathPrefix = "";
} else {
    // Make sure pathPrefix only contains the first forward slash
    config.pathPrefix = `/${config.pathPrefix.replace(/^\/|\/$/g, "")}`;
}

// Make sure siteUrl doesn't have an ending forward slash
if (config.siteUrl.substr(-1) === "/") config.siteUrl = config.siteUrl.slice(0, -1);

// Make sure siteRss has a starting forward slash
if (config.siteRss && config.siteRss[0] !== "/") config.siteRss = `/${config.siteRss}`;

module.exports = config;
