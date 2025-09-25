import React from 'react';
import styles from '../pages/index.module.css';

export interface HobbyCardProps {
  id: string;
  title: string;
  desc: string;
  emoji: string;
}

const HobbyCard: React.FC<HobbyCardProps> = ({ id, title, desc, emoji }) => {
  return (
    <article className={styles.hobbyCard} aria-labelledby={id}>
      <div className={styles.hobbyIcon} aria-hidden="true">
        <span className={styles.hobbyEmoji} aria-hidden="true">
          {emoji}
        </span>
      </div>
      <div className={styles.hobbyContent}>
        <h3 id={id} className={styles.hobbyTitle}>
          {title}
        </h3>
        <p className={styles.hobbyDesc}>{desc}</p>
      </div>
    </article>
  );
};

export default React.memo(HobbyCard);
