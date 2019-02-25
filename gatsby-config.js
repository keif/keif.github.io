const urljoin = require("url-join");
const config = require("./data/siteConfig");

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
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/pages`,
                name: `about`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/images`,
                name: `images`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: `${__dirname}/src/posts`,
                name: `posts`,
            },
        },
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: "gatsby-remark-embed-gist",
                        options: {
                            username: "keif",
                            includeDefaultCss: true,
                        },
                    },
                    {
                        resolve: `gatsby-remark-prismjs`,
                        classPrefix: "language-",
                        inlineCodeMarker: null,
                        aliases: {},
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
                useMozJpeg: false,
                stripMetadata: true,
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
