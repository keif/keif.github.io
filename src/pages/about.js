import React from 'react'
import Layout from '../components/layout'
import Header from '../components/header'

export default () => (
  <Layout>
    <Header siteTitle="About Keith" />

    <h1>Who, What, When, Where, and Maybe Why</h1>

    <p>
      Keith is a web developer who doesn't believe in titles, because the
      industry has made them pretty useless. Previous titles include: Web
      Developer, Web Architect, Solutions Architect, Hope Consultant, Sales
      Consultant, Creative Technologist, and Digital Engineer.
    </p>

    <h2>Code Played With:</h2>

    <ul>
      <li>
        <strong>JavaScript</strong>
        <ul>
          <li>
            <a href="http://vanilla-js.com/">VanillaJS</a> - the #1 JavaScript
            Framework used by every major internet property
          </li>
          <li>
            <a href="https://angular.io/">Angular 2</a>
          </li>
          <li>
            <a href="https://angularjs.org/">Angular 1.x</a>
          </li>
          <li>
            <a href="https://jquery.com/">jQuery - in its various iterations</a>
          </li>
          <li>
            <a href="https://jqueryui.com/">jQuery UI</a>, because evidently it
            deserves its own line
          </li>
          <li>
            <a href="https://mootools.net/">MooTools</a>
          </li>
          <li>
            <a href="https://dojotoolkit.org/">Dojo</a>
          </li>
          <li>
            <a href="https://nodejs.org/en/">Node.JS</a>
          </li>
        </ul>
      </li>
      <li>HTML (Yes, XHTML, and HTML5)</li>
      <li>
        <strong>
          CSS <em>(Yes, CSS 2 *and* 3)</em>
        </strong>
        <ul>
          <li>
            <a href="http://sass-lang.com/">SASS</a>
          </li>
          <li>
            <a href="http://lesscss.org/">LESS</a>
          </li>
        </ul>
      </li>
      <li>Java (which is different than JavaScript, recruiters)</li>
      <li>
        <strong>PHP:</strong>
        <ul>
          <li>
            <a href="https://codeigniter.com/">CodeIgniter</a>
          </li>
          <li>
            <a href="https://laravel.com/">Laravel</a>
          </li>
          <li>
            <a href="http://www.zend.com/">Zend</a>
          </li>
          <li>
            <a href="https://wordpress.com/">WordPress</a>
          </li>
        </ul>
      </li>
      <li>
        <strong>Database/Datastore:</strong>
        <ul>
          <li>
            <a href="https://www.mongodb.com/">MongoDB</a>
          </li>
          <li>
            <a href="https://www.mysql.com/">MySQL</a>
          </li>
          <li>
            <a href="https://www.microsoft.com/en-us/sql-server/sql-server-2017">
              MSSQL
            </a>
          </li>
          <li>
            <a href="https://redis.io/">Redis</a>
          </li>
        </ul>
      </li>
      <li>.net (both old school ASP.net and newer MVC)</li>
      <li>XML/XSLT</li>
      <li>Ruby</li>
      <li>Gulp</li>
      <li>Grunt</li>
    </ul>

    <p>
      Point being, I work in technology, and I have had to delve into different
      programming paradigms as the client/project called for it. I have no
      qualms about being handed a new technology and being tasked to learn it on
      the fly to meet deliverables, or worse, handed an outdated legacy project
      and being asked, "can you fix this? We don't want to upgrade..." - and
      that's the first time I becamse acquainted with TinyInt in databases.
      Primary Key was a TinyInt. It hit the max and just stopped updating.
    </p>

    <p>
      My favorite work oriented task was back in the day with
      <a href="https://docs.oracle.com/cd/E24152_01/Platform.10-1/ATGMultiApp/html/s0102abouttheoracleatgwebcommerceplat01.html">
        ATG (now Oracle Commerce)
      </a>
      . At the time, it had a pretty atrocious UI for its Business Control
      Center (BCC). It's the kind of thing that clearly was designed by
      engineers, and had no love applied to it. The agency I was employed with
      decided to rebuild it, using the latest in technology (…when
      <a href="https://www.mozilla.org/en-US/">Firefox</a> was the latest and
      greatest, Flash was still around and the Flash developers argued HTML5 and
      CSS would never be comparable). The team on the project went from several
      developers to one - and the sole architect left and they turned to me and
      tasked me to finish the project. It was in the middle of a rewrite,
      utilizing <a href="https://mootools.net/">MooTools</a> and a
      <a href="https://www.dofactory.com/javascript/factory-method-design-pattern">
        factory pattern
      </a>
      , which the previous developer was in the middle of converting his work
      into. I had to reverse engineer his work, and debug the codebase to figure
      out what problems existed in the front end code, and what problems existed
      in the Java codebase (utilizing the
      <a href="http://directwebremoting.org/dwr/index.html">DWR Ajax library</a>
      ) only to discover that there was a bug in the version of DWR we were
      utilizing, and that the current upgrade also created new errors. But I'm
      paid to find those problems, fix them, or at least be able to turn to the
      Very Important People and explain to them in layman's terms the problem,
      the solution, and the proposed timeline.
    </p>
  </Layout>
)
