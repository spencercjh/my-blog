import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">欢迎来到我的博客！</h1>
        <p className="hero__subtitle">
          你好，我是一个热爱编程和分享的开发者。这里记录了我的学习与成长。
        </p>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="博客首页"
      description="这是我的个人博客，记录我的技术分享与成长历程。"
    >
      <HomepageHeader />
      <main>
        <section className={styles.introduction}>
          <div className="container">
            <h2>关于我</h2>
            <p>
              我是一名全栈开发者，喜欢探索新技术，分享知识，并通过代码解决问题。
            </p>
            <p>
              目前这个页面（包括文字）是由 GTP-4o
              生成的，未来我会继续完善这个页面，添加更多内容。
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
