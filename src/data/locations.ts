/**
 * Store locations — edit this file to add/update outlets.
 */
export type StoreLocation = {
  id: string;
  city: string;
  label?: string;
  address: string;
  phone: string;
  directionsUrl: string;
  image: string;
};

export const storeLocations: StoreLocation[] = [
  {
    id: "satna",
    city: "Satna",
    address:
      "Rewa Rd, in front of gold palace jewellers, Railway Colony, Satna, Madhya Pradesh 485001",
    phone: "7869717041",
    directionsUrl:
      "https://www.google.com/maps?sca_esv=20b4b65056ec4911&sxsrf=APpeQnvQiOLciYVctLGHBWlxrRnzQy2_bw:1783934977440&biw=1920&bih=958&uact=5&gs_lp=Egxnd3Mtd2l6LXNlcnAiCHN2cyBmb29kMgQQIxgnMgQQIxgnMgQQIxgnMgsQLhiABBjHARivATIIEAAYgAQYyQMyBRAAGIAEMgoQABiABBiKBRhDMgUQABiABDIFEAAYgAQyBRAAGIAESLYHUM4DWIgFcAF4AZABAJgByQGgAd4CqgEFMC4xLjG4AQPIAQD4AQGYAgKgAqEBwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAOYAwCIBgGQBgqSBwMxLjGgB8kSsgcDMC4xuAeeAcIHBTAuMS4xyAcJgAgB&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=Kat_2I-bf4Q5MQ9upYRUetQB&daddr=Rewa+Rd,+in+front+of+gold+palace+jewellers,+Railway+Colony,+Satna,+Madhya+Pradesh+485001",
    image: "/images/location.png",
  },
  {
    id: "jabalpur-narmada",
    city: "Jabalpur",
    label: "Bandariya Tiraha",
    address:
      "Ojas Imperia, Bandariya Tiraha, Narmada Rd, Jabalpur, Madhya Pradesh 482001",
    phone: "7869717041",
    directionsUrl:
      "https://www.google.com/maps/dir/24.5597591,80.836723/SVS+FOOD,+Ojas+Imperia,+Bandariya+Tiraha,+Narmada+Rd,+Jabalpur,+Madhya+Pradesh+482001/@23.8542938,79.722748,9z/data=!3m1!4b1!4m17!1m7!3m6!1s0x3981ad6d9df79349:0x1949edf0cd6f0725!2sSVS+FOOD!8m2!3d23.1437071!4d79.9270865!16s%2Fg%2F11q42ws3pg!4m8!1m1!4e1!1m5!1m1!1s0x3981ad6d9df79349:0x1949edf0cd6f0725!2m2!1d79.9270865!2d23.1437071?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D",
    image: "/images/location.png",
  },
  {
    id: "jabalpur-civic",
    city: "Jabalpur",
    label: "Civic Centre",
    address:
      "Civic Centre, Awadhpuri, Marhatal, Jabalpur, Madhya Pradesh 482002",
    phone: "7869717041",
    directionsUrl:
      "https://www.google.com/maps?vet=10CAAQoqAOahcKEwjw6O_-q8-VAxUAAAAAHQAAAAAQFg..i&pvq=Cg0vZy8xMWtrMDh4amh2Ig4KCHN2cyBmb29kEAIYAw&lqi=CiBzdnMgZm9vZCBzYW1kYXJpeWEgbWFsbCBqYWJhbHB1ckj6g7mExLGAgAhaOBAAEAEYABgBGAIYAxgEIiBzdnMgZm9vZCBzYW1kYXJpeWEgbWFsbCBqYWJhbHB1cioGCAIQABABkgEXc2VsZl9zZXJ2aWNlX3Jlc3RhdXJhbnQ&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=in&sa=X&geocode=KTt9o99Ar4E5MUOmIAHn-7dF&daddr=Civik+centre,+Awadhpuri,+Marhatal,+Jabalpur,+Madhya+Pradesh+482002",
    image: "/images/location.png",
  },
];

/** Rough open window for status badge (IST-ish local time). */
export function getStoreStatusLabel(now = new Date()): "Open now" | "Closing soon" | "Closed" {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const mins = hour * 60 + minute;
  const open = 10 * 60; // 10:00
  const closingSoon = 21 * 60 + 30; // 21:30
  const close = 22 * 60 + 30; // 22:30
  if (mins >= open && mins < closingSoon) return "Open now";
  if (mins >= closingSoon && mins < close) return "Closing soon";
  return "Closed";
}
