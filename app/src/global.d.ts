type SetCookiesOptions = {
  name: string;
  value: string;

  domain?: string;
  expires?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
};

interface Window {
  cookieStore: {
    get(name: string): Promise<{ name: string; value: string } | null>;
    getAll(name?: string): Promise<{ name: string; value: string }[]>;

    set(options: SetCookiesOptions): Promise<void>;
    set(name: string, value: string): Promise<void>;

    delete(name: string): Promise<void>;
  };
}
