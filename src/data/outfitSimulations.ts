import { CuratedSimulationOutfit, StyleOption, OccasionOption } from '../types';

import outfitMinimalChic from '../assets/images/outfit_minimal_chic_1789626963742.jpg';
import outfitKoreanChic from '../assets/images/outfit_korean_chic_1789626978617.jpg';
import outfitLuxuryWork from '../assets/images/outfit_luxury_work_1789626996773.jpg';
import outfitEarthyCasual from '../assets/images/outfit_earthy_casual_1789627019674.jpg';
import outfitEveningDinner from '../assets/images/outfit_evening_dinner_1789627039197.jpg';
import outfitStreetDenim from '../assets/images/outfit_street_denim_1789627656205.jpg';
import outfitCafeDate from '../assets/images/outfit_cafe_date_1789627672829.jpg';

export const OUTFIT_IMAGES = {
  minimalChic: outfitMinimalChic,
  koreanChic: outfitKoreanChic,
  luxuryWork: outfitLuxuryWork,
  earthyCasual: outfitEarthyCasual,
  eveningDinner: outfitEveningDinner,
  streetDenim: outfitStreetDenim,
  cafeDate: outfitCafeDate,
};

export const CURATED_SIMULATION_OUTFITS: CuratedSimulationOutfit[] = [
  {
    id: 'sim-minimal-chic',
    title: 'Minimalist Clean Tailoring',
    tagline: 'มินิมอลโมเดิร์น เรียบโก้ ทรงเสน่ห์น่าค้นหา',
    style: 'Minimal',
    occasion: 'วันสบาย ๆ',
    harmonyScore: 96,
    harmonyType: 'Monochromatic & Tone-on-Tone',
    image: outfitMinimalChic,
    palette: {
      main: { name: 'ครีมวานิลลาซิลค์', hex: '#FDFBF7', roleDesc: 'เสื้อเชิ้ตซิลค์ทับใน (60%)' },
      secondary: { name: 'เบจโทปอ่อน (Soft Taupe)', hex: '#D6CEC2', roleDesc: 'กางเกงสแล็คขากว้าง (30%)' },
      accent: { name: 'ทองแชมเปญ (Warm Gold)', hex: '#D4AF37', roleDesc: 'นาฬิกาและบัคเคิลเข็มขัด (10%)' },
      neutral: { name: 'เบจทรายธรรมชาติ', hex: '#EBE5D8', roleDesc: 'เบลเซอร์ทรงหลวมและรองเท้า' },
    },
    garments: {
      top: 'เสื้อซิลค์คอปาดสีครีมวานิลลา + เบลเซอร์สูทโอเวอร์ไซส์สีเบจ',
      bottom: 'กางเกงสแล็คจับจีบเอวสูงสีซอฟต์โทป',
      shoes: 'รองเท้ามิวล์หนังแท้ปลายเรียวสีครีม',
      bag: 'กระเป๋าถือทรงมินิมอลหนังนุ่มสีทราย',
      accessories: 'นาฬิกาข้อมือสายหนังและต่างหูห่วงทองคำมินิมอล',
    },
    stylingTip:
      'เล่นกับเฉดสีธรรมชาติแบบ Tone-on-Tone โดยไม่ต้องพึ่งลวดลาย ให้ผิวสัมผัสของผ้าซิลค์และลินินสร้างมิติที่เรียบหรูแบบ Quiet Luxury',
    suitableDay: 'เหมาะมากสำหรับวันพุธ, วันพฤหัสบดี และวันศุกร์',
  },
  {
    id: 'sim-korean-chic',
    title: 'Seoul Pastel Soft Knit',
    tagline: 'ลุคสตรีทเกาหลี สดใส ละมุนตา ขับผิวสว่าง',
    style: 'Korean',
    occasion: 'เที่ยว',
    harmonyScore: 94,
    harmonyType: 'Harmonious Contrast & Soft Hue',
    image: outfitKoreanChic,
    palette: {
      main: { name: 'ม่วงลาเวนเดอร์พาสเทล', hex: '#C4B5FD', roleDesc: 'คาร์ดิแกนครอปไหมพรม (60%)' },
      secondary: { name: 'ขาวไข่มุกบริสุทธิ์', hex: '#FFFFFF', roleDesc: 'กระโปรงพลีทมิดี้ (30%)' },
      accent: { name: 'เขียวเสจพาสเทล', hex: '#86EFAC', roleDesc: 'กระเป๋าสะพายไหล่บาแก็ตต์ (10%)' },
      neutral: { name: 'ครีมสว่างมิลกี้', hex: '#F8FAFC', roleDesc: 'สนีกเกอร์และถุงเท้าข้อสั้น' },
    },
    garments: {
      top: 'คาร์ดิแกนไหมพรมถักละเอียดสีม่วงลาเวนเดอร์กระดุมมุก',
      bottom: 'กระโปรงพลีทผ้าทิ้งตัวยาวระดับน่องสีขาวบริสุทธิ์',
      shoes: 'สนีกเกอร์ทรงเรโทรหนังสีขาวคลีน',
      bag: 'กระเป๋าบาแก็ตต์สะพายไหล่หนังเรียบสีเขียวเสจ',
      accessories: 'สร้อยคอจี้เงินมินิมอลและกิ๊บหนีบผมอะคริลิกใส',
    },
    stylingTip:
      'โทนสีพาสเทลคู่ตรงข้ามอ่อนโยน (ม่วง-เขียว) สร้างพลังความน่ารักสดใส เหมาะกับการไปคาเฟ่ นัดเดท หรือถ่ายรูปกลางแจ้ง',
    suitableDay: 'เหมาะมากสำหรับวันเสาร์, วันอังคาร และวันอาทิตย์',
  },
  {
    id: 'sim-luxury-work',
    title: 'Executive Navy & Camel Luxury',
    tagline: 'ลุคผู้บริหาร สง่างาม มั่นใจ เสริมบารมีและอำนาจ',
    style: 'Luxury',
    occasion: 'ประชุม',
    harmonyScore: 98,
    harmonyType: 'Classic High-Contrast Authority',
    image: outfitLuxuryWork,
    palette: {
      main: { name: 'ดีพเนวี่บลู (Deep Navy)', hex: '#1E293B', roleDesc: 'เบลเซอร์สูทคัทติ้งเนี๊ยบ (60%)' },
      secondary: { name: 'คาเมลเบจ (Camel Tan)', hex: '#C29B38', roleDesc: 'กระเป๋าถือหนังแท้และเข็มขัด (30%)' },
      accent: { name: 'ทองประกายแชมเปญ', hex: '#EAB308', roleDesc: 'กระดุมสูทและสร้อยข้อมือ (10%)' },
      neutral: { name: 'ขาวไอวอรีนวล', hex: '#F1F5F9', roleDesc: 'เสื้อเชิ้ตผ้าซาตินและกางเกง' },
    },
    garments: {
      top: 'เสื้อเบลเซอร์เทเลอร์สีเนวี่บลู + เชิ้ตซาตินคอวีสีไอวอรี',
      bottom: 'กางเกงสแล็คทรง Cigarette เอวสูงสีไอวอรี/เบจ',
      shoes: 'รองเท้าคัทชูส้นสูงหัวแหลมหนังนู้ด/คาเมล',
      bag: 'กระเป๋าถือ Top Handle หนังเกรดพรีเมียมสีคอนญัก',
      accessories: 'กำไลข้อมือทองคำเรียบหรูและนาฬิกาหน้าปัดมินิมอล',
    },
    stylingTip:
      'สีกรมท่าเข้มช่วยเพิ่มความน่าเชื่อถือและความเฉียบคม ตัดกับสีคาเมลอุ่นเพื่อลดความแข็งกร้าว เสริมพลังด้านการเจรจาธุรกิจ',
    suitableDay: 'เหมาะมากสำหรับวันจันทร์, วันพฤหัสบดี และวันพุธกลางคืน',
  },
  {
    id: 'sim-earthy-casual',
    title: 'Sun-Drenched Terracotta Linen',
    tagline: 'เอิร์ธโทนอบอุ่น ผ่อนคลาย เป็นธรรมชาติและมีสไตล์',
    style: 'Casual',
    occasion: 'เที่ยว',
    harmonyScore: 92,
    harmonyType: 'Natural Warm Earth & Textured Flow',
    image: outfitEarthyCasual,
    palette: {
      main: { name: 'เทอราคอตตาส้มอิฐ (Rust Terracotta)', hex: '#C2410C', roleDesc: 'เสื้อเชิ้ตลินินโอเวอร์ไซส์ (60%)' },
      secondary: { name: 'เอครูคอตตอน (Ecru Cream)', hex: '#FEF3C7', roleDesc: 'กางเกงเดนิมขาวนวล (30%)' },
      accent: { name: 'แทนธรรมชาติและทองเหลือง', hex: '#B45309', roleDesc: 'รองเท้าแตะหนังและแว่นตากระดองเต่า (10%)' },
      neutral: { name: 'ฟางธรรมชาติ (Natural Raffia)', hex: '#D97706', roleDesc: 'กระเป๋าสานทรงโท้ท' },
    },
    garments: {
      top: 'เสื้อเชิ้ตลินินแขนยาวโอเวอร์ไซส์สีส้มอิฐเทอราคอตตา',
      bottom: 'กางเกงยีนส์เดนิมทรงขากระบอกสีเอครูนวลตา',
      shoes: 'รองเท้าแตะหนังเรียบสไตล์มินิมอลสีแทนคาราเมล',
      bag: 'กระเป๋าโท้ทสานจากราฟเฟียธรรมชาติ',
      accessories: 'แว่นตากันแดดกรอบลายกระและกำไลหินธรรมชาติ',
    },
    stylingTip:
      'คู่สีส้มอิฐและสีครีมเอครูช่วยสะท้อนแสงแดดธรรมชาติอย่างอบอุ่น มอบความรู้สึกเป็นกันเองแต่เปี่ยมด้วยรสนิยม',
    suitableDay: 'เหมาะมากสำหรับวันพฤหัสบดี, วันอาทิตย์ และวันอังคาร',
  },
  {
    id: 'sim-evening-dinner',
    title: 'Emerald Night Velvet Glam',
    tagline: 'เขียวมรกตสะกดสายตา หรูหรา ดึงดูดพลังโชคลาภ',
    style: 'Elegant',
    occasion: 'ออกงานกลางคืน',
    harmonyScore: 95,
    harmonyType: 'Jewel Toned Sophistication',
    image: outfitEveningDinner,
    palette: {
      main: { name: 'เขียวมรกตอัญมณี (Emerald Green)', hex: '#047857', roleDesc: 'สูทเบลเซอร์หรือเดรสผ้าไหม (60%)' },
      secondary: { name: 'ดำสนิทซาติน (Midnight Silk)', hex: '#0F172A', roleDesc: 'กางเกงทรงสลิมหรือซลิปเดรส (30%)' },
      accent: { name: 'ทองประกายแชมเปญ (Metallic Gold)', hex: '#F59E0B', roleDesc: 'คลัตช์และส้นสูงเมทัลลิก (10%)' },
      neutral: { name: 'ซิลเวอร์แพลทินัม', hex: '#CBD5E1', roleDesc: 'เครื่องประดับเพชร/คริสตัล' },
    },
    garments: {
      top: 'เบลเซอร์สูทผ้ากำมะหยี่หรือผ้าไหมซาตินสีเขียวมรกตเข้ม',
      bottom: 'กางเกงสแล็คซาตินสีมิดไนท์แบล็กทิ้งตัวเรียบกริบ',
      shoes: 'รองเท้าส้นสูงสายรัดเส้นเรียวประกายทองเมทัลลิก',
      bag: 'กระเป๋าคลัตช์ทรงเรขาคณิตสีแชมเปญโกลด์',
      accessories: 'ต่างหูระย้าคริสตัลประกายแสงและแหวนประดับอัญมณี',
    },
    stylingTip:
      'สีเขียวมรกตเป็นสีมงคลตัวแทนแห่งความอุดมสมบูรณ์ เมื่อจับคู่กับเมทัลลิกทองในเวลากลางคืน จะช่วยขับออร่าให้โดดเด่นท่ามกลางแสงไฟ',
    suitableDay: 'เหมาะมากสำหรับวันพุธ, วันศุกร์ และวันจันทร์',
  },
  {
    id: 'sim-street-denim',
    title: 'Urban Oversized Denim Beat',
    tagline: 'สตรีทเท่ ทะมัดทะแมง มั่นใจสไตล์โตเกียว-โซล',
    style: 'Street',
    occasion: 'เที่ยว',
    harmonyScore: 93,
    harmonyType: 'Complementary Cool & Neutral Baseline',
    image: outfitStreetDenim,
    palette: {
      main: { name: 'เดนิมเฟดบลู (Washed Blue)', hex: '#3B82F6', roleDesc: 'แจ็คเก็ตยีนส์ทรงโอเวอร์ไซส์ (60%)' },
      secondary: { name: 'เบจคาร์โก้ธรรมชาติ (Warm Sand)', hex: '#E2D9C8', roleDesc: 'กางเกงคาร์โก้ขากว้าง (30%)' },
      accent: { name: 'ดำกราไฟต์ (Obsidian Black)', hex: '#18181B', roleDesc: 'กระเป๋าสะพายข้างและดีเทลลายสกรีน (10%)' },
      neutral: { name: 'ขาวโอลิมปิกคลีน', hex: '#F8FAFC', roleDesc: 'เสื้อยืดคอตตอนและสนีกเกอร์' },
    },
    garments: {
      top: 'แจ็คเก็ตเดนิมทรงหลวมฟอกซีดสไตล์วินเทจ + เสื้อยืดลายกราฟิกขาว',
      bottom: 'กางเกงคาร์โก้ขายาวทรง Relaxed สีเบจทราย',
      shoes: 'สนีกเกอร์ Chunky สีขาวตัดแถบดำ/น้ำเงิน',
      bag: 'กระเป๋าสะพายครอสบอดี้ไนลอนกันน้ำสีดำสนิท',
      accessories: 'สร้อยโซ่คอเงินแท้มินิมอลและหมวกบักเก็ตสีเบจ',
    },
    stylingTip:
      'การดึงความคูลของสียีนส์บลูมาเบรกด้วยความสว่างของสีกางเกงคาร์โก้โทนเบจ ให้ลุคดูโปร่ง คล่องตัว เหมาะกับการเดินทางทั้งวัน',
    suitableDay: 'เหมาะมากสำหรับวันศุกร์, วันเสาร์ และวันอังคาร',
  },
  {
    id: 'sim-cafe-date',
    title: 'Romantic Butter Yellow & Sage Blouse',
    tagline: 'หวานละมุน อบอุ่น ฟีลลิ่งปิกนิกและคาเฟ่ชิลล์',
    style: 'Romantic',
    occasion: 'ออกเดท',
    harmonyScore: 97,
    harmonyType: 'Analogous Soft Spring Harmony',
    image: outfitCafeDate,
    palette: {
      main: { name: 'เหลืองเนยอ่อน (Butter Yellow)', hex: '#FEF08A', roleDesc: 'เสื้อเบลาส์แขนตุ๊กตา (60%)' },
      secondary: { name: 'เขียวเสจละมุน (Soft Sage)', hex: '#A7F3D0', roleDesc: 'กระโปรงพลีทเอไลน์ยาว (30%)' },
      accent: { name: 'ทองประกายมุก (Pearl Gold)', hex: '#FCD34D', roleDesc: 'ต่างหูดอกไม้และกระเป๋ามุก (10%)' },
      neutral: { name: 'ครีมชานมมิลกี้', hex: '#FFFBEB', roleDesc: 'รองเท้าแมรี่เจนและสายสาน' },
    },
    garments: {
      top: 'เสื้อเบลาส์ผ้าชีฟองแขนตุ๊กตาสีเหลืองบัตเตอร์เยลโลว์สุดนุ่ม',
      bottom: 'กระโปรงพลีทเอวสูงยาวคลุมเข่าสีเขียวเสจอ่อนพลิ้วไหว',
      shoes: 'รองเท้าแมรี่เจนส้นเตี้ยสีครีมหนังเงา',
      bag: 'กระเป๋าสานมินิมอลสายคล้องไข่มุก',
      accessories: 'ต่างหูดอกไม้ทองคำจิ๋วและกิ๊บติดผมมุก',
    },
    stylingTip:
      'โทนเหลืองเนยกับเขียวเสจคือสูตรความสดใสที่อบอุ่นและสบายตา เป็นสีมงคลเสริมเสน่ห์เมตตามหานิยม ถ่ายรูปขึ้นกล้องในคาเฟ่แสงธรรมชาติสุดๆ',
    suitableDay: 'เหมาะมากสำหรับวันจันทร์, วันพุธ และวันพฤหัสบดี',
  },
];

/**
 * Returns the most fitting curated mockup image based on style, occasion, or combination properties.
 */
export function getOutfitMockupImage(
  style?: StyleOption,
  occasion?: OccasionOption,
  combinationId?: string
): string {
  if (style === 'Street') {
    return outfitStreetDenim;
  }
  if (style === 'Romantic' || occasion === 'ออกเดท') {
    return outfitCafeDate;
  }
  if (style === 'Korean') {
    return outfitKoreanChic;
  }
  if (style === 'Luxury' || style === 'Office' || occasion === 'ประชุม' || occasion === 'สัมภาษณ์งาน') {
    return outfitLuxuryWork;
  }
  if (occasion === 'ออกงานกลางคืน' || occasion === 'ปาร์ตี้' || occasion === 'งานแต่ง') {
    return outfitEveningDinner;
  }
  if (occasion === 'เที่ยว' || style === 'Casual' || style === 'Vintage') {
    return outfitEarthyCasual;
  }
  if (combinationId === 'comb-harmony-2') {
    return outfitKoreanChic;
  }
  if (combinationId === 'comb-harmony-3') {
    return outfitEarthyCasual;
  }
  return outfitMinimalChic;
}
