# TUNE Link 가이드 (마이그레이션 이후)

* 작성자 : 손보형
* 업데이트: 2019년 3월 21일
---

## 개요
Branch로의 마이그레이션 이후에도 TUNE Link는 그대로 동작합니다.
다만 몇가지 제약사항을 고려해서 신규 TUNE Link 생성및 현재 사용중인 TUNE Link 변경에 참고하시기 바랍니다.

## 참고문서
* [Effective TUNE Links](https://help.tune.com/marketing-console/effective-tune-links/) :
    TUNE Link 생성 가이드 (광고주용)
* [Measuring Clicks](https://developers.tune.com/measurement-docs/measuring-clicks/) :
    클릭 측정 가이드 (광고매체용)

## 마이그레이션 관련 유의사항
* TUNE Link는 계속 서비스가 유지되므로 기존에 사용하시고 계시던 Link들과 신규 생성하시는것 모두 동작합니다.
* 브랜치 대쉬보드에서도 TUNE 대쉬보드와 거의 동일한 TUNE Link 생성 페이지가 3월 중으로 제공될 예정입니다.
* 브랜치 대쉬보드에서는 TUNE 대쉬보드의 `PARTNERS - TUNE Links` 페이지에서 확인하실 수 있었던 저장했던 TUNE Link들의 기록을 보는 기능은 제공되지 않으며,
   Branch 대쉬보드에서 신규 생성하신 TUNE Link에 대해서는 저장하는 기능은 지원되지 않습니다.
* Internal Publisher :
    * 마이그레이션 시작 후: TMC 대쉬보드에서 생성하시면 Branch 시스템/대쉬보드로도 자동으로 반영 됩니다.
    * 마이그레이션 완료 이후 : Branch 대쉬보드내 생성 페이지 개발이 완료될 때 까지는 필요시에 별도로 요청해주시면 생성을 해드립니다. 3월중으로 해당 페이지가 개발될 예정입니다.
* **Destination URL & Deep Link URL** :
    * 기존에 이미 생성된 `Destination URL`과 `Deep Link URL`은 계속 사용이 가능하나 신규 생성 기능은 제공되지 않을 예정입니다.
    * Campaign 페이지에서 생성 후 드랍다운 메뉴에서 미리 생성된 URL을 선택하는 방법을 사용하셨던 경우
        * 이 경우 TUNE Link에 선택한 URL의 ID가 `destination_id_{ios|android}` & `invoke_id_{ios|android}`에 설정됩니다.
        * `Destination URL`과 `딥링크 URL`를 TUNE Link에 직접 설정하는 방법으로 변경하셔야 합니다.
            * 이는 `url_{ios|android}` 와 `invoke_url_{ios|android}` 에 URL인코딩 한것을 직접 설정하는 방식입니다.
    * 관련된 자세한 사항은 현재문서 아래에 좀더 자세히 설명되어 있습니다.
* **웹앱 (Web App)**
    * TUNE Link 생성시 PC에서 클릭시 단순 랜딩시킬 목적으로 생성하셨던 웹앱은 마이그레이션 되지 않습니다.
    * 기존에 데스크탑에서 클릭시 특정 웹페이지로 (단순) 랜딩을 시키기 위한 목적의 Web App을 생성하고 TUNE Link에서 해당앱을 선택했던 경우에는 TUNE Link에 `site_id_web=123456` 과 같은 형식으로 파라메터가 추가되었습니다.
    이와 같은 경우 웹앱은 마이그레이션이 되지 않기 때문에 `url_web` 파라메터에 해당 URL을 URL인코딩한다음 TUNE Link에 직접 설정하시면됩니다.


## TUNE Link 구조

```
https://az1-4.tlnk.io/serve?
        action=click&
        site_id_android=142773&site_id_ios=142753&site_id_web=142774
        campaign_id_android=442580&campaign_id_ios=442555&campaign_id_web=442581&
        publisher_id=366935&
        destination_id_android=536339&destination_id_ios=536281&destination_id_web=536340
```

* **베이스 도메인 URL**
    * TUNE 대쉬보드에서 TUNE Link 생성시 아래와 같은 형식으로 생성됩니다.
        ```
        https://az1-4.tlnk.io/serve
        ```
        * `tlnk.io`는 TUNE Link용 도메인이며, `az1-4`와 같은 서브도메인은 앱별로 고유하게 생성된 문자열이 사용됩니다.
    * 광고매체에서 클릭측정을 위한 URL 생성시 아래와 같은 형식으로 베이스 도메인 URL을 생성할 수 있습니다.
        ```
        https://YOUR_PUBLISHER_ID.api-01.com/serve
        ```
        * `YOUR_PUBLISHER_ID`는 해당 광고주 계정에서 매체에게 부여된 ID이며, 동일한 광고매체라도 광고주 별로 각각 다른 ID가 부여됩니다.

* **Action 파라메터**
    * action : 클릭과 임프레션(뷰)를 구분합니다. `click` 또는 `impression`이 설정됩니다.

* **Site ID 파라메터**
    * `site_id_{ios|android|web}` : 플랫폼별로 앱(사이트) 아이디를 설정합니다.
    * 복수의 앱을 위한 TUNE Link가 아닌 경우, `site_id`에 해당 사이트아이디 하나만 설정할 수 있습니다.

    !!! warning "TUNE에서 Branch로 웹앱이 마이그레이션 되지 않은 경우의 `site_id_web`"
        PC에서의 랜딩목적으로 생성된 웹앱이어서 브랜치로의 TUNE Link에서 사용되던 웹앱이 마이그레이션이 안된 경우 해당 웹앱은 Branch시스템에서는 존재하지 않기 때문에 `site_id_web`으로 설정된 TUNE Link가 PC에서 클릭되었을때 정상적으로 동작하지 않습니다.
        **사용중인 TUNE Link중에서 `site_id_web`이 설정된 것이 있는 경우 Branch로의 Migration이 종료되기 이전에 TUNE Link에서 `site_id_web`은 제거해 주시고 대신 `url_web`을 사용하셔야 합니다.**
        `url_web`에 설정되는 URL은 [URL인코딩](urlencode.html)후 설정하셔야 합니다.
        TUNE Link 생성 페이지에서 웹앱 선택 후 "Manually enter URL" 선택시 TUNE Link에 url_web파라메터가 추가되며, URL인코딩한 URL을 UI상에서 설정해 주시고, TUNE Link에서 `site_id_web=123456`부분은 삭제해 주시기 바라며 해당 부분을 삭제한 앞 또는 뒤에 `&`이 두개가 중복된 경우 하나는 제거해 주시기 바랍니다.
        예를들어 PC에서 클릭시 [https://branch.io](https://branch.io)로 랜딩시키려는 경우, `url_web`은  `url_web=https%3A%2F%2Fbranch.io`과 같이 설정되게 됩니다.

* **캠페인 ID 파라메터**
    * 여기에서의 캠페인은 대쉬보드의 좌측메뉴의 `APPLICATION` - `Campaign`의 캠페인을 의미합니다.
    * 앱 생성시 디폴트 캠페인이 자동으로 생성되며, 특별한 필요한 경우가 아니라면 이 디폴트 캠페인 하나만을 사용합니다.
    * TUNE Link 생성 페이지에서는 생성시 자동으로 디폴트 캠페인으로 설정됩니다.
        * TUNE Link에 캠페인 아이디가 설정되지 않은 경우, 해당앱의 디폴트 캠페인으로 인식됩니다.
    * 캠페인내에서는 캠페인에서 사용할 Destination URL과 Deep Link URL들을 미리 저장해 놓을수 있으며, 이 경우 TUNE Link 생성 페이지에서 드랍다운 메뉴를 통해서 미리 저장해둔 URL들을 쉽게 선택할 수 있습니다. 이때 TUNE Link URL 자체에는 `destination_id`와 `invoke_id` 파라메터에 각각의 미미 저장해놓은 URL에 부여된 고유한 ID가 설정되게 됩니다.
    * `campaign_id_{ios|android|web}` : 플랫폼별로 캠페인의 ID를 설정합니다.
    * 복수의 앱을 위한 TUNE Link가 아닌 경우 `campaign_id`틀통해서 해당 캠페인을 지정할 수 있습니다.

    !!! warning "Branch의 로그에서는 TUNE Link에서 설정된 캠페인 ID와 이름 정보는 볼수 없습니다."

* **Partner ID 파라메터**
    * `publisher_id` : 매체에게 고유하게 부여된 ID입니다.
        * 같은 매체라도 광고주별로 각각 다른 고유한 ID가 부여됩니다.

* **Destination ID 또는 Destination URL 파라메터**
    * 캠페인내에 사용할 랜딩 URL을 저장하면 각각 고유한 아이디가 부여되어 저장됩니다.
    * TUNE Link 생성페이지에서는 드랍다운 메뉴로 미리저장해둔 Destination/랜딩 URL을 선택하실 수 있으며, 이 때 TUNE Link 자체에는 선택된 URL에 부여된 고유한 ID가 설정됩니다.
    * Destination/랜딩은 아래의 두가지 파라메터중 원하는 것으로 설정할 수 있습니다.
        * **`destination_id_{ios|android|web}`** : 플랫폼(OS)별로 캠페인 내에서 미리 저장해논 Destination URL의 ID를 사용해서 지정된 웹 페이지로 랜딩시킬 수 있습니다.
        * **`url_{ios|android|web}`** : 플랫폼(OS)별로 랜딩시킬 URL자체를 TUNE Link에 직접 설정해서 해당 페이지로 랜딩시킬 수 있습니다. **[URL인코딩](urlencode.html)후 설정하는것을 권장**합니다.

    !!! warning "Branch로 마이그레션된 이후에는 캠페인에 신규 Destination URL을 신규로 저장할 수 없습니다."
        기존에 이미 저장된 Destination URL은 계속 동작합니다.
        새로운 Destination URL로 랜딩 시키는 경우, 신규로 발급하시는 TUNE Link에 `url_{ios|android|web}`을 사용해서 랜딩시킬 URL자체을 TUNE Link에 직접 설정 하시기 바랍니다. 이것은 TUNE Link 생성 페이지에서 앱선택 후 "Manually enter URL" 선택시의 방법입니다.

* **Deep Link ID 또는 Deep Link URL 파라메터**
    * 캠페인내에 사용할 Deep Link URL을 저장하면 각각 고유한 아이디가 부여되어 저장됩니다.
    * TUNE Link 생성페이지에서는 드랍다운 메뉴로 미리저장해둔 Deep Link URL을 선택하실 수 있으며, 이 때 TUNE Link 자체에는 선택된 URL에 부여된 고유한 ID가 설정됩니다.
    * Deep Link URL은 아래의 두가지 파라메터중 원하는 것으로 설정할 수 있습니다.
    * `invoke_id_{ios|android|web}` : 플랫폼(OS)별로 캠페인내에서 저장한 Deep Link URL에 부여된 Deep Link URL의 고유한 ID를 사용해서  지정된 앱내 특정 페이지로 랜딩시킬수 있습니다.
    * `invoke_url_{ios|android|web}` : 플랫폼(OS)별로 딥링킹할 URL자체를 TUNE Link에 직접 설정해서 해당 앱내 화면으로 랜딩시킬 수 있습니다. **[URL인코딩](urlencode.html)후 설정하는것을 권장**합니다.

        !!! warning "Branch로 마이그래이션된 이후에는 캠페인에 신규 Deep Link URL을 저장할 수 없습니다."
            기존에 이미 저장된 Deep Link URL은 계속 동작합니다.
            새로운 Deep Link URL로 딥링킹 하시려는 경우, 신규로 발급하시는 TUNE Link에 `invoke_url_{ios|android|web}`을 사용해서 딥링크 URL자체를 TUNE Link 직접 설정 하시기 바랍니다. 이것은 TUNE Link 생성 페이지에서 앱선택 후 "Manually etner deep link" 선택시의 방법입니다.


* **광고ID 파라메터**

    !!! warning "마이그레이션 이후에는 MD5, SHA1, SHA256으로 해슁된 광고ID를 통한 매칭이 지원되지 않습니다."

    * `ios_ifa` : 기기의 IDFA를 설정합니다.

        !!! tip "웹브라우저에서는 광고아이디에 접근이 안되므로 앱기반 광고 인벤토리에서만 설정이 가능합니다."

    * `google_aid` : 앱기반 광고지면에서 기기의 Google Advertising를 설정합니다.

        !!! tip "웹브라우저에서는 광고아이디에 접근이 안되므로 앱기반 광고 인벤토리에서만 설정이 가능합니다."

* **광고주측 캠페인 최적화 파라메터** : My파라메터라 불리는 광고주측에서 유입경로를 구분하는데 사용되는 파라메터입니다.

    !!! tip "Acutuals리포트(집계API 엔드포인트)의 My파러메터별 고유값 갯수 제한"
        각각의 My파라메터에는 설정될 수 있는 고유한 값의 갯수에 제한 있습니다.
        1주일에 4만개이상의 고유한 값이 기록되면 Actuals리포트에서 설정된 값별로 구분된 갯수의 집계가 되지 않습니다.
        다만 로그리포트에서는 문제가 없으며, 이 제한에 사용되는 고유값의 갯수는 1주일마다 리셋됩니다.
        그러므로 많은 고유값이 설정될 수 있는 경우 My파라메터 대신 Sub1~5를 사용하시기 바랍니다.
    !!! warning "My파라메터 값 설정시 주의사항"
        My파라메터에는 설정되는 값은 숫자와 알파벳 만으로 이루어져 있지 않은 경우 꼭 [URL인코딩](urlencode.html)후 설정해 주시기 바랍니다. 이는 예를들어 숫자와 알파벳 이외의 문자열의 경우 브라우저에 따라 해당 값이 깨지는 경우가 발생할 수 있기 때분입니다.

    * `my_publisher` : 광고매체
    * `my_site` : 사이트
    * `my_campaign` : 캠페인
    * `my_adgroup` : 광고그룹
    * `my_ad` : 광고
    * `my_keyword` : 키워드
    * `my_placement` : 광고위치

* **광고매체측 캠페인 최적화 파라메터** : Sub파라메터라 불리는 광고매체측에서 유입경로를 구분하는데 사용되는 파라메터입니다.

    !!! tip "Acutuals리포트(집계API 엔드포인트)의 Sub파러메터별 고유값 갯수 제한"
        각각의 Sub파라메터에는 설정될 수 있는 고유한 값의 갯수에 제한 있습니다.
        1주일에 4만개이상의 고유한 값이 기록되면 Actuals리포트에서 설정된 값별로 구분된 갯수의 집계가 되지 않습니다.
        다만 로그리포트에서는 문제가 없으며, 이 제한에 사용되는 고유값의 갯수는 1주일마다 리셋됩니다.
        그러므로 많은 고유값이 설정될 수 있는 경우 Sub파라메터 대신 Sub1~5를 사용하시기 바랍니다.

    * `sub_publisher` : 하위레벨 광고매체
    * `sub_site` : 사이트
    * `sub_campaign` : 캠페인
    * `sub_adgroup` : 광고그룹
    * `sub_ad` : 광고
    * `sub_keyword` : 키워드
    * `sub_placement` : 광고위치

* **교차검증용 추가 파라메터**
    * `sub1` ~ `sub5` : 주로 광고매체에서 고유한값를 설정하는데 사용되는 파라메터. 수많은 고유한 값이 설정될 수 있으므로 Actuals리포트에서 각각의 값별로 집계데이터를 제공하지 않습니다,.

* **참조 아이디 파라메터**
    * `ref_id` : 광고매체의 내부 클릭아이디를 설정합니다.

* **서버사이드 클릭시 사용되는 파라메터**

    !!! tip "일반적으로 광고매체에서 서버사이드 클릭에만 활용됩니다."

    * `device_ip` : 주로 광고매체에서 사용하며, 서버사이드 클릭시 실제 클릭이 발생한 기기의 Public IP를 여기에 설정합니다.

        !!! warning "서버사이드 클릭에서 `device_ip`에 실제 클릭이 발생한 기기의 Public IP가 설정되지 않는 경우 주의사항"
            이 경우 하나의 기기에서 비정상적인 트래픽이 발생하는 것으로 간주되어 일부 클릭이 기록되지 않을 수 있습니다.

    * `country_code` : 실제 클릭이 발생한 기기의 Public IP를 알수 없는 경우에는 그 대신 ISO ALPHA-2 또는 ISO ALPHA-3 형식의 국가코드를 설정해야합니다.
        * [ISO호환 국가코드 정보](https://www.worldatlas.com/aatlas/ctycodes.htm)
    * `response_format=json` : 주로 광고매체에서 사용하며, 서버사이드 클릭임을 알려주는 필드이며, 기본 설정인 redirect 대신 클릭에 대한 정보가 JSON으로 리턴됩니다.

## 애트리뷰션을 위해 클릭에 요구되는 SLA (광고매체 관련사항)
일반적인 클라이언트사이드 클릭이 아닌 비동기방식의 클라이언트사이드 클릭 또는 서버사이드 클릭의 경우에는 실제 클릭 발생후 5초 내에 TUNE Link클릭을 발생시켜야합니다.
애드리뷰션을 작업을 5초 지연시키고 있으므로 5초이내에 TUNE Link 클릭이 발생되지 않는 경우 인스톨이나 이벤트가 실제 클릭후 곧바로 발생하는경우 해당 클릭은 애트리뷰션에 사용되지 못하게 됩니다.
