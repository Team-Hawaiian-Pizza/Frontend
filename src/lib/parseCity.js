// utils/address.js (or ModifyCard.jsx 상단에 선언)
export function splitAddressToProvinceCity(address = "") {
  const s = String(address).trim().replace(/\s+/g, " ");
  if (!s) return { province_name: "", city_name: "" };

  // 1) 앞에서부터 시/도 단위 토큰을 잡음
  // 예) "서울특별시 강남구", "인천광역시 미추홀구", "경기도 성남시 분당구" 등
  const tokens = s.split(" ");
  if (tokens.length === 1) {
    // "서울특별시" 만 있는 경우
    return { province_name: tokens[0], city_name: "" };
  }

  // 시/도 후보 (한글 + '특별시|광역시|특별자치시|특별자치도|도'로 끝나면 대부분 시/도)
  const PROV_RE = /(특별시|광역시|특별자치시|특별자치도|도)$/;

  // 2-1) 첫 토큰이 시/도처럼 끝나면 → 그걸 province로, 나머지에서 첫 구/시/군을 city로
  if (PROV_RE.test(tokens[0])) {
    const province_name = tokens[0];
    // 남은 토큰에서 "구/시/군" 하나를 city로 모음 (두 단어 이상일 수도 있어 fallback)
    const cityIdx = tokens.slice(1).findIndex(t => /(구|시|군)$/.test(t));
    if (cityIdx >= 0) {
      const city_name = tokens[1 + cityIdx];
      return { province_name, city_name };
    }
    // 못 찾으면 두 번째 토큰을 city로 (fallback)
    return { province_name, city_name: tokens[1] || "" };
  }

  // 2-2) 첫 토큰이 시/도가 아니면, 앞의 두 토큰을 묶어 시/도일 수 있음 (예: "경상북도", "제주특별자치도")
  if (tokens.length >= 2 && PROV_RE.test(tokens[0] + tokens[1])) {
    const province_name = tokens[0] + tokens[1];
    const rest = tokens.slice(2);
    const cityIdx = rest.findIndex(t => /(구|시|군)$/.test(t));
    if (cityIdx >= 0) {
      return { province_name, city_name: rest[cityIdx] };
    }
    return { province_name, city_name: rest[0] || "" };
  }

  // 3) 그 밖엔 첫 토큰을 province, 두 번째를 city로 가정
  return { province_name: tokens[0], city_name: tokens[1] || "" };
}
