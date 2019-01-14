import styled from "styled-components";

const FeaturedContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  background-color: white;
  box-shadow: 0 0 9px #f2f2f2de;
  border-radius: 20px;

  @media (max-width: 780px) {
    flex-direction: column-reverse;
    margin-bottom: 30px;
  }
`;

export default FeaturedContainer;
