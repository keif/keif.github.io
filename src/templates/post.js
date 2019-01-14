import React from "react";
import PropTypes from "prop-types";

import { graphql } from "gatsby";
import BlogPage from "../blocks/Post";
import Layout from "../components/layout";

export default function Template({ data }) {
  const { markdownRemark: post } = data;

  return (
    <Layout>
      <BlogPage>
        <BlogPage.Info>
          <BlogPage.Date>{post.frontmatter.date}</BlogPage.Date>
          <BlogPage.Data>
            {post.timeToRead} {post.timeToRead > 1 ? "minutes" : "minute"} read
            time
            <span>-</span>
            {post.frontmatter.category}
          </BlogPage.Data>
        </BlogPage.Info>
        <BlogPage.Text>
          <h1>{post.frontmatter.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </BlogPage.Text>
      </BlogPage>
    </Layout>
  );
}

Template.propTypes = {
  data: PropTypes.object
};
Template.defaultProps = {
  data: null
};

export const postQuery = graphql`
  query BlogPostByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      timeToRead
      frontmatter {
        path
        title
        date
        category
      }
    }
  }
`;
