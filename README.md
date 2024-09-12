## 简介

auto-i18n-cli 自动国际化脚本，可以通过命令行自动提取收集代码的文字（中文更适配，其他语言可能有bug），自动调用百度、有道、谷歌翻译API进行翻译，存入国际化文件夹中，并且支持 `React` 和 `Vue` 两种语言。

## 说明

### 安装

```bash
$ npm install @rain/auto-i18n-cli -D

# or yarn
$ yarn add @rain/auto-i18n-cli -D

# or pnpm
$ pnpm install @rain/auto-i18n-cli -D
```

### 初始化

```bash
$ npx i18n init
```

### 提取转换

```bash
$ npx i18n transform
```

### 翻译

```bash
$ npx i18n translate
```

### i18n.config.js配置

| 参数                | 说明                                                                    | 类型                          | 默认值      | 版本 |
| ------------------- | ----------------------------------------------------------------------- | ----------------------------- | ----------- | ---- |
| entry               | 要提取的国际化文件(夹)                                                  | string[]                      | []          |
| exclude             | 要排除的文件(夹)                                                        | string[]                      | []          |
| localPath           | 语言存放文件夹路径                                                      | string                        | ./locale    |
| local               | 本地语言                                                                | [LocalType](#语言类型)        | zh-CN       |
| langs               | 需要翻译的语言                                                          | [LocalType\[\]](#语言类型)    | ["en-US"]   |
| i18nImport          | 导入国际化的import语句                                                  | string                        | -           |
| i18nHooksReturnType | 组件需要导入的hooks，一般tsx使用                                        | [0 \| 1](#hooks函数引入类型)  |
| i18nMethod          | 国际化函数，例如t，i18n.t                                               | string                        | $t          |
| generateStrategy    | 生成国际化key的规则                                                     | [I18nKey](#国际化key生成规则) | primitive   |
| prefixKey           | 生成国际化key的前缀                                                     | string                        | -           |
| ignoreAttrs         | 需要忽略的属性，例如class、style                                        | string[]                      | []          |
| ignoreAnnotation    | 注释，类似于//@ts-ignore                                                | string                        | i18n-ignore |
| ignoreMethods       | 需要忽略的方法, 例如console.log                                         | string[]                      | []          |
| translate           | 翻译配置对象                                                            | [object](#翻译配置对象)       |             |
| prettierPath        | prettier格式化文件路径，不填则不格式化                                  | string                        | -           |
| vueTempPrefix       | 启用后会在template中使用\$t（\$: vueTempPrefix，t: i18nMethod的第二级） | string \| false               | $           |

### 语言类型

| 语言名称 | key   |
| -------- | ----- |
| 简体中文 | zh-CN |
| 繁体中文 | zh-TW |
| 英语     | en-US |
| 日语     | ja-JP |
| 西班牙   | es-ES |
| 俄语     | ru-RU |
| 韩语     | ko-KR |
| 法语     | fr-FR |
| 德语     | de-DE |

### hooks函数引入类型

在tsx文件中，使用国际化可能会遇到引用hooks，如果填入，则会自动为您自动引入，例如：const { t } = useLocale()

| 引入方式 | 说明                     |
| -------- | ------------------------ |
| 0        | const t = useLocale()    |
| 1        | const { t }= useLocale() |

### 国际化key生成规则

| key       | 规则                | 示例                        |
| --------- | ------------------- | --------------------------- |
| primitive | 直接使用文字作为key | 我爱你 => 我爱你            |
| slug      | 使用pinyin          | 我爱你 => wo-ai-ni          |
| random    | 使用唯一随机字符串  | 我爱你 => fwrgafa_kncobuoiq |

### 翻译配置对象

| 属性      | 说明                              |
| --------- | --------------------------------- |
| type      | 翻译的类型，baidu、youdao、google |
| appId     | 翻译的appId                       |
| secretKey | 翻译的secretKey                   |

### 翻译效果

#### Vue

转换前

```vue
<template>
  <div class="container">
    <div class="name">{{ name }}</div>
    <template>
      <div>vue数据测试</div>
      <div title="测试title"></div>
    </template>
  </div>
</template>

<script lang="js">
export default {
  data() {
    return {
      name: "测试",
    };
  },
};
</script>
```

转换后

```vue
<template>
  <div class="container">
    <div class="name">{{ name }}</div>
    <template>
      <div>{{ $t("vue数据测试") }}</div>
      <div :title="$('测试title')"></div>
    </template>
  </div>
</template>

<script lang="js">
import i18n from "vue-i18n";
export default {
  data() {
    return {
      name: i18n.t("测试"),
    };
  },
};
</script>
```

#### React

转换前

```tsx
import React, { FC } from "react";
const Component: FC = () => {
  const name = "测试";
  return (
    <div className="container">
      <div className="name">{name}</div>
      <div title="再次测试">哈哈哈</div>
    </div>
  );
};
export default Component;
```

转换后

```tsx
import React, { FC } from "react";
import { useIntl } from "react-intl";
const Component: FC = () => {
  const intl = useIntl();
  const name = intl.t("测试");
  return (
    <div className="container">
      <div className="name">{name}</div>
      <div title={intl.t("再次测试")}>{intl.t("哈哈哈")}</div>
    </div>
  );
};
export default Component;
```
