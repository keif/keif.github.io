import styled from "styled-components";

const FeaturedImage = styled.div`
  width: 100%;
  border-radius: 0 20px 20px 0;
  @media (max-width: 780px) {
    height: 200px;
    border-radius: 20px 20px 0 0;
    margin-top: -30px;
  }
`;

export default FeaturedImage;
