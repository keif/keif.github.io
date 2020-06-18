const path = require("path");

exports.createPages = ({ actions, graphql }) => {
    const { createPage } = actions;

    return graphql(`
        {
            allMarkdownRemark {
                edges {
                    node {
                        html
                        id
                        frontmatter {
                            page
                            path
                            title
                            date
                        }
                    }
                }
            }
        }
    `).then(res => {
        if (res.errors) {
            return Promise.reject(res.errors);
        }

        res.data.allMarkdownRemark.edges.forEach(({ node }) => {
            if (node.frontmatter.page) {
                createPage({
                    path: node.frontmatter.path,
                    component: path.resolve("src/templates/about.js"),
                    layout: "about",
                });
            } else {
                createPage({
                    path: node.frontmatter.path,
                    component: path.resolve("src/templates/post.js"),
                    layout: "post",
                });
            }
        });
    });
};
