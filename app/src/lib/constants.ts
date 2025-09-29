export const USER_COOKIE_NAME = 'user';

export const JOB_CATEGORIES = [
  { value: "cleaning", label: "Прибирання та хатня допомога" },
  { value: "repair", label: "Дрібний ремонт" },
  { value: "construction", label: "Будівельні та оздоблювальні роботи" },
  { value: "gardening", label: "Садівництво та догляд за територією" },
  { value: "moving", label: "Допомога з переїздом, вантажники" },
  { value: "delivery", label: "Доставка та закупівлі" },
  { value: "pet-care", label: "Догляд за тваринами" },
  { value: "child-care", label: "Догляд за дітьми" },
  { value: "elder-care", label: "Догляд за літніми людьми" },
  { value: "event-help", label: "Допомога в організації заходів" },
  { value: "cooking", label: "Кулінарія" },
  { value: "packing", label: "Сортування, пакування, складування" },
  { value: "decor", label: "Ремонт/декор інтер’єру" },
  { value: "it-support", label: "Допомога з комп’ютерами та технікою" },
  { value: "tutoring", label: "Репетиторство та навчання" },
  { value: "photo-video", label: "Фото- та відеопослуги" },
  { value: "entertainment", label: "Аніматори, музиканти, артисти" },
  { value: "car-services", label: "Автопослуги" },
  { value: "admin-help", label: "Адміністративна допомога" },
  { value: "promo", label: "Розклеювання/розповсюдження реклами" },
];

export const ADDRESS_FIELDS = [
  'amenity',
  'building',
  'house_number',
  'road',
  'neighbourhood',
  'suburb',
  'borough',
  'city',
  'municipality',
  'district',
  'state',
  'postcode',
];

export const CENTER_OF_UKRAINE: [number, number] = [50.4501, 30.5234];

export const SCALE = {
  COUNTRY: 6,
  BUILDING: 15,
};
