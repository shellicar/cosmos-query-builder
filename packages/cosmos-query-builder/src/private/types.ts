type ArrayElement<T> = T extends (infer U)[] ? U : never;

type PathBuilder<T, Sep extends string, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any> | null
    ? T[K] extends ArrayLike<any>
      ? K | `${K}[${number}]` | `${K}[${number}]${Sep}${PathBuilder<NonNullable<ArrayElement<T[K]>>, Sep>}`
      : K | `${K}${Sep}${PathBuilder<NonNullable<T[K]>, Sep>}`
    : K
  : never;

type DotPath<T> = PathBuilder<T, '.'>;
type SlashPathCore<T> = PathBuilder<T, '/'>;

export type ExtractPathExpressions<T> = DotPath<T>;
export type ExtractPatchPathExpressions<T> = `/${SlashPathCore<T>}` | `/${SlashPathCore<T>}/-`;

type PathValueResolver<T, P extends string, Sep extends string> = P extends `${infer K}${Sep}${infer Rest}`
  ? K extends keyof T
    ? PathValueResolver<NonNullable<T[K]>, Rest, Sep>
    : never
  : P extends `${infer K}[${infer _Index}]${infer Rest}`
    ? K extends keyof T
      ? T[K] extends (infer R)[] | null
        ? Rest extends ''
          ? NonNullable<R>
          : Rest extends `${Sep}${infer More}`
            ? PathValueResolver<NonNullable<R>, More, Sep>
            : never
        : never
      : never
    : P extends keyof T
      ? T[P]
      : T extends Record<string, any>
        ? T[keyof T]
        : never;

export type PathValue<T, P extends string> = PathValueResolver<T, P, '.'>;
export type PatchPathValue<T, P extends string> = P extends `/${infer Rest}` ? PathValueResolver<T, Rest, '/'> : never;

export type StringFilterData = {
  eq?: string;
  ieq?: string;
  in?: string;
  ine?: string;
  like?: string;
  ne?: string;
};
