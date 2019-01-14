import React from "react";
import { graphql } from "gatsby";
import Common from "../blocks/Common";
import Layout from "../components/layout";

export default function Template({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  return (
    <Layout>
      <Common.Container>
        <Common.Title>{frontmatter.title}</Common.Title>
        <div
          style={{
            maxWidth: "960px",
            color: "#696969"
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Common.Container>
    </Layout>
  );
}

export const pageQuery = graphql`
  query($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
      }
    }
  }
`;
