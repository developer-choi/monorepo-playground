/**
 * 에러 심각도. Sentry event level에 대응.
 * 기획자가 등급별 규칙을 명세하고, 개발자가 그에 맞게 설정하는 구조.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/enriching-events/level/
 *
 * - fatal (high): 지금 하던 작업 멈추고 대응. 퇴근했으면 출근해서 대응. (예: 결제 오류)
 * - error (high): unhandled error만. 예상하지 못한 오류. 올라오면 대부분 조치 후 다른 등급으로 조정해야 함.
 * - warning (medium): 대응은 해야 하지만 바로 할 필요는 없는 경우.
 * - low: 짧은 기간 안에 대량 발생해야 대응하는 에러. 한두 건으로는 대응 불필요.
 */
type Level = 'fatal' | 'error' | 'warning' | 'low';

export interface BaseErrorOption {
  level?: Level;
  tags?: Record<string, string | number>;
  cause?: unknown;
}

/**
 * 모든 커스텀 에러의 부모 클래스.
 *
 * level을 변경하고 싶으면 인스턴스의 값을 재할당하지 말고,
 * 별도의 에러 클래스를 만들어서 생성자에서 level을 지정할 것.
 * 예: PaymentApiResponseError extends BaseError { constructor() { super(..., {level: 'fatal'}) } }
 */
export default abstract class BaseError extends Error {
  abstract readonly name: string;

  readonly level: Level;
  readonly tags?: Record<string, string | number>;

  protected constructor(message: string, option?: BaseErrorOption) {
    super(message, {cause: option?.cause});
    this.level = option?.level ?? 'error';
    this.tags = option?.tags;
  }
}
