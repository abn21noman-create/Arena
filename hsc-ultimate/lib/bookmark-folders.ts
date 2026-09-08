// ===================================================================
// Bookmark Collections/Folders — Core Logic
// -------------------------------------------------------------------
// নতুন ফিচার: ইউজার এখন সেভ করা টপিক গুলো কাস্টম ফোল্ডারে গুছিয়ে
// রাখতে পারবে (যেমন "পরীক্ষার আগে রিভিশন", "দুর্বল টপিক")। established
// Habit/RoutineSlot প্যাটার্ন অনুসরণ করা হয়েছে — per-user সীমিত সংখ্যক
// resource, atomic user-row-lock দিয়ে capacity-bypass race-condition
// প্রতিরোধ।
// ===================================================================

// অতিরিক্ত ফোল্ডার তৈরি করলে UI জটিল হয়ে যায় (established Habit
// Tracker এর MAX_HABITS_PER_USER=10 এর একই যুক্তি অনুসরণ করে)
export const MAX_BOOKMARK_FOLDERS_PER_USER = 15;

export const MAX_FOLDER_NAME_LENGTH = 50;
