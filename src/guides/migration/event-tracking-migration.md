# TUNE=>Branch Event 연동 마이그레이션 가이드

    Modified on: Mar 21, 2019
---

이 문서는 TUNE SDK에서 Branch SDK로 변경하시는 경우 기존 TUNE SDK에 의해서 기록된 로그와 Branch SDK에서 기론된 로그가 동일하게 저장될 수 있도록 설명드리는 가이드입니다.

## 마이그레이션 관련 API필드와 SDK메소드 맵핑문서 별도 제공 공지
* TUNE Reporting API, Branch Custom Export API(TUNE과의 호환성을 위해 별도 구현된 API, `branch_redirect=3`), Branch Export API간의 필드 맵핑과 Branch/TUNE SDK간 메쏘드 맵핑문서는 별도로 bson@branch.io로 메일 주시면 전달드리겠습니다.

## 참고 문서
* [V2 Event](https://docs.branch.io/apps/v2event/) : V2 이벤트
* [Event Ontology Data Schema](https://docs.branch.io/exports/event_ontology_data_schema/#event-ontology-data-schema) : Branch 이벤트 데이터 스키마

## Branch의 이벤트분류(Event Category) 및 이벤트이름
- TUNE에서는 모든 (인스톨이후)이벤트가 하나의 데이터 소스인 Event Log에 포함 되었지만 Branch에서는 이벤트를 4가지로 분류하며 로그익스포트시에도 각각 익스포트 합니다.

    | Branch 이벤트 카테고리 | EO 데이터소스 |
    |    :---:   |     :---:   |
    | User lifecycle Event | eo_user_lifecycle_event |
    | Content Event | eo_content_event |
    | Commerce Event | eo_commerce_event |
    | Custom Event | eo_cucstom_event |

- **이벤트 네임**
    - Branch에서는 Custom 이벤트 카테고리가 아닌 표준이벤트의 경우 이벤트 이름은 대문자로 설정됩니다. 아래의 표를 참고하세요.
    - **표준이벤트에 대해서는 실제 이벤트 연동시에는 (오타방지를 위해서) 아래의 문자열 대신 클래스에 선언된 Constant를 사용해주시는 것이 권장됩니다.**

        | Branch SDK | 이벤트명 상수 정의 |
        |    :---:   |     :---:   |
        | Android | [BRANCH_STANDARD_EVENT.java](https://github.com/BranchMetrics/android-branch-deep-linking/blob/e8fa5f4f6b119156405779bc792f7573878afeb6/Branch-SDK/src/io/branch/referral/util/BRANCH_STANDARD_EVENT.java) |
        | iOS | [BranchEvent.m](https://github.com/BranchMetrics/ios-branch-deep-linking/blob/faada7bfdd643f899f39c9afaf3a8369d74dd4f8/Branch-SDK/Branch-SDK/BranchEvent.m) |

    - TUNE에서 마이그레이션 된앱의 경우  Branch Custom(TUNE호환) Export API이 아닌 Branch Export API로 익스포트시 이름이 대문자로 설정됩니다.
        - 예) TUNE 이벤트 네임: `purchase`, Branch 이벤트 네임: `PURCHASE`
    - Branch 이벤트 로그에서 이벤트의 이름은 `name` 필드에 설정됩니다.
    - Branch 이벤트 로그에서 TUNE에서 마이그레이션된 이벤트의 이름은 `customer_event_alias` 필드에 별도로 설정됩니다.

    !!! warning "TUNE에서 마이그레이션 된 앱인 경우, TUNE호환성을 위해 제공되는 추가필드들을 익스포트하는 방법"
        Branch Export API에서 로그 익스포트시 기본설정상 `customer_event_alias`과 같은 TUNE호환 필드들은 익스포트 되지않습니다.
        별도로 서포트팀을 통해서 요청을 주시면 해당 필드들이 추가로 익스포트가 가능합니다.

- **User lifecycle Event** : 사용자가 앱을 사용하면서 어떤 단계별로 발생되는 이벤트

    | Branch 이벤트네임 | TUNE 이벤트네임 |
    |    :---:   |     :---:   |
    | COMPLETE_REGISTRATION | registration |
    | LOGIN | login |
    | INVITE | invite |
    | COMPLETE_TUTORIAL | tutorial_complete |
    | ACHIEVE_LEVEL | level_achieved |
    | UNLOCK_ACHIEVEMENT | achievement_unlocked |

- **Content Event** : 앱내 컨텐츠에 관련된 이벤트

    | Branch 이벤트네임 | TUNE 이벤트네임 |
    |    :---:   |     :---:   |
    | VIEW_ITEM | content_view |
    | SEARCH | search |
    | RATE | rated |

- **Commerce Event** : 상품 구매에 관련된 이벤트

    | Branch 이벤트네임 | TUNE 이벤트네임 |
    |    :---:   |     :---:   |
    | ADD_TO_CART | add_to_cart |
    | ADD_TO_WISHLIST | add_to_wishlist |
    | VIEW_CART | N/A |
    | INITIATE_PURCHASE | checkout_initiated |
    | ADD_PAYMENT_INFO | added_payment_info |
    | PURCHASE | purchase |
    | SPEND_CREDITS | spent_credits |

- **Custom Event** : 위의 표준이벤트에 속하지 않는 이벤트들


## TUNE 이벤트타입 처리에 따른 주의사항
- TUNE에서는 이벤트별로 이벤트타입(Event Type)을 대쉬보드 상에서 설정할 수 있었습니다. 이는 Branch의 이벤트분류(Event Category)와 유사합니다만 일치하지는 않습니다.
- **마이그레이션 과정에서 일부 TUNE이벤트의 경우** TUNE 이벤트네임이 Branch의 이벤트네임 네임으로 사용되지 않고 **TUNE 이벤트타입이 Branch 이벤트네임으로 사용될수 있습니다.**
  단, TUNE 이벤트네임은 Branch로그에서 `customer_event_alias`에 별도로 저장되므로 익스포트 가능합니다.
- 아래의 예를 참고 하시기 바랍니다.
    - `buy`이벤트는 이름은 `purchase`가 아니나 TUNE이벤트타입에 의해서 Branch의 구매이벤트로 기록됩니다.
    - **`logout`이벤트는 TUNE이벤트타입이 `login`이기 때문에 Branch의 'LOGIN'이벤트로 기록됩니다. 단, 원래이름은 `customer_event_alias` 필드로 알수 있습니다.**

    | TUNE 이벤트네임 | TUNE 이벤트타입 | Branch 이벤트네임 `name` | Branch `customer_event_alias` | Branch 데이터소스 |
    |    :---:   |     :---:   |     :---:   |     :---:   |     :---:   |
    |  purchase | purchase | PURCHASE | purchase | eo_commerce_event |
    |  **buy** | **purchase** | **PURCHASE** | buy | **eo_commerce_event** |
    |  login | login | LOGIN | login | eo_user_lifecycle_event |
    |  **logout** | **login** | **LOGIN** | logout | **eo_user_lifecycle_event** |
    |  **auto-login** | **login** | **LOGIN** | auto-login | **eo_user_lifecycle_event** |
    |  logout | **generic** | **logout** | logout | **eo_custom_event** |
    |  auto-login | **generic** | **auto-login** | auto-login | **eo_custom_event** |


## TUNE의 이벤트아이템과 Branch의 컨텐츠 아이템
- TUNE의 이벤트아이템은 Branch의 컨텐츠아이템으로 맵핑됩니다.
- TUNE에서는 이벤트아이템은 별도의 리포트였으나 Branch에서는 이벤트로그내의 `content_items[]`에 포함되어있습니다.
- Branch에서는 디폴트로 `content_items[]`은 비어서 익스포트 되며, 컨텐츠아이템을 포함해서 익스포트 하기위해서는 서포트팀을 통해서 별도 요청을 해주셔야 합니다.


## 구현 샘플
- 이벤트 연동시 아래의 샘플을 참고해서 구현 하시기 바랍니다.


## Registration : 회원가입 완료
- 이벤트 전송시점
    - 앱설치후 1회에 한대 사용자가 회원가입을 완료한 시점에 전송하세요.
- 이벤트에 포함되는 정보
    - 없음.
- 참고사항
    - TUNE에서의 이벤트네임은 `registration` 이지만 Branch에서는 이벤트네임이 `COMPLETE_REGISTRATION`으로 설정됩니다.
    - Branch로그에서도 `customer_event_alias`를 통해서 TUNE SDK에서 실제로 설정한 이벤트네임을 확인할 수 있습니다.

- **TUNE SDK**
    - *Java*

        ```java
        Tune tune = Tune.getInstance();
        TuneEvent event = new TuneEvent(TuneEvent.REGISTRATION);
        tune.measureEvent(event);
        ```

    - *Objective-C*

        ```objc
        TuneEvent *event = [TuneEvent eventWithName:TUNE_EVENT_REGISTRATION];
        [Tune measureEvent:event];
        ```

- **Branch SDK**
    - *Java*

        ```java
        new BranchEvent(BRANCH_STANDARD_EVENT.COMPLETE_REGISTRATION)
            .logEvent(context);
        ```

    - *Objective-C*

        ```objc
        BranchEvent *event = [BranchEvent standardEvent:BranchStandardEventCompleteRegistration];
        [event logEvent];
        ```

## Login : 로그인 완료
- 이벤트 전송 시점.
    - 사용자가 로그인에 성공할 경우 전송하세요.
- 이벤트에 포함되는 정보
    - 없음.
    - 필요에 따라 로그인 성공시 해당 사용자의 유저아이디 또는 해슁된 유저아이디를 설정할 수도 있으며, 유저 아이디 설정은 이 문서 하단을 참고해 주시기 바랍니다.
- 참고사항
    - TUNE에서의 이벤트네임은 `login` 이지만 Branch에서는 이벤트네임이 `LOGIN`으로 설정됩니다.
    - Branch로그에서도 `customer_event_alias`를 통해서 TUNE SDK에서 실제로 설정한 이벤트네임을 확인할 수 있습니다.

    !!! warning "TUNE에서 자동로그인, 로그아웃 이벤트의 이벤트 타입을 `login`으로 설정한 경우"
        Branch Export API의 로그에서 `name`이 이벤트 타입으로 인해 `LOGIN`으로 설정됩니다.
        하지만 `customer_event_alias`필드에서 TUNE에서 사용한 실제 이벤트이름이 설정되므로 이를 사용해서 TUNE에서 설정한 이름을 확인할 수 있습니다.

    !!! tip "자동로그인(`auto-login`), 로그아웃(`logout`) 이벤트 트래킹"
        표준 이벤트인 `LOGIN`이벤트는 User Lifecycle로 분류되지만 다른 이벤트들은 Custom 카테고리로 분류됩니다.
        예를들어 비표준이벤트인 `logout`의 경우 iOS에서는 `[BranchEvent customEventWithName:@"logout"]`라는 별도 메쏘드를 사용하세요.


- **TUNE SDK**
    - *Java*

        ```java
        Tune tune = Tune.getInstance();
        TuneEvent event = new TuneEvent(TuneEvent.LOGIN);
        tune.measureEvent(event);
        ```

    - *Objective-C*

        ```objc
        TuneEvent *event = [TuneEvent eventWithName:TUNE_EVENT_LOGIN];
        [Tune measureEvent:event];
        ```

- **Branch SDK**
    - *Java*

        ```java
        new BranchEvent(BRANCH_STANDARD_EVENT.LOGIN)
            .logEvent(context);

        ```

    - *Objective-C*

        ```objc
        BranchEvent *event = [BranchEvent standardEvent:BranchStandardEventLogin]; // 에러발생시 iOS SDK를 최신버전으로 업데이트 해주세요.
        [event logEvent];
        ```

## Purchase : 구매완료
- 이벤트 전송시점
    - 구매가 완료된 시점에 전송해주세요.
- 이벤트에 포함되는 정보
    - Event:
        - revenue : 매출액을 설정하세요.
        - currency code : 통화코드, . [ISO 4217 3-character 대문자](https://en.wikipedia.org/wiki/ISO_4217)
        - advertiser ref id : 해당 구매에 고유하게 할당된 오더/영수증/구매 ID를 설정하세요.
        - (참고 예) attribute1 : 구매시 적용된 쿠폰번호
    - Event Item :
         - name : 제품 아이디/코드
         - unit price : 해당 아이템의 단가
         - quantity : 해당 아이템 갯수
         - revenue : 설정하지 않으면 unit price * quantity로 자동 계산
         - *(참고 예) attribute1 : 제품의 대분류 아이디*
- 참고사항
    - TUNE에서의 이벤트네임은 `purchase` 이지만 Branch에서는 이벤트네임이 `PURCHASE`로 설정됩니다.
    - Branch로그에서도 `customer_event_alias`를 통해서 TUNE SDK에서 실제로 설정한 이벤트네임을 확인할 수 있습니다.
- 주의사항
    - TUNE에서는 이벤트에만 통화코드를 설정했지만, Branch에서는 이벤트와 BranchUniversalObject에 모두 통화코드를 설정하세요.

    !!! warning "매출액 설정"

        이벤트 아이템에 설정된 상품가격의 합산액이 이벤트의 매출액에 자동으로 계산되지 않으므로 이벤트에도 별도로 매출액을 설정합니다.


- **TUNE SDK**
    - *Java*

        ```java
        Tune tune = Tune.getInstance();
        ArrayList<TuneItem> itemList = new ArrayList<TuneEventItem>();
        TuneEventItem item1 = new TuneEventItem(“ProductID1111”)
                                    .withQuantity(2)
                                    .withUnitPrice(1000.0)
                                    .withAttribute1("Snack"); // sample code for attribute1
        itemList.add(item1);
        TuneEventItem item2 = new TuneEventItem(“ProductID2222”)
                                      .withQuantity(1)
                                      .withUnitPrice(1000.0)
                                      .withAttribute1("Fruit"); // sample code for attribute1
        itemList.add(item2);

        TuneEvent event = new TuneEvent(TuneEvent.PURCHASE)
                                .withEventItems(itemList)
                                .withRevenue(3000.0)
                                .withCurrencyCode(“KRW”)
                                .withAdvertiserRefId(“OrderID_1234-ABCD”)
                                .withAttribute1("Coupon0001"); // sample code for attribute1
        tune.measureEvent(event);
        ```

    - *Objective-C*

        ```objc
        NSMutableArray items = [NSMutableArray array];
        TuneEventItem item1 =
            [TuneEventItem eventItemWithName:@“ProductID1111” unitPrice:1000.0 quantity:2];
        item1.attribute1 = @"Snack"; // sample code for attribute1
        [items addObject:item1];
        TuneEventItem item2 =
            [TuneEventItem eventItemWithName:@“ProductID2222” unitPrice:1000.0 quantity:1];
        item2.attribute1 = @"Fruit";  // sample code for attribute1
        [items addObject:item2];

        TuneEvent *event = [TuneEvent eventWithName:TUNE_EVENT_PURCHASE];
        event.eventItems = items;
        event.revenue = 50.0;
        event.currencyCode = @“USD”;
        event.refId = @“OrderID_1234-ABCD”;
        event.attribute1 = @"Coupon00001"; // sample code for attribute1
        [Tune measureEvent:event];
        ```

- **Branch SDK**
    - *Android*

        ```java
        BranchUniversalObject buo1 = new BranchUniversalObject()
            .setContentMetadata(
                new ContentMetadata()
                    .setProductName("ProductID1111")
                    .setPrice(1000.0, CurrencyType.KRW)
                    .setQuantity(2.0)
                    .addCustomMetadata("sub1", "Snack")
        );
        BranchUniversalObject buo2 = new BranchUniversalObject()
            .setContentMetadata(
                  new ContentMetadata()
                      .setProductName("ProductID2222")
                      .setPrice(1000.0, CurrencyType.KRW)
                      .setQuantity(1.0)
                      .addCustomMetadata("sub1", "Fruit")
        );

        new BranchEvent(BRANCH_STANDARD_EVENT.PURCHASE)
            .setRevenue(3000.0)
            .setCurrency(CurrencyType.KRW)
            .setTransactionID("OrderID_1234-ABCD")
            .addCustomDataProperty("attribute_sub1", "Coupon0001")
            .addContentItems(buo1, buo2)
            .logEvent(context);
        ```

    - *iOS*

        ```objc
        // Create a BranchUniversalObject with your content data:
        BranchUniversalObject *buo1 = [BranchUniversalObject new];
        buo1.contentMetadata.productName       = @"ProductID1111";
        buo1.contentMetadata.price             = [NSDecimalNumber decimalNumberWithString:@"1000.0"];
        buo1.contentMetadata.quantity          = 2.0;
        buo1.contentMetadata.currency          = BNCCurrencyKRW;
        buo1.contentMetadata.customMetadata = (NSMutableDictionary*) @{ @"sub1": @"Snack" };

        BranchUniversalObject *buo2 = [BranchUniversalObject new];
        buo2.contentMetadata.productName       = @"ProductID1111";
        buo2.contentMetadata.price             = [NSDecimalNumber decimalNumberWithString:@"1000.0"];
        buo2.contentMetadata.quantity          = 1.0;
        buo2.contentMetadata.currency          = BNCCurrencyKRW;
        buo2.contentMetadata.customMetadata = (NSMutableDictionary*) @{ @"sub1": @"Fruid" };

        // Create an event and add the BranchUniversalObject to it.
        BranchEvent *event     = [BranchEvent standardEvent:BranchStandardEventPurchase];

        // Add the BranchUniversalObjects with the content:
        event.contentItems     = (id) @[ buo1, buo2 ];
        // Add relevant event data:
        event.transactionID    = @"OrderID_1234-ABCD";
        event.revenue          = [NSDecimalNumber decimalNumberWithString:@"3000.0"];
        event.currency         = BNCCurrencyKRW;
        event.customData       = (NSMutableDictionary*) @{ @"attribute_sub1": @"Coupon0001" };
        [event logEvent];
        ```


## Content View : 컨텐츠/상품상세 보기
- 이벤트 전송시점
    - 사용자가 제품의 상세페이지를 확인할 경우 전송하세요.
- 이벤트에 포함되는 정보
    - 이벤트
        - 통화코드
    - 이벤트아이템
        - 상품 아이디/코드
        - 갯수
        - 단가
- 참고사항
    - TUNE에서의 이벤트네임은 `countent_view` 이지만 Branch에서는 이벤트네임이 `VIEW_ITEM`으로 설정됩니다.
    - Branch로그에서도 `customer_event_alias`를 통해서 TUNE SDK에서 실제로 설정한 이벤트네임을 확인할 수 있습니다.

- **TUNE SDK**
    - *Java*

        ```java
        Tune tune = Tune.getInstance();
        ArrayList<TuneItem> itemList = new ArrayList<TuneEventItem>();
        TuneEventItem item1 = new TuneEventItem(“ProductID1111”)
                                    .withQuantity(1)
                                    .withUnitPrice(1000.0);
        itemList.add(item1);

        TuneEvent event = new TuneEvent(TuneEvent.CONTENT_VIEW)
                                .withEventItems(itemList)
                                .withCurrencyCode(“KRW”);
        tune.measureEvent(event);
        ```

    - *Objective-C*

        ```objc
        NSMutableArray items = [NSMutableArray array];
        TuneEventItem item1 =
            [TuneEventItem eventItemWithName:@“ProductID1111” unitPrice:1000.0 quantity:1];
        [items addObject:item1];

        TuneEvent *event = [TuneEvent eventWithName:TUNE_EVENT_CONTENT_VIEW];
        event.eventItems = items;
        event.currencyCode = @“USD”;
        [Tune measureEvent:event];
        ```

- **Branch SDK**
    - *Android*

        ```java
        BranchUniversalObject buo = new BranchUniversalObject()
            .setContentMetadata(
                new ContentMetadata()
                    .setProductName("ProductID1111")
                    .setPrice(1000.0, CurrencyType.KRW)
                    .setQuantity(1.0)
            );

        new BranchEvent(BRANCH_STANDARD_EVENT.VIEW_ITEM)
            .addContentItems(buo)
            .logEvent(context);

        ```

    - *iOS*

        ```objc
        BranchUniversalObject *buo = [BranchUniversalObject new];
        buo.contentMetadata.productName       = @"ProductID1111";
        buo.contentMetadata.price             = [NSDecimalNumber decimalNumberWithString:@"1000.0"];
        buo.contentMetadata.quantity          = 1.0;
        buo.contentMetadata.currency          = BNCCurrencyKRW;

        BranchEvent *event     = [BranchEvent standardEvent:BranchStandardEventViewItem];
        event.contentItems     = (id) @[ buo ];
        event.currency         = BNCCurrencyKRW;
        [event logEvent];
        ```

## Add To Cart
- 이벤트 전송시점
    - 사용자가 상품을 장바구니에 넣을 경우 전송하세요.
- 이벤트에 포함되는 정보
    - 이벤트
        - 통화코드
    - 이벤트아이템
        - 상품 아이디/코드
        - 갯수
        - 단가
        - (참고 예) attribute1: 특정값 설정
- 참고사항
    - TUNE에서의 이벤트네임은 `add_to_cart` 이지만 Branch에서는 이벤트네임이 `ADD_TO_CART`으로 설정됩니다.
    - Branch로그에서도 `customer_event_alias`를 통해서 TUNE SDK에서 실제로 설정한 이벤트네임을 확인할 수 있습니다.

- **TUNE SDK**
    - *Java*

        ```java
        Tune tune = Tune.getInstance();
        ArrayList<TuneItem> itemList = new ArrayList<TuneEventItem>();
        TuneEventItem item1 = new TuneEventItem(“ProductID1111”)
                                    .withUnitPrice(1000.0)
                                    .withQuantity(1)
                                    .withAttribute1("abcd");
        itemList.add(item1);

        TuneEvent event = new TuneEvent(TuneEvent.ADD_TO_CART)
                                .withEventItems(itemList)
                                .withCurrencyCode(“KRW”);
        tune.measureEvent(event);
        ```

    - *Objective-C*

        ```objc
        NSMutableArray items = [NSMutableArray array];
        TuneEventItem item1 =
            [TuneEventItem eventItemWithName:@“ProductID1111” unitPrice:1000.0 quantity:1];
        item1.attribute1 = @"abcd";
        [items addObject:item1];

        TuneEvent *event = [TuneEvent eventWithName:TUNE_EVENT_ADD_TO_CART];
        event.eventItems = items;
        event.currencyCode = @“KRW”;
        [Tune measureEvent:event];
        ```

- **Branch SDK**
    - *Android*

        ```java
        BranchUniversalObject buo = new BranchUniversalObject()
                .setContentMetadata(
                        new ContentMetadata()
                                .setProductName("ProductID1111")
                                .setPrice(1000.0, CurrencyType.KRW)
                                .setQuantity(1.0)
                                .addCustomMetadata("sub1", "abcd")
                                );

        new BranchEvent(BRANCH_STANDARD_EVENT.ADD_TO_CART)
                .addContentItems(buo)
                .logEvent(context);

        ```

    - *iOS*

        ```objc
        BranchUniversalObject *buo = [BranchUniversalObject new];
        buo.contentMetadata.productName       = @"ProductID1111";
        buo.contentMetadata.price             = [NSDecimalNumber decimalNumberWithString:@"1000.0"];
        buo.contentMetadata.quantity          = 1.0;
        buo.contentMetadata.currency          = BNCCurrencyKRW;
        buo.contentMetadata.customMetadata    = (NSMutableDictionary*) @{ @"sub1": @"abcd" };

        BranchEvent *event     = [BranchEvent standardEvent:BranchStandardEventAddToCart];
        event.contentItems     = (id) @[ buo ];
        event.currency         = BNCCurrencyKRW;
        [event logEvent];
        ```


## Search : 검색
- 이벤트 전송시점
    - 사용자가 검색후 상품이 노출되었을때 노출상위 5개의 상품정보를 포함해서 전송하세요.
- 이벤트에 포함되는 정보
    - 이벤트
        - 통화코드
        - search string
    - 이벤트아이템
        - 상품 아이디/코드
        - 갯수
        - 단가
- 참고사항
    - TUNE에서의 이벤트네임은 `search` 이지만 Branch에서는 이벤트네임이 `SEARCH`로 설정됩니다.

- **TUNE SDK**
    - *Java*

        ```java
        Tune tune = Tune.getInstance();
        ArrayList<TuneItem> itemList = new ArrayList<TuneEventItem>();
        TuneEventItem item1 = new TuneEventItem(“Banana_ID1111”)
                                    .withQuantity(1)
                                    .withUnitPrice(1000.0);
        itemList.add(item1);

        TuneEvent event = new TuneEvent(TuneEvent.SEARCH)
                                .withEventItems(itemList)   // Add top N search results
                                .withCurrencyCode("KRW")
                                .withSearchString("Fruit"); // Optional
        tune.measureEvent(event);
        ```

    - *Objective-C*

        ```objc
        NSMutableArray items = [NSMutableArray array];
        TuneEventItem item1 =
            [TuneEventItem eventItemWithName:@“Banana_ID1111” unitPrice:1000.0 quantity:1];
        [items addObject:item1];

        TuneEvent *event = [TuneEvent eventWithName:TUNE_EVENT_SEARCH];
        event.eventItems = items;      // Add top N search results
        event.currencyCode = @KRW;
        event.searchString = @"Fruit"; // Optional
        [Tune measureEvent:event];
        ```

- **Branch SDK**
    - *Android*

        ```java
        BranchUniversalObject buo = new BranchUniversalObject()
        .setContentMetadata(
                new ContentMetadata()
                        .setProductName("Banana_ID1111")
                        .setPrice(1000.0, CurrencyType.KRW)
                        .setQuantity(1.0)
        );
        new BranchEvent(BRANCH_STANDARD_EVENT.SEARCH)
            .setSearchQuery("Fruit")
            .addContentItems(buo) // Add top N search results.
            .logEvent(context);
        ```

    - *iOS*

        ```objc
        BranchUniversalObject *buo = [BranchUniversalObject new];
        buo.contentMetadata.productName       = @"Banana_ID1111";
        buo.contentMetadata.price             = [NSDecimalNumber decimalNumberWithString:@"1000.0"];
        buo.contentMetadata.quantity          = 1.0;
        buo.contentMetadata.currency          = BNCCurrencyKRW;

        BranchEvent *event     = [BranchEvent standardEvent:BranchStandardEventSearch];
        event.contentItems     = (id) @[ buo ];
        event.currency         = BNCCurrencyKRW;
        event.searchQuery      = @"Fruit";
        [event logEvent];
        ```

## User ID 설정
- 사용자가 로그인과 로그아웃 할경우에 User ID를 처리합니다.
- **USER ID설정은 꼭 사내에서 개인정보 관련 검토를 받은 경우에만 설정하고, 개발팀에서 임의적으로 설정하지 않습니다.**
- 가급적 UUID형식의 User ID를 설정해 주시기 바랍니다.
- 꼭 원본 User ID를 설정하실 필요는 없으며, 필요시는 해슁된 값을 설정하셔도 됩니다.

- **TUNE SDK**
    - *Java*

        ```java
        ITune tune = Tune.getInstance();
        // 로그인 시
        tune.setUserId("your_user_id");

        // 로그아웃 시
        tune.setUserId("");
        ```

    - *Objective-C*

        ```objc
        // 로그인 시
        [Tune setUserId:@"your_user_id"];

        // 로그아웃 시
        [Tune setUserId:@""];
        ```

- **Branch SDK**
    - *Android*

        ```java
        // 로그인 시
        Branch.getInstance().setIdentity("your_user_id");

        // 로그아웃 시
        Branch.getInstance().logout();
        ```

    - *iOS*

        ```objc
        // 로그인 시
        [[Branch getInstance] setIdentity:@"your_user_id"];

        // 로그아웃 시
        [[Branch getInstance] logout];
        ```
