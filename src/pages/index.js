import React from "react";
import { graphql } from "gatsby";
import Layout from "../components/layout";

import Intro from "../components/Intro";
import Links from "../blocks/Link";
import Featured from "../blocks/Featured";
import Img from "gatsby-image";

const IndexPage = ({ data }) => (
    <Layout>
        <Intro />
        <Featured>
            <Featured.Text>
                <h3>Featured article</h3>
                <p />
                <Links to="/blog">Read more articles</Links>
            </Featured.Text>
            {data.allMarkdownRemark.edges.map(post => (
                <Featured.Container key={post.node.id}>
                    <Featured.Content>
                        <Featured.Link key={post.node.id} to={post.node.frontmatter.path}>
                            <h2>{post.node.frontmatter.title}</h2>
                        </Featured.Link>
                        <h5>
                            Posted on {post.node.frontmatter.date} - {post.node.frontmatter.category}
                        </h5>
                        <p>{post.node.excerpt}</p>
                    </Featured.Content>
                    <Featured.Image
                        style={{
                            backgroundImage: `url(${post.node.frontmatter.url})`,
                            backgroundSize: "cover",
                        }}
                    >
                    {post.node.frontmatter.cover_image &&
                      post.node.frontmatter.cover_image.childImageSharp &&
                      post.node.frontmatter.cover_image.childImageSharp.fluid &&
                      <Img fluid={post.node.frontmatter.cover_image.childImageSharp.fluid} />
                    }
                    </Featured.Image>
                </Featured.Container>
            ))}
        </Featured>
    </Layout>
);

export const pageQuery = graphql`
    query IndexQuery {
        allMarkdownRemark(
            limit: 1
            sort: { fields: [frontmatter___date], order: DESC }
            filter: { frontmatter: { featured: { eq: true } } }
        ) {
            edges {
                node {
                    excerpt(pruneLength: 150)
                    id
                    frontmatter {
                        title
                        path
                        published
                        date
                        category
                        cover_image {
                          publicURL
                          childImageSharp {
                            fluid(maxWidth: 1080, quality: 100) {
                              ...GatsbyImageSharpFluid_noBase64
                            }
                          }
                        }
                        url
                    }
                }
            }
        }
    }
`;

export default IndexPage;
