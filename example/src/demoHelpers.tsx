/**
 * stripe-react-native 鸿蒙化 Example — 新增 Demo 公共设施
 *
 * 与 example/App.tsx（原单页用例，保持不动）风格保持一致：
 * - ActionButton + ResultBlock + run(name, fn) 观察每次调用的返回/异常
 * - safeStringify 序列化（Error 序列化为 {name,message}，保证 THREW 可见）
 * - JsonCard 展示类型字面量样例（类型覆盖用例：字段引用即覆盖）
 *
 * DemoScreen 在挂载时执行一次 initStripe（幂等守卫），保证后续原生调用
 * 走「已初始化」路径；未配置真实后端密钥时，调用返回结构化 StripeError，
 * 可在结果区直接观察鸿蒙降级行为。
 */

import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {initStripe, type InitialiseParams} from '@stripe/stripe-react-native';

// 与原 example/App.tsx 一致的测试密钥（同一账号，配合降级行为观察）
export const PUBLISHABLE_KEY =
  'pk_test_51UXLDKDV8zdV6PUc8vJLRtsZtQ9RkTqAT7eQZrXTWl527wg4DVPM8zAp2eeXSagUHPTS5vaUQztEvO0r0KEgVeIe00EDyRaMaR';

export function safeStringify(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  try {
    // Error（含嵌套在对象里的）序列化为 {name,message}，否则 message 被吞
    return JSON.stringify(value, (_k, v) =>
      v instanceof Error ? {name: v.name, message: v.message} : v,
    );
  } catch (e) {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// initStripe 幂等守卫
// ---------------------------------------------------------------------------

let stripeInitialised = false;

export async function ensureStripeInit(): Promise<void> {
  if (stripeInitialised) {
    return;
  }
  stripeInitialised = true;
  try {
    // InitialiseParams = InitStripeParams + appInfo，兼容传 appInfo 的同时满足类型
    const params: InitialiseParams = {
      publishableKey: PUBLISHABLE_KEY,
      appInfo: {
        name: 'stripe-react-native-ohos-example',
        partnerId: 'pp_partner_demo_ohos',
        version: '0.76.1-beta.1',
        url: 'https://example.com',
      },
    };
    await initStripe(params);
  } catch (error) {
    // 初始化失败不阻塞用例：后续调用会以结构化错误形式在结果区暴露
    console.warn('[demoHelpers] initStripe failed:', safeStringify(error));
  }
}

// ---------------------------------------------------------------------------
// 用例执行器：run(name, fn) → results[name]
// ---------------------------------------------------------------------------

export type DemoResults = Record<string, string>;

export function useDemoRunner() {
  const [results, setResults] = useState<DemoResults>({});
  const run = useCallback(
    async (name: string, fn: () => Promise<unknown> | unknown) => {
      setResults(prev => ({...prev, [name]: 'RUNNING…'}));
      try {
        const value = await fn();
        setResults(prev => ({...prev, [name]: safeStringify(value)}));
      } catch (error) {
        setResults(prev => ({
          ...prev,
          [name]: 'THREW: ' + safeStringify(error),
        }));
      }
    },
    [],
  );
  return {results, run};
}

// ---------------------------------------------------------------------------
// UI 积木
// ---------------------------------------------------------------------------

export function ActionButton({
  method,
  onPress,
}: {
  method: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      testID={'btn-' + method}
      style={demoStyles.button}
      activeOpacity={0.7}
      onPress={onPress}>
      <Text style={demoStyles.buttonText}>{method}</Text>
    </TouchableOpacity>
  );
}

export function ResultBlock({
  method,
  results,
}: {
  method: string;
  results: DemoResults;
}) {
  return (
    <View style={demoStyles.resultBox}>
      <Text style={demoStyles.resultLabel}>{method}:</Text>
      <Text testID={'result-' + method} style={demoStyles.resultText}>
        {results[method] ?? '—'}
      </Text>
    </View>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={demoStyles.section}>
      <Text style={demoStyles.sectionTitle}>{title}</Text>
      {description ? (
        <Text style={demoStyles.sectionDescription}>{description}</Text>
      ) : null}
      {children}
    </View>
  );
}

/** 类型字面量样例卡片：类型覆盖用例的展示形态 */
export function JsonCard({label, value}: {label: string; value: unknown}) {
  return (
    <View style={demoStyles.resultBox}>
      <Text style={demoStyles.resultLabel}>{label}</Text>
      <Text style={demoStyles.resultText}>{safeStringify(value)}</Text>
    </View>
  );
}

// RNOH 下未捕获的渲染错误会拆掉整棵 RN 树（全屏白屏）；
// 用边界把原生视图的崩溃隔离成可见文本，保证后续用例可观测
export class DemoErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {error: Error | null}
> {
  state = {error: null as Error | null};

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  render() {
    if (this.state.error) {
      return (
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>渲染错误（已隔离）:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export function DemoScreen({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    void ensureStripeInit();
  }, []);
  return (
    <SafeAreaView style={demoStyles.screen}>
      <ScrollView contentContainerStyle={demoStyles.content}>
        <Text style={demoStyles.title}>{title}</Text>
        {description ? (
          <Text style={demoStyles.description}>{description}</Text>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const demoStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B1D30',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B1D30',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#888A9E',
    marginBottom: 8,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#4F49D6',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#F6F6F8',
    borderRadius: 6,
    padding: 8,
    marginTop: 6,
  },
  resultLabel: {
    fontSize: 11,
    color: '#635BFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  resultText: {
    fontSize: 11,
    color: '#3F4152',
    fontFamily: 'monospace',
  },
});
