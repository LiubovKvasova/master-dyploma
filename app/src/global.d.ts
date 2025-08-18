type SetCookiesOptions = {
  name: string;
  value: string;

  domain?: string;
  expires?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
};

type CookieInstance = {
  name: string;
  value: string;
  domain: string;
  expires: number;
  path: string;
  sameSite: 'strict' | 'lax' | 'none';
};

interface Window {
  cookieStore: {
    get(name: string): Promise<CookieInstance | null>;
    getAll(name?: string): Promise<CookieInstance[]>;

    set(options: SetCookiesOptions): Promise<void>;
    set(name: string, value: string): Promise<void>;

    delete(name: string): Promise<void>;
  };
}
