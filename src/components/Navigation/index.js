import React from "react";
import logo from "../../assets/logo.svg";
import Navbar from "../../blocks/Navigation";

const Navigation = () => (
  <Navbar>
    <Navbar.Wrapper>
      <Navbar.Logo to="/">
        <img src={logo} alt="Logo" />
      </Navbar.Logo>
      <Navbar.LinkWrap>
        <Navbar.LinkItem>
          <Navbar.Link to="/about">About</Navbar.Link>
        </Navbar.LinkItem>
        <Navbar.LinkItem>
          <Navbar.Link to="/blog">Blog</Navbar.Link>
        </Navbar.LinkItem>
      </Navbar.LinkWrap>
    </Navbar.Wrapper>
  </Navbar>
);

export default Navigation;
