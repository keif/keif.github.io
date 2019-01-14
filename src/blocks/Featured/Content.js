import styled from "styled-components";

const FeaturedContent = styled.div`
  max-width: 60%;
  padding: 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap-reverse;

  @media (max-width: 780px) {
    max-width: 100%;
  }
  h2 {
    margin-bottom: 0;
    max-width: 100%;
  }
  h5 {
    margin: 20px 0;
    color: #cfcfcf;
    font-weight: normal;
  }
  p {
    color: #696969;
    margin-bottom: 20px;
  }
  button {
    position: absolute;
    bottom: 40px;
    border: none;
    border-radius: 20px;
    padding: 10px 25px;
    background-color: #dd390f;
    color: white;
    text-transform: uppercase;
    font-family: "Raleway", serif;
    letter-spacing: 1px;
    cursor: pointer;
  }
`;

export default FeaturedContent;
