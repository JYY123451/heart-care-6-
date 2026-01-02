
import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../AppContext';
import { 
  Award, 
  Scale, 
  ChevronRight, 
  Gift, 
  X, 
  HelpCircle, 
  MessageSquare, 
  Image as ImageIcon, 
  ShoppingBag, 
  Star, 
  Send, 
  User as UserIcon, 
  Plus, 
  HeartPulse 
} from 'lucide-react';
import * as echarts from 'echarts';

const REDEEM_ITEMS = [
  { id: 'item1', name: '血压计', points: 500, img: 'https://picsum.photos/200?bloodpressure' },
  { id: 'item2', name: '体重秤', points: 300, img: 'https://picsum.photos/200?scale' },
  { id: 'item3', name: '带刻度的水杯', points: 80, img: 'https://picsum.photos/200?cup' },
  { id: 'item4', name: '健康教育手册', points: 50, img: 'https://picsum.photos/200?manual' },
  { id: 'item5', name: '药盒', points: 40, img: 'https://picsum.photos/200?pillbox' },
  { id: 'item6', name: '盐勺', points: 30, img: 'https://picsum.photos/200?spoon' },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  type: 'text' | 'image';
  content: string;
  time: string;
}

const ProfilePage: React.FC = () => {
  const { user, logs, eduContents, favorites, deductPoints, toggleFavorite } = useAppContext();
  const chartRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // 弹窗状态
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [feedbackText, setFeedbackText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // 咨询状态
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'doctor',
      type: 'text',
      content: '您好，我是您的专属健康助理。请问有什么可以帮您的？您可以发送文字或者上传症状照片。',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // 计算体重差异
  const diff = logs.length > 0 
    ? (logs[logs.length - 1].weight - user.baseWeight).toFixed(1) 
    : "0.0";

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!chartRef.current || logs.length === 0) return;

    const myChart = echarts.init(chartRef.current);
    const last7Logs = logs.slice(-7);
    const dates = last7Logs.map(l => l.date.slice(5));
    const weights = last7Logs.map(l => l.weight);
    
    const option = {
      backgroundColor: '#ffffff',
      title: {
        text: '体重监测趋势',
        left: 'center',
        top: 10,
        textStyle: { fontSize: 14, color: '#334155', fontWeight: 'bold' }
      },
      grid: { left: '15%', right: '10%', bottom: '15%', top: '25%' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: { fontSize: 11, color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#f1f5f9' } },
      },
      yAxis: {
        type: 'value',
        scale: true, 
        axisLabel: { fontSize: 11, color: '#94a3b8' },
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      },
      series: [
        {
          data: weights,
          type: 'line',
          smooth: true,
          symbolSize: 6,
          label: { show: true, position: 'top', fontSize: 11, fontWeight: 'bold' },
          lineStyle: { width: 3, color: '#2B59C3' },
          itemStyle: { color: '#2B59C3' },
          markLine: {
            silent: true,
            data: [{ yAxis: user.baseWeight }],
            lineStyle: { type: 'dashed', color: '#E11D48', width: 2 }
          }
        }
      ]
    };

    myChart.setOption(option);
    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [logs, user.baseWeight]);

  useEffect(() => {
    if (chatEndRef.current && isChatOpen) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleRedeem = (item: { name: string; points: number }) => {
    if (deductPoints(item.points)) {
      showToast(`兑换成功！已获得 ${item.name}`);
    } else {
      showToast(`积分不足，还差 ${item.points - user.points} 分`);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
    
    // 模拟医生回复
    setTimeout(() => {
      const doctorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        type: 'text',
        content: '收到您的咨询。医生正在阅读您的历史打卡记录，请稍等片刻...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, doctorReply]);
    }, 1500);
  };

  const handleSendImage = () => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'image',
      content: 'https://picsum.photos/400/300?symptom',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMessage]);
    
    setTimeout(() => {
      const doctorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'doctor',
        type: 'text',
        content: '图片已收到。请问这处水肿按压后是否有明显凹陷？',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, doctorReply]);
    }, 2000);
  };

  const favoriteList = eduContents.filter(content => favorites.includes(content.id));

  return (
    <div className="pb-10 min-h-screen bg-[#F9FBFF]">
      {/* 资料卡 */}
      <div className="bg-white p-6 shadow-sm flex items-center gap-5 border-b">
        <img src={user.avatar} className="w-14 h-14 rounded-full border-2 border-blue-50 shadow-sm" alt="Avatar" />
        <div className="flex-1">
          <h2 className="senior-text-lg font-black text-slate-800">{user.name} </h2>
          <div className="mt-1 flex gap-2">
            <span className="bg-blue-50 text-[#2B59C3] px-2 py-0.5 rounded-lg text-xs font-bold">心功能 {user.functionLevel}</span>
            <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg text-xs font-bold">{user.history}</span>
          </div>
        </div>
      </div>

      {/* 积分面板 */}
      <div className="mx-4 mt-5 bg-[#2B59C3] rounded-[24px] p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award size={32} className="text-yellow-400" />
            <div>
              <p className="opacity-80 senior-text-base font-bold">健康积分</p>
              <p className="senior-text-2xl font-black">{user.points}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsRedeemOpen(true)}
            className="bg-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 active:bg-white/30 transition-colors"
          >
            <Gift size={18} />
            <span className="senior-text-base font-black">积分兑换</span>
          </button>
        </div>
        <p className="text-xs opacity-60">坚持打卡和学习，赢取丰厚奖品</p>
      </div>

      {/* 体重趋势 */}
      <div className="mx-4 mt-5 bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <Scale size={24} className="text-[#2B59C3]" />
          <h2 className="senior-text-base font-black text-slate-800">体重变化趋势</h2>
        </div>
        <div ref={chartRef} className="h-52 w-full mb-4"></div>
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-slate-400 text-xs font-bold mb-1">入组体重</p>
            <p className="senior-text-lg font-black text-slate-700">{user.baseWeight}kg</p>
          </div>
          <div className="text-center border-l border-slate-100">
            <p className="text-slate-400 text-xs font-bold mb-1">当前对比</p>
            <p className={`senior-text-lg font-black ${parseFloat(diff) >= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {parseFloat(diff) > 0 ? `+${diff}` : diff}kg
            </p>
          </div>
        </div>
      </div>

      {/* 辅助入口 */}
      <div className="mt-5 mx-4 space-y-2">
        {/* 在“我的收藏”上方添加“咨询”模块 */}
        <div onClick={() => setIsChatOpen(true)} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-50 active:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} className="text-[#2B59C3]" />
            </div>
            <span className="senior-text-base font-bold text-slate-700">在线咨询</span>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </div>

        <div onClick={() => setIsFavoritesOpen(true)} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-50 active:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <Star size={20} className="text-yellow-500" fill="currentColor" />
            </div>
            <span className="senior-text-base font-bold text-slate-700">我的收藏</span>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </div>

        <div onClick={() => setIsHelpOpen(true)} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-50 active:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <HelpCircle size={20} className="text-slate-500" />
            </div>
            <span className="senior-text-base font-bold text-slate-700">使用帮助</span>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </div>

        <div onClick={() => setIsFeedbackOpen(true)} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-50 active:bg-slate-50 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ImageIcon size={20} className="text-emerald-500" />
            </div>
            <span className="senior-text-base font-bold text-slate-700">意见反馈</span>
          </div>
          <ChevronRight className="text-slate-300" size={20} />
        </div>
      </div>

      {/* 在线咨询全屏弹窗 */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-[#F5F7FA] z-[1400] flex flex-col">
          <div className="p-6 pt-12 flex items-center justify-between bg-white border-b shadow-sm z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <HeartPulse size={24} className="text-[#2B59C3]" />
              </div>
              <div>
                <h2 className="senior-text-lg font-black text-slate-800">专属健康咨询</h2>
                <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 在线
                </p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={24} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-[#2B59C3]' : 'bg-white'}`}>
                    {msg.sender === 'user' ? <UserIcon size={20} className="text-white" /> : <HeartPulse size={20} className="text-[#2B59C3]" />}
                  </div>
                  <div className="flex flex-col">
                    <div className={`p-4 rounded-[20px] shadow-sm senior-text-base font-bold ${msg.sender === 'user' ? 'bg-[#2B59C3] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                      {msg.type === 'text' ? (
                        msg.content
                      ) : (
                        <img src={msg.content} className="max-w-full rounded-lg" alt="upload" />
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 text-slate-400 font-bold ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="bg-white p-4 pb-10 border-t flex items-end gap-3">
            <button onClick={handleSendImage} className="p-3 bg-slate-50 text-slate-500 rounded-full active:bg-slate-100">
              <Plus size={28} />
            </button>
            <div className="flex-1 bg-slate-50 rounded-[28px] border border-slate-200 px-4 py-2 flex items-center">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="点击输入您的问题..."
                className="flex-1 bg-transparent senior-text-base font-bold outline-none"
              />
            </div>
            <button onClick={handleSendMessage} className={`p-3 rounded-full shadow-md transition-colors ${chatInput.trim() ? 'bg-[#2B59C3] text-white' : 'bg-slate-100 text-slate-300'}`}>
              <Send size={24} />
            </button>
          </div>
        </div>
      )}

      {/* 积分兑换全屏弹窗 */}
      {isRedeemOpen && (
        <div className="fixed inset-0 bg-[#F9FBFF] z-[1300] flex flex-col overflow-y-auto">
          <div className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-white border-b z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-[#2B59C3]" size={24} />
              <h2 className="senior-text-xl font-black">礼品兑换</h2>
            </div>
            <button onClick={() => setIsRedeemOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={24} /></button>
          </div>
          <div className="p-6">
            <div className="bg-blue-50 p-6 rounded-[28px] mb-8 flex justify-between items-center border border-blue-100">
              <span className="senior-text-lg font-black text-slate-700">我的可用积分</span>
              <span className="senior-text-2xl font-black text-[#2B59C3]">{user.points}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {REDEEM_ITEMS.map(item => (
                <div key={item.id} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm flex flex-col">
                  <img src={item.img} className="w-full h-32 object-cover" />
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="senior-text-base font-bold text-slate-800 mb-2 truncate">{item.name}</h3>
                    <p className="text-[#2B59C3] senior-text-lg font-black mb-3">{item.points}积分</p>
                    <button 
                      onClick={() => handleRedeem(item)}
                      className="mt-auto senior-btn h-12 bg-blue-50 text-[#2B59C3] senior-text-base border-2 border-blue-100 active:bg-[#2B59C3] active:text-white"
                    >
                      兑换
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 我的收藏全屏弹窗 */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 bg-[#F9FBFF] z-[1300] flex flex-col overflow-y-auto">
          <div className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-white border-b z-10 shadow-sm">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" fill="currentColor" size={24} />
              <h2 className="senior-text-xl font-black">我的收藏</h2>
            </div>
            <button onClick={() => setIsFavoritesOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={24} /></button>
          </div>
          <div className="p-6">
            {favoriteList.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-20 text-slate-300">
                <Star size={64} className="mb-4 opacity-20" />
                <p className="senior-text-lg font-bold">暂无收藏内容</p>
                <p className="text-sm mt-2 font-bold">学习宣教内容时可点击星星收藏</p>
              </div>
            ) : (
              <div className="space-y-4">
                {favoriteList.map(edu => (
                  <div key={edu.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex gap-4 relative">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={edu.cover} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="senior-text-base font-black text-slate-800 leading-tight mb-2">{edu.title}</h3>
                      <button 
                        onClick={() => toggleFavorite(edu.id)}
                        className="text-rose-500 text-xs font-bold underline"
                      >
                        取消收藏
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用帮助全屏弹窗 */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-white z-[1300] flex flex-col overflow-y-auto">
          <div className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-white border-b">
            <h2 className="senior-text-xl font-black">使用帮助</h2>
            <button onClick={() => setIsHelpOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={24} /></button>
          </div>
          <div className="p-6 space-y-8">
            <section>
              <h3 className="senior-text-lg font-black text-blue-700 mb-3">1. 如何进行健康打卡？</h3>
              <p className="senior-text-base text-slate-600 mb-4 leading-relaxed font-bold">
                在首页点击“每日健康记录”区域，输入您的体重、血压、心率。点击“摄入”和“排出”可以记录饮食和排尿情况。
              </p>
              <img src="https://picsum.photos/600/300?help1" className="w-full rounded-2xl shadow-sm" alt="help" />
            </section>
            <section>
              <h3 className="senior-text-lg font-black text-blue-700 mb-3">2. 积分有什么用？</h3>
              <p className="senior-text-base text-slate-600 mb-4 leading-relaxed font-bold">
                每天签到、打卡、完成测评和阅读健康知识都能获得积分。积分可以在个人中心兑换礼品。
              </p>
              <img src="https://picsum.photos/600/300?help2" className="w-full rounded-2xl shadow-sm" alt="help" />
            </section>
            <button onClick={() => setIsHelpOpen(false)} className="senior-btn w-full bg-[#2B59C3] text-white senior-text-lg">我知道了</button>
          </div>
        </div>
      )}

      {/* 意见反馈全屏弹窗 */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-[#F9FBFF] z-[1300] flex flex-col overflow-y-auto">
          <div className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-white border-b">
            <h2 className="senior-text-xl font-black">意见反馈</h2>
            <button onClick={() => setIsFeedbackOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={24} /></button>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4 text-slate-400">
                <MessageSquare size={20} />
                <span className="senior-text-base font-bold">您的问题或建议</span>
              </div>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full h-40 senior-text-base font-bold outline-none resize-none placeholder:text-slate-200"
                placeholder="请填写您在使用过程中遇到的问题..."
              />
            </div>
            <button 
              onClick={() => {
                if(!feedbackText) return window.alert('请输入内容');
                showToast('提交成功，感谢您的建议！');
                setIsFeedbackOpen(false);
                setFeedbackText('');
              }}
              className="senior-btn w-full bg-[#2B59C3] text-white senior-text-lg shadow-md"
            >
              提交反馈
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 text-white senior-text-lg px-8 py-4 rounded-2xl z-[2000] shadow-2xl text-center">
          {toast}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
