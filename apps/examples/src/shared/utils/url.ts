import queryString from 'query-string';

type Primitive = string | number | boolean | null | undefined;
type QueryParams = Record<string, Primitive | ReadonlyArray<Primitive>>;

export interface BuildUrlOptions {
  skipNull?: boolean;
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
  const {skipNull, skipEmptyString} = {...DEFAULT_OPTIONS, ...options};

  return queryString.stringifyUrl({url: pathname, query: params}, {skipNull, skipEmptyString});
}

const DEFAULT_OPTIONS: BuildUrlOptions = {
  skipEmptyString: true,
  skipNull: true,
};

export function joinUrl(prefixUrl: string, path: string): string {
  if (!prefixUrl) {
    return path;
  }

  return `${prefixUrl.replace(/\/+$/, '')}/${stripLeadingSlash(path)}`;
}

export function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, '');
}
