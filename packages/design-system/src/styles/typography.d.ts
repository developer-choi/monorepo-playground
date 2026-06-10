// typography.module.scss를 JS에서 CSS Module로 import할 때의 타입.
// @each로 방출되는 토큰 클래스와 .bold 모디파이어를 노출한다.
declare const classes: {
  h1: string;
  h2: string;
  h3: string;
  h4: string;
  body1: string;
  body2: string;
  body3: string;
  bold: string;
};

export default classes;
