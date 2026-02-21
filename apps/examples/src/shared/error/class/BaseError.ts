type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

export interface SentryOption {
  level: SeverityLevel;
  tags?: Record<string, string | number>;
}

export interface BaseErrorOption {
  cause?: Error;
}

/**
 * 모든 커스텀 에러에 공통적으로 적용되야하는 설계를 반영
 */
export default abstract class BaseError extends Error {
  readonly abstract name: string;

  /**
   * 외부에서 sentryOptions를 재할당 하지 못하게 하기 위해 readonly를 설정했습니다.
   * 예를들어, ApiResponseError의 에러인스턴스의 sentry event level를 상향 하고 싶은 경우,
   * error.sentryOptions.level = 'fatal' 하는것이 아니라,
   * PaymentApiResponseError 같은 에러 클래스를 별도로 만들고 그 인스턴스를 던지는것을 의도했습니다.
   */
  readonly sentryOptions: SentryOption;

  protected constructor(message: string, option: SentryOption & BaseErrorOption) {
    const {cause, ...sentry} = option ?? {};
    super(message, {cause});
    this.sentryOptions = sentry;
  }
}
