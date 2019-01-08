import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Container from '../components/container'

export default () => (
  <Layout>
    <Container>
      <h1>Hi! I'm building a fake Gatsby site as part of a tutorial!</h1>
      <p>
        What do I like to do? Lots of course but definitely enjoy building
        websites.
      </p>
      <Link to="/contact/">Contact</Link>
      <Link to="/about/">About</Link>
      <div>
        <h1>Richard Hamming on Luck</h1>
        <div>
          <p>
            From Richard Hamming’s classic and must-read talk, “
            <a href="http://www.cs.virginia.edu/~robins/YouAndYourResearch.html">
              You and Your Research
            </a>
            ”.
          </p>
          <blockquote>
            <p>
              There is indeed an element of luck, and no, there isn’t. The
              prepared mind sooner or later finds something important and does
              it. So yes, it is luck.{' '}
              <em>
                The particular thing you do is luck, but that you do something
                is not.
              </em>
            </p>
          </blockquote>
        </div>
        <p>Posted April 09, 2011</p>
      </div>
    </Container>
  </Layout>
)
