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

type JobAddress = {
  city: string;
  road: string;
  house_number?: string;
  building?: string;
  amenity?: string;
};

type Job = {
  _id: string;
  title: string;
  description: string;
  category: string;
  hourRate: number;

  duration: {
    hoursPerDay: number;
    daysPerWeek: number;
    weeks: number;
  };

  coordinates: [number, number]; // [lng, lat]
  owner: {
    id: string;
    username: string;
    email: string;
  };

  address: JobAddress;
  fullAddress: string;
  hasApplied?: boolean;

  // Calculated for Leaflet environment
  distance?: number;
};
