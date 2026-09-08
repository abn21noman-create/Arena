/**
 * Daily Quests & Booster System
 */

export interface DailyQuest {
  id: string;
  titleBangla: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  xpReward: number;
  completed: boolean;
  claimed: boolean;
}

export function getDailyQuests(): DailyQuest[] {
  return [
    {
      id: "quest-mcq-10",
      titleBangla: "১০টি বহু নির্বাচনী সমাধান",
      description: "প্র্যাকটিস বা টেস্ট পেপার থেকে যেকোনো ১০টি প্রশ্ন সমাধান করুন",
      current: 8,
      target: 10,
      unit: "টি",
      xpReward: 50,
      completed: false,
      claimed: false,
    },
    {
      id: "quest-accuracy",
      titleBangla: "৮৫%+ নির্ভুলতা অর্জন",
      description: "যেকোনো টেস্ট বা স্পিড ম্যাচিং গেমে ৮৫% বা তার বেশি স্কোর তুলুন",
      current: 1,
      target: 1,
      unit: "বার",
      xpReward: 75,
      completed: true,
      claimed: false,
    },
    {
      id: "quest-study-time",
      titleBangla: "১৫ মিনিট মনোযোগ দিয়ে অধ্যয়ন",
      description: "স্মার্ট বুক, হ্যান্ডনোট বা ফ্ল্যাশকার্ডে সময় দিন",
      current: 15,
      target: 15,
      unit: "মিনিট",
      xpReward: 100,
      completed: true,
      claimed: true,
    },
  ];
}
