import styled from "styled-components";

const FeaturedText = styled.div`
  display: flex;
  flex-direction: column;
  h3 {
    position: relative;
    margin-bottom: 0;
    color: #696969;
    &:after {
      content: "";
      display: block;
      width: 100%;
      height: 3px;
      max-width: 120px;
      background-color: #dd390f;
      margin: 20px 0;
    }
  }
  p {
    color: #696969;
    margin-bottom: 0;
  }
`;

export default FeaturedText;
