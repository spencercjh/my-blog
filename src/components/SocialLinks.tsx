import React from 'react';
import styles from '../pages/index.module.css';
import { SOCIAL_LINKS } from '../data/socialLinks';

const GitHubIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.14 3.34 9.49 7.98 11.02.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.25.71-3.94-1.57-3.94-1.57-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.75-1.56-2.6-.3-5.34-1.3-5.34-5.78 0-1.28.46-2.33 1.21-3.15-.12-.3-.53-1.5.12-3.13 0 0 .99-.32 3.25 1.2a11.2 11.2 0 0 1 2.96-.4c1.01.01 2.03.14 2.96.4 2.26-1.52 3.25-1.2 3.25-1.2.65 1.63.24 2.83.12 3.13.76.82 1.21 1.87 1.21 3.15 0 4.49-2.75 5.48-5.37 5.77.42.36.81 1.07.81 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.54 11.54 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5z" />
  </svg>
);

const LinkedInIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="#0A66C2"
      d="M20.45 20.45h-3.55v-5.24c0-1.25-.02-2.86-1.74-2.86-1.74 0-2.01 1.36-2.01 2.77v5.33H9.59V9h3.41v1.56h.05c.48-.9 1.65-1.85 3.39-1.85 3.62 0 4.29 2.38 4.29 5.47v6.78zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.57V9h3.54v11.45zM22.23 0H1.77A1.77 1.77 0 0 0 0 1.77v20.45C0 23.2.79 24 1.77 24h20.45A1.77 1.77 0 0 0 24 22.23V1.77A1.77 1.77 0 0 0 22.23 0z"
    />
  </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M6 6 L18 18 M18 6 L6 18"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const ICON_MAP: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};

export default function SocialLinks(): JSX.Element {
  return (
    <div className={styles.socialLinks}>
      {SOCIAL_LINKS.map(({ href, label, title, icon }) => {
        const Icon = ICON_MAP[icon] || GitHubIcon;
        return (
          <a
            key={label}
            className={styles.socialLink}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} - 在新标签页打开`}
            title={title}
          >
            <Icon className={styles.socialIcon} />
          </a>
        );
      })}
    </div>
  );
}
