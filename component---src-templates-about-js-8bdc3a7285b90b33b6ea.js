(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{139:function(e,t,n){"use strict";n.r(t),n.d(t,"default",function(){return l}),n.d(t,"pageQuery",function(){return c});var a=n(0),i=n.n(a),r=n(153),o=n(152);function l(e){var t=e.data.markdownRemark,n=t.frontmatter,a=t.html;return i.a.createElement(o.a,null,i.a.createElement(r.a.Container,null,i.a.createElement(r.a.Title,null,n.title),i.a.createElement("div",{style:{maxWidth:"960px",color:"#696969"},dangerouslySetInnerHTML:{__html:a}})))}var c="997976791"},147:function(e,t,n){"use strict";n.r(t),n.d(t,"graphql",function(){return h}),n.d(t,"StaticQueryContext",function(){return m}),n.d(t,"StaticQuery",function(){return p}),n.d(t,"useStaticQuery",function(){return g});var a=n(0),i=n.n(a),r=n(4),o=n.n(r),l=n(146),c=n.n(l);n.d(t,"Link",function(){return c.a}),n.d(t,"withPrefix",function(){return l.withPrefix}),n.d(t,"navigate",function(){return l.navigate}),n.d(t,"push",function(){return l.push}),n.d(t,"replace",function(){return l.replace}),n.d(t,"navigateTo",function(){return l.navigateTo});var d=n(148),u=n.n(d);n.d(t,"PageRenderer",function(){return u.a});var s=n(32);n.d(t,"parsePath",function(){return s.a});var m=i.a.createContext({}),p=function(e){return i.a.createElement(m.Consumer,null,function(t){return e.data||t[e.query]&&t[e.query].data?(e.render||e.children)(e.data?e.data.data:t[e.query].data):i.a.createElement("div",null,"Loading (StaticQuery)")})},g=function(e){i.a.useContext;var t=i.a.useContext(m);if(t[e]&&t[e].data)return t[e].data;throw new Error("The result of this StaticQuery could not be fetched.\n\nThis is likely a bug in Gatsby and if refreshing the page does not fix it, please open an issue in https://github.com/gatsbyjs/gatsby/issues")};function h(){throw new Error("It appears like Gatsby is misconfigured. Gatsby related `graphql` calls are supposed to only be evaluated at compile time, and then compiled away,. Unfortunately, something went wrong and the query was left in the compiled code.\n\n.Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.")}p.propTypes={data:o.a.object,query:o.a.string.isRequired,render:o.a.func,children:o.a.func}},148:function(e,t,n){var a;e.exports=(a=n(151))&&a.default||a},149:function(e,t){e.exports="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAANZJREFUKBW1kMsOAUEQRdsjXsHCxgYJWwvxD3yPje9lIVZe8VgggnMn052aDGalkpO+U1VTt7qd+2PkzGyrTfqzLH1OR9lUrWCavUuHXAtOMII2bKEPNThCCP9TSMRiwNmEG9yhDhq4hETYDXxBuT3I7QIaUIQFvOCbqfPDhjTNQDGFSaScm3OOY52Pz/CT/9YpRzk1YAU70DtoqzWcIYR3DQmE7v2AJ2zgCrrOATQgEWEVsv5uPXQF9GB6SCFdhS5kRtl0yMCa2Jppy5Z+u+xOOn41p2pv3HMdyMskcJMAAAAASUVORK5CYII="},150:function(e,t,n){e.exports=n.p+"static/logo-14914f54a7c54b994ba567516a92be92.svg"},151:function(e,t,n){"use strict";n.r(t);n(33);var a=n(0),i=n.n(a),r=n(4),o=n.n(r),l=n(52),c=n(2),d=function(e){var t=e.location,n=c.default.getResourcesForPathnameSync(t.pathname);return i.a.createElement(l.a,Object.assign({location:t,pageResources:n},n.json))};d.propTypes={location:o.a.shape({pathname:o.a.string.isRequired}).isRequired},t.default=d},152:function(e,t,n){"use strict";var a=n(0),i=n.n(a),r=n(154),o=n.n(r),l=(n(4),n(149)),c=n.n(l),d=n(150),u=n.n(d),s=n(145),m=s.a.div.withConfig({displayName:"Wrapper",componentId:"sc-1me14xt-0"})(["height:100%;max-width:1200px;width:100%;margin:0 auto;display:flex;justify-content:space-between;align-items:center;@media (max-width:1200px){padding:0 15px;}"]),p=n(147),g=Object(s.a)(p.Link).withConfig({displayName:"Logo",componentId:"mh6ofa-0"})(["line-height:0;img{width:140px;height:auto;margin-bottom:0;}"]),h=s.a.ul.withConfig({displayName:"NavigationWrapper",componentId:"sc-3bjy7h-0"})(['list-style:none;display:flex;font-family:"Raleway",sans-serif;text-transform:uppercase;font-weight:bold;margin:0;']),f=s.a.li.withConfig({displayName:"NavigationItem",componentId:"butj2d-0"})(["margin:0 30px 0 0;&:last-child{margin-right:0;}"]),A=Object(s.a)(p.Link).withConfig({displayName:"NavigationLink",componentId:"sc-1i7hsn0-0"})(["color:#dd390f;"]),y=s.a.section.withConfig({displayName:"Navigation__Navbar",componentId:"hqwgfu-0"})(["background:white;box-shadow:0px 2px 15px 0px #f2f2f2de;z-index:1;"]);y.Wrapper=m,y.Logo=g,y.LinkWrap=h,y.LinkItem=f,y.Link=A;var b=y,w=function(){return i.a.createElement(b,null,i.a.createElement(b.Wrapper,null,i.a.createElement(b.Logo,{to:"/"},i.a.createElement("img",{src:u.a,alt:"Logo"})),i.a.createElement(b.LinkWrap,null,i.a.createElement(b.LinkItem,null,i.a.createElement(b.Link,{to:"/about"},"About")),i.a.createElement(b.LinkItem,null,i.a.createElement(b.Link,{to:"/blog"},"Blog")))))};n(155);n(156),n(157),n(158);t.a=function(e){var t=e.children;return i.a.createElement("div",{style:{display:"grid",gridTemplateColumns:"100%",gridTemplateRows:"60px 1fr auto"}},i.a.createElement(o.a,{title:"Keith Baker - Developer and Digital Engineer",meta:[{name:"description",content:"Keith Baker - Developer and Digital Engineer"},{name:"keywords",content:"front-end, design, developer, minimal, gatsby, keith, baker, ecommerce, web development"}],link:[{rel:"shortcut icon",type:"image/png",href:""+c.a}]},i.a.createElement("html",{lang:"en"})),i.a.createElement(w,null),t)}},153:function(e,t,n){"use strict";var a=n(145),i=a.a.h1.withConfig({displayName:"Common__Title",componentId:"sc-1eabwpy-0"})(['&:after{background-color:#dd390f;content:"";display:block;height:3px;margin:20px 0 50px;max-width:120px;width:100%;}color:#696969;font-weight:normal;position:relative;']),r=a.a.p.withConfig({displayName:"Common__Text",componentId:"sc-1eabwpy-1"})(["color:#696969;margin-bottom:0;max-width:960px;"]),o=a.a.div.withConfig({displayName:"Common__Container",componentId:"sc-1eabwpy-2"})(["margin:60px auto;max-width:1200px;width:100%;@media (max-width:1200px){padding:0 15px;}"]),l=a.a.div.withConfig({displayName:"Common",componentId:"sc-1eabwpy-3"})([""]);l.Title=i,l.Text=r,l.Container=o,t.a=l}}]);
//# sourceMappingURL=component---src-templates-about-js-8bdc3a7285b90b33b6ea.js.map