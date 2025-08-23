// 스탬프/보상 정책 (관리자 화면이 생기면 이 값을 서버에서 주도록 교체)
export const stampConfig = {
  completionCount: 10,                     // Toss: 10개 고정
  accrualRule: "per_order",                // 'per_order' | 'per_item'
  eligible: {                              // 적립 대상
    mode: "all",                           // 'all' | 'exclude'
    excludedProductIds: [],                // mode='exclude'일 때만 사용
    excludedCategoryIds: [],
  },
  reward: {
    // 'discount' | 'gift' (증정=특정 상품 100% 할인 개념)
    type: "discount",
    discount: {
      mode: "percent",                     // 'percent' | 'amount'
      value: 20,                           // 20% (amount면 금액)
      scope: "includeProducts",            // 'all' | 'includeProducts' | 'includeCategories'
      productIds: ["americano", "latte","tea"],
      categoryIds: [],
      applyToOptions: true,                // 옵션에도 할인 적용 (Toss 현재 동작) :contentReference[oaicite:1]{index=1}
    },
    gift: {
      // 증정 대상 선택(여러 개면 가장 비싼 1개만 증정) :contentReference[oaicite:2]{index=2}
      productIds: ["americano", "latte","tea"],
      categoryIds: [],
    },
  },
};
