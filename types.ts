
export enum NYHAFunction {
  I = 'I级',
  II = 'II级',
  III = 'III级',
  IV = 'IV级'
}

export interface FoodIntake {
  name: string;
  weightG: number;
  ml: number;
}

export interface Medication {
  id: string;
  name: string;
  time: string; // HH:mm format
  dosage: string;
  isTakenToday: boolean;
}

export interface EduContent {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video';
  cover: string;
  summary: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
}

export interface HealthLog {
  id: string;
  date: string;
  weight: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  fluidIntakeTotal: number;
  fluidIntakeDetails: FoodIntake[];
  fluidOutputTotal: number;
  fluidOutputDetails: {
    urine: number;
    vomit: number; // 呕吐
    drainage: number; // 引流
    other: number;
  };
  symptoms: string[];
  otherSymptomText?: string; // 其他症状描述
}

export interface UserProfile {
  name: string;
  avatar: string;
  gender: '男' | '女';
  age: number;
  phone: string;
  functionLevel: NYHAFunction;
  history: string;
  baseWeight: number;
  points: number;
}
