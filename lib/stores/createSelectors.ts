import type { StoreApi, UseBoundStore } from "zustand";

type UseHookName<K extends PropertyKey> = K extends string
  ? `use${Capitalize<K>}`
  : never;

type StoreWithSelectors<StoreState> = {
  use: {
    [K in keyof StoreState as UseHookName<K>]: () => StoreState[K];
  };
};

const toUseHookName = (key: string) =>
  `use${key.charAt(0).toUpperCase()}${key.slice(1)}`;

export const createSelectors = <StoreState extends object>(
  store: UseBoundStore<StoreApi<StoreState>>,
) => {
  type StoreKey = keyof StoreState;

  const useStore = store as UseBoundStore<StoreApi<StoreState>> &
    StoreWithSelectors<StoreState>;
  useStore.use = {} as StoreWithSelectors<StoreState>["use"];

  (Object.keys(store.getState()) as StoreKey[]).forEach((key) => {
    const hookName = toUseHookName(String(key));
    const useHook = () => store((state) => state[key]);
    Object.defineProperty(useHook, "name", {
      value: hookName,
      configurable: true,
    });
    (useStore.use as Record<string, () => StoreState[StoreKey]>)[hookName] =
      useHook;
  });

  return useStore;
};
