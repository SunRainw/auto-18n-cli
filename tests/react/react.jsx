import { useLocale } from "@/hooks/useLocale";import React from 'react';
export default function () {const i18n = useLocale();
  // i18n-ignore
  const a = "哈哈哈";

  return <div>
    <span>{a}</span>
    <span title={i18n.t("yxAg0C6eDpaMjCtjXzuH4")}>{i18n.t("RirNZijdWl0n0JJWLGmsj")}</span>
  </div>;
}