
import React, { createContext, useContext, useState, useEffect } from 'react';
import { HealthLog, UserProfile, NYHAFunction, Medication, EduContent } from './types';

interface AppContextType {
  user: UserProfile;
  logs: HealthLog[];
  medications: Medication[];
  eduContents: EduContent[];
  favorites: string[]; // 存储 EduContent 的 ID
  addLog: (log: Omit<HealthLog, 'id' | 'date'>) => void;
  addPoints: (amount: number) => void;
  deductPoints: (amount: number) => boolean;
  markCheckedIn: () => boolean;
  hasCheckedInToday: boolean;
  addMedication: (name: string, time: string, dosage: string) => void;
  removeMedication: (id: string) => void;
  toggleMedicationTaken: (id: string) => void;
  markEduRead: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>({
    name: '张大爷',
    avatar: 'https://picsum.photos/200',
    gender: '男',
    age: 72,
    phone: '138****8888',
    functionLevel: NYHAFunction.II,
    history: '心衰病史3年',
    baseWeight: 70.5,
    points: 120,
  });

  const [favorites, setFavorites] = useState<string[]>([]);

  const [eduContents, setEduContents] = useState<EduContent[]>([
    {
      id: 'edu1',
      title: '心衰患者的饮食禁忌：三低原则',
      type: 'text',
      cover: 'https://picsum.photos/400/250?diet',
      summary: '低盐、低脂肪、低热量，保护心脏的第一步。',
      content: '心衰患者的饮食应遵循“三低”原则：1. 低盐：每日食盐摄入量应控制在3克以内，避免腌制食品。2. 低脂：少吃肥肉、油炸食品。3. 低热量：保持适宜体重，减轻心脏负担。此外，应少食多餐，避免过饱。',
      isRead: false
    },
    {
      id: 'edu2',
      title: '如何正确测量每日出入量',
      type: 'video',
      cover: 'https://picsum.photos/400/250?video',
      summary: '视频演示：精准记录，医生诊断的重要参考。',
      content: '记录出入量包括：每日喝水量、稀饭量、尿量等。建议使用带刻度的杯子和量尿器。心衰患者水分控制至关重要。',
      mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isRead: false
    },
    {
      id: 'edu3',
      title: '识别心衰加重的早期信号',
      type: 'image',
      cover: 'https://picsum.photos/400/250?warning',
      summary: '看图说话：当出现以下症状，请及时就医。',
      content: '如果您发现：夜间憋醒、下肢水肿加重、体重短时间内突然增加（如3天增加2kg），请务必引起重视，联系您的随访医生或前往医院。',
      mediaUrl: 'https://picsum.photos/800/1200?symptoms',
      isRead: false
    }
  ]);

  const [logs, setLogs] = useState<HealthLog[]>([
    { 
      id: '1', 
      date: '2023-10-20', 
      weight: 70.8, 
      systolic: 130, 
      diastolic: 85, 
      heartRate: 72, 
      fluidIntakeTotal: 1500, 
      fluidIntakeDetails: [], 
      fluidOutputTotal: 1400, 
      fluidOutputDetails: { urine: 1400, vomit: 0, drainage: 0, other: 0 },
      symptoms: ['无症状'] 
    }
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    { id: 'm1', name: '地高辛', time: '08:00', dosage: '1片', isTakenToday: false },
    { id: 'm2', name: '呋塞米', time: '09:30', dosage: '0.5片', isTakenToday: false },
  ]);

  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const addLog = (newLogData: Omit<HealthLog, 'id' | 'date'>) => {
    const newLog: HealthLog = {
      ...newLogData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setLogs(prev => [...prev, newLog]);
    addPoints(20);
  };

  const addPoints = (amount: number) => {
    setUser(prev => ({ ...prev, points: prev.points + amount }));
  };

  const deductPoints = (amount: number) => {
    if (user.points >= amount) {
      setUser(prev => ({ ...prev, points: prev.points - amount }));
      return true;
    }
    return false;
  };

  const markCheckedIn = () => {
    if (!hasCheckedInToday) {
      setHasCheckedInToday(true);
      addPoints(5);
      return true;
    }
    return false;
  };

  const markEduRead = (id: string) => {
    let rewarded = false;
    setEduContents(prev => prev.map(content => {
      if (content.id === id && !content.isRead) {
        addPoints(5);
        rewarded = true;
        return { ...content, isRead: true };
      }
      return content;
    }));
    return rewarded;
  };

  const addMedication = (name: string, time: string, dosage: string) => {
    const newMed: Medication = { id: Date.now().toString(), name, time, dosage, isTakenToday: false };
    setMedications(prev => [...prev, newMed].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const toggleMedicationTaken = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, isTakenToday: !m.isTakenToday } : m));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <AppContext.Provider value={{ 
      user, logs, medications, eduContents, favorites,
      addLog, addPoints, deductPoints, markCheckedIn, hasCheckedInToday,
      addMedication, removeMedication, toggleMedicationTaken, markEduRead, toggleFavorite
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
