import styled from "styled-components";

import Wrapper from "./Wrapper";
import Logo from "./Logo";
import NavigationWrapper from "./NavigationWrapper";
import NavigationItem from "./NavigationItem";
import NavigationLink from "./NavigationLink";

const Navbar = styled.section`
  background: white;
  box-shadow: 0px 2px 15px 0px #f2f2f2de;
  z-index: 1;
`;

Navbar.Wrapper = Wrapper;
Navbar.Logo = Logo;
Navbar.LinkWrap = NavigationWrapper;
Navbar.LinkItem = NavigationItem;
Navbar.Link = NavigationLink;

export default Navbar;
