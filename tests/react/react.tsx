import React, { FC, useState } from "react";

interface IProps {
  t: string;
}

const TestTS: FC<IProps> = ({ t }) => {
  /*   i18n-ignore          */
  const f = "测试一下";
  const [a, setA] = useState<boolean>(false); 
  const obj = {
    a: "嘿嘿嘿", 
    // i18n-ignore
    b: { c: "猪" }
  };
  return <div>
    <span style="margin: 厕所">测</span>
    {/* i18n-ignore */}
    <span title={a ? '测试title' : '不测试'} style={{ margin: "测试style" }}>{f}</span>
    <span name="测tt"></span>
    <span className={a ? "猪猪": "狗狗"}>{obj.b.c}</span>
  </div>;
};

export default TestTS;