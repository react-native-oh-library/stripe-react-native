/**
 * CardBrand — 卡品牌规则库（BIN 段、卡号长度、CVC 长度）。
 * 参照 stripe-android CardBrand 的判定规则（交互规格对齐 Android CardInputView）。
 */

/** JS 层 CardBrand 数字枚举值（types/Common.ts） */
export enum CardBrandEnum {
  JCB = 0,
  Amex = 1,
  CartesBancaires = 2,
  DinersClub = 3,
  Discover = 4,
  Mastercard = 5,
  UnionPay = 6,
  Visa = 7,
  Unknown = 8,
}

export class CardBrandRule {
  /** 展示名（UI 用） */
  readonly displayName: string;
  /**
   * JS 层桥接字面量（types/Token.ts CardBrand 字符串联合）：
   * 'Visa' | 'MasterCard' | 'AmericanExpress' | 'DinersClub' | 'Discover' |
   * 'JCB' | 'UnionPay' | 'Unknown'。onCardChange/创建结果中的 brand 用此值。
   */
  readonly code: string;
  /** JS 层数字枚举（types/Common.ts CardBrand，preferredNetworks 用） */
  readonly enumValue: number;
  /** 该品牌所有可能卡号长度 */
  readonly lengths: number[];
  readonly cvcLength: number;
  /** BIN 前缀（支持 2~6 位） */
  readonly prefixes: string[];

  constructor(displayName: string, code: string, enumValue: number, lengths: number[], cvcLength: number, prefixes: string[]) {
    this.displayName = displayName;
    this.code = code;
    this.enumValue = enumValue;
    this.lengths = lengths;
    this.cvcLength = cvcLength;
    this.prefixes = prefixes;
  }
}

const VISA = new CardBrandRule('Visa', 'Visa', CardBrandEnum.Visa, [16, 13, 19], 3, ['4']);
const MASTERCARD = new CardBrandRule('Mastercard', 'MasterCard', CardBrandEnum.Mastercard, [16], 3,
  ['51', '52', '53', '54', '55', '2221', '2222', '2223', '2224', '2225', '2226', '2227', '2228', '2229',
    '223', '224', '225', '226', '227', '228', '229', '23', '24', '25', '26', '270', '271', '2720', '2721']);
const AMEX = new CardBrandRule('American Express', 'AmericanExpress', CardBrandEnum.Amex, [15], 4, ['34', '37']);
const DISCOVER = new CardBrandRule('Discover', 'Discover', CardBrandEnum.Discover, [16, 19], 3, ['6011', '622', '644', '645', '646', '647', '648', '649', '65']);
const DINERS = new CardBrandRule('Diners Club', 'DinersClub', CardBrandEnum.DinersClub, [14, 16, 19], 3, ['300', '301', '302', '303', '304', '305', '3095', '36', '38', '39']);
const JCB = new CardBrandRule('JCB', 'JCB', CardBrandEnum.JCB, [16, 17, 18, 19], 3, ['35']);
const UNIONPAY = new CardBrandRule('UnionPay', 'UnionPay', CardBrandEnum.UnionPay, [16, 17, 18, 19], 3,
  ['62', '81']);
const CARTES_BANCAIRES = new CardBrandRule('Cartes Bancaires', 'Unknown', CardBrandEnum.CartesBancaires, [16], 3,
  ['5018', '5037', '5059', '507', '5', '6', '4', '2']);

const ALL_BRANDS: CardBrandRule[] = [VISA, MASTERCARD, AMEX, DISCOVER, DINERS, JCB, UNIONPAY];

export class CardBrandDetector {
  private static matchLength(prefix: string, bin: string): number {
    if (bin.length > prefix.length) {
      return 0;
    }
    return prefix.length;
  }

  /**
   * 依据卡号（或前缀）判定品牌。
   * @param numberOrBin 卡号或已输入前缀（仅数字）
   */
  static detect(numberOrBin: string): CardBrandRule {
    const digits = numberOrBin.replace(new RegExp('[^0-9]', 'g'), '');
    if (digits.length === 0) {
      return VISA; // 空输入按 stripe-android 语义返回默认品牌（Visa）
    }
    let best: CardBrandRule | null = null;
    let bestLen = 0;
    for (const brand of ALL_BRANDS) {
      for (const prefix of brand.prefixes) {
        if (digits.startsWith(prefix)) {
          const len = prefix.length;
          if (len > bestLen) {
            bestLen = len;
            best = brand;
          }
        }
      }
    }
    if (best) {
      // Cartes Bancaires 为 co-badge 品牌：visa/mastercard 前缀也可能命中，
      // 简化处理与 stripe-android 一致——优先主流品牌
      return best;
    }
    return new CardBrandRule('Unknown', 'Unknown', CardBrandEnum.Unknown, [16, 17, 18, 19], 3, []);
  }

  static maxCvcLength(brand: CardBrandRule): number {
    return brand.cvcLength;
  }

  static isCardNumberLengthValid(brand: CardBrandRule, numberLength: number): boolean {
    for (const len of brand.lengths) {
      if (numberLength === len) {
        return true;
      }
    }
    return false;
  }
}
