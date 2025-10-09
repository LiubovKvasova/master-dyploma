import { USER_COOKIE_NAME } from './constants';

export const setUser = async (value: object, expires?: number) => {
  await window.cookieStore.set({
    name: USER_COOKIE_NAME,
    value: JSON.stringify(value),
    expires,
  });
};

export const getUser = async (): Promise<object | null> => {
  const user = await window.cookieStore.get(USER_COOKIE_NAME);

  if (!user) {
    return null;
  }

  return JSON.parse(user.value!);
};

export const updateUser = async (newOptions: object) => {
  const user = await window.cookieStore.get(USER_COOKIE_NAME);

  if (!user) {
    return;
  }

  const parsedUser = JSON.parse(user.value!);
  const updatedUser = Object.assign(parsedUser, newOptions);

  const expires = user.expires;
  await setUser(updatedUser, expires);
};

export const removeUser = async () => {
  await window.cookieStore.delete(USER_COOKIE_NAME);
};
