import styled from "styled-components";

const Title = styled.h1`
  &:after {
    background-color: #dd390f;
    content: "";
    display: block;
    height: 3px;
    margin: 20px 0 50px;
    max-width: 120px;
    width: 100%;
  }
  color: #696969;
  font-weight: normal;
  position: relative;
`;

const Text = styled.p`
  color: #696969;
  margin-bottom: 0;
  max-width: 960px;
`;

const Container = styled.div`
  margin: 60px auto;
  max-width: 1200px;
  width: 100%;
  @media (max-width: 1200px) {
    padding: 0 15px;
  }
`;

const Common = styled.div``;

Common.Title = Title;
Common.Text = Text;
Common.Container = Container;

export default Common;
