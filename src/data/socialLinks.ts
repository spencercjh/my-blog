export type SocialLink = {
  href: string;
  label: string;
  title: string;
  icon: 'github' | 'linkedin' | 'x';
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://github.com/spencercjh',
    label: 'GitHub',
    title: 'GitHub',
    icon: 'github',
  },
  {
    href: 'https://x.com/real_spencercjh',
    label: 'X',
    title: 'X',
    icon: 'x',
  },
  {
    href: 'https://www.linkedin.com/in/spencercjh',
    label: 'LinkedIn',
    title: 'LinkedIn',
    icon: 'linkedin',
  },
];
