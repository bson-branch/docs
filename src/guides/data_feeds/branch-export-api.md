# Branch Export API 가이드 (작업중)

    Modified on: Mar 27, 2019
---

## 개요

* 우선 아래의 영문 공식 가이드를 참고하시기 바랍니다.
    * https://docs.branch.io/exports/api-v3/
    * https://docs.branch.io/exports/event_ontology_data_schema/

## 해슁
* Branch에서는 개인정보관련 데이터를 엄격하게 관리하고 있습니다.
* 일부 개인정보관련 필드의 경우 7일 이후에  Salt를 사용하여 해슁되므로 원본으로 복구가 불가능하게 해슁​되므로 원본값을 익스포트 하시려면 7일 이내에 익스포트 하셔야 합니다. 해슁된 필드는 64자의 16진수로 (예: `597511111111b3cb7b0b653e2682bc08111158b5bfb5f8a0ccd100322a721111`) 저장됩니다.
* 현재 개인정보관련 필드의 원본 보유 기간을 7일에서 60일로 연장하는 작업을 진행중에 있으며, 추후 필요한 고객분들께 지원될 예정입니다.
* 7일 이후 해슁되는 필드들: IDFA, IDFV, AAID(Android ID), GAID(Google AID), IP, Local IP, Browser Cookie, Device Fingerprint, Developer ID(User ID), last_attributed_touch_data_custom_fields
