export type Hobby = {
  id: string;
  title: string;
  desc: string;
  emoji: string;
};

export const HOBBIES: Hobby[] = [
  {
    id: 'hobby-football',
    title: '足球（守门员）',
    desc: '已作为守门员踢了十多年，参加过不少业余比赛与训练，对扑救与指挥防线颇有心得。',
    emoji: '🧤',
  },
  {
    id: 'hobby-racing',
    title: '赛道日',
    desc: '拥有并改装本田飞度，常在上海天马赛车场参与圈速与日常练习，对车辆调校与赛道驾驶充满热情。',
    emoji: '🏎',
  },
  {
    id: 'hobby-history',
    title: '史政',
    desc: '喜欢近代史，关注高华、沈志华等学者的著作；家中收藏了多部史政类书籍，常阅读与研究。',
    emoji: '📚',
  },
];
