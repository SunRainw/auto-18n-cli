<template>
  <div>{{i18n.t('u5RRzL04VTuIhhTT4Y9qF')}}</div>
  <div v-if="show" :fa="i18n.t('6bU_SacfJI_pN4MH30n56')">{{i18n.t('KFMDHG0OVcBqlZQ6EtNZ2')}}</div>
  <Form :form="ff" :#faFF="i18n.t('lbkLzYXqxtc8oooNAxK_U')">
    <FormItem>123</FormItem>
  </Form>
  <template v-for="item in arr" :key="item">
    <Form :form="ff" :#faFF="i18n.t('znwY5q-k1ACTRSd1FM31_')">
      <FormItem>333</FormItem>
    </Form>
  </template>
  <template>
    <div>{{i18n.t('eJXQFE_bZWPIQZF9CDguF')}}</div>
  </template>
  <Input v-model="ff"></Input>
  <div :a="ff">{{i18n.t('eR16dX3JoDcx3mNkYl8-1')}}</div>

  </template>
<script setup>
  
import { reactive } from "vue";
const a = reactive({
  f: i18n.t("rWCaNEoT7qgdfssaZveYI")
});
  </script>
<style>
.a {
  color: #fff;
}
</style>