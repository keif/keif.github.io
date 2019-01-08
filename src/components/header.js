import React from 'react'
import { Link } from 'gatsby'

import styles from './header.module.scss'

const Header = ({ siteTitle }) => (
  <header className={styles.header}>
    <h1>
      <Link to="/" className={styles.link}>
        {siteTitle}
      </Link>
    </h1>
  </header>
)

export default Header
