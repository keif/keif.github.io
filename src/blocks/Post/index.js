import styled from "styled-components";

import BlogInfo from "./Info";
import BlogDate from "./Date";
import BlogData from "./Data";
import BlogText from "./Text";

const BlogPage = styled.div`
  margin: 60px auto;
  max-width: 1200px;
  @media (max-width: 1200px) {
    padding: 0 15px;
  }
  h1,
  h2,
  h3 {
    color: #696969;
  }
  h1 {
    &:after {
      content: "";
      display: block;
      width: 100%;
      height: 3px;
      max-width: 120px;
      background-color: #dd390f;
      margin: 20px auto;
    }
  }
  h2,
  h3 {
    max-width: 960px;
    margin: 40px auto;
  }
`;

BlogPage.Info = BlogInfo;
BlogPage.Date = BlogDate;
BlogPage.Data = BlogData;
BlogPage.Text = BlogText;

export default BlogPage;
