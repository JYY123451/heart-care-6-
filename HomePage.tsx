
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { 
  Activity, CheckCircle, Pill, Clock, X, ChevronRight, 
  ClipboardList, HeartHandshake, MessageSquare, Send, ChevronLeft,
  AlertCircle, Lightbulb, Thermometer, BookOpen, Star, Heart
} from 'lucide-react';
import { FoodIntake, EduContent } from '../types';

// --- 轮播图数据 ---
const BANNER_ITEMS = [
  {
    id: 1,
    title: '水分管理是核心',
    subtitle: '每天记录出入量，严格控制饮水',
    bgColor: 'bg-blue-600',
    icon: <Activity className="text-white/20 absolute right-4 bottom-4 w-24 h-24" />
  },
  {
    id: 2,
    title: '体重监测防隐患',
    subtitle: '清晨排尿后称重，3天增2kg需警惕',
    bgColor: 'bg-[#2B59C3]',
    icon: <Heart className="text-white/20 absolute right-4 bottom-4 w-24 h-24" />
  },
  {
    id: 3,
    title: '低盐饮食更健康',
    subtitle: '每日食盐不超3克，少吃腌制食品',
    bgColor: 'bg-emerald-600',
    icon: <Lightbulb className="text-white/20 absolute right-4 bottom-4 w-24 h-24" />
  }
];

// --- 测评量表数据结构 ---
const SURVEYS = [
  {
    id: 'SCHFI',
    name: '自我护理量表测评',
    getInterpretation: (score: number) => {
      if (score >= 60) return { level: '管理良好', advice: '太棒了！您对自己的病情管理非常到位，请继续保持。' };
      if (score >= 40) return { level: '管理中等', advice: '您的管理能力尚可，建议多学习“健康宣教”中的饮食和监测知识。' };
      return { level: '需要加强', advice: '建议您在家人陪同下重新学习出入量记录，并定期与医生沟通。' };
    },
    questions: [
      ...Array.from({length: 10}, (_, i) => ({
        id: i + 1,
        text: `【日常行为】您进行以下行为的频率是？(题${i+1})`,
        options: [{t:'从不', s:1}, {t:'偶尔', s:2}, {t:'经常', s:3}, {t:'总是', s:4}]
      })),
      {
        id: 11,
        text: '过去一个月中，您是否有呼吸困难或脚踝肿胀等症状？',
        options: [{t:'没有 (跳过后续部分)', s:0}, {t:'有 (继续答题)', s:1}] 
      },
      ...Array.from({length: 5}, (_, i) => ({
        id: i + 12,
        text: `【应对措施】当您出现症状时，您采取措施的可能性？(题${i+12})`,
        options: [{t:'不太可能', s:1}, {t:'有些可能', s:2}, {t:'很有可能', s:3}, {t:'非常可能', s:4}]
      })),
      ...Array.from({length: 6}, (_, i) => ({
        id: i + 17,
        text: `【自我信心】您对自我护理能力的信心程度？(题${i+17})`,
        options: [{t:'没有信心', s:1}, {t:'有些信心', s:2}, {t:'很有信心', s:3}, {t:'非常有信心', s:4}]
      })),
    ]
  },
  {
    id: 'MLHFQ',
    name: '生活质量测评',
    getInterpretation: (score: number) => {
      if (score <= 24) return { level: '质量良好', advice: '心衰对您的生活影响较小，请保持积极心态。' };
      if (score <= 45) return { level: '中度受损', advice: '您的生活受到了一定限制，建议通过轻微运动改善状态。' };
      return { level: '严重受损', advice: '心衰严重影响了生活，请务必咨询医生，调整治疗方案。' };
    },
    questions: Array.from({length: 21}, (_, i) => ({
      id: i + 1,
      text: `过去一个月，心衰在多大程度上影响您的生活？(题${i+1})`,
      options: [{t:'没有影响', s:0}, {t:'轻微影响', s:1}, {t:'普通', s:3}, {t:'影响很大', s:5}]
    }))
  },
  {
    id: 'GSES',
    name: '一般自我效能感测评',
    getInterpretation: (score: number) => {
      if (score >= 31) return { level: '效能高', advice: '您对自己处理健康问题的能力非常有信心，这非常有利于康复！' };
      if (score >= 21) return { level: '效能中等', advice: '您的信心水平正常，建议在遇到困难时多寻求医生和家人的支持。' };
      return { level: '效能偏低', advice: '您可能觉得管理病情有些力不从心，别担心，我们会一直陪伴您。' };
    },
    questions: [
      { id: 1, text: '如果我尽力去做，我总是能解决难题的。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 2, text: '即使别人反对我，我仍有办法取得我所想要的东西。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 3, text: '对我来说，坚持自己的理想和目标是轻而易举的。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 4, text: '我自信能从容地应对意外事件。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 5, text: '以我的才智，我能应付意外的局面。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 6, text: '如果我付出必要的努力，我一定能解决大多数的问题。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 7, text: '我能坦然地面对困难，因为我信赖自己处理问题的能力。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 8, text: '面对困难时，我通常能找到几个解决方法。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 9, text: '如果陷入困境，我通常能想出好主意。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] },
      { id: 10, text: '不论发生什么事，我都能从容应付。', options: [{t:'完全不正确', s:1}, {t:'有点正确', s:2}, {t:'多数正确', s:3}, {t:'完全正确', s:4}] }
    ]
  },
  {
    id: 'GAD7',
    name: '焦虑测评',
    getInterpretation: (score: number) => {
      if (score <= 4) return { level: '情绪平稳', advice: '您当前心态很好，请继续保持。' };
      if (score <= 9) return { level: '轻度焦虑', advice: '建议您多听舒缓音乐，或去公园走走放松心情。' };
      return { level: '焦虑偏高', advice: '建议找亲友倾诉，必要时咨询医生。' };
    },
    questions: Array.from({length: 7}, (_, i) => ({
      id: i + 1,
      text: `最近两周内，您感到紧张或担心的频率是？(题${i+1})`,
      options: [{t:'完全没有', s:0}, {t:'有几天', s:1}, {t:'一半以上时间', s:2}, {t:'几乎天天', s:3}]
    }))
  },
  {
    id: 'PHQ9',
    name: '抑郁测评',
    getInterpretation: (score: number) => {
      if (score <= 4) return { level: '状态良好', advice: '您的精神状态很不错。' };
      if (score <= 9) return { level: '轻度抑郁', advice: '建议多和老伙伴们聊聊天，培养一些小爱好。' };
      return { level: '状态欠佳', advice: '请务必告知家人，并在医生指导下进行调整。' };
    },
    questions: Array.from({length: 9}, (_, i) => ({
      id: i + 1,
      text: `最近两周内，您感到做事提不起劲或心情低落吗？(题${i+1})`,
      options: [{t:'完全没有', s:0}, {t:'有几天', s:1}, {t:'一半以上时间', s:2}, {t:'几乎天天', s:3}]
    }))
  }
];

// --- 扩充后的食物含水量映射表 (每100g含水量) ---
const WATER_CONTENT_MAP: Record<string, number> = {
  "饮水/茶": 100,
  "米饭": 71,
  "大米粥": 88,
  "面条(熟)": 73,
  "馒头": 40,
  "花卷": 46,
  "烧饼": 26,
  "油饼": 25,
  "包子": 53,
  "水饺": 55,
  "蛋糕": 19,
  "饼干": 6,
  "面包": 27,
  "油条": 22,
  "馄饨": 59,
  "鸡/鸭蛋": 74,
  "牛奶": 84,
  "豆浆": 96,
  "牛肉": 70,
  "猪肉": 55,
  "羊肉": 73,
  "鱼虾蟹": 77,
  "鸡肉": 70,
  "豆腐脑": 97,
  "豆腐": 83,
  "鲜青菜/菌藻": 95,
  "土豆": 80,
  "坚果": 3,
  "板栗": 55,
  "西瓜": 93,
  "葡萄": 89,
  "梨类": 86,
  "桃子": 89,
  "李子": 90,
  "香蕉": 77,
  "樱桃": 88,
  "草莓": 91,
  "苹果": 86,
  "菠萝": 88,
  "橙子/柑橘": 87,
  "火龙果": 84,
  "黄瓜": 96,
  "西红柿": 94
};

const SYMPTOM_OPTIONS = ["无症状", "呼吸困难", "胸闷", "水肿", "咳嗽", "腹胀", "疲乏", "纳差", "其他"];

const HomePage: React.FC = () => {
  const { addLog, markCheckedIn, hasCheckedInToday, medications, eduContents, favorites, toggleMedicationTaken, markEduRead, toggleFavorite } = useAppContext();
  
  // 轮播图状态
  const [currentBanner, setCurrentBanner] = useState(0);

  // 表单状态
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['无症状']);
  const [otherSymptomText, setOtherSymptomText] = useState('');
  
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  
  const [intakeList, setIntakeList] = useState<FoodIntake[]>([]);
  const [tempFood, setTempFood] = useState('饮水/茶');
  const [tempWeight, setTempWeight] = useState('');
  const [urine, setUrine] = useState('');
  const [vomit, setVomit] = useState('');
  const [drainage, setDrainage] = useState('');
  const [otherOutput, setOtherOutput] = useState('');
  const [selectedEdu, setSelectedEdu] = useState<EduContent | null>(null);

  // 测评状态
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [activeSurvey, setActiveSurvey] = useState<typeof SURVEYS[0] | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number>>({});
  const [surveyResult, setSurveyResult] = useState<{name: string, score: number, level: string, advice: string} | null>(null);

  const totalIntake = useMemo(() => intakeList.reduce((acc, curr) => acc + curr.ml, 0), [intakeList]);
  const totalOutput = useMemo(() => (parseInt(urine)||0) + (parseInt(vomit)||0) + (parseInt(drainage)||0) + (parseInt(otherOutput)||0), [urine, vomit, drainage, otherOutput]);

  // 轮播图自动播放
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % BANNER_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const toggleSymptom = (s: string) => {
    if (s === "无症状") {
      setSelectedSymptoms(["无症状"]);
      return;
    }
    let newSymptoms = selectedSymptoms.filter(item => item !== "无症状");
    if (newSymptoms.includes(s)) {
      newSymptoms = newSymptoms.filter(item => item !== s);
    } else {
      newSymptoms.push(s);
    }
    if (newSymptoms.length === 0) newSymptoms = ["无症状"];
    setSelectedSymptoms(newSymptoms);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !systolic || !diastolic || !heartRate) return triggerToast('请完成打卡信息填写');
    addLog({
      weight: parseFloat(weight), systolic: parseInt(systolic), diastolic: parseInt(diastolic),
      heartRate: parseInt(heartRate), fluidIntakeTotal: totalIntake, fluidIntakeDetails: intakeList,
      fluidOutputTotal: totalOutput, fluidOutputDetails: { urine: parseInt(urine)||0, vomit: parseInt(vomit)||0, drainage: parseInt(drainage)||0, other: parseInt(otherOutput)||0 },
      symptoms: selectedSymptoms, otherSymptomText: selectedSymptoms.includes("其他") ? otherSymptomText : ""
    });
    triggerToast('打卡成功！积分+20');
    setWeight(''); setSystolic(''); setDiastolic(''); setHeartRate(''); setIntakeList([]); setUrine(''); setVomit(''); setDrainage(''); setOtherOutput(''); setSelectedSymptoms(['无症状']); setOtherSymptomText('');
  };

  // 问卷测评逻辑
  const selectSurvey = (survey: typeof SURVEYS[0]) => {
    setActiveSurvey(survey);
    setCurrentQIndex(0);
    setSurveyAnswers({});
    setSurveyResult(null);
  };

  const onSelectAnswer = (score: number) => {
    const newAnswers = { ...surveyAnswers, [activeSurvey!.questions[currentQIndex].id]: score };
    setSurveyAnswers(newAnswers);
    if (activeSurvey?.id === 'SCHFI' && currentQIndex === 10 && score === 0) {
      setCurrentQIndex(16); 
    } else if (currentQIndex < activeSurvey!.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const submitSurvey = () => {
    const totalScore = Object.values(surveyAnswers).reduce((a, b) => a + b, 0);
    const interp = activeSurvey!.getInterpretation(totalScore);
    setSurveyResult({ name: activeSurvey!.name, score: totalScore, level: interp.level, advice: interp.advice });
    triggerToast('测评提交成功！积分+10');
  };

  return (
    <div className="pb-16 bg-[#F9FBFF] min-h-screen">
      {/* 轮播图 - 心衰宣教版 */}
      <div className="w-full h-44 relative overflow-hidden shadow-lg">
        {BANNER_ITEMS.map((item, index) => (
          <div 
            key={item.id}
            className={`absolute inset-0 transition-all duration-700 flex flex-col justify-center px-8 text-white ${item.bgColor} ${index === currentBanner ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
          >
            {item.icon}
            <h2 className="senior-text-2xl font-black mb-2 relative z-10">{item.title}</h2>
            <p className="senior-text-lg opacity-90 relative z-10 font-bold">{item.subtitle}</p>
          </div>
        ))}
        {/* 指示点 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {BANNER_ITEMS.map((_, idx) => (
            <div key={idx} className={`w-3 h-3 rounded-full transition-all ${idx === currentBanner ? 'bg-white w-8' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10 mb-6">
        <button onClick={() => { if(markCheckedIn()) triggerToast('签到成功，积分+5'); }}
          className={`senior-btn w-full shadow-xl border-4 ${hasCheckedInToday ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-[#2B59C3] border-blue-100'}`}>
          <CheckCircle size={28} className="mr-3" />
          <span className="senior-text-xl font-black">{hasCheckedInToday ? '今日已签到' : '点击签到领积分'}</span>
        </button>
      </div>

      {/* 健康打卡 */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Activity size={24} className="text-[#2B59C3]" />
            <h2 className="senior-text-xl font-black text-slate-800">每日健康记录</h2>
          </div>
          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-slate-400 font-bold mb-1 senior-text-base">体重 (kg)</p>
                <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-transparent senior-text-2xl font-black text-[#2B59C3] outline-none" placeholder="0.0" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-slate-400 font-bold mb-1 senior-text-base">心率 (次/分)</p>
                <input type="number" value={heartRate} onChange={e => setHeartRate(e.target.value)} className="w-full bg-transparent senior-text-2xl font-black text-rose-500 outline-none" placeholder="0" />
              </div>
            </div>

            {/* 血压记录板块：极简清晰版 */}
            <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100">
               <p className="text-slate-500 font-bold mb-4 text-center senior-text-lg">血压监测 (mmHg)</p>
               <div className="flex items-center gap-4">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-xs text-slate-400 font-black mb-1">高压</span>
                    <input 
                      type="number" 
                      value={systolic} 
                      onChange={e => setSystolic(e.target.value)} 
                      className="w-full bg-white h-14 rounded-xl border-2 border-slate-200 text-center senior-text-2xl font-black text-[#2B59C3] outline-none focus:border-[#2B59C3]" 
                      placeholder="0" 
                    />
                  </div>
                  <div className="text-slate-300 senior-text-3xl font-bold self-end mb-2">/</div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-xs text-slate-400 font-black mb-1">低压</span>
                    <input 
                      type="number" 
                      value={diastolic} 
                      onChange={e => setDiastolic(e.target.value)} 
                      className="w-full bg-white h-14 rounded-xl border-2 border-slate-200 text-center senior-text-2xl font-black text-[#2B59C3] outline-none focus:border-[#2B59C3]" 
                      placeholder="0" 
                    />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => setIsIntakeModalOpen(true)} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center active:bg-blue-100 cursor-pointer"><p className="text-blue-700 font-bold senior-text-base">摄入: {totalIntake}ml</p></div>
              <div onClick={() => setIsOutputModalOpen(true)} className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center active:bg-orange-100 cursor-pointer"><p className="text-orange-700 font-bold senior-text-base">排出: {totalOutput}ml</p></div>
            </div>
            <div onClick={() => setIsSymptomModalOpen(true)} className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between active:bg-slate-100 cursor-pointer">
              <div className="flex items-center gap-2">
                <Thermometer className="text-[#2B59C3]" size={24} />
                <span className="senior-text-lg font-bold text-slate-700">我的症状</span>
              </div>
              <span className="senior-text-base text-blue-600 font-bold truncate max-w-[120px]">{selectedSymptoms.join('、')}</span>
            </div>
            <button type="submit" className="senior-btn w-full bg-[#2B59C3] text-white senior-text-xl shadow-md">完成打卡</button>
          </form>
        </div>
      </div>

      {/* 用药提醒板块 */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <Pill size={24} className="text-emerald-500" />
            <h2 className="senior-text-xl font-black text-slate-800">今日用药</h2>
          </div>
          <div className="space-y-3">
            {medications.map(med => (
              <div key={med.id} onClick={() => toggleMedicationTaken(med.id)} className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${med.isTakenToday ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-emerald-50 shadow-sm cursor-pointer'}`}>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-slate-400" />
                  <div>
                    <p className="senior-text-lg font-bold">{med.name}</p>
                    <p className="senior-text-base text-slate-400 font-bold">{med.time} · {med.dosage}</p>
                  </div>
                </div>
                {med.isTakenToday ? <CheckCircle className="text-emerald-500" size={32} /> : <div className="w-8 h-8 rounded-full border-4 border-slate-100"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 评估测评入口 */}
      <div className="px-4 mb-6">
        <button onClick={() => setIsSurveyModalOpen(true)} className="w-full bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 cursor-pointer">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
            <ClipboardList size={32} className="text-orange-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="senior-text-xl font-black text-slate-800">健康测评调查</p>
            <p className="senior-text-base text-slate-400 font-bold">定期评估，掌握病情</p>
          </div>
          <ChevronRight className="text-slate-300" />
        </button>
      </div>

      {/* 健康宣教板块 */}
      <div className="px-4 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen size={24} className="text-blue-500" />
          <h2 className="senior-text-xl font-black text-slate-800">健康小知识</h2>
        </div>
        <div className="space-y-4">
          {eduContents.map(edu => (
            <div key={edu.id} onClick={() => setSelectedEdu(edu)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex gap-4 active:bg-slate-50 cursor-pointer">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={edu.cover} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="senior-text-lg font-black text-slate-800 leading-tight mb-2">{edu.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-bold">{edu.type === 'video' ? '视频' : '图文'}</span>
                  {edu.isRead && <span className="text-emerald-500 text-sm font-bold">已读</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 症状多选模态框 --- */}
      {isSymptomModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[1100] flex flex-col justify-end">
          <div className="bg-white rounded-t-[32px] p-8 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="senior-text-2xl font-black">选择症状</h2>
              <button onClick={() => setIsSymptomModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={28} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {SYMPTOM_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)}
                  className={`senior-btn border-4 h-16 senior-text-lg ${selectedSymptoms.includes(s) ? 'bg-blue-50 border-[#2B59C3] text-[#2B59C3]' : 'bg-slate-50 border-transparent text-slate-600'}`}>
                  {s}
                </button>
              ))}
            </div>
            {selectedSymptoms.includes("其他") && (
              <div className="mb-6">
                <input type="text" value={otherSymptomText} onChange={e => setOtherSymptomText(e.target.value)} 
                  className="senior-input w-full" placeholder="请输入其他症状..." />
              </div>
            )}
            <button onClick={() => setIsSymptomModalOpen(false)} className="senior-btn w-full bg-[#2B59C3] text-white mt-4 senior-text-xl">选好了</button>
          </div>
        </div>
      )}

      {/* --- 测评模态框 --- */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 bg-[#F9FBFF] z-[1000] flex flex-col">
          <div className="bg-white p-6 pt-12 flex items-center justify-between shadow-sm border-b">
            <h2 className="senior-text-xl font-black text-slate-800 truncate flex-1">{activeSurvey ? activeSurvey.name : '测评调查'}</h2>
            <button onClick={() => { setIsSurveyModalOpen(false); setActiveSurvey(null); }} className="p-2 bg-slate-100 rounded-full"><X size={28} /></button>
          </div>
          <div className="flex-1 p-6 flex flex-col overflow-y-auto">
            {!activeSurvey ? (
              <div className="space-y-4 pt-4">
                {SURVEYS.map(s => (
                  <button key={s.id} onClick={() => selectSurvey(s)} className="w-full bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-50 flex items-center justify-between active:bg-slate-50">
                    <span className="senior-text-lg font-bold text-slate-700 text-left">{s.name}</span>
                    <ChevronRight size={28} className="text-blue-500" />
                  </button>
                ))}
              </div>
            ) : surveyResult ? (
              <div className="flex-1 flex flex-col items-center justify-center p-2 pt-6 text-center">
                <div className="bg-white rounded-[32px] p-8 shadow-md border border-slate-50 w-full">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 mx-auto"><CheckCircle size={40} className="text-emerald-500" /></div>
                  <h3 className="senior-text-2xl font-black text-slate-800 mb-2">测评完成</h3>
                  <div className="w-full h-px bg-slate-100 my-4"></div>
                  <p className="senior-text-xl font-black text-[#2B59C3] mb-4">{surveyResult.level}</p>
                  <div className="bg-blue-50 p-6 rounded-2xl w-full text-left flex gap-3">
                    <Lightbulb className="text-orange-500 shrink-0" size={24} />
                    <p className="senior-text-base text-slate-700 font-bold">{surveyResult.advice}</p>
                  </div>
                </div>
                <button onClick={() => { setIsSurveyModalOpen(false); setActiveSurvey(null); }} className="senior-btn w-full bg-[#2B59C3] text-white mt-8 senior-text-xl">好的</button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="w-full bg-slate-100 h-3 rounded-full mb-8 overflow-hidden">
                  <div className="bg-[#2B59C3] h-full transition-all duration-300" style={{ width: `${((currentQIndex + 1) / activeSurvey.questions.length) * 100}%` }} />
                </div>
                <h3 className="senior-text-xl font-black text-slate-800 mb-8 min-h-[80px]">{activeSurvey.questions[currentQIndex].text}</h3>
                <div className="space-y-3">
                  {activeSurvey.questions[currentQIndex].options.map((opt, idx) => (
                    <button key={idx} onClick={() => onSelectAnswer(opt.s)}
                      className="senior-btn w-full bg-white border-2 border-slate-100 text-slate-700 senior-text-lg active:bg-blue-50">
                      {opt.t}
                    </button>
                  ))}
                </div>
                <div className="mt-auto pt-8 flex gap-4">
                  {currentQIndex > 0 && (
                    <button onClick={() => setCurrentQIndex(currentQIndex - 1)} className="flex-1 h-12 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-400">
                      <ChevronLeft size={24} /><span className="senior-text-base font-bold ml-1">上一题</span>
                    </button>
                  )}
                  {currentQIndex === activeSurvey.questions.length - 1 && (
                    <button onClick={submitSurvey} className="flex-[2] senior-btn bg-[#2B59C3] text-white senior-text-xl">完成</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 宣教详情 */}
      {selectedEdu && (
        <div className="fixed inset-0 bg-white z-[1200] flex flex-col overflow-y-auto">
          <div className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-white border-b z-10">
            <h2 className="senior-text-xl font-black">详情内容</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => { toggleFavorite(selectedEdu.id); triggerToast(favorites.includes(selectedEdu.id) ? '已取消收藏' : '已加入收藏'); }}
                className={`p-2 rounded-full ${favorites.includes(selectedEdu.id) ? 'bg-yellow-50 text-yellow-500' : 'bg-slate-50 text-slate-400'}`}
              >
                <Star size={24} fill={favorites.includes(selectedEdu.id) ? "currentColor" : "none"} />
              </button>
              <button onClick={() => { markEduRead(selectedEdu.id); setSelectedEdu(null); }} className="p-2 bg-slate-100 rounded-full"><X size={28} /></button>
            </div>
          </div>
          <div className="p-6">
            <h1 className="senior-text-2xl font-black mb-6">{selectedEdu.title}</h1>
            <div className="rounded-3xl overflow-hidden aspect-video bg-slate-100 mb-8">
              {selectedEdu.type === 'video' ? <video src={selectedEdu.mediaUrl} controls className="w-full h-full" /> : <img src={selectedEdu.mediaUrl || selectedEdu.cover} className="w-full h-full object-cover" />}
            </div>
            <div className="senior-text-lg leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">{selectedEdu.content}</div>
            <button onClick={() => { markEduRead(selectedEdu.id); setSelectedEdu(null); triggerToast('阅读完成，积分+5'); }} className="senior-btn w-full bg-[#2B59C3] text-white mt-12">我读完了</button>
          </div>
        </div>
      )}

      {/* 摄入/排出弹窗 */}
      {isIntakeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[600] flex flex-col justify-end">
          <div className="bg-white rounded-t-[32px] p-8 max-h-[80vh] shadow-2xl">
            <div className="flex items-center justify-between mb-6"><h2 className="senior-text-xl font-black">摄入记录 (24小时)</h2><button onClick={() => setIsIntakeModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={28} /></button></div>
            <select className="senior-input w-full bg-slate-50 mb-4" value={tempFood} onChange={e => setTempFood(e.target.value)}>{Object.keys(WATER_CONTENT_MAP).map(f => <option key={f} value={f}>{f}</option>)}</select>
            <div className="flex gap-4 mb-4"><input type="number" value={tempWeight} onChange={e => setTempWeight(e.target.value)} className="senior-input flex-1" placeholder="克(g)" /><button onClick={() => { if(!tempWeight) return; const ml = Math.round((parseFloat(tempWeight)/100) * WATER_CONTENT_MAP[tempFood]); setIntakeList([...intakeList, { name: tempFood, weightG: parseFloat(tempWeight), ml }]); setTempWeight(''); }} className="bg-[#2B59C3] text-white px-6 rounded-xl senior-text-lg font-bold active:scale-95 transition-transform">加</button></div>
            <div className="h-40 overflow-y-auto space-y-2 mb-4 bg-slate-50 p-4 rounded-xl">{intakeList.length > 0 ? intakeList.map((item, i) => (<div key={i} className="flex justify-between senior-text-base font-bold"><span>{item.name} {item.weightG}g</span><span className="text-[#2B59C3]">+{item.ml}ml</span></div>)) : <p className="text-slate-300 text-center py-10 font-bold">暂无摄入记录</p>}</div>
            <button onClick={() => setIsIntakeModalOpen(false)} className="senior-btn w-full bg-[#2B59C3] text-white">确定</button>
          </div>
        </div>
      )}

      {isOutputModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 z-[600] flex flex-col justify-end">
          <div className="bg-white rounded-t-[32px] p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="senior-text-xl font-black text-slate-800">排出记录 (24小时)</h2>
              <button onClick={() => setIsOutputModalOpen(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={28} />
              </button>
            </div>
            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 p-5 rounded-[20px] flex items-center gap-4 shadow-sm">
                <span className="senior-text-lg font-black text-slate-700 w-24">尿量</span>
                <input type="number" value={urine} onChange={e => setUrine(e.target.value)} className="senior-input flex-1 text-right bg-white font-black" placeholder="0" />
                <span className="senior-text-base font-black text-slate-400">ml</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-[20px] flex items-center gap-4 shadow-sm">
                <span className="senior-text-lg font-black text-slate-700 w-24">呕吐</span>
                <input type="number" value={vomit} onChange={e => setVomit(e.target.value)} className="senior-input flex-1 text-right bg-white font-black" placeholder="0" />
                <span className="senior-text-base font-black text-slate-400">ml</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-[20px] flex items-center gap-4 shadow-sm">
                <span className="senior-text-lg font-black text-slate-700 w-24">引流量</span>
                <input type="number" value={drainage} onChange={e => setDrainage(e.target.value)} className="senior-input flex-1 text-right bg-white font-black" placeholder="0" />
                <span className="senior-text-base font-black text-slate-400">ml</span>
              </div>
              <div className="bg-slate-50 p-5 rounded-[20px] flex items-center gap-4 shadow-sm">
                <span className="senior-text-lg font-black text-slate-700 w-24">其他</span>
                <input type="number" value={otherOutput} onChange={e => setOtherOutput(e.target.value)} className="senior-input flex-1 text-right bg-white font-black" placeholder="0" />
                <span className="senior-text-base font-black text-slate-400">ml</span>
              </div>
            </div>
            <div className="bg-blue-50 p-5 rounded-2xl mb-8 flex justify-between items-center border border-blue-100">
              <span className="senior-text-lg font-black text-slate-600">总计排出量</span>
              <span className="senior-text-2xl font-black text-[#2B59C3]">{totalOutput} ml</span>
            </div>
            <button onClick={() => setIsOutputModalOpen(false)} className="senior-btn w-full bg-[#2B59C3] text-white senior-text-xl shadow-lg">确定</button>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 text-white senior-text-lg px-8 py-4 rounded-2xl z-[2000] shadow-2xl text-center">
          {showToast}
        </div>
      )}
    </div>
  );
};

export default HomePage;
