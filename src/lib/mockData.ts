export interface Ride {
  id: string;
  driver: {
    name: string;
    avatar: string;
    rating: number;
    totalRides: number;
    company: string;
  };
  from: string;
  to: string;
  date: string;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  co2Saved: number; // kg
  duration: number; // minutes
  meetingPoint: string;
  notes: string;
  carModel: string;
}

export const mockRides: Ride[] = [
  {
    id: "ride-001",
    driver: {
      name: "陳大偉",
      avatar: "陳",
      rating: 4.9,
      totalRides: 128,
      company: "台積電",
    },
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-17",
    departureTime: "08:15",
    availableSeats: 2,
    totalSeats: 3,
    price: 80,
    co2Saved: 1.2,
    duration: 25,
    meetingPoint: "市政府站 1 號出口",
    notes: "請準時，車內禁止飲食",
    carModel: "Toyota Camry 灰色",
  },
  {
    id: "ride-002",
    driver: {
      name: "林小雨",
      avatar: "林",
      rating: 4.7,
      totalRides: 64,
      company: "聯發科",
    },
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-17",
    departureTime: "08:30",
    availableSeats: 1,
    totalSeats: 2,
    price: 90,
    co2Saved: 1.2,
    duration: 28,
    meetingPoint: "市政府站 3 號出口 全家便利商店前",
    notes: "可接受帶小型寵物（需有外出籠）",
    carModel: "Honda Fit 白色",
  },
  {
    id: "ride-003",
    driver: {
      name: "王建國",
      avatar: "王",
      rating: 5.0,
      totalRides: 312,
      company: "台灣大哥大",
    },
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-17",
    departureTime: "07:50",
    availableSeats: 3,
    totalSeats: 4,
    price: 70,
    co2Saved: 2.4,
    duration: 30,
    meetingPoint: "市政府站 2 號出口 公車站牌旁",
    notes: "歡迎聊天，也可保持安靜",
    carModel: "Toyota Alphard 黑色",
  },
  {
    id: "ride-004",
    driver: {
      name: "張美玲",
      avatar: "張",
      rating: 4.8,
      totalRides: 89,
      company: "玉山銀行",
    },
    from: "捷運市政府站",
    to: "南港軟體園區",
    date: "2026-03-17",
    departureTime: "09:00",
    availableSeats: 2,
    totalSeats: 3,
    price: 85,
    co2Saved: 1.2,
    duration: 22,
    meetingPoint: "市政府站 4 號出口",
    notes: "女性優先，男性亦歡迎",
    carModel: "Mazda CX-5 紅色",
  },
];

export function getRideById(id: string): Ride | undefined {
  return mockRides.find((r) => r.id === id);
}
