/**
 * CardValidator — Luhn 校验、有效期/CVC 校验、卡号格式化、
 * onCardChange 的 CardDetails 状态机组装。
 */

import type { CardBrandRule } from './CardBrand';
import { CardBrandDetector } from './CardBrand';

/** JS 层 ValidationState（types/components/CardFieldInput.ts） */
export type ValidationState = 'Valid' | 'Invalid' | 'Incomplete' | 'Unknown';

/** 原生侧持有的卡片输入快照（CardField 组件每次变更时更新） */
export class CardFieldSnapshot {
  number: string = '';
  cvc: string = '';
  expiryMonth: number = 0;
  expiryYear: number = 0;
  postalCode: string = '';
}

/**
 * CardFieldRegistry — 原生侧卡片数据注册表。
 *
 * 与 Android 端同型：CardField 原生视图持有卡号（不经 JS 服务器），
 * createPaymentMethod/confirmPayment 无 token/paymentMethodId 时从这里取卡数据
 * 直接 HTTPS 直传 Stripe（PCI 路径与移动 SDK 一致）。
 * 应用内通常只有一个活跃 CardField；多实例时以最后获得焦点的实例为准。
 */
export class CardFieldRegistry {
  private static readonly instance = new CardFieldRegistry();
  private snapshot: CardFieldSnapshot | null = null;

  static get shared(): CardFieldRegistry {
    return CardFieldRegistry.instance;
  }

  update(snapshot: CardFieldSnapshot): void {
    this.snapshot = snapshot;
  }

  get current(): CardFieldSnapshot | null {
    return this.snapshot;
  }

  clear(): void {
    this.snapshot = null;
  }
}

export class CardValidator {
  /** Luhn 校验 */
  static isValidLuhn(cardNumber: string): boolean {
    const digits = cardNumber.replace(new RegExp('[^0-9]', 'g'), '');
    if (digits.length < 11) {
      return false;
    }
    let sum = 0;
    let doubleUp = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(digits.charAt(i), 10);
      if (doubleUp) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      doubleUp = !doubleUp;
    }
    return sum % 10 === 0;
  }

  /** 卡号校验状态（品牌长度 + Luhn） */
  static validateNumber(brand: CardBrandRule, cardNumber: string): ValidationState {
    const digits = cardNumber.replace(new RegExp('[^0-9]', 'g'), '');
    if (digits.length === 0) {
      return 'Incomplete';
    }
    const isLengthOk = CardBrandDetector.isCardNumberLengthValid(brand, digits.length);
    const maxLen = brand.lengths[brand.lengths.length - 1];
    if (!isLengthOk) {
      return digits.length < maxLen ? 'Incomplete' : 'Invalid';
    }
    return CardValidator.isValidLuhn(digits) ? 'Valid' : 'Invalid';
  }

  /** CVC 校验状态 */
  static validateCvc(brand: CardBrandRule, cvc: string): ValidationState {
    const digits = cvc.replace(new RegExp('[^0-9]', 'g'), '');
    if (digits.length === 0) {
      return 'Incomplete';
    }
    if (digits.length < brand.cvcLength) {
      return 'Incomplete';
    }
    return 'Valid';
  }

  /** 有效期校验状态：MM/YY，月份 1-12，不早于当前月 */
  static validateExpiry(month: number, year: number): ValidationState {
    if (month === 0 || year === 0) {
      return 'Incomplete';
    }
    if (month < 1 || month > 12) {
      return 'Invalid';
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const fullYear = year < 100 ? 2000 + year : year;
    if (fullYear < currentYear) {
      return 'Invalid';
    }
    if (fullYear === currentYear && month < now.getMonth() + 1) {
      return 'Invalid';
    }
    if (fullYear > currentYear + 20) {
      return 'Invalid';
    }
    return 'Valid';
  }

  /** 卡号分组格式化：Amex 4-6-5，其余 4-4-4-4(-3) */
  static formatNumber(brand: CardBrandRule, value: string): string {
    const digits = value.replace(new RegExp('[^0-9]', 'g'), '');
    const maxLen = brand.lengths[brand.lengths.length - 1];
    const bounded = digits.substring(0, Math.min(digits.length, maxLen));
    if (brand.enumValue === 1) {
      // Amex: 4-6-5
      const parts: string[] = [];
      if (bounded.length > 0) {
        parts.push(bounded.substring(0, 4));
      }
      if (bounded.length > 4) {
        parts.push(bounded.substring(4, 10));
      }
      if (bounded.length > 10) {
        parts.push(bounded.substring(10, 15));
      }
      return parts.join(' ');
    }
    let result = '';
    for (let i = 0; i < bounded.length; i++) {
      if (i > 0 && i % 4 === 0) {
        result += ' ';
      }
      result += bounded.charAt(i);
    }
    return result;
  }

  /** 有效期输入格式化：4 位数字 → MM/YY（自动补斜杠，支持退格） */
  static formatExpiry(value: string): string {
    const digits = value.replace(new RegExp('[^0-9]', 'g'), '').substring(0, 4);
    if (digits.length === 0) {
      return '';
    }
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.substring(0, 2)}/${digits.substring(2)}`;
  }

  /** 从 MM/YY 文本解析月/年（2 位年份补全为 20xx） */
  static parseExpiry(value: string): { month: number, year: number } {
    const digits = value.replace(new RegExp('[^0-9]', 'g'), '');
    if (digits.length < 3) {
      return { month: 0, year: 0 };
    }
    const month = Number.parseInt(digits.substring(0, 2), 10);
    const yearDigits = digits.substring(2);
    let year = Number.parseInt(yearDigits, 10);
    if (yearDigits.length <= 2) {
      year = 2000 + year;
    }
    return { month: month, year: year };
  }
}
