import styled from "styled-components";

import FeaturedContainer from "./Container";
import FeaturedContent from "./Content";
import FeaturedLink from "./Link";
import FeaturedText from "./Text";
import FeaturedImage from "./Image";

const Featured = styled.section`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.3fr 1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 50px;
  padding: 0 0 30px;
  @media (max-width: 1200px) {
    padding: 0 15px;
  }

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
    grid-template-rows: 30% 70%;
    grid-row-gap: 30px;
  }
`;

Featured.Container = FeaturedContainer;
Featured.Content = FeaturedContent;
Featured.Link = FeaturedLink;
Featured.Text = FeaturedText;
Featured.Image = FeaturedImage;

export default Featured;
