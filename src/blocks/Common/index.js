import styled from "styled-components";

const Title = styled.h1`
  font-weight: normal;
  position: relative;
  color: #696969;
  &:after {
    content: "";
    display: block;
    width: 100%;
    height: 3px;
    max-width: 120px;
    background-color: #dd390f;
    margin: 20px 0 50px;
  }
`;

const Text = styled.p`
  max-width: 700px;
  margin-bottom: 0;
  color: #696969;
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
