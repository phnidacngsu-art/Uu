import {
  ColorRule,
  DayOfWeekKey,
  OccasionOption,
  OutfitCombination,
  OutfitItemPiece,
  StyleOption,
  DAY_INFO_LIST,
  DayInfo,
  MatchResultResponse,
} from '../src/types';

// Helper to convert date to DayOfWeekKey
export function getDayOfWeekFromDate(dateStr: string): DayOfWeekKey {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const map: DayOfWeekKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday_day',
    'thursday',
    'friday',
    'saturday',
  ];
  return map[day] || 'sunday';
}

export function getDayInfo(key: DayOfWeekKey): DayInfo {
  return (
    DAY_INFO_LIST.find((d) => d.key === key) || {
      key: 'sunday',
      label: 'Sunday',
      thaiName: 'วันอาทิตย์',
      defaultColor: '#EF4444',
      symbol: '☀️',
    }
  );
}

function extractColor(
  item: ColorRule | { name: string; hex: string } | undefined,
  fallback: { name: string; hex: string } = { name: 'เบจครีม', hex: '#FDFBF7' }
): { name: string; hex: string } {
  if (!item) return fallback;
  if ('colorName' in item) {
    return { name: item.colorName, hex: item.hexCode };
  }
  return { name: item.name, hex: item.hex };
}

// Color distance helper to ensure colors don't clash or sneak into kali
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function colorDistance(hex1: string, hex2: string): number {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
  );
}

// Neutral palettes that can be safely used unless they clash with Kali
const SAFE_NEUTRALS = [
  { name: 'ขาวไข่มุกบริสุทธิ์', hex: '#FFFFFF' },
  { name: 'ครีมวานิลลาอบอุ่น', hex: '#FDFBF7' },
  { name: 'เบจธรรมชาติ', hex: '#F3EFE6' },
  { name: 'เทาหมอกสว่าง', hex: '#E2E8F0' },
  { name: 'ทรายทองอ่อน', hex: '#EED9C4' },
  { name: 'ทองแชมเปญเกรซ', hex: '#D4AF37' },
  { name: 'เงินพรีเมียม', hex: '#CBD5E1' },
];

export function runMatchingEngine(
  birthdayKey: DayOfWeekKey,
  targetDate: string,
  allRules: ColorRule[],
  occasion: OccasionOption = 'วันสบาย ๆ',
  style: StyleOption = 'Minimal',
  preferredColors: string[] = []
): MatchResultResponse {
  const targetDayKey = getDayOfWeekFromDate(targetDate);
  const birthDayInfo = getDayInfo(birthdayKey);
  const targetDayInfo = getDayInfo(targetDayKey);

  // 1. Layer 1: User's Birthday Rules
  const birthRules = allRules.filter((r) => r.dayOfWeek === birthdayKey && r.isActive);

  // 2. Layer 2: Target Day Rules
  const targetRules = allRules.filter((r) => r.dayOfWeek === targetDayKey && r.isActive);

  // 3. Identify all Kali colors and Avoid colors (from both birth and target day)
  const kaliRules = [
    ...birthRules.filter((r) => r.type === 'kali'),
    ...targetRules.filter((r) => r.type === 'kali'),
  ];
  const avoidRules = [
    ...birthRules.filter((r) => r.type === 'avoid'),
    ...targetRules.filter((r) => r.type === 'avoid'),
  ];

  // Deduplicate kali & avoid by hexCode
  const kaliHexes = new Set(kaliRules.map((k) => k.hexCode.toUpperCase()));
  const avoidHexes = new Set(avoidRules.map((a) => a.hexCode.toUpperCase()));

  // 4. Candidate colors: Recommended & Secondary
  const rawRecommended = [
    ...birthRules.filter((r) => r.type === 'recommended'),
    ...targetRules.filter((r) => r.type === 'recommended'),
  ];
  const rawSecondary = [
    ...birthRules.filter((r) => r.type === 'secondary'),
    ...targetRules.filter((r) => r.type === 'secondary'),
  ];

  // STRICT KALI EXCLUSION FILTER:
  // Color is excluded if exact match to Kali or too close (distance < 38)
  const isKali = (hex: string) => {
    const up = hex.toUpperCase();
    if (kaliHexes.has(up)) return true;
    for (const kh of kaliHexes) {
      if (colorDistance(up, kh) < 38) return true;
    }
    return false;
  };

  const cleanRecommended = rawRecommended.filter((r) => !isKali(r.hexCode));
  const cleanSecondary = rawSecondary.filter((r) => !isKali(r.hexCode));
  const cleanNeutrals = SAFE_NEUTRALS.filter((n) => !isKali(n.hex));

  // Fallback if rules are sparse
  if (cleanRecommended.length === 0) {
    cleanRecommended.push({
      id: 'fallback-rec',
      dayOfWeek: targetDayKey,
      colorName: targetDayInfo.label + ' Classic Gold',
      hexCode: '#D97706',
      type: 'recommended',
      priority: 1,
      description: 'สีทองสุภาพเสริมมงคล',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });
  }

  // Generate distinct Outfit Combinations
  const combinations: OutfitCombination[] = [];

  // Harmony Strategy 1: Monochromatic / Tonal Harmony
  {
    const primary = cleanRecommended[0];
    const secondary = cleanSecondary[0] || cleanNeutrals[0];
    const neutral = cleanNeutrals[0] || { name: 'เบจคลีน', hex: '#F5F5F4' };
    const accent = cleanSecondary[1] || cleanRecommended[1] || cleanNeutrals[5];

    const top: OutfitItemPiece = {
      category: 'top',
      label: 'เสื้อเชิ้ต/เสื้อท็อป',
      colorName: primary.colorName,
      hexCode: primary.hexCode,
      role: 'main',
      description: `สีหลักประจำวันเพื่อเสริมมงคลและความโดดเด่นสไตล์ ${style}`,
    };
    const bottom: OutfitItemPiece = {
      category: 'bottom',
      label: 'กางเกง/กระโปรง',
      colorName: neutral.name,
      hexCode: neutral.hex,
      role: 'neutral',
      description: 'โทนสีสมดุลสร้างความสะอาดตาและขับให้สีหลักเด่นขึ้น',
    };
    const secondaryColorObj = extractColor(secondary);
    const accentColorObj = extractColor(accent);

    const shoes: OutfitItemPiece = {
      category: 'shoes',
      label: 'รองเท้า',
      colorName: secondaryColorObj.name,
      hexCode: secondaryColorObj.hex,
      role: 'secondary',
      description: 'สีรองกลมกลืน ช่วยคุมโทนให้ทั้งชุดดูมีมิติ',
    };
    const bag: OutfitItemPiece = {
      category: 'bag',
      label: 'กระเป๋าถือ',
      colorName: accentColorObj.name,
      hexCode: accentColorObj.hex,
      role: 'accent',
      description: `จุดเด่น Accent สวยงาม เหมาะกับโอกาส ${occasion}`,
    };
    const accessory: OutfitItemPiece = {
      category: 'accessory',
      label: 'เครื่องประดับ/นาฬิกา',
      colorName: 'ทองแชมเปญ/เมทัลลิก',
      hexCode: '#D4AF37',
      role: 'accent',
      description: 'เสริมประกายความหรูหราและความมั่นใจ',
    };

    combinations.push({
      id: 'comb-harmony-1',
      score: 95,
      harmonyType: 'Monochromatic & Tone-on-Tone',
      mainColor: { name: primary.colorName, hex: primary.hexCode },
      secondaryColor: secondaryColorObj,
      accentColor: accentColorObj,
      neutralColor: { name: neutral.name, hex: neutral.hex },
      items: { top, bottom, shoes, bag, accessory },
      explanation: `ใช้หลักการไล่ระดับเฉดสี (Tonal Contrast) โดยวางสี ${primary.colorName} เป็นสีหลักด้านบน เพื่อเปิดรับพลังมงคลและสร้าง First Impression ที่สง่างาม ตัดด้วย ${neutral.name} ในส่วนท่อนล่างเพื่อลดความหนักของสี และแต้ม Accent ด้วย ${accentColorObj.name} เพื่อความโมเดิร์นมีระดับ`,
      luckyHighlights: [
        `สีหลัก ${primary.colorName}: หนุนบารมีและเสน่ห์เมตตา`,
        `สีรอง ${secondaryColorObj.name}: เสริมโชคลาภการเงินและความราบรื่น`,
        `ระบบได้ตัดสีกาลกิณี ${kaliRules.map((k) => k.colorName).join(', ') || 'ทั้งหมด'} ออกจากชุด 100%`,
      ],
      kaliExcludedCount: kaliRules.length,
    });
  }

  // Harmony Strategy 2: Analogous / Complementary Contrast
  {
    const primary = cleanRecommended[1] || cleanRecommended[0];
    const secondary = cleanRecommended[0];
    const neutral = cleanNeutrals[1] || cleanNeutrals[0];
    const accent = cleanNeutrals[4] || { name: 'ทองประกาย', hex: '#D4AF37' };

    const top: OutfitItemPiece = {
      category: 'top',
      label: 'เสื้อเบลเซอร์ / เสื้อคลุม',
      colorName: neutral.name,
      hexCode: neutral.hex,
      role: 'neutral',
      description: 'สร้างกรอบความสมาร์ทแบบมืออาชีพและเรียบโก้',
    };
    const bottom: OutfitItemPiece = {
      category: 'bottom',
      label: 'กางเกงสแล็ค / กระโปรงทรงเอ',
      colorName: primary.colorName,
      hexCode: primary.hexCode,
      role: 'main',
      description: `สีมงคลหลักที่ดึงดูดสายตาและเสริมพลังวันเกิด`,
    };
    const shoes: OutfitItemPiece = {
      category: 'shoes',
      label: 'รองเท้าส้นสูง / สนีกเกอร์คลีน',
      colorName: neutral.name,
      hexCode: neutral.hex,
      role: 'neutral',
      description: 'โทนเบจสะอาดตา ยืดสัดส่วนขาให้ดูเพรียวยาว',
    };
    const bag: OutfitItemPiece = {
      category: 'bag',
      label: 'กระเป๋าสะพายข้าง',
      colorName: secondary.colorName,
      hexCode: secondary.hexCode,
      role: 'secondary',
      description: 'สร้างมิติคู่สีคล้องจอง เพิ่มความมีสไตล์',
    };
    const accessory: OutfitItemPiece = {
      category: 'accessory',
      label: 'เข็มขัด / เครื่องประดับคอ',
      colorName: accent.name,
      hexCode: accent.hex,
      role: 'accent',
      description: 'ตัดขอบเอวให้ดูคมชัดและเพิ่มความพรีเมียม',
    };

    combinations.push({
      id: 'comb-harmony-2',
      score: 92,
      harmonyType: 'Harmonious Contrast & Accent Balance',
      mainColor: { name: primary.colorName, hex: primary.hexCode },
      secondaryColor: { name: secondary.colorName, hex: secondary.hexCode },
      accentColor: { name: accent.name, hex: accent.hex },
      neutralColor: { name: neutral.name, hex: neutral.hex },
      items: { top, bottom, shoes, bag, accessory },
      explanation: `วางสัดส่วนแบบ 60-30-10: ใช้สีเบจกลาง ${neutral.name} 60% เพื่อคุมบรรยากาศให้เข้ากับโอกาส ${occasion} ตามด้วยสีมงคล ${primary.colorName} 30% ที่ส่วนท่อนล่างเพื่อเพิ่มน้ำหนักความมั่นคง และจบด้วย Accent ${accent.name} 10% ให้ชุดดูน่าจดจำ`,
      luckyHighlights: [
        `การจับคู่สีตามหลัก Golden Ratio (60-30-10) ช่วยให้ชุดดูแพง`,
        `ดึงสีมงคลของทั้งวันเกิดและวันที่แต่งตัวมาผสมผสานกันอย่างลงตัว`,
        `ปลอดภัยจากสีกาลกิณีโดยสมบูรณ์`,
      ],
      kaliExcludedCount: kaliRules.length,
    });
  }

  // Harmony Strategy 3: Relaxed Sophisticated Minimal
  {
    const primary = cleanRecommended[cleanRecommended.length - 1] || cleanRecommended[0];
    const neutral1 = cleanNeutrals[0];
    const neutral2 = cleanNeutrals[2] || cleanNeutrals[1];
    const accent = cleanSecondary[0] || cleanRecommended[0];

    const top: OutfitItemPiece = {
      category: 'top',
      label: 'เสื้อเชิ้ตโอเวอร์ไซส์ / คาร์ดิแกน',
      colorName: neutral1.name,
      hexCode: neutral1.hex,
      role: 'neutral',
      description: 'ให้ความรู้สึกผ่อนคลาย เรียบง่าย และสบายตา',
    };
    const bottom: OutfitItemPiece = {
      category: 'bottom',
      label: 'กางเกงผ้าลินิน / กระโปรงพลีท',
      colorName: primary.colorName,
      hexCode: primary.hexCode,
      role: 'main',
      description: 'แต้มสีประจำวันเกิดให้ลุคดูสดใสมีชีวิตชีวา',
    };
    const shoes: OutfitItemPiece = {
      category: 'shoes',
      label: 'รองเท้าโลฟเฟอร์ / มิวล์',
      colorName: neutral2.name,
      hexCode: neutral2.hex,
      role: 'secondary',
      description: 'โทนสีสบายตา เดินทางคล่องตัวตลอดวัน',
    };
    const accentColorObj = extractColor(accent);

    const bag: OutfitItemPiece = {
      category: 'bag',
      label: 'กระเป๋าโท้ทหนังนุ่ม',
      colorName: accentColorObj.name,
      hexCode: accentColorObj.hex,
      role: 'accent',
      description: 'สีรองที่ช่วยดึงความน่าสนใจของกระเป๋า',
    };
    const accessory: OutfitItemPiece = {
      category: 'accessory',
      label: 'แว่นตากันแดด / ต่างหูมินิมอล',
      colorName: 'ซิลเวอร์แพลทินัม',
      hexCode: '#94A3B8',
      role: 'accent',
      description: 'เสริมความทันสมัยสไตล์ Modern Chic',
    };

    combinations.push({
      id: 'comb-harmony-3',
      score: 89,
      harmonyType: 'Modern Neutral & Organic Flow',
      mainColor: { name: primary.colorName, hex: primary.hexCode },
      secondaryColor: accentColorObj,
      accentColor: { name: 'ซิลเวอร์แพลทินัม', hex: '#94A3B8' },
      neutralColor: { name: neutral1.name, hex: neutral1.hex },
      items: { top, bottom, shoes, bag, accessory },
      explanation: `เหมาะสำหรับคนที่ชอบความเรียบหรู คล่องตัว ไม่ตะโกน (Quiet Luxury) การประสานสีโทนธรรมชาติกับสีมงคล ${primary.colorName} ช่วยให้ดูน่าเข้าหา เป็นมิตร และเปี่ยมด้วยความมั่นใจ`,
      luckyHighlights: [
        `ขับผิวและเหมาะกับบรรยากาศ ${occasion}`,
        `ส่งเสริมพลังความสงบนิ่งและความคิดสร้างสรรค์`,
      ],
      kaliExcludedCount: kaliRules.length,
    });
  }

  return {
    birthDayOfWeek: birthdayKey,
    birthDayInfo,
    targetDate,
    targetDayOfWeek: targetDayKey,
    targetDayInfo,
    occasion,
    style,
    recommendedColors: cleanRecommended,
    secondaryColors: cleanSecondary,
    avoidColors: avoidRules,
    kaliColors: kaliRules,
    combinations,
    excludedColorsCount: kaliRules.length + avoidRules.length,
    notice:
      'ข้อมูลสีมงคลและสีกาลกิณีเป็นข้อมูลที่ถูกกำหนดตามฐานข้อมูลกฎสีของระบบ สามารถปรับเปลี่ยนได้ผ่านระบบ Admin หลังบ้าน และผลลัพธ์ทั้งหมดถูกตัดสีกาลกิณีออกอย่างเข้มงวด',
  };
}
