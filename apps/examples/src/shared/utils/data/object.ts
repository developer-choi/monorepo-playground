export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

type LeafValue = number | string | boolean | null | undefined;

export type LeafMapCallback = (parameter: {key?: string; value: LeafValue}) => unknown;

export interface MapLeavesOption {
  ignoreKeyList: string[];
}

interface MapLeavesParams {
  callback: LeafMapCallback;
  option?: MapLeavesOption;
}

function mapLeaves(value: object, {callback, option}: MapLeavesParams): unknown {
  function traverse(node: object | LeafValue, parentKey?: string): unknown {
    if (Array.isArray(node)) {
      return (node as (object | LeafValue)[]).map((element) => traverse(element, parentKey));
    } else if (node === null || typeof node !== 'object') {
      if (parentKey && option && option.ignoreKeyList.includes(parentKey)) {
        return node;
      } else {
        return callback({key: parentKey, value: node});
      }
    } else {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node) as [string, object | LeafValue][]) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        result[key] = traverse(value, fullKey);
      }
      return result;
    }
  }

  return traverse(value);
}

export function mapObjectLeaves<O extends object>(object: O, {callback, option}: MapLeavesParams): O {
  const wrappedCallback: LeafMapCallback = (parameter) => {
    const result = callback(parameter);

    if (typeof parameter.value !== typeof result || isObject(parameter.value) !== isObject(result)) {
      throw new Error('The converted value types is different than before.');
    }

    return result;
  };

  return mapLeaves(object, {callback: wrappedCallback, option}) as O;
}

export function trimObject<O extends object>(value: O, option?: MapLeavesOption): O {
  return mapObjectLeaves(value, {
    callback: ({value}) => {
      if (typeof value === 'string') {
        return value.trim();
      } else {
        return value;
      }
    },
    option,
  });
}

export function cleanObject<O extends object>(target: O, option?: MapLeavesOption): O {
  return mapLeaves(target, {
    callback: ({value}) => {
      if (value === null) {
        return undefined;
      }

      if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (trimmedValue === '') {
          return undefined;
        } else {
          return trimmedValue;
        }
      }

      return value;
    },
    option,
  }) as O;
}
