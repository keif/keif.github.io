import React from "react";
import IntroSection from "../../blocks/Intro";
import Links from "../../blocks/Link";
import Common from "../../blocks/Common";

const Intro = () => (
  <IntroSection>
    <IntroSection.Wrapper>
      <IntroSection.Heading>Keith Baker</IntroSection.Heading>
      <IntroSection.SubHeading>
        Troubleshooter, *Maker, Innovator, Consultant, Father.
      </IntroSection.SubHeading>
      <Common.Text>
        <blockquote>"Once you stop learning, you start dying."</blockquote>
        <br />
        I've spent my career by being able to quickly learn new things, or being
        handed projects that were in the middle of a rewrite or having lost the
        lead developer that "knew" the ins and outs of a system. Technology, to
        me, is not just a "thing" we live with, but representative of a
        combination of art and science, future improvements balanced with past
        simplicity.<br /><br />
        My love of technology is born through a love of education and the constant learning that goes along with it.
      </Common.Text>
      <Links to="/about">Read my full bio</Links>
    </IntroSection.Wrapper>
  </IntroSection>
);

export default Intro;
