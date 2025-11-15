export interface Site {
  hostname: string;
  name: string;
}

export interface IndependentSite {
  url: string;
  name: string;
}

export interface FacebookSource {
  id: string;
  name: string;
  reason: string;
}

export const propagandaSites: Site[] = [
  { hostname: "origo.hu", name: "Origo" },
  { hostname: "888.hu", name: "888" },
  { hostname: "ripost.hu", name: "Ripost" },
  { hostname: "pestisracok.hu", name: "Pesti Srácok" },
  { hostname: "vadhajtasok.hu", name: "Vadhajtások" },
  { hostname: "kuruc.info", name: "Kuruc.info" },
  { hostname: "mandiner.hu", name: "Mandiner" },
  { hostname: "magyarnemzet.hu", name: "Magyar Nemzet" },
  { hostname: "hirado.hu", name: "Híradó" },
  { hostname: "metropol.hu", name: "Metropol" },
  { hostname: "lokalpiac.hu", name: "Lokál" },
  { hostname: "borsonline.hu", name: "Bors" },
  { hostname: "magyaridok.hu", name: "Magyar Idők" }
];

export const independentSites: IndependentSite[] = [
  { url: "https://telex.hu", name: "Telex" },
  { url: "https://444.hu", name: "444" },
  { url: "https://24.hu", name: "24.hu" },
  { url: "https://hvg.hu", name: "HVG" },
  { url: "https://index.hu", name: "Index" },
  { url: "https://nepszava.hu", name: "Népszava" },
  { url: "https://merce.hu", name: "Mérce" },
  { url: "https://atlatszo.hu", name: "Átlátszó" },
  { url: "https://direkt36.hu", name: "Direkt36" },
  { url: "https://azonnali.hu", name: "Azonnali" },
  { url: "https://rtl.hu/hirek", name: "RTL Hírek" },
  { url: "https://szabadeuropa.hu", name: "Szabad Európa" }
];

export const facebookBlacklist: FacebookSource[] = [
  // Government politicians - real page IDs
  { id: "zoltanspox", name: "Kovács Zoltán", reason: "kormányzati szóvivő" },
  { id: "kocsis.mate.official", name: "Kocsis Máté", reason: "kormányzati politikus" },
  { id: "rogan.antal.official", name: "Rogán Antal", reason: "kormányzati politikus" },
  { id: "nemeth.szilard.fidesz", name: "Németh Szilárd", reason: "kormányzati politikus" },
  { id: "hollik.istvan", name: "Hollik István", reason: "kormányzati kommunikátor" },
  { id: "GulyasGergely", name: "Gulyás Gergely", reason: "kormányzati politikus" },
  { id: "vargajudit", name: "Varga Judit", reason: "kormányzati politikus" },
  { id: "szijjarto.peter.official", name: "Szijjártó Péter", reason: "kormányzati politikus" },
  { id: "takacs.szabolcs.official", name: "Takács Szabolcs", reason: "kormányzati kommunikátor" },
  
  // Media pages - real page IDs
  { id: "origohirek", name: "Origo", reason: "kormányközeli média" },
  { id: "888.hu", name: "888.hu", reason: "kormányközeli média" },
  { id: "ripost.hu", name: "Ripost", reason: "kormányközeli média" },
  { id: "pestisracok", name: "Pesti Srácok", reason: "kormányközeli média" },
  { id: "vadhajtasok.hu", name: "Vadhajtások", reason: "kormányközeli média" },
  { id: "magyarnemzet", name: "Magyar Nemzet", reason: "kormányközeli média" },
  { id: "mandiner", name: "Mandiner", reason: "kormányközeli média" },
  { id: "hirado.hu", name: "Híradó", reason: "kormányközeli média" },
  { id: "metropolhungary", name: "Metropol", reason: "kormányközeli média" },
  { id: "lokalpiac", name: "Lokál", reason: "kormányközeli média" },
  
  // Additional known sources
  { id: "FideszHU", name: "Fidesz", reason: "kormányzó párt" },
  { id: "KormanyZH", name: "Kormany.hu", reason: "kormányzati oldal" }
];

export const independentFacebookPages: FacebookSource[] = [
  { id: "telexhu", name: "Telex", reason: "független média" },
  { id: "444.hu", name: "444", reason: "független média" },
  { id: "24ponthu", name: "24.hu", reason: "független média" },
  { id: "hvghu", name: "HVG", reason: "független média" },
  { id: "indexhu", name: "Index", reason: "független média" },
  { id: "nepszavaofficial", name: "Népszava", reason: "független média" },
  { id: "merce.hu", name: "Mérce", reason: "független média" },
  { id: "atlatszo.hu", name: "Átlátszó", reason: "független oknyomozó portál" },
  { id: "direkt36", name: "Direkt36", reason: "független oknyomozó portál" }
];