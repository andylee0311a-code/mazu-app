import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Calendar, ChevronRight, Sparkles, X, Loader2, ZoomIn, ZoomOut, Maximize, Minimize, ChevronUp } from 'lucide-react';

// --- Gemini API 整合設定 ---
// ⚠️ 注意：如果您要在 Vercel 上執行，請將下方空字串改為 import.meta.env.VITE_GEMINI_API_KEY
const apiKey = ""; 
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

const callGeminiApi = async (prompt) => {
  // 自動判斷：如果您有設定 VITE_GEMINI_API_KEY，優先使用您的金鑰
  let activeKey = apiKey;
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      activeKey = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    console.log("非 Vite 環境，使用預設金鑰機制");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${activeKey}`;
  
  let retries = 0;
  const maxRetries = 5;
  const delays = [1000, 2000, 4000, 8000, 16000];

  while (retries <= maxRetries) {
    try {
      console.log(`[API 測試] 正在發送請求... (第 ${retries + 1} 次嘗試)`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{
              text: "你是一位精通台灣宗教民俗文化與大甲媽祖遶境歷史的專業導覽員。請用充滿敬意、溫和、安定人心且具備文化深度的語氣回覆。若是解籤，請給予正向的指引。"
            }]
          }
        })
      });

      // 🚨 新增：如果 API 回傳錯誤，把錯誤細節印出來
      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API 伺服器回傳錯誤細節:", errorData);
        throw new Error(errorData.error?.message || `API 錯誤代碼: ${response.status}`);
      }
      
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "無法獲取內容，請稍後再試。";
      
    } catch (error) {
      console.error(`❌ 請求失敗 (第 ${retries + 1} 次):`, error.message);
      
      if (retries === maxRetries) {
        return `神明正在休息中 🙏\n(錯誤代碼: ${error.message})\n請按 F12 查看主控台了解詳細錯誤。`;
      }
      await new Promise(resolve => setTimeout(resolve, delays[retries]));
      retries++;
    }
  }
};

// --- 行程資料 ---
const itineraryData = [
  {
    day: "第1天",
    date: "4月18日",
    title: "駐駕彰化市南瑤宮",
    events: [
      { time: "子時", location: "大甲區大甲溪北端出城" },
      { time: "23:30", location: "清水區菁埔里慈雲宮起駕" },
      { time: "00:00", location: "清水區無極鎮安宮起駕" },
      { time: "00:15", location: "清水區下湳里朝興宮起駕" },
      { time: "01:15", location: "沙鹿區鹿寮里福德宮起駕" },
      { time: "01:45", location: "沙鹿區和平街朝興宮起駕" },
      { time: "02:10", location: "沙鹿區四平街保安宮起駕" },
      { time: "02:30", location: "沙鹿區四平街玉皇殿起駕" },
      { time: "03:00", location: "沙鹿區東晉路福亨宮起駕" },
      { time: "03:15", location: "沙鹿區東晉路青山宮起駕" },
      { time: "03:45", location: "沙鹿區南勢里南斗宮起駕" },
      { time: "04:00", location: "沙鹿區三鹿里保安宮起駕" },
      { time: "08:00", location: "大肚區頂街里萬興宮起駕" },
      { time: "08:50", location: "大肚區永和里永和宮起駕" },
      { time: "09:20", location: "大肚區中臺路煌熙宮起駕" },
      { time: "10:00", location: "大肚區磺溪里福德祠起駕" },
      { time: "11:10", location: "大肚區慈惠堂鎮明宮起駕" },
      { time: "12:10", location: "彰化市國聖里永安宮起駕" },
      { time: "13:10", location: "彰化市復興里久長安宮起駕" },
      { time: "14:10", location: "彰化市茄苳里茄苳王廟起駕" },
      { time: "14:20", location: "彰化市茄苳里福龍宮起駕" },
      { time: "14:30", location: "過境經彰化市茄苳里起駕" },
      { time: "14:50", location: "過境經彰化市茄南宮起駕" },
      { time: "15:00", location: "和美鎮營盤路福行宮起駕" },
      { time: "15:50", location: "彰化市下廍里福德祠起駕" },
      { time: "16:00", location: "彰化市下廍里永和堂起駕" },
      { time: "16:20", location: "彰化市過溝仔文華宮起駕" },
      { time: "16:50", location: "彰化市彩鳳庵、北辰宮起駕" },
      { time: "17:20", location: "彰化市自強南路龍鳳精舍起駕" },
      { time: "18:00", location: "彰化市西勢里聖安宮起駕" },
      { time: "18:30", location: "彰化市忠權里北極宮起駕" },
      { time: "20:10", location: "彰化市中華路開化寺起駕" },
      { time: "20:30", location: "彰化市民生路關帝廟起駕" },
      { time: "20:50", location: "彰化市民族路鎮安宮起駕" },
      { time: "21:00", location: "彰化市南瑤路鎮南宮起駕" },
      { time: "21:30", location: "彰化市南瑤路南瑤宮駐駕" }
    ]
  },
  {
    day: "第2天",
    date: "4月19日",
    title: "駐駕西螺福興宮",
    events: [
      { time: "01:00", location: "彰化市南瑤路南瑤宮起駕" },
      { time: "01:20", location: "彰化市中山路鈺鳳宮起駕" },
      { time: "01:30", location: "彰化市長壽街修水岩起駕" },
      { time: "02:00", location: "員林大甲媽祖會臨時行宮起駕" },
      { time: "04:10", location: "員林市大北門福營宮起駕" },
      { time: "04:30", location: "員林市和平里福寧宮起駕" },
      { time: "06:30", location: "永靖鄉永東村永安宮起駕" },
      { time: "08:20", location: "北斗鎮光復里華嚴寺起駕" },
      { time: "08:50", location: "北斗鎮光復里奠安宮起駕" },
      { time: "09:10", location: "東螺開基祖廟天后宮起駕" },
      { time: "09:40", location: "溪州鄉舊眉村武元宮起駕" },
      { time: "10:10", location: "溪州鄉舊眉村聖安宮起駕" },
      { time: "10:30", location: "過境經溪州鄉東州村起駕" },
      { time: "11:00", location: "溪州鄉尾厝村復興宮起駕" },
      { time: "12:30", location: "溪州鄉 (市區遶境)" },
      { time: "13:30", location: "溪州鄉瓦厝村后天宮起駕" },
      { time: "15:40", location: "溪州鄉三圳村三千宮起駕" },
      { time: "16:10", location: "溪州鄉三條村聖天宮起駕" },
      { time: "17:40", location: "西螺鎮建興路啟興宮起駕" },
      { time: "17:50", location: "西螺鎮建興路威天宮起駕" },
      { time: "18:00", location: "西螺遠東街伽藍爺廟起駕" },
      { time: "18:10", location: "西螺鎮四十一媽慈惠堂起駕" },
      { time: "18:30", location: "西螺鎮新街路廣福宮起駕" },
      { time: "19:00", location: "西螺鎮公正路正興宮起駕" },
      { time: "19:30", location: "西螺鎮源成東路廣興宮起駕" },
      { time: "20:10", location: "西螺鎮仁和街太元寺起駕" },
      { time: "21:00", location: "西螺鎮福興里福興宮駐駕" }
    ]
  },
  {
    day: "第3天",
    date: "4月20日",
    title: "駐駕新港奉天宮",
    events: [
      { time: "00:00", location: "西螺鎮福興里福興宮起駕" },
      { time: "00:20", location: "西螺鎮漢光里天聖宮起駕" },
      { time: "00:30", location: "西螺鎮漢光里廣聖宮起駕" },
      { time: "01:00", location: "西螺鎮新豐里新天宮起駕" },
      { time: "01:30", location: "西螺鎮七座魚寮鎮南宮起駕" },
      { time: "02:10", location: "西螺鎮吳厝里朝興宮起駕" },
      { time: "02:40", location: "二崙鄉田尾村賜福宮起駕" },
      { time: "03:10", location: "二崙鄉湳仔村玄祐宮起駕" },
      { time: "03:20", location: "二崙鄉湳仔村東隆宮起駕" },
      { time: "03:30", location: "二崙鄉三和村協天宮起駕" },
      { time: "04:00", location: "二崙鄉深坑仔觀音佛祖起駕" },
      { time: "04:20", location: "虎尾鎮墾地里福德宮起駕" },
      { time: "04:40", location: "虎尾鎮北溪里擇元堂起駕" },
      { time: "04:50", location: "虎尾鎮北溪里龍安宮起駕" },
      { time: "05:10", location: "虎尾鎮東屯里城隍廟起駕" },
      { time: "05:30", location: "虎尾鎮東屯里大安宮起駕" },
      { time: "05:40", location: "虎尾鎮西屯里七王府起駕" },
      { time: "05:50", location: "虎尾鎮西屯里聖安宮起駕" },
      { time: "06:00", location: "虎尾鎮大屯子福德宮起駕" },
      { time: "06:50", location: "土庫鎮中山路鳳山寺起駕" },
      { time: "07:00", location: "土庫鎮順天里順天宮起駕" },
      { time: "07:20", location: "土庫鎮順天里福德宮起駕" },
      { time: "07:30", location: "土庫鎮圓環145甲線往新港" },
      { time: "08:00", location: "土庫農安宮臨時行宮起駕" },
      { time: "09:30", location: "元長鄉鹿北村保勝宮起駕" },
      { time: "10:00", location: "元長鄉鹿北村泰安府起駕" },
      { time: "10:30", location: "元長鄉鹿北村義天宮起駕" },
      { time: "10:40", location: "元長鄉鹿南村薛府宮起駕" },
      { time: "11:00", location: "元長鄉瓦磘村安清府起駕" },
      { time: "11:10", location: "元長鄉瓦磘村福德宮起駕" },
      { time: "11:30", location: "元長鄉瓦磘村保生宮起駕" },
      { time: "12:00", location: "元長內寮村無極聖殿起駕" },
      { time: "12:20", location: "元長鄉安北路隆玄宮起駕" },
      { time: "13:00", location: "新港鄉各界人士恭迎聖駕" },
      { time: "13:50", location: "新港鄉南崙村代天宮起駕" },
      { time: "14:00", location: "新港鄉崙子點心站起駕" },
      { time: "14:30", location: "各香參拜鎮瀾宮天上聖母" },
      { time: "典禮", location: "頭香 桃園鎮德宮大甲天上聖母會" },
      { time: "典禮", location: "貳香 豐原鎮清宮慈聖天上聖母會" },
      { time: "典禮", location: "叁香 台中朝聖宮台中天上聖母會" },
      { time: "典禮", location: "贊香 台北聖鳳宮大甲媽祖聯誼會" },
      { time: "15:45", location: "新港鄉中庄村北極殿起駕" },
      { time: "16:00", location: "新港鄉中庄村永祿宮起駕" },
      { time: "16:40", location: "新港鄉古民村永福宮起駕" },
      { time: "17:20", location: "新港鄉大興村大興宮起駕" },
      { time: "17:30", location: "新港市區遶境奉天宮駐駕" }
    ]
  },
  {
    day: "第4天",
    date: "4月21日",
    title: "祝壽大典",
    events: [
      { time: "08:00", location: "於奉天宮廟前舉行遶境進香祝壽典禮 (07:30集合)" },
      { time: "晚間", location: "於奉天宮廟前舉行遶境進香回駕典禮 (21:30集合)" },
      { time: "典禮", location: "大甲鎮瀾宮天上聖母丙午年遶境進香回駕" }
    ]
  },
  {
    day: "第5天",
    date: "4月22日",
    title: "駐駕西螺福興宮",
    events: [
      { time: "典禮", location: "天上聖母遶境進香回駕" },
      { time: "01:00", location: "經新港鄉南崙村、北崙村" },
      { time: "01:50", location: "經元長鄉崙仔村、內寮村" },
      { time: "02:50", location: "瓦磘村、鹿南村、鹿北村" },
      { time: "03:00", location: "元長鄉鹿南村薛府宮起駕" },
      { time: "04:00", location: "過境經土庫鎮圓環邊起駕" },
      { time: "05:00", location: "虎尾鎮延平里德品堂起駕" },
      { time: "05:20", location: "虎尾鎮新吉里新翰宮起駕" },
      { time: "05:30", location: "虎尾鎮立仁里福德宮起駕" },
      { time: "06:00", location: "虎尾鎮立仁里順天宮起駕" },
      { time: "07:30", location: "虎尾鎮德興里天后宮起駕" },
      { time: "08:00", location: "虎尾鎮中正路德興宮起駕" },
      { time: "08:30", location: "虎尾鎮新生五路福德宮起駕" },
      { time: "08:40", location: "虎尾鎮新生路救世堂起駕" },
      { time: "08:50", location: "虎尾鎮新生路妙宗寺起駕" },
      { time: "09:20", location: "虎尾鎮民族路金羅殿起駕" },
      { time: "10:00", location: "虎尾鎮清雲路懿明宮起駕" },
      { time: "10:30", location: "虎尾鎮新興里福德祖廟起駕" },
      { time: "13:30", location: "西螺鎮吳厝里朝興宮起駕" },
      { time: "14:00", location: "西螺鎮九隆里慈和宮起駕" },
      { time: "14:20", location: "西螺鎮九隆里弓孝宮起駕" },
      { time: "14:50", location: "西螺鎮九隆里震安宮起駕" },
      { time: "16:00", location: "西螺鎮下湳里缽子寺起駕" },
      { time: "16:10", location: "西螺七座魚寮鎮南宮起駕" },
      { time: "16:30", location: "西螺鎮湳源里祖行宮起駕" },
      { time: "16:45", location: "西螺鎮福田里行天宮起駕" },
      { time: "17:00", location: "西螺鎮福田里福天宮起駕" },
      { time: "17:30", location: "經西螺鎮新安里、新豐里" },
      { time: "18:30", location: "西螺鎮新豐里新天宮起駕" },
      { time: "20:00", location: "西螺鎮福興里福興宮駐駕" }
    ]
  },
  {
    day: "第6天",
    date: "4月23日",
    title: "駐駕北斗奠安宮",
    events: [
      { time: "02:00", location: "西螺鎮福興里福興宮起駕" },
      { time: "02:20", location: "西螺鎮大橋路永興宮起駕" },
      { time: "03:00", location: "溪州鄉水尾村震威宮起駕" },
      { time: "06:00", location: "溪州鄉永安路育善寺起駕" },
      { time: "07:30", location: "北斗鎮大橋組壽安宮起駕" },
      { time: "08:30", location: "埤頭鄉元埔村三元宮起駕" },
      { time: "09:30", location: "埤頭鄉芙朝村金安宮起駕" },
      { time: "10:00", location: "埤頭鄉崙腳村新吉宮起駕" },
      { time: "10:30", location: "埤頭鄉崙腳村南雲寺起駕" },
      { time: "10:50", location: "埤頭鄉平原村廣興宮起駕" },
      { time: "13:10", location: "埤頭鄉合興村合興宮起駕" },
      { time: "15:50", location: "田中乾德宮臨時行宮起駕" },
      { time: "16:00", location: "北斗鎮西安里寶天宮起駕" },
      { time: "16:30", location: "北斗鎮斗苑路寶興宮起駕" },
      { time: "16:40", location: "北斗鎮斗苑路萬安館起駕" },
      { time: "16:50", location: "北斗鎮新政里福德祠起駕" },
      { time: "17:10", location: "北斗鎮三民街武英殿起駕" },
      { time: "17:20", location: "北斗光復路普度公壇起駕" },
      { time: "17:30", location: "北斗鎮地政路寶藍宮起駕" },
      { time: "17:50", location: "北斗鎮光復路富美館起駕" },
      { time: "18:30", location: "北斗鎮光復里奠安宮駐駕" }
    ]
  },
  {
    day: "第7天",
    date: "4月24日",
    title: "駐駕彰化天后宮",
    events: [
      { time: "01:00", location: "北斗鎮光復里奠安宮起駕" },
      { time: "03:10", location: "田尾鄉公園路廣興堂起駕" },
      { time: "03:30", location: "田尾鄉公園路上清殿起駕" },
      { time: "03:50", location: "田尾鄉公園路受武宮起駕" },
      { time: "04:00", location: "田尾鄉民生路廣善堂起駕" },
      { time: "04:20", location: "田尾鄉上野景觀工程起駕" },
      { time: "04:50", location: "田尾鄉溪畔村朝天宮起駕" },
      { time: "05:20", location: "永靖鄉湳港村甘澍宮起駕" },
      { time: "05:40", location: "永靖鄉湳港村慶福宮起駕" },
      { time: "06:00", location: "永靖鄉永東村永安宮起駕" },
      { time: "06:30", location: "永靖鄉永西村永福宮起駕" },
      { time: "06:45", location: "永靖鄉永東村壽歸堂起駕" },
      { time: "07:00", location: "永靖鄉瑚璉村輔天宮起駕" },
      { time: "08:00", location: "永靖鄉五汴村天聖宮起駕" },
      { time: "08:30", location: "員林大甲媽祖會臨時行宮起駕" },
      { time: "09:20", location: "員林市惠明宮妙化堂起駕" },
      { time: "09:30", location: "員林市光明街福寧宮起駕" },
      { time: "10:30", location: "員林市和平里福寧宮起駕" },
      { time: "11:00", location: "員林市大北門福營宮起駕" },
      { time: "11:30", location: "大村鄉美港村賜福宮起駕" },
      { time: "12:00", location: "大村鄉美港村福安宮起駕" },
      { time: "13:00", location: "花壇鄉中庄村福安宮起駕" },
      { time: "13:10", location: "花壇鄉中庄素食團起駕" },
      { time: "13:30", location: "花壇鄉橋頭村聖惠宮起駕" },
      { time: "15:30", location: "花壇鄉白沙坑文德宮起駕" },
      { time: "15:50", location: "彰化山腳大甲媽祖會起駕" },
      { time: "16:10", location: "彰化市延和里慈恩寺起駕" },
      { time: "17:00", location: "彰化市延平里慈元寺起駕" },
      { time: "19:30", location: "彰化市華北里彰山宮起駕" },
      { time: "20:00", location: "彰化市山路開彰祖廟起駕" },
      { time: "20:30", location: "彰化市大西門福德祠起駕" },
      { time: "21:00", location: "彰化市民族路鎮安宮起駕" },
      { time: "21:10", location: "彰化市民族路關帝廟起駕" },
      { time: "21:20", location: "彰化市永樂街慶安宮起駕" },
      { time: "21:30", location: "彰化市永樂街天后宮駐駕" }
    ]
  },
  {
    day: "第8天",
    date: "4月25日",
    title: "駐駕清水朝興宮",
    events: [
      { time: "23:00", location: "彰化市永樂街天后宮起駕" },
      { time: "00:00", location: "彰化市中華路開化寺起駕" },
      { time: "00:20", location: "彰化古龍山上帝公廟起駕" },
      { time: "00:40", location: "彰化大甲媽祖會臨時行宮起駕" },
      { time: "04:00", location: "過境經大肚溪橋至大肚區" },
      { time: "05:00", location: "大肚區王田里天和宮起駕" },
      { time: "08:30", location: "大肚區沙田路福興宮起駕" },
      { time: "09:00", location: "大肚區大東里鎮元宮起駕" },
      { time: "09:15", location: "大肚山陽里福德爺廟起駕" },
      { time: "09:30", location: "龍井區山腳里福德祠起駕" },
      { time: "10:00", location: "沙鹿區潭仔墘點心站起駕" },
      { time: "10:15", location: "沙鹿區斗抵里保寧宮起駕" },
      { time: "10:20", location: "沙鹿區沙田路福安宮起駕" },
      { time: "10:30", location: "沙鹿區福興宮點心站起駕" },
      { time: "11:00", location: "沙鹿區中山路觀音亭起駕" },
      { time: "13:00", location: "沙鹿區成功東路起駕" },
      { time: "14:00", location: "沙鹿區長春路義聖宮起駕" },
      { time: "16:00", location: "清水區西寧路壽天宮起駕" },
      { time: "16:05", location: "清水區董公街蓮馨宮起駕" },
      { time: "16:20", location: "清水區北寧街紫雲巖起駕" },
      { time: "16:40", location: "清水區大街路紫雲巖起駕" },
      { time: "16:45", location: "清水大街路開基福德祠起駕" },
      { time: "17:30", location: "清水區中華路順天宮起駕" },
      { time: "20:00", location: "清水區下湳里朝興宮駐駕" }
    ]
  },
  {
    day: "第9天",
    date: "4月26日",
    title: "回駕大甲鎮瀾宮",
    events: [
      { time: "05:30", location: "清水區下湳里朝興宮起駕" },
      { time: "06:00", location: "頭香 桃園鎮德宮大甲天上聖母會 獻香" },
      { time: "06:30", location: "貳香 豐原鎮清宮慈聖天上聖母會 獻香" },
      { time: "07:00", location: "叁香 台中朝聖宮台中天上聖母會 獻香" },
      { time: "07:30", location: "贊香 中壢朝明宮天上聖母會 獻香" },
      { time: "08:00", location: "贊香 台北聖鳳宮大甲媽祖聯誼會 獻香" },
      { time: "11:00", location: "清水區菁埔里慈雲宮起駕" },
      { time: "12:00", location: "過境經清水區至甲南停駕" },
      { time: "12:30", location: "清水區甲南北真宮起駕" },
      { time: "13:00", location: "清水區甲南湄安宮起駕" },
      { time: "14:00", location: "外埔區無極三清總道院起駕" },
      { time: "15:00", location: "大甲鎮瀾宮天上聖母丙午年遶境進香回駕遶境大甲市區" },
      { time: "典禮", location: "大甲鎮瀾宮天上聖母丙午年遶境進香回駕安座典禮" }
    ]
  }
];

export default function App() {
  const [activeDay, setActiveDay] = useState(0);
  const contentRef = useRef(null);
  
  // 螢幕大小與縮放狀態管理
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 顯示回頁首按鈕的狀態管理
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // AI Modal 狀態管理
  const [aiModal, setAiModal] = useState({
    isOpen: false,
    title: "",
    content: "",
    isLoading: false
  });

  const currentData = itineraryData[activeDay];

  // 監聽滾動事件來控制回頁首按鈕的顯示
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回頁首功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 全螢幕切換功能
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`無法切換全螢幕: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 觸發「探索宮廟」AI 功能
  const handleTempleInsight = async (location) => {
    setAiModal({
      isOpen: true,
      title: `✨ 探索：${location}`,
      content: "",
      isLoading: true
    });

    const prompt = `請簡短介紹「${location}」在大甲媽祖遶境中的重要性或其歷史背景。如果它是一個特定宮廟，請說明其主祀神明與特色。字數大約 100 到 150 字，以繁體中文撰寫。`;
    const response = await callGeminiApi(prompt);
    
    setAiModal(prev => ({ ...prev, content: response, isLoading: false }));
  };

  const closeModal = () => {
    setAiModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3B32] font-serif selection:bg-red-900 selection:text-white pb-24 relative" style={{ zoom: zoomLevel }}>
      {/* 頂部裝飾 */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-600 via-red-800 to-amber-600"></div>
      
      {/* 標題區塊 - 宗教文化風格 */}
      <header className="pt-10 pb-6 px-4 text-center bg-[#8B1A1A] text-amber-100 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #fcd34d 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative z-10 max-w-3xl mx-auto mt-2 md:mt-0">
          <p className="text-amber-300 text-sm md:text-base font-bold tracking-widest mb-2">2026 丙午年</p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wider mb-4 border-b-2 border-amber-600/50 pb-4 inline-block px-2 md:px-8">
            大甲鎮瀾宮媽祖遶境進香
          </h1>
          <p className="text-amber-200/80 mt-1 flex items-center justify-center gap-2">
            <Calendar size={16} /> 九天八夜完整時刻表
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative">
        
        {/* 日期切換導航 - 凍結於頂部 (Sticky) */}
        <div className="sticky top-2 md:top-4 z-30 mb-8 bg-white/95 backdrop-blur-sm shadow-[0_8px_20px_rgba(139,26,26,0.12)] rounded-xl border border-red-100 overflow-hidden transition-all">
          <div className="flex overflow-x-auto scrollbar-hide">
            {itineraryData.map((data, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveDay(index);
                  // 點擊後自動平滑滾動到內容區塊，並預留上方凍結選單的空間 (-120px)
                  setTimeout(() => {
                    if (contentRef.current) {
                      const yOffset = -120; 
                      const y = contentRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 50);
                }}
                className={`flex flex-col items-center min-w-[100px] flex-1 py-3 px-2 border-b-4 transition-all duration-300
                  ${activeDay === index 
                    ? 'border-red-800 bg-red-50 text-red-900 font-bold' 
                    : 'border-transparent text-gray-500 hover:bg-orange-50 hover:text-red-700'
                  }`}
              >
                <span className="text-sm">{data.day}</span>
                <span className="text-xs mt-1">{data.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 當日行程資訊卡 */}
        <div ref={contentRef} className="bg-white rounded-xl shadow-lg border-2 border-[#E8DCC4] overflow-hidden relative">
          
          {/* 當日標題 */}
          <div className="bg-gradient-to-r from-red-900 to-red-800 py-4 px-6 text-center text-amber-200 flex flex-col items-center">
            <h2 className="text-2xl font-bold tracking-widest flex items-center gap-2">
              <MapPin className="text-amber-400" />
              {currentData.title}
            </h2>
            <p className="text-sm mt-1 opacity-80">{currentData.day} ‧ {currentData.date}</p>
          </div>

          {/* 行程列表 - 時間軸設計 */}
          <div className="p-4 md:p-8 bg-[#FAFAF5]">
            <div className="relative border-l-2 border-amber-300 ml-4 md:ml-6 space-y-6">
              
              {currentData.events.map((event, idx) => {
                const isCeremony = event.time === "典禮" || event.time === "晚間" || event.time.includes("時");
                
                return (
                  <div key={idx} className="relative pl-6 md:pl-8 group">
                    {/* 時間軸圓點 */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 
                      ${isCeremony ? 'bg-amber-400 border-red-800' : 'bg-red-800 border-amber-300'} 
                      group-hover:scale-125 transition-transform duration-300 z-10`}></div>
                    
                    {/* 行程內容卡片 */}
                    <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-orange-100 group-hover:shadow-md group-hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
                      
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 z-10">
                        {/* 時間 */}
                        <div className={`flex items-center gap-1.5 font-bold min-w-[80px]
                          ${isCeremony ? 'text-amber-600' : 'text-red-800'}`}>
                          <Clock size={16} className={isCeremony ? 'text-amber-500' : 'text-red-700'} />
                          <span className="tracking-wider">{event.time}</span>
                        </div>
                        
                        {/* 箭頭 (僅桌面版顯示) */}
                        <ChevronRight size={16} className="hidden md:block text-gray-300" />

                        {/* 地點/活動 */}
                        <div className="text-lg text-gray-800 font-medium tracking-wide">
                          {event.location}
                        </div>
                      </div>

                      {/* AI 探索按鈕 */}
                      <button 
                        onClick={() => handleTempleInsight(event.location)}
                        className="self-start md:self-center flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors z-10"
                      >
                        <Sparkles size={14} className="text-amber-500" />
                        ✨ 探索
                      </button>

                    </div>
                  </div>
                );
              })}
              
            </div>
          </div>
          
          {/* 底部裝飾花紋 */}
          <div className="h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgLz4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2Q0YWYzNyIgLz4KPC9zdmc+')] opacity-50 border-t border-[#E8DCC4]"></div>
        </div>

      </main>

      {/* 頁尾 */}
      <footer className="text-center py-8 text-[#8B1A1A]/70 text-sm border-t border-orange-200 mt-8">
        <p>祈求風調雨順 ‧ 國泰民安</p>
        <p className="mt-1">© 2026 大甲媽祖遶境行程時刻表</p>
        <div className="mt-4">
          <span className="inline-block px-4 py-1.5 bg-red-800 text-amber-300 font-bold text-sm tracking-widest rounded-full shadow-md border border-amber-500/50">
            資料來源：大甲鎮瀾宮
          </span>
        </div>
        <p className="mt-6 text-xs font-sans text-amber-700 font-semibold tracking-wider">
          Designed by Andy Lee
        </p>
      </footer>

      {/* 懸浮控制面板：調整螢幕大小與畫面縮放 */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40">
        <button 
          onClick={toggleFullscreen}
          className="bg-white/90 backdrop-blur border border-amber-200 text-amber-900 p-3 rounded-full shadow-lg hover:bg-amber-50 transition-colors"
          title={isFullscreen ? "退出全螢幕" : "全螢幕模式"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        
        <div className="bg-white/90 backdrop-blur border border-amber-200 rounded-full shadow-lg flex flex-col items-center overflow-hidden">
          <button 
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))}
            className="p-3 text-amber-900 hover:bg-amber-50 transition-colors"
            title="放大畫面"
          >
            <ZoomIn size={20} />
          </button>
          <div className="h-px w-full bg-amber-200"></div>
          <button 
            onClick={() => setZoomLevel(1)}
            className="py-1 px-1 text-xs font-bold text-amber-800 hover:bg-amber-50 transition-colors min-w-[3.5rem]"
            title="重設大小"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <div className="h-px w-full bg-amber-200"></div>
          <button 
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.8))}
            className="p-3 text-amber-900 hover:bg-amber-50 transition-colors"
            title="縮小畫面"
          >
            <ZoomOut size={20} />
          </button>
        </div>
      </div>

      {/* 懸浮按鈕：回頁首 */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-800 to-red-700 text-amber-100 p-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all border border-amber-500/30 z-40"
          title="回頁首"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* AI 資訊彈出視窗 (Modal) */}
      {aiModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FAFAF5] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-amber-200 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal 標題區 */}
            <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                {aiModal.title}
              </h3>
              <button 
                onClick={closeModal}
                className="text-amber-200/70 hover:text-amber-100 transition-colors bg-white/10 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal 內容區 */}
            <div className="p-6 md:p-8 min-h-[150px] flex items-center justify-center relative">
              {/* 背景浮水印裝飾 */}
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <Sparkles size={120} />
              </div>

              {aiModal.isLoading ? (
                <div className="flex flex-col items-center text-amber-700 gap-3">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="text-sm font-medium animate-pulse tracking-widest">神諭解讀中...</p>
                </div>
              ) : (
                <div className="text-gray-800 leading-relaxed font-medium relative z-10 whitespace-pre-wrap">
                  {aiModal.content}
                </div>
              )}
            </div>

            {/* Modal 底部按鈕 */}
            <div className="bg-amber-50 px-6 py-4 border-t border-amber-100 flex justify-end">
              <button 
                onClick={closeModal}
                className="px-6 py-2 bg-red-800 hover:bg-red-700 text-amber-100 rounded-lg font-bold tracking-wider transition-colors shadow-sm"
              >
                叩謝神恩 (關閉)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}