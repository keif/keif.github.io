import styled from "styled-components";

const Wrapper = styled.div`
  height: 100%;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 1200px) {
    padding: 0 15px;
  }
`;

export default Wrapper;
