cmake_minimum_required(VERSION 3.11)
project(rnapp)

# =============================================================================
# 公共部分：RNOH 0.72 / 0.77 / 0.84 三种版本布局通用
# =============================================================================
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
# cpp 目录为 entry/src/main/cpp，向上三级是 entry/，依赖安装在 entry/oh_modules 下
set(OH_MODULE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(OH_MODULES_DIR "${OH_MODULE_DIR}") # required by 'autolink_libraries'
set(RNOH_PKG_DIR "${OH_MODULE_DIR}/@rnoh/react-native-openharmony")
set(RNOH_GENERATED_DIR "${CMAKE_CURRENT_SOURCE_DIR}/generated")
set(LOG_VERBOSITY_LEVEL 1)
set(CMAKE_ASM_FLAGS "-Wno-error=unused-command-line-argument -Qunused-arguments")
set(CMAKE_CXX_FLAGS "-fstack-protector-strong -Wl,-z,relro,-z,now,-z,noexecstack -s -fPIE -pie")
set(WITH_HITRACE_SYSTRACE ON)

# =============================================================================
# RNOH 版本探测：按 har 包内布局自动选择接线方式（三版布局标记互斥）
#   0.84+ : 包根 include/react-native-harmony.cmake（预编译 so，INTERFACE 目标）
#   0.77~0.82 : src/main/cpp/CMakeLists.txt（har 带完整源码，add_subdirectory）
#   0.72  : src/main/include（应用手工构建 rnoh 共享库）
# =============================================================================
if(EXISTS "${RNOH_PKG_DIR}/include/react-native-harmony.cmake")
    # -------------------------------------------------------------------------
    # RNOH 0.84+：头文件与 react-native-harmony.cmake 位于包根 include/
    # rnoh 目标（INTERFACE）由该 cmake 文件定义，负责 folly-config 配置、头文件
    # 路径并链接预编译的 react-native-openharmony::* 目标（librnoh_core.so 等，
    # 由 hvigor 依据 nativeComponents 通过 find_package 导入）
    # -------------------------------------------------------------------------
    set(RNOH_CPP_DIR "${RNOH_PKG_DIR}/include")
    set(CMAKE_CXX_STANDARD 20)
    set(CMAKE_CXX_STANDARD_REQUIRED ON)
    include("${RNOH_CPP_DIR}/react-native-harmony.cmake")

elseif(EXISTS "${RNOH_PKG_DIR}/src/main/cpp/CMakeLists.txt")
    # -------------------------------------------------------------------------
    # RNOH 0.77~0.82：har 内置完整 C++ 源码，通过 add_subdirectory 构建 rnoh
    # -------------------------------------------------------------------------
    set(RNOH_CPP_DIR "${RNOH_PKG_DIR}/src/main/cpp")
    add_subdirectory("${RNOH_CPP_DIR}" ./rn)

else()
    # -------------------------------------------------------------------------
    # RNOH 0.72：头文件在 src/main/include，应用侧手工构建 rnoh 共享库
    # -------------------------------------------------------------------------
    set(RNOH_CPP_DIR "${RNOH_PKG_DIR}/src/main/include")
    set(REACT_COMMON_PATCH_DIR "${RNOH_CPP_DIR}/patches/react_native_core")
    set(NATIVERENDER_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}")
    set(CMAKE_CXX_STANDARD 17)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DNDEBUG")
    set(WITH_HITRACE_SYSTRACE 1)
    add_compile_definitions(WITH_HITRACE_SYSTRACE)

    set(folly_compile_options
        -DFOLLY_NO_CONFIG=1
        -DFOLLY_MOBILE=1
        -DFOLLY_USE_LIBCPP=1
        -DFOLLY_HAVE_RECVMMSG=1
        -DFOLLY_HAVE_PTHREAD=1
        -Wno-comma
        -Wno-shorten-64-to-32
        -Wno-documentation
        -faligned-new
    )
    add_compile_options("-Wno-unused-command-line-argument")

    include_directories(${NATIVERENDER_ROOT_PATH}
                        ${RNOH_CPP_DIR}
                        ${REACT_COMMON_PATCH_DIR}
                        ${RNOH_CPP_DIR}/third-party/folly
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/react/nativemodule/core
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/jsi
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/callinvoker
                        ${RNOH_CPP_DIR}/third-party/boost/libs/utility/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/stacktrace/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/predef/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/array/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/throw_exception/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/config/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/core/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/preprocessor/include
                        ${RNOH_CPP_DIR}/third-party/double-conversion
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/react/renderer/graphics/platform/cxx
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/runtimeexecutor
                        ${RNOH_CPP_DIR}/third-party/glog/src
                        ${RNOH_CPP_DIR}/third-party/boost/libs/mpl/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/type_traits/include
                        ${RNOH_CPP_DIR}/third-party/rn/ReactCommon/yoga
                        ${RNOH_CPP_DIR}/third-party/boost/libs/intrusive/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/assert/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/move/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/static_assert/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/container_hash/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/describe/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/mp11/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/iterator/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/detail/include
                        ${RNOH_CPP_DIR}/third-party/boost/libs/regex/include
                        ${RNOH_CPP_DIR}/patches/react_native_core/react/renderer/textlayoutmanager/platform/harmony
                        )

    configure_file(
      ${RNOH_CPP_DIR}/third-party/folly/CMake/folly-config.h.cmake
      ${RNOH_CPP_DIR}/third-party/folly/folly/folly-config.h
    )

    add_library(rnoh SHARED
        "${RNOH_CPP_DIR}/RNOHOther.cpp"
        "${RNOH_CPP_DIR}/third-party/folly/folly/lang/SafeAssert.cpp"
    )

    target_compile_options(rnoh PUBLIC ${folly_compile_options})
    target_link_directories(rnoh PUBLIC "${RNOH_PKG_DIR}/libs/arm64-v8a")
    target_link_libraries(rnoh PUBLIC
        rnoh_semi
        libace_napi.z.so
        libace_ndk.z.so
        librawfile.z.so
        libhilog_ndk.z.so
        libnative_vsync.so
        libnative_drawing.so
        libc++_shared.so
        libhitrace_ndk.z.so
        libdeviceinfo_ndk.z.so
        react_render_scheduler
        rrc_image
        rrc_text
        rrc_textinput
        rrc_scrollview
        react_nativemodule_core
        react_render_animations
        jsinspector
        hermes
        jsi
        logger
        react_config
        react_debug
        react_render_attributedstring
        react_render_componentregistry
        react_render_core
        react_render_debug
        react_render_graphics
        react_render_imagemanager
        react_render_mapbuffer
        react_render_mounting
        react_render_templateprocessor
        react_render_textlayoutmanager
        react_render_telemetry
        react_render_uimanager
        react_utils
        rrc_root
        rrc_view
        react_render_leakchecker
        react_render_runtimescheduler
        runtimeexecutor
    )

    set(RNOH_C_API_ARCH "${RNOH_C_API_ARCH}" CACHE STRING "Enable C-API architecture")
    if(RNOH_C_API_ARCH STREQUAL "1" OR "$ENV{RNOH_C_API_ARCH}" STREQUAL "1")
        message("Experimental C-API architecture enabled")
        target_link_libraries(rnoh PUBLIC libqos.so)
        target_compile_definitions(rnoh PUBLIC C_API_ARCH)
    endif()

    # 0.72 官方模板中 rnoh_app 额外编译 RNOHOther.cpp
    set(RNOH_APP_EXTRA_SRC "${RNOH_CPP_DIR}/RNOHOther.cpp")
endif()

# =============================================================================
# Windows MAX_PATH 规避：ohpm 将被多个模块共享的 har 安装在
# harmony/oh_modules/.ohpm/<hash>/oh_modules/... 下，hvigor 生成的 find_package
# 导入目标（react-native-openharmony::*）的 include 路径会超出 260 字符，
# ninja 在检查 .ninja_deps 中记录的头文件依赖时报
# "Filename longer than 260 characters"。
# entry/oh_modules/<pkg> 是指向同一目录的 junction 短路径，这里统一改写。
# （0.72/0.77 布局下没有导入目标，此段为空操作）
# =============================================================================
if(CMAKE_HOST_WIN32)
    get_directory_property(_rnoh_imported_targets IMPORTED_TARGETS)
    foreach(_t IN LISTS _rnoh_imported_targets)
        get_target_property(_inc ${_t} INTERFACE_INCLUDE_DIRECTORIES)
        if(_inc)
            string(REGEX REPLACE "^[A-Za-z]:/[^;]*/\.ohpm/[^;/]+/oh_modules/"
                   "${OH_MODULE_DIR}/" _inc_fixed "${_inc}")
            if(NOT "${_inc_fixed}" STREQUAL "${_inc}")
                set_target_properties(${_t} PROPERTIES
                    INTERFACE_INCLUDE_DIRECTORIES "${_inc_fixed}")
            endif()
        endif()
    endforeach()
endif()

# =============================================================================
# 公共部分：rnoh_app（三种版本通用，仅桥接源文件略有差异）
# =============================================================================
# RNOH_BEGIN: add_plugin_subdirectories
# 手动注册示例（不支持autolink的插件）:
# add_subdirectory("${OH_MODULES_DIR}/@react-native-ohos/YOUR_PACKAGE_NAME/src/main/cpp" ./YOUR_TARGET_NAME)
# autolink支持:
include("${CMAKE_CURRENT_SOURCE_DIR}/autolinking.cmake")
# RNOH_END: add_plugin_subdirectories

file(GLOB GENERATED_CPP_FILES "${CMAKE_CURRENT_SOURCE_DIR}/generated/*.cpp") # this line is needed by codegen v1
add_library(rnoh_app SHARED
    ${GENERATED_CPP_FILES}
    "./PackageProvider.cpp"
    "${RNOH_CPP_DIR}/RNOHAppNapiBridge.cpp"
    ${RNOH_APP_EXTRA_SRC}
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: link_plugins
# 手动注册示例（不支持autolink的插件）:
# target_link_libraries(rnoh_app PUBLIC YOUR_TARGET_NAME)
# autolink支持:
autolink_libraries(rnoh_app)
# RNOH_END: link_plugins
