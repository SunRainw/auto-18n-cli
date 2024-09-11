<template>
  <div>
    <div>{{i18n.t('oVmFzc4wxiXYC6DZ-09NB')}}</div>
    <div v-if="show" :fa="i18n.t('RyPu43LQmGM2ELD6Ng_HG')">{{i18n.t('blHQVZ4PrYuscwksRoWZE')}}</div>
    <Form :form="ff" #faff="{ a }">
      <FormItem>123</FormItem>
    </Form>
    <template v-for="item in arr" :key="item">
      <Form :form="ff">
        <FormItem>333</FormItem>
      </Form>
    </template>
    <template>
      <div>{{i18n.t('MYwZR0xgx5X4MlMzdAXkU')}}</div>
    </template>
    <Input v-model="ff"></Input>
    <div :a="ff">{{i18n.t('-32jhWyPSEqdmfyUGXf-8')}}</div>
    <Form :rules="{ a: i18n.t('oOYoGLl5LSrVN9kR_z2eW'), b: { c: i18n.t('9Hl0MG_pWE46MHe1v058m') } }"></Form>
  </div>

  </template>
<script lang="ts">
  import { useLocale } from "@/hooks/useLocale";
export default {
  data() {
    return {
      ff: i18n.t("IZ_wX9M8yk-dKo264j0z9"),
      show: false,
      arr: [1, 2, 3]
    };
  },
  methods: {
    func() {
      const a = i18n.t("hZPW-7_u-L0xQ-qBP3oRk");
      return a + "1" + i18n.t("mYBJ7ps3MGifF_81JGJW7");
    }
  }
};
  </script>
<sss>
  123
</sss>
<style>
.a {
  color: #fff;
}
</style>
<style>
.a {
  color: #fff;
}
</style>