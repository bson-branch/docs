# 테스트 가이드 (작성중..)

* 작성자 : 손보형
* 업데이트: 2019년 4월 5일
---

## 테스트 순서
1. SDK 로깅기능 활성화 (릴리즈 빌드에서는 꼭 제거)
2. 기기로그 에서 이벤트 전송 확인
3. 광고아이디등 주요정보 확인


## 1. SDK의 로깅기능 활성화
* 기기의 로그 콘솔에서 이벤트가 실제 전송되는지 확인하고, 주요한 정보들이 잘 수집되는지 확인합니다.

### 로깅기능 활성화 (Android)

!!! warning "마켓 릴리즈 빌드에서는 꼭 비활성화 하세요."
!!! warning "테스트키일 경우에는 실제 기기의 Google AID가 전송되지 않고 랜덤UUID가 설정됩니다."
- 3.1.0에서 enableLogging()에서 enableDebugMode()로 메쏘드 이름변경
- `Branch.getAutoInstance(this);` 앞에서 호출하세요.
- *Java*

    ```java
    Branch.enableDebugMode();
    ```

### 로깅기능 활성화 (iOS)

!!! warning "앱스토어 릴리즈 빌드에서는 꼭 비활성화 하세요."
!!! warning "로깅기능을 활성화 하면 실제 기기의 IDFA 대신 랜덤UUID가 설정됩니다."

- `initSession` 앞에서 호출해 주세요.
- `OS_ACTIVITY_MODE`는 꼭 비활성화 되어야 합니다. ([link](https://stackoverflow.com/a/39503602/2690774))

- *Objective C*

    ```objc
    [[Branch getInstance] setDebug];
    ```

- *Swift*

    ```swift
    Branch.getInstance().setDebug()
    ```

## 2. 기기 로그 샘플

* Install 이벤트 샘플
    ```
    I/BranchSDK: posting to https://api2.branch.io/v1/install
    I/BranchSDK: Post value = {"hardware_id":"92b67271-824c-4c42-96cf-3636bbeeb637","is_hardware_id_real":false,"brand":"samsung","model":"SM-G955N","screen_dpi":560,"screen_height":2792,"screen_width":1440,"wifi":false,"ui_mode":"UI_MODE_TYPE_NORMAL","os":"Android","os_version":28,"country":"US","language":"en","local_ip":"102.45.125.187","app_version":"1.0.2","facebook_app_link_checked":false,"is_referrable":1,"debug":true,"update":0,"latest_install_time":1554446038595,"latest_update_time":1554446038595,"first_install_time":1554446038595,"previous_update_time":0,"environment":"FULL_APP","cd":{"mv":"-1","pn":"com.bson.branchtesters"},"install_begin_ts":1554444525,"metadata":{},"google_advertising_id":"4fd96af5-98d3-4681-9d1d-33292ffecc83","lat_val":0,"instrumentation":{"v1\/install-qwt":"0"},"sdk":"android3.1.1","branch_key":"key_live_1gfd5689QW53b54H456456kG9BEhcb12"}
    I/BranchSDK: returned {"session_id":"642600168734516567","identity_id":"642600168721700181","link":"https://branchtesters.app.link?%24identity_id=642600168721700181","data":"{\"+clicked_branch_link\":false,\"+is_first_session\":true}","device_fingerprint_id":"642600168667338007"}
    ```

* Open 이벤트 샘플
    ```
    I/BranchSDK: posting to https://api2.branch.io/v1/open
    I/BranchSDK: Post value = {"device_fingerprint_id":"642600168667338007","identity_id":"642600168721700181","hardware_id":"92b67271-824c-4c42-96cf-3636bbeeb637","is_hardware_id_real":false,"brand":"samsung","model":"SM-G955N","screen_dpi":560,"screen_height":2792,"screen_width":1440,"wifi":false,"ui_mode":"UI_MODE_TYPE_NORMAL","os":"Android","os_version":28,"country":"US","language":"en","local_ip":"102.45.125.187","app_version":"1.0.2","facebook_app_link_checked":false,"is_referrable":1,"debug":true,"update":1,"latest_install_time":1554446038595,"latest_update_time":1554446038595,"first_install_time":1554446038595,"previous_update_time":1554446038595,"environment":"FULL_APP","cd":{"mv":"-1","pn":"com.bson.branchtesters"},"metadata":{},"google_advertising_id":"4fd96af5-98d3-4681-9d1d-33292ffecc83","lat_val":0,"instrumentation":{"v1\/close-brtt":"677","v1\/open-qwt":"0"},"sdk":"android3.1.1","branch_key":"key_live_1gfd5689QW53b54H456456kG9BEhcb12"}
    I/BranchSDK: returned {"session_id":"642600288330627530","identity_id":"642600168721700181","link":"https://branchtesters.app.link?%24identity_id=642600168721700181","data":"{\"+clicked_branch_link\":false,\"+is_first_session\":false}","device_fingerprint_id":"642600168667338007"}
    ```

## 3. 로그확인

1. 아래와 같이 install (최초실행시) 또는 open 이벤트가 앱실행시 전송되는지 확인합니다.
    * `posting to` 뒤의 엔드포인트 URL로 어떤 종류의 이벤트가 전송되는지 확인할 수 있습니다.
2. 현재 라이브 또는 테스트 빌드/키 인지 확인하는 방법
    * 이벤트의 정보는 POST요청의 바디에 JSON으로 설정되며, `Post value` 뒤에 출력됩니다.
    * `branch_key`에 설정된 키값을 확인합니다. `key_live_`로 시작되면 라이브키, `key_test_`로 시작되면 테스트 키입니다.
3. Android에서의 확인 사항
    * 구글 광고아이디가 잘 수집되었는지 확인합니다.
        * `google_advertising_id`에 Google 광고아이디가 설정됩니다. (단, 라이브키 일때 만 실제 기기의 광고아이디가 설정됩니다.)
        * 미수집 된 경우에는 그래들에 아래와 같이 구글 플레이서비스 라이브러리가 임포트 되었는지 확인합니다.
        ```
        implementation 'com.google.android.gms:play-services-ads:9+' // GAID matching
        ```
    * 앱 실행시 아래와 같은 익셉션로그가 출력되면 Gradle파일에 구글 인스톨 레퍼러 라이브러리를 추가 합니다.

    ```
    ReferrerClientWrapper Exception: Failed resolution of: Lcom/android/installreferrer/api/InstallReferrerClient;
    ```

    ```gradle
    implementation 'com.android.installreferrer:installreferrer:1.0'
    ```
