import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { PLACES } from '../data/places';

export default function MapPage(): React.JSX.Element {
  return (
    <Layout title="足迹 - 我走过的地方" description="我在地图上的足迹">
      <main className="container margin-top--lg margin-bottom--xl">
        <div className="row">
          <div className="col col--12">
            <h1>行万里路</h1>
            <p>这是我去过的地方，点击标记可以看到访问时间和备注。</p>
            <p>只有在该城市过夜，或者有重大景点时才会记录。</p>
          </div>
        </div>
        <div className="row margin-top--md">
          <div className="col col--12">
            <BrowserOnly fallback={<div>加载地图中...</div>}>
              {() => {
                try {
                  const TravelMap = require('../components/TravelMap').default;
                  return <TravelMap places={PLACES} />;
                } catch (error) {
                  console.error('Failed to load map component:', error);
                  return <div>地图加载失败，请刷新页面重试。</div>;
                }
              }}
            </BrowserOnly>
          </div>
        </div>
      </main>
    </Layout>
  );
}
