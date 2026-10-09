/**
 * DeepLinkHelper — stripe:// deep link 的接收与分发。
 *
 * 鸿蒙端 deep link 为「module.json5 skills 配置 + UIAbility Want 解析」：
 * 宿主入口 UIAbility 在 onCreate/onNewWant 中拿到 want.uri 后，经 JS 层
 * handleURLCallback 转回原生（Android 端为 Manifest 拦截 Activity）。
 * 本类维护：
 * 1. 3DS/SCA pending 队列：handleNextAction 打开 Web 认证后等待 stripe:// 回跳
 * 2. Stripe Connect pending 队列：pollAndClearPendingStripeConnectUrls 消费
 */

export type DeepLinkHandler = (url: string) => boolean;

export class DeepLinkHelper {
  private static readonly instance = new DeepLinkHelper();

  /** 3DS/认证 Web 流程的回跳处理器 */
  private authHandlers: Map<string, DeepLinkHandler> = new Map();
  /** Stripe Connect 拦截到的待处理 URL 队列 */
  private pendingConnectUrls: string[] = [];

  static get shared(): DeepLinkHelper {
    return DeepLinkHelper.instance;
  }

  registerAuthHandler(id: string, handler: DeepLinkHandler): void {
    this.authHandlers.set(id, handler);
  }

  unregisterAuthHandler(id: string): void {
    this.authHandlers.delete(id);
  }

  storeConnectDeepLink(url: string): void {
    this.pendingConnectUrls.push(url);
  }

  pollAndClearConnectUrls(): string[] {
    const urls = this.pendingConnectUrls;
    this.pendingConnectUrls = [];
    return urls;
  }

  /**
   * 处理回跳 URL（handleURLCallback 的 native 实现）。
   * @returns 是否为 Stripe 处理的回调 URL
   */
  handleUrl(url: string): boolean {
    if (!url || !url.startsWith('stripe')) {
      return false;
    }
    let handled = false;
    for (const entry of Array.from(this.authHandlers.entries())) {
      if (entry[1](url)) {
        handled = true;
      }
    }
    if (!handled) {
      // 无活跃认证流程时按 Connect 拦截语义入队
      this.storeConnectDeepLink(url);
    }
    return true;
  }
}
