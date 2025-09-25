import type { JSX, ReactNode } from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';

import styles from './index.module.css';
import HobbyCard from '../components/HobbyCard';
import { HOBBIES } from '../data/hobbies';
import SocialLinks from '../components/SocialLinks';

function HomepageHeader(): JSX.Element {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>分享工程、赛车与历史 · 在代码之外的生活</h1>
            <p className={styles.heroLead}>
              写代码是我的日常，守门员、赛道与史书构成了我的节奏；在这里我把技术笔记与生活见闻一起记录下来。
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className={styles.avatar} title="头像">
              <img
                src="/img/docusaurus-social-card.jpg"
                alt="头像"
                className={styles.avatarImage}
                loading="lazy"
                decoding="async"
                width={120}
                height={120}
                srcSet="/img/favicon.ico 64w, /img/docusaurus-social-card.jpg 512w"
                sizes="(max-width: 420px) 96px, 120px"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout>
      <HomepageHeader />
      <main>
        <section className={styles.introduction}>
          <div className="container">
            <div className={styles.hobbies}>
              {HOBBIES.map(h => (
                <HobbyCard key={h.id} id={h.id} title={h.title} desc={h.desc} emoji={h.emoji} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.socialSection}>
          <div className="container">
            <h2>Connect</h2>
            <SocialLinks />
          </div>
        </section>
      </main>
    </Layout>
  );
}
