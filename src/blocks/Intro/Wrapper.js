import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 1200px) {
    padding: 0 15px;
  }
`;

export default Wrapper;
