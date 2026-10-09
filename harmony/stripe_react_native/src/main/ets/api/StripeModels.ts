/**
 * StripeModels — Stripe REST JSON → JS 桥接层结构的转换器。
 *
 * 对齐 src/types/ 下的桥接类型（PaymentMethod.Result / PaymentIntent.Result /
 * SetupIntent.Result / Token.Result / StripeError）。REST 字段为 snake_case，
 * 桥接结构为 camelCase，转换规则逐字段对齐官方移动端 bridge 映射。
 */

import type { StripeRestError } from './StripeApiClient';
import { StripeApiError } from './StripeApiClient';

export type BridgeRecord = Record<string, Object>;

export class StripeModels {
  // ---------- 基础取值 ----------

  static asRecord(value: Object | undefined | null): BridgeRecord | null {
    if (value === null || value === undefined || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as BridgeRecord;
  }

  static asRecords(value: Object | undefined | null): BridgeRecord[] {
    if (value === null || value === undefined || !Array.isArray(value)) {
      return [];
    }
    const result: BridgeRecord[] = [];
    for (const item of value) {
      const rec = StripeModels.asRecord(item);
      if (rec) {
        result.push(rec);
      }
    }
    return result;
  }

  static str(record: BridgeRecord | null, key: string, fallback: string = ''): string {
    if (!record) {
      return fallback;
    }
    const v = record[key];
    if (typeof v === 'string') {
      return v;
    }
    if (v === null || v === undefined) {
      return fallback;
    }
    return String(v);
  }

  static strOrNull(record: BridgeRecord | null, key: string): string | null {
    if (!record) {
      return null;
    }
    const v = record[key];
    if (v === null || v === undefined) {
      return null;
    }
    return typeof v === 'string' ? v : String(v);
  }

  static num(record: BridgeRecord | null, key: string, fallback: number = 0): number {
    if (!record) {
      return fallback;
    }
    const v = record[key];
    if (typeof v === 'number') {
      return v;
    }
    if (typeof v === 'string') {
      const parsed = Number.parseFloat(v);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  static bool(record: BridgeRecord | null, key: string, fallback: boolean = false): boolean {
    if (!record) {
      return fallback;
    }
    const v = record[key];
    if (typeof v === 'boolean') {
      return v;
    }
    if (typeof v === 'string') {
      return v === 'true';
    }
    return fallback;
  }

  /** snake_case → PascalCase（REST status → JS Status 枚举） */
  static snakeToPascal(value: string): string {
    let result = '';
    const parts = value.split('_');
    for (const part of parts) {
      if (part.length > 0) {
        result += part.charAt(0).toUpperCase() + part.substring(1);
      }
    }
    return result;
  }

  /** REST unix 秒 → 桥接层毫秒时间戳字符串 */
  static createdToMillis(record: BridgeRecord): string {
    const created = StripeModels.num(record, 'created', 0);
    return created > 0 ? String(Math.floor(created * 1000)) : '';
  }

  // ---------- 错误 ----------

  /** REST/网络错误 → JS 层 StripeError（code 取 JS 枚举值，如 'Failed'/'Canceled'） */
  static toBridgeError(err: Object | null | undefined, code: string): BridgeRecord {
    const error: BridgeRecord = { 'code': code, 'message': '' };
    if (err instanceof StripeApiError) {
      const rest: StripeRestError = err.restError;
      error.message = rest.message;
      error.stripeErrorCode = rest.code;
      error.type = rest.type;
      if (rest.decline_code) {
        error.declineCode = rest.decline_code;
      }
    } else if (err instanceof Error) {
      error.message = err.message;
    } else if (err !== null && err !== undefined) {
      error.message = JSON.stringify(err);
    } else {
      error.message = 'Unknown Stripe error';
    }
    return error;
  }

  // ---------- PaymentMethod ----------

  /** JS 层数字枚举值（types/Common.ts CardBrand，preferredNetworks 用） */
  static cardBrandToEnum(brand: string): number {
    switch (brand) {
      case 'visa':
        return 7;
      case 'mastercard':
        return 5;
      case 'amex':
        return 1;
      case 'discover':
        return 4;
      case 'diners':
        return 3;
      case 'jcb':
        return 0;
      case 'unionpay':
        return 6;
      case 'cartes_bancaires':
        return 2;
      default:
        return 8;
    }
  }

  /**
   * REST brand 字符串 → JS 层 CardBrand 字符串联合（types/Token.ts）：
   * 'Visa' | 'MasterCard' | 'AmericanExpress' | 'DinersClub' | 'Discover' |
   * 'JCB' | 'UnionPay' | 'Unknown'。PaymentMethod.Card.brand 与 Token.Card.brand
   * 均为该字符串（对齐 Android Mappers.kt mapCardBrand）。
   */
  static brandToCode(brand: string): string {
    switch (brand) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'MasterCard';
      case 'amex':
        return 'AmericanExpress';
      case 'discover':
        return 'Discover';
      case 'diners':
        return 'DinersClub';
      case 'jcb':
        return 'JCB';
      case 'unionpay':
        return 'UnionPay';
      default:
        return 'Unknown';
    }
  }

  static billingDetails(rest: BridgeRecord | null): BridgeRecord {
    const raw = StripeModels.asRecord(rest ? rest.billing_details : undefined);
    const addressRaw = StripeModels.asRecord(raw ? raw.address : undefined);
    const address: BridgeRecord = {};
    if (addressRaw) {
      address.city = StripeModels.str(addressRaw, 'city');
      address.country = StripeModels.str(addressRaw, 'country');
      address.line1 = StripeModels.str(addressRaw, 'line1');
      address.line2 = StripeModels.str(addressRaw, 'line2');
      address.postalCode = StripeModels.str(addressRaw, 'postal_code');
      address.state = StripeModels.str(addressRaw, 'state');
    }
    const result: BridgeRecord = {
      'email': StripeModels.str(raw, 'email'),
      'phone': StripeModels.str(raw, 'phone'),
      'name': StripeModels.str(raw, 'name'),
      'address': address,
    };
    return result;
  }

  /** REST /v1/payment_methods 响应 → JS PaymentMethod.Result */
  static paymentMethod(rest: BridgeRecord): BridgeRecord {
    const type = StripeModels.str(rest, 'type');
    const card = StripeModels.asRecord(rest.card);
    const auBecs = StripeModels.asRecord(rest.au_becs_debit);
    const bacs = StripeModels.asRecord(rest.bacs_debit);
    const fpx = StripeModels.asRecord(rest.fpx);
    const ideal = StripeModels.asRecord(rest.ideal);
    const sepa = StripeModels.asRecord(rest.sepa_debit);
    const usBank = StripeModels.asRecord(rest.us_bank_account);

    const cardResult: BridgeRecord = {};
    if (card) {
      cardResult.brand = StripeModels.brandToCode(StripeModels.str(card, 'brand'));
      cardResult.country = StripeModels.str(card, 'country');
      cardResult.expYear = StripeModels.num(card, 'exp_year');
      cardResult.expMonth = StripeModels.num(card, 'exp_month');
      cardResult.fingerprint = StripeModels.str(card, 'fingerprint');
      cardResult.funding = StripeModels.str(card, 'funding');
      cardResult.last4 = StripeModels.str(card, 'last4');
    }
    const auBecsResult: BridgeRecord = {};
    if (auBecs) {
      auBecsResult.bsbNumber = StripeModels.str(auBecs, 'bsb_number');
      auBecsResult.fingerprint = StripeModels.str(auBecs, 'fingerprint');
      auBecsResult.last4 = StripeModels.str(auBecs, 'last4');
    }
    const bacsResult: BridgeRecord = {};
    if (bacs) {
      bacsResult.sortCode = StripeModels.str(bacs, 'sort_code');
      bacsResult.fingerprint = StripeModels.str(bacs, 'fingerprint');
    }
    const fpxResult: BridgeRecord = {};
    if (fpx) {
      fpxResult.bank = StripeModels.str(fpx, 'bank');
    }
    const idealResult: BridgeRecord = {};
    if (ideal) {
      idealResult.bank = StripeModels.str(ideal, 'bank');
      idealResult.bankIdentifierCode = StripeModels.str(ideal, 'bic');
    }
    const sepaResult: BridgeRecord = {};
    if (sepa) {
      sepaResult.bankCode = StripeModels.str(sepa, 'bank_code');
      sepaResult.country = StripeModels.str(sepa, 'country');
      sepaResult.fingerprint = StripeModels.str(sepa, 'fingerprint');
    }
    const usBankResult: BridgeRecord = {};
    if (usBank) {
      usBankResult.routingNumber = StripeModels.str(usBank, 'routing_number');
      usBankResult.accountHolderType = StripeModels.str(usBank, 'account_holder_type');
      usBankResult.bankName = StripeModels.str(usBank, 'bank_name');
      usBankResult.fingerprint = StripeModels.str(usBank, 'fingerprint');
      usBankResult.last4 = StripeModels.str(usBank, 'last4');
    }

    return {
      'id': StripeModels.str(rest, 'id'),
      'liveMode': StripeModels.bool(rest, 'livemode'),
      'customerId': StripeModels.str(rest, 'customer'),
      'billingDetails': StripeModels.billingDetails(rest),
      'paymentMethodType': StripeModels.snakeToPascal(type),
      'AuBecsDebit': auBecsResult,
      'BacsDebit': bacsResult,
      'Card': cardResult,
      'Fpx': fpxResult,
      'Ideal': idealResult,
      'SepaDebit': sepaResult,
      'USBankAccount': usBankResult,
    };
  }

  // ---------- PaymentIntent / SetupIntent ----------

  /** REST next_action → JS NextAction（urlRedirect 等核心形态） */
  static nextAction(rest: BridgeRecord | null): BridgeRecord | null {
    if (!rest) {
      return null;
    }
    const raw = StripeModels.asRecord(rest.next_action);
    if (!raw) {
      return null;
    }
    const redirect = StripeModels.asRecord(raw.redirect_to_url);
    if (redirect) {
      const action: BridgeRecord = {
        'type': 'urlRedirect',
        'redirectUrl': StripeModels.str(redirect, 'url'),
      };
      return action;
    }
    const verifyMicro = StripeModels.asRecord(raw.verify_with_microdeposits);
    if (verifyMicro) {
      const action: BridgeRecord = {
        'type': 'verifyWithMicrodeposits',
        'redirectUrl': StripeModels.str(verifyMicro, 'hosted_verification_url'),
        'microdepositType': StripeModels.str(verifyMicro, 'microdeposit_type'),
        'arrivalDate': StripeModels.str(verifyMicro, 'arrival_date'),
      };
      return action;
    }
    return null;
  }

  static lastError(rest: BridgeRecord | null, key: string): BridgeRecord | null {
    if (!rest) {
      return null;
    }
    const raw = StripeModels.asRecord(rest[key]);
    if (!raw) {
      return null;
    }
    const result: BridgeRecord = {
      'code': StripeModels.str(raw, 'code'),
      'message': StripeModels.str(raw, 'message'),
      'stripeErrorCode': StripeModels.str(raw, 'decline_code'),
      'type': StripeModels.str(raw, 'type'),
    };
    const pm = StripeModels.asRecord(raw.payment_method);
    if (pm) {
      result.paymentMethod = StripeModels.paymentMethod(pm);
    }
    return result;
  }

  /** REST /v1/payment_intents/{id} 响应 → JS PaymentIntent.Result */
  static paymentIntent(rest: BridgeRecord): BridgeRecord {
    const pmRaw = StripeModels.asRecord(rest.payment_method);
    const shippingRaw = StripeModels.asRecord(rest.shipping);
    const types: string[] = [];
    const rawTypes = rest.payment_method_types;
    if (Array.isArray(rawTypes)) {
      for (const t of rawTypes) {
        types.push(StripeModels.snakeToPascal(String(t)));
      }
    }
    const result: BridgeRecord = {
      'id': StripeModels.str(rest, 'id'),
      'amount': StripeModels.num(rest, 'amount'),
      'created': StripeModels.createdToMillis(rest),
      'currency': StripeModels.str(rest, 'currency'),
      'status': StripeModels.snakeToPascal(StripeModels.str(rest, 'status')),
      'description': StripeModels.strOrNull(rest, 'description'),
      'receiptEmail': StripeModels.strOrNull(rest, 'receipt_email'),
      'canceledAt': rest.canceled_at === null ? null : StripeModels.strOrNull(rest, 'canceled_at'),
      'clientSecret': StripeModels.str(rest, 'client_secret'),
      'livemode': StripeModels.bool(rest, 'livemode'),
      'paymentMethodId': StripeModels.str(rest, 'payment_method'),
      'paymentMethod': pmRaw ? StripeModels.paymentMethod(pmRaw) : null,
      'paymentMethodTypes': types,
      'captureMethod': StripeModels.snakeToPascal(StripeModels.str(rest, 'capture_method')),
      'confirmationMethod': StripeModels.snakeToPascal(StripeModels.str(rest, 'confirmation_method')),
      'lastPaymentError': StripeModels.lastError(rest, 'last_payment_error'),
      'shipping': shippingRaw ? StripeModels.billingDetailsShipping(shippingRaw) : null,
      'nextAction': StripeModels.nextAction(rest),
    };
    return result;
  }

  private static billingDetailsShipping(shippingRaw: BridgeRecord): BridgeRecord {
    const addressRaw = StripeModels.asRecord(shippingRaw.address);
    const address: BridgeRecord = {};
    if (addressRaw) {
      address.city = StripeModels.str(addressRaw, 'city');
      address.country = StripeModels.str(addressRaw, 'country');
      address.line1 = StripeModels.str(addressRaw, 'line1');
      address.line2 = StripeModels.str(addressRaw, 'line2');
      address.postalCode = StripeModels.str(addressRaw, 'postal_code');
      address.state = StripeModels.str(addressRaw, 'state');
    }
    return {
      'name': StripeModels.str(shippingRaw, 'name'),
      'phone': StripeModels.str(shippingRaw, 'phone'),
      'address': address,
    };
  }

  /** REST /v1/setup_intents/{id} 响应 → JS SetupIntent.Result */
  static setupIntent(rest: BridgeRecord): BridgeRecord {
    const pmRaw = StripeModels.asRecord(rest.payment_method);
    const types: string[] = [];
    const rawTypes = rest.payment_method_types;
    if (Array.isArray(rawTypes)) {
      for (const t of rawTypes) {
        types.push(StripeModels.snakeToPascal(String(t)));
      }
    }
    return {
      'id': StripeModels.str(rest, 'id'),
      'clientSecret': StripeModels.str(rest, 'client_secret'),
      'lastSetupError': StripeModels.lastError(rest, 'last_setup_error'),
      'created': rest.created === null || rest.created === undefined ? null : StripeModels.createdToMillis(rest),
      'livemode': StripeModels.bool(rest, 'livemode'),
      'paymentMethodId': StripeModels.strOrNull(rest, 'payment_method'),
      'paymentMethod': pmRaw ? StripeModels.paymentMethod(pmRaw) : null,
      'status': StripeModels.snakeToPascal(StripeModels.str(rest, 'status')),
      'paymentMethodTypes': types,
      'usage': StripeModels.snakeToPascal(StripeModels.str(rest, 'usage', 'off_session')),
      'description': StripeModels.strOrNull(rest, 'description'),
      'nextAction': StripeModels.nextAction(rest),
    };
  }

  // ---------- Token ----------

  /** REST /v1/tokens 响应 → JS Token.Result */
  static token(rest: BridgeRecord): BridgeRecord {
    const card = StripeModels.asRecord(rest.card);
    const bank = StripeModels.asRecord(rest.bank_account);
    const result: BridgeRecord = {
      'id': StripeModels.str(rest, 'id'),
      'created': StripeModels.createdToMillis(rest),
      // REST 'card'/'bank_account'/'pii' → JS Type 联合 'Card'/'BankAccount'/'Pii' 等
      'type': StripeModels.snakeToPascal(StripeModels.str(rest, 'type')),
      'used': StripeModels.bool(rest, 'used'),
      'livemode': StripeModels.bool(rest, 'livemode'),
    };
    if (card) {
      const address = StripeModels.asRecord(card.address);
      const cardToken: BridgeRecord = {
        'id': StripeModels.str(card, 'id') || StripeModels.str(rest, 'id'),
        'last4': StripeModels.str(card, 'last4'),
        'expMonth': StripeModels.num(card, 'exp_month'),
        'expYear': StripeModels.num(card, 'exp_year'),
        'country': StripeModels.str(card, 'country'),
        'brand': StripeModels.brandToCode(StripeModels.str(card, 'brand')),
        'funding': StripeModels.snakeToPascal(StripeModels.str(card, 'funding', 'unknown')),
        'address': address ? address : {},
      };
      const name = StripeModels.strOrNull(card, 'name');
      if (name !== null) {
        cardToken.name = name;
      }
      const currency = StripeModels.strOrNull(card, 'currency');
      if (currency !== null) {
        cardToken.currency = currency;
      }
      result.card = cardToken;
    }
    if (bank) {
      result.bankAccount = {
        'id': StripeModels.str(bank, 'id'),
        'bankName': StripeModels.strOrNull(bank, 'bank_name'),
        'accountHolderName': StripeModels.strOrNull(bank, 'account_holder_name'),
        'country': StripeModels.strOrNull(bank, 'country'),
        'currency': StripeModels.strOrNull(bank, 'currency'),
        'routingNumber': StripeModels.strOrNull(bank, 'routing_number'),
        'status': StripeModels.strOrNull(bank, 'status'),
        'fingerprint': StripeModels.strOrNull(bank, 'fingerprint'),
        'last4': StripeModels.str(bank, 'last4'),
      };
    }
    return result;
  }
}
