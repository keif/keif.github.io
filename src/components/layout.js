import React from "react";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import favIcon from "../assets/favicon.png";
import Navigation from "./Navigation";
import "../assets/app.css";

require("prismjs/themes/prism-solarizedlight.css");
require("typeface-raleway");
require("typeface-roboto-slab");

const TemplateWrapper = ({ children }) => (
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "100%",
            gridTemplateRows: "60px 1fr auto",
        }}
    >
        <Helmet
            title="Keith Baker - Developer and Digital Engineer"
            meta={[
                { name: "description", content: "Keith Baker - Developer and Digital Engineer" },
                {
                    name: "keywords",
                    content: "front-end, design, developer, minimal, gatsby, keith, baker, ecommerce, web development",
                },
                {
                    name: "google-site-verification",
                    content: "ojxzHz13Q3TNqNO0VsnyxLDpDb1NL1FIMMQG0GwIIqc",
                },
            ]}
            link={[{ rel: "shortcut icon", type: "image/png", href: `${favIcon}` }]}
        >
            <html lang="en" />
        </Helmet>
        <Navigation />
        {children}
    </div>
);

export default TemplateWrapper;
