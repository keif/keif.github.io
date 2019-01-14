import React from "react";
import { graphql } from "gatsby";
import Common from "../blocks/Common";
import Blog from "../blocks/Blog";
import Layout from "../components/layout";

const BlogPage = ({ data }) => (
  <Layout>
    <Common.Container>
      <Common.Title>Blog posts</Common.Title>
      <Blog>
        {data.allMarkdownRemark.edges.map(post => (
          <Blog.Item key={post.node.id}>
            <Blog.Date>{post.node.frontmatter.date}</Blog.Date>
            <Blog.Title key={post.node.id} to={post.node.frontmatter.path}>
              {post.node.frontmatter.title}
            </Blog.Title>
            <p>{post.node.excerpt}</p>
          </Blog.Item>
        ))}
      </Blog>
    </Common.Container>
  </Layout>
);

export const pageQuery = graphql`
  query BlogQuery {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { published: { eq: true } } }
    ) {
      edges {
        node {
          excerpt(pruneLength: 400)
          id
          frontmatter {
            title
            path
            published
            date
          }
        }
      }
    }
  }
`;

export default BlogPage;
