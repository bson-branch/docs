## 브랜치 연동

!!! warning "iOS 11.2+에서의 불안정한 Universal Links 동작"
    기기들이 iOS 11.2이상의 버전으로 업데이트된 이후, 앱설치 이후 앱의 AASA파일이 이제는 더이상 신뢰성있게 기기에 다운로드 되지 않음을 확인 하였습니다. 이로 인해, Universal Links 클릭시 앱이 더이상 일관성 있게 열리지 않습니다. 앱을 URI scheme을 통해서 열기 위해서는 브랜치 링크에 [forced uri redirect mode](/pages/links/integrate/#forced-redirections) 설정을 할 수 있습니다. 이 이슈에 대한 상세한 내용은 [Apple Bug report](http://www.openradar.me/radar?id=4999496467480576)를 참고하시기 바랍니다.

- ### 브랜치 설정

    - [Configure your dashboard](/pages/dashboard/integrate/)문서의 `Basic integration`섹션내의 설정들을 완료합니다.

    - `I have an iOS app`이 활성화 합니다.

        ![image](/img/pages/dashboard/ios.png)

- ### Bundle Identifier 설정

    - 앱의 Bundle Id가 [Branch Dashboard](https://dashboard.branch.io/settings/link)와 동일해야 합니다.

        ![image](/img/pages/apps/ios-bundle-id.png)

- ### Associated Domains 설정

    - [Branch Dashboard](https://dashboard.branch.io/settings/link)의 링크 도메인들을 추가합니다.
    - `-alternate` 도메인은 웹사이트에 연동된 [Web SDK](/pages/web/integrate/)에서 Universal 링킹을 지원하기 위해 필요합니다.
    - `test-` 도메인은 [테스트 키](#use-test-key)를 사용할 경우 필요합니다.
    - [커스텀 링크 도메인](/pages/dashboard/integrate/#change-link-domain)을 사용하는 경우,  이전 링크 도메인, `-alternate`, 새로운 링크도메인을 추가해야 합니다.

        ![image](/img/pages/apps/ios-entitlements.png)

- ### Entitlements 설정

    - Target내에서 entitlements 확인

        ![image](/img/pages/apps/ios-package.png)

- ### Info.plist 설정

    - [Branch Dashboard](https://dashboard.branch.io/account-settings/app)의 값들을 추가 합니다.

        - `branch_app_domain`에 라이브키에서 사용하는 도메인 추가
        - `branch_key`에 현재 브랜치 키 추가
        - URI scheme을 `URL Types` -> `Item 0` -> `URL Schemes` 순서로 추가

        ![image](/img/pages/apps/ios-plist.png)

- ### App prefix 확인

    - [Apple Developer Account](https://developer.apple.com/account/ios/identifier/bundle)에서 확인

        ![image](/img/pages/apps/ios-team-id.png)

- ### 브랜치 설치

    - Option 1: [CocoaPods](https://cocoapods.org/)

        ```sh hl_lines="7"
        platform :ios, '8.0'

        target 'APP_NAME' do
          # if swift
          use_frameworks!

          pod 'Branch'
        end
        ```

        ```sh
        pod install && pod update
        ```

    - Option 2: [Carthage](https://github.com/Carthage/Carthage)

        ```sh
        github "BranchMetrics/ios-branch-deep-linking"
        ```

    - Option 3: [소스코드](https://github.com/BranchMetrics/ios-branch-deep-linking/releases)에서 참조되는 라이브러리와 함께 수동으로 설치

        - `Branch.framework`를 `Embedded Binaries`로 드랙앤드랍 (`Copy items if needed` 선택)
        - `AdSupport`, `SafariServices`, `MobileCoreServices`, `CoreSpotlight`, `iAd`를 `Linked Frameworks`으로 임포트

        ![image](/img/pages/apps/ios-frameworks.png)

- ### 브랜치 초기화

    - *Swift 3*

        ```swift hl_lines="2 10 11 12 13 14 15 16 21 22 27 28 33 34"
        import UIKit
        import Branch

        @UIApplicationMain
        class AppDelegate: UIResponder, UIApplicationDelegate {

        var window: UIWindow?

        func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
          // if you are using the TEST key
          Branch.setUseTestBranchKey(true)
          // listener for Branch Deep Link data
          Branch.getInstance().initSession(launchOptions: launchOptions) { (params, error) in
            // do stuff with deep link data (nav to page, display content, etc)
            print(params as? [String: AnyObject] ?? {})
          }
          return true
        }

        func application(_ app: UIApplication, open url: URL, options: [UIApplicationOpenURLOptionsKey : Any] = [:]) -> Bool {
          Branch.getInstance().application(app, open: url, options: options)
          return true
        }

        func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([Any]?) -> Void) -> Bool {
          // handler for Universal Links
          Branch.getInstance().continue(userActivity)
          return true
        }

        func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
          // handler for Push Notifications
          Branch.getInstance().handlePushNotification(userInfo)
        }
        ```

    - *Objective-C*

        ```objc hl_lines="2 11 12 13 14 15 16 17 22 23 28 29 34 35"
        #import "AppDelegate.h"
        #import "Branch/Branch.h"

        @interface AppDelegate ()

        @end

        @implementation AppDelegate

        - (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
          // if you are using the TEST key
          [Branch setUseTestBranchKey:YES];
          // listener for Branch Deep Link data
          [[Branch getInstance] initSessionWithLaunchOptions:launchOptions andRegisterDeepLinkHandler:^(NSDictionary * _Nonnull params, NSError * _Nullable error) {
            // do stuff with deep link data (nav to page, display content, etc)
            NSLog(@"%@", params);
          }];
          return YES;
        }

        - (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
          [[Branch getInstance] application:app openURL:url options:options];
          return YES;
        }

        - (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler {
          // handler for Universal Links
          [[Branch getInstance] continueUserActivity:userActivity];
          return YES;
        }

        - (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
          // handler for Push Notifications
          [[Branch getInstance] handlePushNotification:userInfo];
        }

        @end
        ```

- ### 딥링크 테스트

    - [Branch Dashboard](https://dashboard.branch.io/marketing)에서 딥링크를 생성합니다.
    - 기기에서 앱을 삭제합니다.
    - 컴파일후 기기에 앱을 설치합니다.
    - `Apple Notes`에 딥링크를 붙여 넣습니다.
    - 딥링크를 길게 누릅니다. (3D Touch가 아닙니다.)
    - `Open in "앱 이름"`을 클릭해 앱을 실행합니다. ([예](/img/pages/apps/ios-notes.png))

    !!! tip "Deferred 딥링킹 테스트"
        Deferred 딥링킹은 클릭시 아직 앱이 설치되어 있지 않은 경우에 딥링킹을 수행하는 것입니다. 앱이 설치된 후 앱이 최초로 실행될때 클릭했던 브랜치 링크에 설정되었던 딥링크 데이터를 가져오게 됩니다. 이를 테스트 하기 위해서는 기기에서 앱을 삭제한 뒤, 브랜치 링크를 클릭하고, 앱을 수동으로 실행합니다. 앱이 오픈되면 앱내 해당 컨텐츠로 정상적으로 이동해야 합니다.


## 기능 구현

- ### 컨텐츠 레퍼런스 생성

    - `Branch Universal Object`는 컨텐츠 또는 유저와 같이 공유하려는 것을 캡슐화 합니다.

    - [Universal Object properties](/pages/links/integrate/#universal-object)를 사용합니다.

    - *Swift 3*

        ```swift
        let buo = BranchUniversalObject.init(canonicalIdentifier: "content/12345")
        buo.title = "My Content Title"
        buo.contentDescription = "My Content Description"
        buo.imageUrl = "https://lorempixel.com/400/400"
        buo.publiclyIndex = true
        buo.locallyIndex = true
        buo.contentMetadata.customMetadata["key1"] = "value1"
        ```

    - *Objective-C*

        ```objc
        BranchUniversalObject *buo = [[BranchUniversalObject alloc] initWithCanonicalIdentifier:@"content/12345"];
        buo.title = @"My Content Title";
        buo.contentDescription = @"My Content Description";
        buo.imageUrl = @"https://lorempixel.com/400/400";
        buo.publiclyIndex = YES;
        buo.locallyIndex = YES;
        buo.contentMetadata.customMetadata[@"key1"] = @"value1";
        ```

- ### 링크 레퍼런스 생성

    - 딥링크를 위해 분석용 속성들을 생성합니다.

    - [딥링크 생성](#create-deep-link) 과 [딥링크 공유](#share-deep-link)에 사용됩니다.

    - [Configure link data](/pages/links/integrate/#configure-deep-links)와 커스텀 데이터를 사용합니다.

    - *Swift 3*

        ```swift
        let lp: BranchLinkProperties = BranchLinkProperties()
        lp.channel = "facebook"
        lp.feature = "sharing"
        lp.campaign = "content 123 launch"
        lp.stage = "new user"
        lp.tags = ["one", "two", "three"]

        lp.addControlParam("$desktop_url", withValue: "http://example.com/desktop")
        lp.addControlParam("$ios_url", withValue: "http://example.com/ios")
        lp.addControlParam("$ipad_url", withValue: "http://example.com/ios")
        lp.addControlParam("$android_url", withValue: "http://example.com/android")
        lp.addControlParam("$match_duration", withValue: "2000")

        lp.addControlParam("custom_data", withValue: "yes")
        lp.addControlParam("look_at", withValue: "this")
        lp.addControlParam("nav_to", withValue: "over here")
        lp.addControlParam("random", withValue: UUID.init().uuidString)
        ```

    - *Objective-C*

        ```objc
        BranchLinkProperties *lp = [[BranchLinkProperties alloc] init];
        lp.feature = @"facebook";
        lp.channel = @"sharing";
        lp.campaign = @"content 123 launch";
        lp.stage = @"new user";
        lp.tags = @[@"one", @"two", @"three"];

        [lp addControlParam:@"$desktop_url" withValue: @"http://example.com/desktop"];
        [lp addControlParam:@"$ios_url" withValue: @"http://example.com/ios"];
        [lp addControlParam:@"$ipad_url" withValue: @"http://example.com/ios"];
        [lp addControlParam:@"$android_url" withValue: @"http://example.com/android"];
        [lp addControlParam:@"$match_duration" withValue: @"2000"];

        [lp addControlParam:@"custom_data" withValue: @"yes"];
        [lp addControlParam:@"look_at" withValue: @"this"];
        [lp addControlParam:@"nav_to" withValue: @"over here"];
        [lp addControlParam:@"random" withValue: [[NSUUID UUID] UUIDString]];
        ```

- ### 딥링크 생성

    - 앱내에서 딥링크 생성

    - [컨텐츠 레퍼런스 생성](#create-content-reference)이 필요함.

    - [링크 레퍼런스 생성](#create-link-reference)이 필요함.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/links)에서 데이터를 확인합니다.

    - *Swift 3*

        ```swift
        buo.getShortUrl(with: lp) { (url, error) in
          print(url ?? "")
        }
        ```

    - *Objective-C*

        ```objc
        [buo getShortUrlWithLinkProperties:lp andCallback:^(NSString* url, NSError* error) {
            if (!error) {
                NSLog(@"@", url);
            }
        }];
        ```


- ### 딥링크 공유

    - 유저가 선택한 채널정보가 태깅된 브랜치 딥링크를 생성합니다.

    - [컨텐츠 레퍼런스 생성](#create-content-reference)이 필요합니다.

    - [링크 레퍼런스 생성](#create-link-reference)이 필요합니다.

    - [Deep Link Properties](/pages/links/integrate/)이 필요합니다.

     - *Swift 3*

        ```swift
        let message = "Check out this link"
        buo.showShareSheet(with: lp, andShareText: message, from: self) { (activityType, completed) in
          print(activityType ?? "")
        }
        ```

    - *Objective C*

        ```objc
        [buo showShareSheetWithLinkProperties:lp andShareText:@"Super amazing thing I want to share!" fromViewController:self completion:^(NSString* activityType, BOOL completed) {
            NSLog(@"finished presenting");
        }];
        ```

- ### 딥링크 데이터 조회

    - 딥링크에 설정된 브랜치 데이터를 조회 합니다.

    - (Race Condition)을 방지하기 위해서, listener를 통해서 데이터를 수신하는 것을 권장합니다.

    - [deep link properties](/pages/links/integrate/#read-deep-links)가 반환됩니다.

    - *Swift 3*

        ```swift
        // listener (within AppDelegate didFinishLaunchingWithOptions)
        Branch.getInstance().initSession(launchOptions: launchOptions) { params, error in
          print(params as? [String: AnyObject] ?? {})
        }

        // latest
        let sessionParams = Branch.getInstance().getLatestReferringParams()

        // first
        let installParams = Branch.getInstance().getFirstReferringParams()
        ```

    - *Objective C*

        ```objc
        [[Branch getInstance] initSessionWithLaunchOptions:launchOptions
                                andRegisterDeepLinkHandler:^(NSDictionary * _Nullable params,
                                                             NSError * _Nullable error) {
            if (!error) {
                //Referring params
                NSLog(@"Referring link params %@",params);
            }
        }];

        // latest
        NSDictionary *sessionParams = [[Branch getInstance] getLatestReferringParams];

        // first
        NSDictionary *installParams =  [[Branch getInstance] getFirstReferringParams];

        ```

- ### 컨텐츠로의 이동

    - `Branch.initSession()`내에서 처리합니다.

    - *Swift 3*

        ```swift
        // within AppDelegate application.didFinishLaunchingWithOptions
        Branch.getInstance().initSession(launchOptions: launchOptions) { params , error in
          // Option 1: read deep link data
          guard let data = params as? [String: AnyObject] else { return }

          // Option 2: save deep link data to global model
          SomeCustomClass.sharedInstance.branchData = data

          // Option 3: display data
          let alert = UIAlertController(title: "Deep link data", message: "\(data)", preferredStyle: .alert)
          alert.addAction(UIAlertAction(title: "Okay", style: .default, handler: nil))
          self.window?.rootViewController?.present(alert, animated: true, completion: nil)

          // Option 4: navigate to view controller
          guard let options = data["nav_to"] as? String else { return }
          switch options {
              case "landing_page": self.window?.rootViewController?.present( SecondViewController(), animated: true, completion: nil)
              case "tutorial": self.window?.rootViewController?.present( SecondViewController(), animated: true, completion: nil)
              case "content": self.window?.rootViewController?.present( SecondViewController(), animated: true, completion: nil)
              default: break
          }
        }
        ```

    - *Objective C*

        ```objc
        // within AppDelegate application.didFinishLaunchingWithOptions
        [[Branch getInstance] initSessionWithLaunchOptions:launchOptions andRegisterDeepLinkHandler:^(NSDictionary * _Nonnull params, NSError * _Nullable error) {
          // Option 1: read deep link data
          NSLog(@"%@", params);

          // Option 2: save deep link data to global model
          NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
          [defaults setObject:params.description forKey:@"BranchData"];
          [defaults synchronize];

          // Option 3: display data
          UIAlertController * alert = [UIAlertController alertControllerWithTitle:@"Title" message:params.description preferredStyle:UIAlertControllerStyleAlert];
          UIAlertAction *button = [UIAlertAction actionWithTitle:@"Deep Link Data" style:UIAlertActionStyleDefault handler:nil];
          [alert addAction:button];
          [self.window.rootViewController presentViewController:alert animated:YES completion:nil];

          // Option 4: navigate to view controller
          if ([params objectForKey:@"navHere"]) {
            ViewController *anotherViewController = [[ViewController alloc] initWithNibName:@"anotherViewController" bundle:nil];
            [self.window.rootViewController presentViewController:anotherViewController animated:YES completion:nil];
          }
        }];
        ```

- ### 컨텐츠 노출

    - `iOS Spotlight` 컨텐츠를 노출 시킵니다.

    - [컨텐츠 레퍼런스 생성](#create-content-reference)이 필요합니다.

    - *Swift 3*

        ```swift
        buo.automaticallyListOnSpotlight = true
        ```

    - *Objective-C*

        ```objc
        buo.automaticallyListOnSpotlight = YES;
        ```

- ### 컨텐츠 트래킹

    - 사용자의 컨텐츠를 조회를 트래킹합니다.

    - [컨텐츠 레퍼런스 생성](#create-content-reference)이 필요합니다.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/content)에서 데이터를 확인합니다.

    - *Swift 3*

        ```swift
        BranchEvent.standardEvent(.viewItem, withContentItem: buo).logEvent()
        ```

    - *Objective-C*

        ```objc
        [[BranchEvent standardEvent:BranchStandardEventViewItem withContentItem:buo] logEvent];
        ```

- ### 사용자 트래킹

    - 이벤트, 딥링크, Referral에 사용자에 대한 식별자(email, ID, UUID, etc)를 설정합니다. 사용자의 식별자 설정의 경우 꼭 사내 개인정보보호 관련부서와 사전 논의합니다.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/identities)에서 데이터를 검증합니다.

    - *Swift 3*

        ```swift
        // login
        Branch.getInstance().setIdentity("your_user_id")

        // logout
        Branch.getInstance().logout()
        ```

    - *Objective-C*

        ```objc
        // login
        [[Branch getInstance] setIdentity:@"your_user_id"];

        // logout
        [[Branch getInstance] logout];
        ```


- ### 이벤트 트래킹

    - 고객의 구매활동과 관련된 모든 이벤트들은 "Commerce" 클래스의 데이터아이템으로 분류됩니다.

    - 사용자가 앱내 컨텐츠와 상호작용하는 것에 관련된 모든 이벤트들은 "Content" 클래스의 데이터아이템으로 분류됩니다.

    - 사용자들이 앱사용을 진행하면서 발생하는 것에 관련된 모든 이벤트들은 "lifecycle" 클래스의 데이터아이템으로 분류됩니다.

    - 아래의 표에 없는 커스텀 이벤트에 대한 트래킹은 [Track Custom Events](https://docs.branch.io/pages/apps/v2event/#track-custom-events)문서를 참고하세요.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/events)에서 데이터를 검증합니다.


    {! ingredients/sdk/v2-events.md !}


- ### Referral 처리

    - Referral 포인트는 [Branch Dashboard](https://dashboard.branch.io/referrals/rules)의 Referral 룰에 의해서 주어집니다.

    - [Branch Dashboard](https://dashboard.branch.io/referrals/analytics)에서 데이터를 검증합니다.

    - Reward credits (리워드 크레딧)

        -  [Referral guide](/pages/dashboard/analytics/#referrals)

    - Redeem credits (크레딧 상환)

        - *Swift 3*

            ```swift
            // option 1 (default bucket)
            let amount = 5
            Branch.getInstance().redeemRewards(amount)

            // option 2
            let bucket = "signup"
            Branch.getInstance().redeemRewards(amount, forBucket: bucket)
            ```

        - *Objective C*

            ```objc
            // option 1 (default bucket)
            NSInteger amount = 5;
            [[Branch getInstance] redeemRewards:amount];

            // option 2
            NSString *bucket = @"signup";
            [[Branch getInstance] redeemRewards:amount forBucket:bucket];
            ```

    - Load credits (크레딧 로딩)

        - *Swift 3*

            ```swift
            Branch.getInstance().loadRewards { (changed, error) in
              // option 1 (defualt bucket)
              let credits = Branch.getInstance().getCredits()

              // option 2
              let bucket = "signup"
              let credits = Branch.getInstance().getCreditsForBucket(bucket)
            }
            ```

        - *Objective C*

            ```objc
            [[Branch getInstance] loadRewardsWithCallback:^(BOOL changed, NSError * _Nullable error) {
                if (changed) {
                // option 1 (defualt bucket)
                NSInteger credits = [[Branch getInstance] getCredits];

                // option 2
                NSString *bucket = @"signup";
                NSInteger credit = [[Branch getInstance] getCreditsForBucket:bucket];
                }
            }];

            ```

    - Load history (히스토리 로딩)

        - *Swift 3*

            ```swift
            Branch.getInstance().getCreditHistory { (creditHistory, error) in
               print(creditHistory ?? {})
             }
            ```

        - *Objective C*

            ```objc
            [[Branch getInstance] getCreditHistoryWithCallback:^(NSArray * _Nullable creditHistory, NSError * _Nullable error) {
                NSLog(@"%@",creditHistory);
            }];
            ```

- ### 푸시알림 처리

    - 푸시알림 내의 브랜치 딥링크 트래킹을 지원합니다.

    - [브랜치 초기화](#브랜치-초기화)에 브랜치 푸시알림 핸들러를 추가합니다.

    - 푸시알림 내의 `payload`에 브랜치 딥링크를 추가합니다.

        ```json hl_lines="6"
        {
          "aps": {
            "alert": "Push notification with a Branch deep link",
            "badge": "1"
          },
          "branch": "https://example.app.link/u3fzDwyyjF"
        }
        ```

        - `https://example.app.link/u3fzDwyyjF`를 사용할 딥링크로 변경합니다.

    - [브랜치 초기화](#브랜치-초기화)의 `initSession`에서 딥링크 데이터를 읽습니다.

- ### 앱 내에 딥링크 처리

    - 앱에서 동일한 앱으로의 딥링킹을 지원합니다.

    - *Swift 3*

        ```swift
        Branch.getInstance().handleDeepLink(withNewSession: URL(string: "https://example.app.link/u3fzDwyyjF"))
        ```

    - *Objective C*

        ```objc
        [[Branch getInstance] handleDeepLinkWithNewSession:[NSURL URLWithString:@"https://example.app.link/u3fzDwyyjF"]];
        ```

!!! warning
    앱내에서 새로운 딥링크를 처리하는 경우 현재의 세션 데이터가 지워지고, 새로 참조된 "open"으로 애트리뷰션이 됩니다.

- ### Apple Search Ads 트래킹

    - Branch에서 Apple Search Ads 딥링킹 분석을 지원합니다.

    - 분석정보를 전달해주는 Apple API로 지연문제로 인해서 브랜치에서의 분석정보가 수치가 애플보다 낮게 나오고 있습니다. 추가적으로 애플의 API는 광고에 대한 모든 정보를 항상 전달해주지 않기 때문에 브랜치에서는 가끔씩 일반적인 캠페인으로 보여질 수 있습니다.

    - [브랜치 초기화](#브랜치-초기화)에서 `initSession` 앞에 추가합니다.

        - *Swift 3*

            ```swift
            Branch.getInstance().delayInitToCheckForSearchAds()
            ```

        - *Objective C*

            ```objc
            [[Branch getInstance] delayInitToCheckForSearchAds];
            ```

    - 가짜 캠펜인 파라메터로 테스트 (상용/릴리즈용 빌드에서는 테스트 하지 마세요.)

        - *Swift 3*

            ```swift
            Branch.getInstance().setAppleSearchAdsDebugMode()
            ```

        - *Objective C*

            ```objc
            [[Branch getInstance] setAppleSearchAdsDebugMode];
            ```

- ### 100% 정확도 매칭 활성화

    - `SFSafariViewController`를 사용해서 애트리뷰션 매칭의 성공률을 향상시킬수 있습니다.

    - 사파리브라우저에서의 클릭만 100% 매칭이 가능하기 때문에 100% 매칭이라는 것이 약간 잘못 이해될 수도 있습니다. 브랜치에서 내부적으로 분석한 바에 의하면 케이스에 따라 다를수 있지만 사파리를 통한 클릭이 50-75% 정도입니다. 예를들어 Facebook, Gmail, Chrome에서의 클릭은 100%매칭이 되지는 않지만, 매칭정확도 향상에 도움을 주고 있습니다.

    - 커스텀 도메인을 사용할 경우 `branch_app_domain` 문자열 키를 Info.plist에 추가하면 커스텀 도메인에 100% 매칭을 활성화 할 수 있습니다.

    - 디폴트로, `SafariServices.framework`이 앱에 임포트 하면, 쿠키가반 매칭이 iOS 9 와 iOS 10에서 활성화 되며, 앱에서 app.link 서브도메인 사용하거나 `branch_app_domain`을 Info.plist에 설정한 경우 쿠키기반 매칭을 SDK를 통해서 비활성화 할 수 있습니다.

    - [Initialize Branch](#initialize-branch)`initSession`

    - *Swift 3*

        ```swift
        Branch.getInstance().disableCookieBasedMatching()
        ```

    - *Objective C*

        ```objc
        [[Branch getInstance] disableCookieBasedMatching];
        ```

- ### 사용자 트래킹 활성화 / 비활성화

    If you need to comply with a user's request to not be tracked for GDPR purposes, or otherwise determine that a user should not be tracked, utilize this field to prevent Branch from sending network requests. This setting can also be enabled across all users for a particular link, or across your Branch links.

    - *Swift*

        ```swift
        Branch.setTrackingDisabled(true)
        ```

    - *Objective C*

        ```objc
        [Branch setTrackingDisabled:YES];
        ```

    You can choose to call this throughout the lifecycle of the app. Once called, network requests will not be sent from the SDKs. Link generation will continue to work, but will not contain identifying information about the user. In addition, deep linking will continue to work, but will not track analytics for the user.

## 문제 해결

- ### 브랜치 연동 테스트

    Test your Branch Integration by calling `validateSDKIntegration` in your AppDelegate. Check your Xcode logs to make sure all the SDK Integration tests pass. Make sure to comment out or remove `validateSDKIntegration` in your production build.

    - *Swift*

        ```swift
        Branch.getInstance().validateSDKIntegration()
        ```

    - *Objective C*

        ```objc
        [[Branch getInstance] validateSDKIntegration];
        ```

- ### AASA 파일의 다운로드 성공 여부 확인

    - Connect a test device to your MAC

    - Uninstall the app

    - View the device's console output in the MAC console

    - Install your app and let it launch

    - Filter the console output by "swcd"

    - If the AASA downloaded sucessfully, you'll see something like the screenshot below (If the AASA did not download, you must uninstall the app, restart the device, and then reinstall the app)

    ![image](https://cdn.branch.io/branch-assets/1520880422940-og_image.png)

- ### App Store 제출

    - Need to select `app uses IDFA or GAID` when publishing your app (for better deep link matching)

- ### 앱이 열리지 않는 문제

    - Double check [Integrate Branch](#integrate-branch)

    - Investigate if the device disabled universal links ([Re-enable universal linking](#re-enable-universal-linking))

    - Investigate if it is a link related issue ([Deep links do not open app](/pages/links/integrate/#deep-links-do-not-open-app))

    - Use [Universal links validator](https://branch.io/resources/universal-links/)

    - Use [AASA validator](https://branch.io/resources/aasa-validator/)

    - Use [Test deep link](#test-deep-link)

- ### 앱이이 데이터를 전달하지 않는 문제

    - See if issue is related to [App not opening](#app-not-opening)

    - Investigate Branch console logs ([Enable logging](#enable-logging))

- ### 인스톨 시뮬레이션

    - Delete your app

    - iPhone Device -> Settings -> Privacy -> Advertising -> Reset Advertising Identifier -> Reset Identifier

    - Add `Branch.setDebug(true)` before `initSession` ([Initialize Branch Features](#initialize-branch-features))

    - Click on a deep link to navigate to your `$fallback_url` because your app is not installed

    - Install your app

    - Open your app

    - Read from `params` within `initSession` for `+is_first_session = true`

- ### 딥링크가 긴 문제

    - Happens whenever the app cannot make a connection to the Branch servers

    - The long deep links will still open the app and pass data

- ### 샘플 앱

    - [Swift testbed](https://github.com/BranchMetrics/ios-branch-deep-linking/tree/master/Branch-TestBed-Swift)

    - [Objective C testbed](https://github.com/BranchMetrics/ios-branch-deep-linking/tree/master/Branch-TestBed)

- ### 컨텐츠 속성 트래킹

    - Used for [Track content](#track-content)

        | Key | Value
        | --- | ---
        | BNCRegisterViewEvent | User viewed the object
        | BNCAddToWishlistEvent | User added the object to their wishlist
        | BNCAddToCartEvent | User added object to cart
        | BNCPurchaseInitiatedEvent | User started to check out
        | BNCPurchasedEvent | User purchased the item
        | BNCShareInitiatedEvent | User started to share the object
        | BNCShareCompletedEvent | User completed a share

- ### 로깅 활성화

    - Use the Branch test key instead of the live key

    - Add before `initSession` [Initialize Branch](#initialize-branch)

    - Remove before releasing to production

    - *Swift 3*

        ```swift
        Branch.getInstance().setDebug()
        ```

    - *Objective C*

        ```objc
        [[Branch getInstance] setDebug];
        ```

    - Make sure `OS_ACTIVITY_MODE` is not disabled ([link](https://stackoverflow.com/a/39503602/2690774))

- ### 테스트키 사용

    - Use the Branch `test key` instead of the `live key`

    - Add before `initSession` [Initialize Branch](#initialize-branch)

    - Update `branch_key` in your `Info.plist` to a dictionary ([example](https://github.com/BranchMetrics/ios-branch-deep-linking/blob/master/Branch-TestBed/Branch-TestBed/Branch-TestBed-Info.plist#L58-L63))

    - The `test key` of your app must match the `test key` of your deep link

    - Remove before releasing to production

    - *Swift 3*

        ```swift
        Branch.setUseTestBranchKey(true)
        ```

    - *Objective C*

        ```objc
        [Branch setUseTestBranchKey:YES];
        ```

- ### Universal linking 재 활성화

    - Apple allows users to disable universal linking on a per app per device level on iOS 9 and iOS 10 (fixed in iOS 11)

    - Use [Test deep link](#test-deep-link) to re-enable universal linking on the device

- ### Branch ViewController를 통한 딥링크 라우팅

    - Add before `initSession` [Initialize Branch](#initialize-branch)

    - Recommend to [Navigate to content](#navigate-to-content) instead

    - *Swift 3*

        ```swift
        Branch.getInstance().registerDeepLinkController(ViewController(), forKey: "my-key", withPresentation: .optionShow)
        ```

    - *Objective C*

        ```objc
        [[Branch getInstance] registerDeepLinkController:customViewController forKey:@"my-key"withPresentation:BNCViewControllerOptionShow];
        ```

- ### 브랜치 링크에 대한 딥링크 테스트

    Append `?bnc_validate=true` to any of your app's Branch links and click it on your mobile device (not the Simulator!) to start the test. For instance, to validate a link like: `"https://<yourapp\>.app.link/NdJ6nFzRbK"` click on: `"https://<yourapp\>.app.link/NdJ6nFzRbK?bnc_validate=true"`


- ### 딥링크가 네트워크 없이 브랜치로부터 온것인지 확인

    - Use for Universal Linking if you want to get the `true/false` response from `Branch.getInstance().continue(userActivity)` within `continueUserActivity` without a Branch network call
    - Use only if you have a custom link domain
    - Add `branch_universal_link_domains` to your `info.plist` with an array of your link domain from your [Branch Dashboard](https://dashboard.branch.io/settings/link)

        ![image](/img/pages/apps/ios-link-domains.png)

- ### 이메일 공유 옵션

    - Change the way your deep links behave when shared to email

    - Needs a [Share deep link](#share-deep-link)

    - *Swift 3*

        ```swift
        lp.addControlParam("$email_subject", withValue: "Your Awesome Deal")
        lp.addControlParam("$email_html_header", withValue: "<style>your awesome CSS</style>\nOr Dear Friend,")
        lp.addControlParam("$email_html_footer", withValue: "Thanks!")
        lp.addControlParam("$email_html_link_text", withValue: "Tap here")
        ```

    - *Objective C*

        ```objc
        [lp addControlParam:@"$email_subject" withValue:@"This one weird trick."];
        [lp addControlParam:@"$email_html_header" withValue:@"<style>your awesome CSS</style>\nOr Dear Friend,"];
        [lp addControlParam:@"$email_html_footer" withValue:@"Thanks!"];
        [lp addControlParam:@"$email_html_link_text" withValue:@"Tap here"];
        ```

- ### 동적으로 메시지 공유

    - Change the message you share based on the source the users chooses

    - Needs a [Share deep link](#share-deep-link)

    - *Swift 3*

        ```swift
        // import delegate
        class ViewController: UITableViewController, BranchShareLinkDelegate

        func branchShareLinkWillShare(_ shareLink: BranchShareLink) {
          // choose shareSheet.activityType
          shareLink.shareText = "\(shareLink.linkProperties.channel)"
        }
        ```

    - *Objective C*

        ```objc
        // import delegate
        @interface ViewController () <BranchShareLinkDelegate>

        - (void) branchShareLinkWillShare:(BranchShareLink*)shareLink {
          // choose shareSheet.activityType
          shareLink.shareText = [NSString stringWithFormat:@"@%", shareLink.linkProperties.channel];
        }
        ```
