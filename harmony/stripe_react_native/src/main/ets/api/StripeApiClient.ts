/**
 * StripeApiClient — 基于 @ohos.net.http 的 Stripe REST API v1 客户端。
 *
 * 架构级替代 stripe-android/stripe-ios：移动 SDK 客户端能力本质是 publishable
 * key 直调 api.stripe.com（无 secret key），鸿蒙端复刻同构调用。
 *
 * 平台限制（已查证 @ohos.net.http.md）：
 * - POST 默认 content-type 为 application/json，调 Stripe 表单端点必须显式
 *   设置 {'content-Type': 'application/x-www-form-urlencoded'}
 * - 表单数据 key/value 需 URL 编码后以 k1=v1&k2=v2 作为 extraData(string) 传入
 * - 每个 HttpRequest 一次性使用，用完必须 destroy()
 */

import { http } from '@kit.NetworkKit';
import hilog from '@ohos.hilog';
import { DeviceEnv } from '../util/DeviceEnv';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

export const STRIPE_API_BASE = 'https://api.stripe.com';
export const STRIPE_API_VERSION = '2024-06-20';
export const SDK_VERSION = '0.77.0';

/** Stripe REST 错误响应结构（docs.stripe.com 错误契约） */
export interface StripeRestError {
  type: string;
  code: string;
  message: string;
  decline_code?: string;
  param?: string;
}

/** 转换为 JS 层 StripeError 结构（对齐 src/types/Errors.ts）的记录 */
export type BridgeError = Record<string, Object>;

export class StripeApiError extends Error {
  readonly restError: StripeRestError;

  constructor(restError: StripeRestError) {
    super(restError.message);
    this.restError = restError;
  }
}

export class StripeNetworkError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class HttpRequestResult {
  readonly statusCode: number;
  readonly body: Record<string, Object>;

  constructor(statusCode: number, body: Record<string, Object>) {
    this.statusCode = statusCode;
    this.body = body;
  }
}

/**
 * 表单参数编码器：支持嵌套对象（a[b]=c）与对象数组（a[][b]=c），
 * 与 Stripe 表单编码规范一致。
 */
export class StripeFormEncoder {
  static encode(form: Map<string, Object>): string {
    const parts: string[] = [];
    for (const entry of Array.from(form.entries())) {
      StripeFormEncoder.encodeValue('', entry[0], entry[1], parts);
    }
    return parts.join('&');
  }

  private static encodeValue(prefix: string, key: string, value: Object, parts: string[]): void {
    const fullKey = prefix.length > 0 ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) {
      return;
    }
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined && typeof item === 'object' && !Array.isArray(item)) {
          StripeFormEncoder.encodeRecordAs(fullKey + '[]', item as Record<string, Object>, parts);
        } else {
          parts.push(`${encodeURIComponent(fullKey + '[]')}=${encodeURIComponent(String(item))}`);
        }
      }
      return;
    }
    StripeFormEncoder.encodeRecordAs(fullKey, value as Record<string, Object>, parts);
  }

  private static encodeRecordAs(prefix: string, record: Record<string, Object>, parts: string[]): void {
    const keys = Object.keys(record);
    for (const key of keys) {
      StripeFormEncoder.encodeValue(prefix, key, record[key], parts);
    }
  }
}

/** PascalCase → snake_case（PaymentMethodType → REST type，如 SepaDebit → sepa_debit） */
export function pascalToSnake(value: string): string {
  let result = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value.charAt(i);
    if (ch >= 'A' && ch <= 'Z') {
      result += (i === 0 ? '' : '_') + ch.toLowerCase();
    } else {
      result += ch;
    }
  }
  return result;
}

export class StripeApiClient {
  private static readonly instance = new StripeApiClient();

  private publishableKey: string = '';
  private stripeAccountId: string = '';
  private idempotencyKeySeed: number = 0;

  static get shared(): StripeApiClient {
    return StripeApiClient.instance;
  }

  configure(publishableKey: string, stripeAccountId: string): void {
    this.publishableKey = publishableKey;
    this.stripeAccountId = stripeAccountId;
  }

  get isConfigured(): boolean {
    return this.publishableKey.length > 0;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${this.publishableKey}`,
      'User-Agent': `Stripe/v1 harmony/${SDK_VERSION} (${DeviceEnv.appName}/${DeviceEnv.appVersion})`,
      'X-Stripe-User-Agent': `{"os":{"name":"harmony","version":"${DeviceEnv.osVersion}"}}`,
    };
    if (this.stripeAccountId.length > 0) {
      headers['Stripe-Account'] = this.stripeAccountId;
    }
    return headers;
  }

  nextIdempotencyKey(): string {
    this.idempotencyKeySeed += 1;
    return `rnoh-${Date.now()}-${this.idempotencyKeySeed}`;
  }

  async request(method: http.RequestMethod, path: string, form: Map<string, Object>): Promise<HttpRequestResult> {
    if (!this.isConfigured) {
      throw new StripeNetworkError('Stripe SDK is not initialised. Call initialise() with a publishable key first.');
    }
    try {
      const httpRequest = http.createHttp();
      try {
        const body = StripeFormEncoder.encode(form);
        const options: http.HttpRequestOptions = {
          method: method,
          header: this.buildHeaders(),
          extraData: body,
          expectDataType: http.HttpDataType.STRING,
          connectTimeout: 60000,
          readTimeout: 60000,
        };
        const response = await httpRequest.request(`${STRIPE_API_BASE}${path}`, options);
        const text = typeof response.result === 'string' ? response.result : JSON.stringify(response.result);
        let parsed: Record<string, Object> = {};
        try {
          parsed = JSON.parse(text) as Record<string, Object>;
        } catch (err) {
          hilog.error(HILOG_DOMAIN, HILOG_TAG, 'invalid JSON from %{public}s: %{public}s', path, text.substring(0, 200));
          throw new StripeNetworkError(`Invalid response from Stripe API (${path})`);
        }
        if (response.responseCode >= 400) {
          throw new StripeApiError(StripeApiClient.parseRestError(parsed, response.responseCode));
        }
        return new HttpRequestResult(response.responseCode, parsed);
      } finally {
        httpRequest.destroy();
      }
    } catch (err) {
      if (err instanceof StripeApiError || err instanceof StripeNetworkError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'http request failed: %{public}s', message);
      throw new StripeNetworkError(message);
    }
  }

  async post(path: string, form: Map<string, Object>): Promise<HttpRequestResult> {
    return this.request(http.RequestMethod.POST, path, form);
  }

  async get(path: string, form: Map<string, Object>): Promise<HttpRequestResult> {
    return this.request(http.RequestMethod.GET, path, form);
  }

  private static parseRestError(body: Record<string, Object>, statusCode: number): StripeRestError {
    const raw = body.error as Record<string, Object> | undefined;
    if (raw) {
      const str = (key: string): string => {
        const v = raw[key];
        return typeof v === 'string' ? v : (v === null || v === undefined ? '' : String(v));
      };
      return {
        type: str('type'),
        code: str('code'),
        message: str('message'),
        decline_code: str('decline_code') || undefined,
        param: str('param') || undefined,
      };
    }
    return {
      type: 'api_error',
      code: `http_${statusCode}`,
      message: `Stripe API request failed with HTTP ${statusCode}`,
    };
  }
}
