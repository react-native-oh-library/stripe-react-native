/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// RNOH JS 白盒测试全局 mock
// 在 jest.config.js 中通过 setupFiles 加载。

global.nativeModuleProxy = global.nativeModuleProxy || {};

if (typeof global.queueMicrotask === 'undefined') {
  global.queueMicrotask = function (callback) {
    return Promise.resolve().then(callback);
  };
}
