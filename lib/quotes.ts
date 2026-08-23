export interface Quote {
  text: string;
  author?: string;
}

// 公有领域 / 古典诗词 + 原创静坐短句，避免版权问题。
export const quotes: Quote[] = [
  { text: "人闲桂花落，夜静春山空。", author: "王维" },
  { text: "行到水穷处，坐看云起时。", author: "王维" },
  { text: "采菊东篱下，悠然见南山。", author: "陶渊明" },
  { text: "独坐幽篁里，弹琴复长啸。深林人不知，明月来相照。", author: "王维" },
  { text: "雨中山果落，灯下草虫鸣。", author: "王维" },
  { text: "清风徐来，水波不兴。", author: "苏轼" },
  { text: "吾心似秋月，碧潭清皎洁", author: "寒山" },
  { text: "观水有术，必观其澜。", author: "《孟子》" },
  { text: "心如止水，方能照物。", author: "" },
  { text: "一念放下，万般自在。", author: "" },
  { text: "云在青天水在瓶。", author: "李翱" },
  { text: "静故了群动，空故纳万境。", author: "苏轼" },
  { text: "万籁此都寂，但余钟磬音。", author: "常建" },
  { text: "深林人不知，明月来相照。", author: "王维" },
  { text: "菩提本无树，明镜亦非台。\n本来无一物，何处惹尘埃。", author: "慧能" },
  { text: "心质直故，如净明镜；心无垢故，如清凉水", author: "《大宝积经》" },
  { text: "众生心水清，菩提影现中。", author: "《大乘本生心地观经》：" },
  { text: "譬如大水，普皆饶益一切众生。", author: "《大方广佛华严经》" },
];

export function randomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
