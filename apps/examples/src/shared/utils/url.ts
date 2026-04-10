import queryString from 'query-string';

type Primitive = string | number | boolean | null | undefined;
type QueryParams = Record<string, Primitive | ReadonlyArray<Primitive>>;

export interface BuildUrlOptions {
  skipNullish?: boolean;
  skipEmptyString?: boolean;
}

export function buildUrlWithQuery({
  pathname,
  params,
  ...options
}: {
  pathname: string;
  params: QueryParams;
} & Partial<BuildUrlOptions>): string {
  const {skipNullish, skipEmptyString} = {...DEFAULT_OPTIONS, ...options};

  return queryString.stringifyUrl({url: pathname, query: params}, {skipNull: skipNullish, skipEmptyString});
}

const DEFAULT_OPTIONS: BuildUrlOptions = {
  skipEmptyString: true,
  skipNullish: true,
};
