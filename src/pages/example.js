import React from 'react'
import Layout from '../components/layout'
import Header from '../components/header'

export default () => (
  <Layout>
    <Header siteTitle="HTML Style Check" />
    <h1>A Simple Sample Web Page to test CSS styling</h1>

    <img alt="Bill Murray Filler" src="https://www.fillmurray.com/200/300" />

    <p>
      This page will consist of HTML elements to get a single view of all
      applied styling.
    </p>

    <div>
      <h2>Elements: Headings</h2>
      <h1>This is a size "h1" heading</h1>
      <h2>This is a size "h2" heading</h2>
      <h3>This is a size "h3" heading</h3>
      <h4>This is a size "h4" heading</h4>
      <h5>This is a size "h5" heading</h5>
      <h6>This is a size "h6" heading</h6>
    </div>

    <div>
      <h2>Elements: Text</h2>
      <abbr>Defines an abbreviation or an acronym</abbr>
      <address>
        Defines contact information for the author/owner of a document
      </address>
      <article>An article element.</article>
      <aside>Aside element.</aside>
      <b>Bold text.</b>
      <blockquote>I'm a blockquote.</blockquote>
      <button>A button</button>
      <p>This is a paragraph.</p>
      <ul>
        <li>Unordered</li>
        <li>List</li>
      </ul>

      <ol>
        <li>Unordered</li>
        <li>List</li>
      </ol>
    </div>
  </Layout>
)
