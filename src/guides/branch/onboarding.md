# 브랜치 온보딩 가이드

* 작성자 : 손보형
* 업데이트: 2019년 3월 21일
---

## 개요
이 문서는 Branch 온보딩시 필요한 주요한 사항을을 위주로 전반적인 진행순서을 알기쉽게 설명한 문서입니다.
이 문서에서 설명된 내용 이외의 문의들은 담당 Client Success Manager를 통해서 별도 연락 주시기 바랍니다.

## 담당자별 업무소개
* **Account Executive**:
    신규 고객에 대한 세일즈 및 계약을 담당 합니다.
* **Sales Engineer**:
    계약 이전 단계에서 제품의 전반적인 기술사항에 대한 가이드 및 지원을 담당합니다.
* **Client Success Manager (CSM)**
    계약 후 대쉬보드 사용법 및 설정 및 Branch를 통한 전반적인 마케팅 집행에 대한 가이드를 드리며 재계약을 담당합니다.
* **Solutions Engineer & Support Engineer**:
    계약 이후 단계에서 Branch 제품에 대한 연동, 기술문의 ,이슈처리등 전반적인 모든 사항에 대해서 지원을 드립니다.
    모든 문의사항는 support@branch.io로 메일을 보내 주시기 바랍니다.

## 온보딩 순서

### Branch Link에 사용될 도메인
* Branch Link는 앱별로 고유한 도메인을 사용하며, 단축URL과 같은 기능을 지원합니다.
* iOS의 경우에는 기본적으로 애플의 [Universal Links](https://developer.apple.com/ios/universal-links/)를 사용하시게 됩니다.
* **`app.link`도메인 사용**
    * 대쉬보드를 통한 앱등록 과정에서 기본적으로는 `asdf.app.link`와 같이 랜덤한 `app.link`의 하위의 서브도메인이 할당됩니다.
    * 원하시는 경우 **미사용**중인 `app.link`의 서브도메인 중에서 선택하실 수 있습니다. 예) `myapp.app.link`

        !!! tip "앱등록 이전에 앱별로 미리 사용할 서버도메인 이름을 정해 두시는 것을 권장드립니다."

* **회사 도메인의 서브도메인 사용하기**
    * 사용자가 문자, SNS등으로 브랜치링크를 받았을때 해당 링크를 신뢰하고 클릭할 수 있도록 `myapp.mycompany.com`과 같이 회사의 도메인의 서브도메인을 Branch Link에 사용하실 수 있으며, 브랜치링크를 광고용으로만 사용하셔서 사용자에게 링크가 직접 노출되지 않는 경우가 아니라면 회사 도메인의 서브도메인을 앱별로 사용하시는것이 권장됩니다.
    * 이를 위해서는 회사IT팀에서 해당 서브도메인을 `CNAME`레코드를 `custom.bnc.lt`로 설정 해주시는 간단한 작업입니다.
        * 회사의 도메인을 Branch에서 사용하게 되는 것이기 때문에 일반적으로 사내 IT팀에서 할당전 사전 검토가 필요할 것입니다.
    * 관련된 자세한 사항은 아래의 문서에 설경되어 있습니다.
    * [Link Settings : Advanced Settings Configuration](https://docs.branch.io/links/advanced-settings-configuration/#use-custom-subdomain)


### Persona 임포트
* **Branch를 사용하시기 이전에 이미 앱이 마켓에 릴리즈되어 이미 많은 인스톨이 발생되어 있는 경우에만 필요**하며, 해당 기기들에 대한 광고아이디를 보유하고 계셔야 합니다.
* 이미 인스톨한 기기들의 광고아이디를 확보하지 못한 경우 Branch SDK를 연동한 앱을 미리 라이브 시키고 인스톨 추이를 확인하시면서 기존 인스톨 사용자들의 앱업데이트 추이를 대략적으로 확인할 수 있습니다. Universal Ads를 사용하시는 고객분들은 기존 인스톨했던 유저들로 부터 인스톨이 대부분 발생한 것을 확인 후 광고캠페인을 집행 하시기 바랍니다.
* Persona임포트는 이미 인스톨이 발생한 기기의 광고아이디및 추가정보들을 시스템에 임포트 하는 작업이며, 이후 Branch SDK가 연동된 앱이 릴리즈된 후 이미 임포트된 기기인 경우 해당 릴리즈로 사용자가 앱업데이트를 할때 인스톨이 발생하지 않게 됩니다.
* Persona임포트를 진행하시기 위해서는 CSM팀 또는 서포트팀(`support@branch.io`)으로 연락주시기 바랍니다.
* 자세한 사항은 아래의 문서를 참고해주시기 바랍니다.
    * [Importing Historical User Data](https://docs.branch.io/dashboard/importing-historical-user-data/)

    !!! tip "Attribution Analystics에서 마이그래이션된 앱의 경우 마이그레이션 과정중에 Persona임포트가 수행되므로 별도 Persona임포트가 필요하지 않습니다."

### 대쉬보드 광고 계정 설정
* CSM팀으로부터 가이드를 받으시길 바랍니다.
* 관련 내용은 아래의 페이지를 참고해주시기 바랍니다.
    * [Account Settings](https://docs.branch.io/dashboard/account-settings/)

### 트래킹할 이벤트 선정
* 마케팅팀과 개발팀이 함께 작업하셔야 하는 부분입니다.
* 마케팅팀은 마케팅효율을 측정하기 위한 이벤트를 선정하셔야하며, 개발팀에서도 트래킹이 필요한 이벤트들을 추가 하실 수 있습니다.
* **개인정보에 관련된 정보들은 가급적으로 설정하지 않으시는것을 권장드리며, 개인정보로 판단될수 있는 정보를 이벤트에 설정시 사내 개인정보 관련부서의 리뷰를 받으시는 것을 권장드립니다.**
* **개발팀에서는 이벤트연동시 사내 개인정보관련팀에서 검토후 명확히 설정을 요청받은 정보들만 설정하시고, 요청되지 않은 정보를 개인적인 판단으로 설정하시는것은 지양해 주시기 바랍니다.**
* Branch에서 수집하는 정보들과 개인정보 정책은 아래의 문서를 참고 해주시기 바랍니다.
    * [Branch의 개인정보 정책](https://branch.io/policies/#privacy)

* [이벤트 연동 가이드(작업중)](event-guide.md)

### Branch SDK 연동
* 아래의 SDK 연동 가이드를 참고해 주시기 바랍니다.
    * [Android SDK 연동 가이드 (드래프트)](android-sdk.md)
    * [iOS SDK 연동 가이드 (작업중)](ios-sdk.md)
    * [Web SDK 연동 가이드 (작업중)](web-sdk.md)
* GDPR및 개인정보 보호관련 법규를 준수 관련
    * Branch SDK에서는 특정 사용자를 트래킹하지 않기위한 방법이 제공됩니다.
        * **SDK의 `Do Not Track Mode`를 활성화 하시면 Branch SDK에서 Branch 서버로 해당 사용자/기기의 데이터가 전송되지 않습니다.**
            * [Android SDK](https://docs.branch.io/apps/android/#enable-disable-user-tracking),
              [iOS SDK](https://docs.branch.io/apps/ios/#enable-disable-user-tracking),
              [Web SDK](https://docs.branch.io/web/integrate/#enable-disable-user-tracking)
        * 사용자가 요청시 해당 사용자의 데이터의 수집을 앱단에서 중단시키기 위해서 SDK에서 `Do Not Track Mode` 기능을 앱단에서 활성화 해주시는 부분을 사용 하실 수 있습니다.
        * 단, `Do Not Track Mode`이 활성화된 기기의 경우에도 Branch Link는 동작합니다만 딥링킹의 정확도가 낮아질 수 있습니다.


### Branch SDK 연동중 또는 연동후 테스트
* [테스트 가이드 (작업중)](test-guide.md)

### 포스트백 설정
* 주로 Universal Ads 고객분들께 적용됩니다.
* 앱의 모든 이벤트에 대해서 내부 데이터 시스템또는 광고매체로 준실시간 포스트백을 각각의 이벤트의 발생을 알려줄 수 있습니다.

### Branch 데이터 익스포트
* Branch 시스템은 딥링킹 플랫폼이면서 다양한 채널로부터의 사용자 유입및 이후 행동을 측정하고 분석을 도와주는 플랫폼 입니다.
* DataFeeds 제품(유료상품)을 통해서 Branch 시스템내에 있는 데이터를 고객사의 시스템으로 익스포트 하실 수 있습니다.
* Branch는 GDPR및 다양한 국제적인 개인정보보호 관련 법률들과 함께 Facebook등 몇몇 파트너의 개인정보보호관련 요구사항들을 준수해야 하므로
   데이터 프로세서(Data Processor)의 입장에서 수집된 데이터를 원본그대로 장기간 저장하는 것에 제약이 있습니다.
   그러므로 Branch를 통해서 수집된 데이터로 다양한 장기/단기 분석을 원하시는 경우 Data Feeds를 통해 내부 데이터웨어하우스에 저장하시는 것을 권장드립니다.
* Branch에서는 고객사에서 데이터를 효과적으로 익스포트 하실 수 있도록 가이드및 지원을 드리고 있습니다.
* [Data Feeds](../data_feeds/index.md)
