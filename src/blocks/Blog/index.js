import styled from "styled-components";
import BlogItem from "./Item";
import BlogDate from "./Date";
import BlogTitle from "./Title";

const Blog = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-column: 3;
  grid-gap: 30px;
  list-style: none;
`;

Blog.Item = BlogItem;
Blog.Date = BlogDate;
Blog.Title = BlogTitle;

export default Blog;
