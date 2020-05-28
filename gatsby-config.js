const urljoin = require("url-join");
const config = require("./data/siteConfig");

const path = require(`path`);

module.exports = {
    siteMetadata: {
        siteUrl: urljoin(config.siteUrl, config.pathPrefix),
        rssMetadata: {
            site_url: urljoin(config.siteUrl, config.pathPrefix),
            feed_url: urljoin(config.siteUrl, config.pathPrefix, config.siteRss),
            title: config.siteTitle,
            description: config.siteDescription,
            // image_url: `${urljoin(config.siteUrl, config.pathPrefix)}/logos/logo-512.png`,
            copyright: config.copyright,
        },
    },
    plugins: [
        {
            resolve: `gatsby-plugin-google-analytics`,
            options: {
              trackingId: "UA-2161286-15",
            },
        },
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `about`,
                path: path.join(__dirname, `src`, `pages`),
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: path.join(__dirname, `src`, `images`),
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `posts`,
                path: path.join(__dirname, `src`, `posts`),
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: "gatsby-remark-embed-gist",
                        options: {
                            includeDefaultCss: true,
                            username: "keif",
                        },
                    },
                    {
                        resolve: `gatsby-remark-images`,
                        options: {
                            // It's important to specify the maxWidth (in pixels) of
                            // the content container as this plugin uses this as the
                            // base for generating different widths of each image.
                            maxWidth: 590,
                        },
                    },
                    {
                        aliases: {},
                        classPrefix: "language-",
                        inlineCodeMarker: null,
                        resolve: `gatsby-remark-prismjs`,
                    },
                ],
            },
        },
        `gatsby-plugin-styled-components`,
        {
            resolve: `gatsby-plugin-typography`,
            options: {
                pathToConfigModule: `src/utils/typography.js`,
            },
        },
        {
            resolve: `gatsby-plugin-sharp`,
            options: {
                stripMetadata: true,
                useMozJpeg: false,
            },
        },
        `gatsby-remark-copy-linked-files`,
        {
            resolve: `gatsby-remark-images`,
            options: {
                maxWidth: 1080,
            },
        },
        `gatsby-transformer-sharp`,
    ],
};
