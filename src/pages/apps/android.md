## 브랜치 연동

- ### 브랜치 설정

    - [Configure your dashboard](/pages/dashboard/integrate/) 문서의 `Basic integration`섹션내의 설정들을 완료합니다.

    - `Always try to open app`와 `I have an Android App` 모두를 활성화 합니다.

        ![image](/img/pages/dashboard/android.png)

- ### 브랜치 설치

    - `build.gradle`내에 Branch SDK를 임포트 합니다.

        ```java hl_lines="30 31 33 34 35 36"
        apply plugin: 'com.android.application'

        android {
            compileSdkVersion 25
            buildToolsVersion "25.0.2"
            defaultConfig {
                applicationId "com.eneff.branch.example.android"
                minSdkVersion 16
                targetSdkVersion 25
                versionCode 1
                versionName "1.0"
                testInstrumentationRunner "android.support.test.runner.AndroidJUnitRunner"
            }
            buildTypes {
                release {
                    minifyEnabled false
                    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
                }
            }
        }

        dependencies {
            implementation fileTree(dir: 'libs', include: ['*.jar'])
            androidTestImplementation ('com.android.support.test.espresso:espresso-core:2.2.2', {
                exclude group: 'com.android.support', module: 'support-annotations'
            })
            implementation 'com.android.support:appcompat-v7:25.2.0'
            implementation 'com.android.support:design:25.2.0'

            // required
            implementation 'io.branch.sdk.android:library:3.+'

            // optional
            implementation 'com.android.support:customtabs:23.3.0' // Chrome Tab matching
            implementation 'com.google.android.gms:play-services-ads:9+' // GAID matching
            implementation 'com.google.android.gms:play-services-appindexing:9.+' // App indexing

            testImplementation 'junit:junit:4.12'
        }
        ```

- ### 앱 설정

    - `AndroidManifest.xml`내에 브랜치관련 항목들을 추가합니다.

        ```xml hl_lines="9 17 26 27 28 29 30 31 32 34 35 36 37 38 39 40 44 45 46 47 49 50 51 52 53 54"
        <?xml version="1.0" encoding="utf-8"?>
        <manifest xmlns:android="http://schemas.android.com/apk/res/android"
            package="com.eneff.branch.example.android">

            <uses-permission android:name="android.permission.INTERNET" />

            <application
                android:allowBackup="true"
                android:name="com.eneff.branch.example.android.CustomApplicationClass"
                android:icon="@mipmap/ic_launcher"
                android:label="@string/app_name"
                android:supportsRtl="true"
                android:theme="@style/AppTheme">

                <!-- Launcher Activity to handle incoming Branch intents -->    
                <activity
                    android:name=".LauncherActivity"
                    android:launchMode="singleTask"
                    android:label="@string/app_name"
                    android:theme="@style/AppTheme.NoActionBar">

                    <intent-filter>
                        <action android:name="android.intent.action.MAIN" />
                        <category android:name="android.intent.category.LAUNCHER" />
                    </intent-filter>

                    <!-- Branch URI Scheme -->
                    <intent-filter>
                        <data android:scheme="androidexample" />
                        <action android:name="android.intent.action.VIEW" />
                        <category android:name="android.intent.category.DEFAULT" />
                        <category android:name="android.intent.category.BROWSABLE" />
                    </intent-filter>

                    <!-- Branch App Links (optional) -->
                    <intent-filter android:autoVerify="true">
                        <action android:name="android.intent.action.VIEW" />
                        <category android:name="android.intent.category.DEFAULT" />
                        <category android:name="android.intent.category.BROWSABLE" />
                        <data android:scheme="https" android:host="example.app.link" />
                        <data android:scheme="https" android:host="example-alternate.app.link" />
                    </intent-filter>
                </activity>

                <!-- Branch init -->
                <meta-data android:name="io.branch.sdk.BranchKey" android:value="key_live_kaFuWw8WvY7yn1d9yYiP8gokwqjV0Sw" />
                <meta-data android:name="io.branch.sdk.BranchKey.test" android:value="key_test_hlxrWC5Zx16DkYmWu4AHiimdqugRYMr" />
                <meta-data android:name="io.branch.sdk.TestMode" android:value="false" /> <!-- Set to true to use Branch_Test_Key -->

                <!-- Branch install referrer tracking (optional) -->
                <receiver android:name="io.branch.referral.InstallListener" android:exported="true">
                    <intent-filter>
                        <action android:name="com.android.vending.INSTALL_REFERRER" />
                    </intent-filter>
                </receiver>

            </application>

        </manifest>
        ```

    - 아래의 값들을 Branch 대쉬보드의 [App settings](https://dashboard.branch.io/account-settings/app)와 [Link settings](https://dashboard.branch.io/link-settings)의 설정값들로 변경합니다
        - `androidexample`
        - `example.app.link`
        - `example-alternate.app.link`
        - `key_live_kaFuWw8WvY7yn1d9yYiP8gokwqjV0Sw`
        - `key_test_hlxrWC5Zx16DkYmWu4AHiimdqugRYMr`

    !!! warning "Single Task launch mode설정이 필요합니다"
        안드로이드 시스템상에 SingleTask Activity 인스턴스가 없다면, 동일 Task의 스택의 최상위에 새로운 Activity가 생성됩니다. Single Task 모드일 경우 앱 전체가 재시작되지 않을 것입니다. Single Task모드는 Main/Splash Activity가 Activity Stack내에 존재하지 않을때만 Main/Splash Activity를 인스턴트를 생성합니다. Main/Splash Activity가 백그라운드에 존재한다면, Main/Splash Activity로의 전달되는 모든 이후 Intent들은 이 Activity를 포그라운드로 전환시킬것입니다. Single Task 모드에 대한 자세한 내용은 [이곳](https://developer.android.com/guide/components/activities/tasks-and-back-stack.html#TaskLaunchModes)를 참조하시기 바랍니다.

- ### 브랜치 초기화

    - `LauncherActivity.java`에 Branch를 추가합니다.

    - *Java*

        ```java hl_lines="3 9 14 16 17 31 32 33 34 35 36 37 38 39 40 41 44 45 46 47"
        package com.eneff.branch.example.android;

        import android.content.Intent;
        import android.os.Bundle;
        import android.support.design.widget.FloatingActionButton;
        import android.support.design.widget.Snackbar;
        import android.support.v7.app.AppCompatActivity;
        import android.support.v7.widget.Toolbar;
        import android.util.Log;
        import android.view.View;
        import android.view.Menu;
        import android.view.MenuItem;

        import org.json.JSONObject;

        import io.branch.referral.Branch;
        import io.branch.referral.BranchError;

        public class LauncherActivity extends AppCompatActivity {

            @Override
            protected void onCreate(Bundle savedInstanceState) {
                super.onCreate(savedInstanceState);
                setContentView(R.layout.activity_launcher);
            }

            @Override
            public void onStart() {
                super.onStart();

                // Branch init
                Branch.getInstance().initSession(new Branch.BranchReferralInitListener() {
                    @Override
                    public void onInitFinished(JSONObject referringParams, BranchError error) {
                        if (error == null) {
                            Log.i("BRANCH SDK", referringParams.toString());
                            // Retrieve deeplink keys from 'referringParams' and evaluate the values to determine where to route the user
                            // Check '+clicked_branch_link' before deciding whether to use your Branch routing logic
                        } else {
                            Log.i("BRANCH SDK", error.getMessage());
                        }
                    }
                }, this.getIntent().getData(), this);
            }

            @Override
            public void onNewIntent(Intent intent) {
                this.setIntent(intent);
            }
        }
        ```

    - *Kotlin*

        ```java hl_lines="3 9 14 16 17 29 30 31 32 33 34 35 36 37 38 41 42 43"
        package com.eneff.branch.example.android

        import android.content.Intent
        import android.os.Bundle
        import android.support.design.widget.FloatingActionButton
        import android.support.design.widget.Snackbar
        import android.support.v7.app.AppCompatActivity
        import android.support.v7.widget.Toolbar
        import android.util.Log
        import android.view.View
        import android.view.Menu
        import android.view.MenuItem

        import org.json.JSONObject

        import io.branch.referral.Branch
        import io.branch.referral.BranchError

        class LauncherActivity : AppCompatActivity() {

            override fun onCreate(savedInstanceState: Bundle?) {
                super.onCreate(savedInstanceState)
                setContentView(R.layout.activity_launcher)
            }

            override fun onStart() {
                super.onStart()

                // Branch init
                Branch.getInstance().initSession(object : BranchReferralInitListener {
                    override fun onInitFinished(referringParams: JSONObject, error: BranchError?) {
                        if (error == null) {
                            Log.e("BRANCH SDK", referringParams.toString)
                            // Retrieve deeplink keys from 'referringParams' and evaluate the values to determine where to route the user
                            // Check '+clicked_branch_link' before deciding whether to use your Branch routing logic
                        } else {
                            Log.e("BRANCH SDK", error.message)
                        }
                    }
                }, this.intent.data, this)
            }

            public override fun onNewIntent(intent: Intent) {
                this.intent = intent
            }
        }
        ```

    !!! warning "Branch SDK는 꼭 Launcher Activity에서 초기화 되어야 합니다."
        앱은 Launcher Activity를 통해서 열릴것이고, 이 Activity에서 Branch SDK가 초기화 되고 클릭했던 링크의 데이터를 가져올 것입니다.

    !!! warning "`onStart()`에서만 Branch SDK를 초기화 되어야 합니다."
        Branch SDK를 `onResume()`와 같은 다른 라이프사이클 메쏘드내에서 초기화 하면 의도되지 않은 문제가 발생할 수 있습니다. `onStart()`는 Activity를 사용자에게 보여지는 단계이며 앱이 포그라운드로 전환되어 사용자와의 상호작용을 하기 위한 준비를 하는 곳입니다. 좀더 자세한 사항은 [이곳](https://developer.android.com/guide/components/activities/activity-lifecycle.html)을 참고하시기 바랍니다.

- ### 브랜치 로딩

    - `CustomApplicationClass.java`에 Branch를 추가합니다.

    - *Java*

        ```java hl_lines="4 11 12 14 15"
        package com.eneff.branch.example.android;

        import android.app.Application;
        import io.branch.referral.Branch;

        public class CustomApplicationClass extends Application {
            @Override
            public void onCreate() {
                super.onCreate();

                // Branch logging for debugging
                Branch.enableLogging();

                // Branch object initialization
                Branch.getAutoInstance(this);
            }
        }
        ```

    - *Kotlin*

        ```java hl_lines="4 10 11 13 14"
        package com.eneff.branch.example.android

        import android.app.Application
        import io.branch.referral.Branch

        class CustomApplicationClass : Application() {
            override fun onCreate() {
                super.onCreate()

                // Branch logging for debugging
                Branch.enableLogging()

                // Branch object initialization
                Branch.getAutoInstance(this)
            }
        }
        ```

- ### 딥링크 테스트

    - [Branch Dashboard](https://dashboard.branch.io/marketing)에서 딥링크를 생성합니다.

    - 기기에서 앱을 삭제합니다.

    - 컴파일후 기기에 앱을 설치합니다.

    - `Google Hangouts`에 딥링크를 붙여 넣습니다.

    - 앱을 열기 위해 딥링크를 클릭합니다.

    !!! tip "Deferred 딥링킹 테스트"
    	Deferred 딥링킹은 클릭시 아직 앱이 설치되어 있지 않은 경우에 딥링킹을 수행하는 것입니다. 앱이 설치된 후 앱이 최초로 실행될때 클릭했던 브랜치 링크에 설정되었던 딥링크 데이터를 가져오게 됩니다. 이를 테스트 하기 위해서는 기기에서 앱을 삭제한 뒤, 브랜치 링크를 클릭하고, 앱을 수동으로 실행합니다. 앱이 오픈되면 앱내 해당 컨텐츠로 정상적으로 이동해야 합니다.

## 기능 구현

- ### 컨텐츠 레퍼런스 생성

    - `Branch Universal Object`는 컨텐츠 또는 유저와 같이 공유하려는 것을 캡슐화 합니다.

    - [Universal Object Properties](#/pages/links/integrate/#universal-object)를 사용합니다.

    - *Java*

        ```java
        BranchUniversalObject buo = new BranchUniversalObject()
            .setCanonicalIdentifier("content/12345")
            .setTitle("My Content Title")
            .setContentDescription("My Content Description")
            .setContentImageUrl("https://lorempixel.com/400/400")
            .setContentIndexingMode(BranchUniversalObject.CONTENT_INDEX_MODE.PUBLIC)
            .setLocalIndexMode(BranchUniversalObject.CONTENT_INDEX_MODE.PUBLIC)
            .setContentMetadata(new ContentMetadata().addCustomMetadata("key1", "value1"));
        ```

    - *Kotlin*

        ```java
        val buo = BranchUniversalObject()
            .setCanonicalIdentifier("content/12345")
            .setTitle("My Content Title")
            .setContentDescription("My Content Description")
            .setContentImageUrl("https://lorempixel.com/400/400")
            .setContentIndexingMode(BranchUniversalObject.CONTENT_INDEX_MODE.PUBLIC)
            .setLocalIndexMode(BranchUniversalObject.CONTENT_INDEX_MODE.PUBLIC)
            .setContentMetadata(ContentMetadata().addCustomMetadata("key1", "value1"))
        ```

- ### 딥링크 생성

    - 캡슐화된 데이터로 딥링크 URL을 생성합니다.

    - [Branch Universal Object](#컨텐츠-레퍼런스-생성)가 필요합니다.

    - [Deep Link Properties](/pages/links/integrate/)를 사용합니다.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/links)에서 데이터를 확인합니다.

    - *Java*

        ```java
        LinkProperties lp = new LinkProperties()
            .setChannel("facebook")
            .setFeature("sharing")
            .setCampaign("content 123 launch")
            .setStage("new user")
            .addControlParameter("$desktop_url", "http://example.com/home")
            .addControlParameter("custom", "data")
            .addControlParameter("custom_random", Long.toString(Calendar.getInstance().getTimeInMillis()));

        buo.generateShortUrl(this, lp, new Branch.BranchLinkCreateListener() {
            @Override
            public void onLinkCreate(String url, BranchError error) {
                if (error == null) {
                    Log.i("BRANCH SDK", "got my Branch link to share: " + url);
                }
            }
        });
        ```

    - *Kotlin*

        ```java
        val lp = LinkProperties()
            .setChannel("facebook")
            .setFeature("sharing")
            .setCampaign("content 123 launch")
            .setStage("new user")
            .addControlParameter("$desktop_url", "http://example.com/home")
            .addControlParameter("custom", "data")
            .addControlParameter("custom_random", Long.toString(Calendar.getInstance().getTimeInMillis()))

        buo.generateShortUrl(this, lp, BranchLinkCreateListener { url, error ->
            if (error == null) {
                Log.i("BRANCH SDK", "got my Branch link to share: " + url)
            }
        })
        ```

- ### 딥링크 공유

    - 유저가 선택한 채널정보가 태깅된 브랜치 딥링크를 생성합니다.

    - [Branch Universal Object](#컨텐츠-레퍼런스-생성)가 필요합니다.

    - [Deep Link Properties](/pages/links/integrate/)를 사용합니다.

    - *Java*

        ```java
        LinkProperties lp = new LinkProperties()
            .setChannel("facebook")
            .setFeature("sharing")
            .setCampaign("content 123 launch")
            .setStage("new user")
            .addControlParameter("$desktop_url", "http://example.com/home")
            .addControlParameter("custom", "data")
            .addControlParameter("custom_random", Long.toString(Calendar.getInstance().getTimeInMillis()));

        ShareSheetStyle ss = new ShareSheetStyle(MainActivity.this, "Check this out!", "This stuff is awesome: ")
            .setCopyUrlStyle(ContextCompat.getDrawable(this, android.R.drawable.ic_menu_send), "Copy", "Added to clipboard")
            .setMoreOptionStyle(ContextCompat.getDrawable(this, android.R.drawable.ic_menu_search), "Show more")
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.FACEBOOK)
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.EMAIL)
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.MESSAGE)
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.HANGOUT)
            .setAsFullWidthStyle(true)
            .setSharingTitle("Share With");

        buo.showShareSheet(this, lp,  ss,  new Branch.BranchLinkShareListener() {
            @Override
            public void onShareLinkDialogLaunched() {
            }
            @Override
            public void onShareLinkDialogDismissed() {
            }
            @Override
            public void onLinkShareResponse(String sharedLink, String sharedChannel, BranchError error) {
            }
            @Override
            public void onChannelSelected(String channelName) {
            }
        });
        ```

    - *Kotlin*

        ```java
        var lp = LinkProperties()
            .setChannel("facebook")
            .setFeature("sharing")
            .setCampaign("content 123 launch")
            .setStage("new user")
            .addControlParameter("$desktop_url", "http://example.com/home")
            .addControlParameter("custom", "data")
            .addControlParameter("custom_random", Long.toString(Calendar.getInstance().getTimeInMillis()))

        val ss = ShareSheetStyle(this@MainActivity, "Check this out!", "This stuff is awesome: ")
            .setCopyUrlStyle(resources.getDrawable(this, android.R.drawable.ic_menu_send), "Copy", "Added to clipboard")
            .setMoreOptionStyle(resources.getDrawable(this, android.R.drawable.ic_menu_search), "Show more")
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.FACEBOOK)
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.EMAIL)
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.MESSAGE)
            .addPreferredSharingOption(SharingHelper.SHARE_WITH.HANGOUT)
            .setAsFullWidthStyle(true)
            .setSharingTitle("Share With")

        buo.showShareSheet(this, lp, ss, object : Branch.BranchLinkShareListener {
            override fun onShareLinkDialogLaunched() {}
            override fun onShareLinkDialogDismissed() {}
            override fun onLinkShareResponse(sharedLink: String, sharedChannel: String, error: BranchError) {}
            override fun onChannelSelected(channelName: String) {}
        })
        ```

- ### 딥링크 데이터 조회

    - 딥링크에 설정된 브랜치 데이터를 조회합니다.

    - (Race Condition)을 방지하기 위해서, `listener`를 통해서 데이터를 수신하는 것을 권장합니다.

    - [deep link properties](/pages/links/integrate/#read-deep-links)가 반환됩니다.

    - *Java*

        ```java
        // listener (within Main Activity's onStart)
        Branch.getInstance().initSession(new Branch.BranchReferralInitListener() {
            @Override
            public void onInitFinished(JSONObject referringParams, BranchError error) {
                if (error == null) {
                    Log.i("BRANCH SDK", referringParams.toString());
                } else {
                    Log.i("BRANCH SDK", error.getMessage());
                }
            }
        }, this.getIntent().getData(), this);

        // latest
        JSONObject sessionParams = Branch.getInstance().getLatestReferringParams();

        // first
        JSONObject installParams = Branch.getInstance().getFirstReferringParams();
        ```

    - *Kotlin*

        ```java
        // listener (within Main Activity's onStart)
        Branch.getInstance().initSession(object : BranchReferralInitListener {
            override fun onInitFinished(referringParams: JSONObject, error: BranchError?) {
                if (error == null) {
                    Log.e("BRANCH SDK", referringParams.toString)
                } else {
                    Log.e("BRANCH SDK", error.message)
                }
            }
        }, this.intent.data, this)

        // latest
        val sessionParams = Branch.getInstance().latestReferringParams

        // first
        val installParams = Branch.getInstance().firstReferringParams
        ```

- ### 컨텐츠로의 이동

    - 브랜치 딥링크 데이터를 읽어와서 컨텐츠로의 이동을 처리합니다.

    - *Java*

        ```java
        // listener (within Main Activity's onStart)
        Branch.getInstance().initSession(new Branch.BranchReferralInitListener() {
            @Override
            public void onInitFinished(JSONObject referringParams, BranchError error) {
                if (error == null) {
                    // option 1: log data
                    Log.i("BRANCH SDK", referringParams.toString());

                    // option 2: save data to be used later
                    SharedPreferences preferences = .getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
                    SharedPreferences.Editor editor = preferences.edit();
                    editor.putString("branchData", referringParams.toString(2));
                    editor.commit();

                    // option 3: navigate to page
                    Intent intent = new Intent(MainActivity.this, OtherActivity.class);
                    intent.putExtra("branchData", referringParams.toString(2));
                    startActivity(intent);

                    // option 4: display data
                    Toast.makeText(this, referringParams.toString(2), Toast.LENGTH_LONG).show();
                } else {
                    Log.i("BRANCH SDK", error.getMessage());
                }
            }
        }, this.getIntent().getData(), this);
        ```

    - *Kotlin*

        ```java
        // listener (within Main Activity's onStart)
        Branch.getInstance().initSession(object : BranchReferralInitListener {
            override fun onInitFinished(referringParams: JSONObject, error: BranchError?) {
                if (error == null) {
                    // option 1: log data
                    Log.i("BRANCH SDK", referringParams.toString())

                    // option 2: save data to be used later
                    val preferences =  getSharedPreferences("MyPreferences", Context.MODE_PRIVATE)
                    val editor = preferences.edit()
                    editor.putString("branchData", referringParams.toString(2))
                    editor.commit()

                    // option 3: navigate to page
                    val intent = Intent(this, MainActivity2::class.java)
                    intent.putExtra("branchData", referringParams.toString(2))
                    startActivity(intent)

                    // option 4: display data
                    Toast.makeText(this, referringParams.toString(2), Toast.LENGTH_SHORT).show()
                } else {
                    Log.e("BRANCH SDK", error.message)
                }
            }
        }, this.intent.data, this)
        ```

- ### 컨텐츠 노출

    - `App Indexing`을 사용해서 `Google Search`에 컨텐츠를 노출시킵니다.

    - [Branch Dashboard](#https://dashboard.branch.io/search)에서 앱 인덱싱을 활성화 합니다.

    - [App indexing validator](https://branch.io/resources/app-indexing/)로 검증합니다.

    - [Branch Universal Object](#컨텐츠-레퍼런스-생성)가 필요합니다.

    - `build.gradle`에 앱인덱싱 라이브러리를 추가합니다.

        ```java
        compile 'com.google.android.gms:play-services-appindexing:9.+'
        ```

    - *Java*

        ```java
        buo.listOnGoogleSearch(this);
        ```

    - *Kotlin*

        ```java
        buo.listOnGoogleSearch(this)
        ```


- ### 컨텐츠 트래킹

    - 사용자의 컨텐츠를 조회를 트래킹합니다.

    - [Branch Universal Object](#컨텐츠-레퍼런스-생성)가 필요합니다.

    - [Track content properties](#track-content-properties)를 사용합니다.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/content)에서 데이터를 검증합니다.

    - *Java*

        ```java
        new BranchEvent(BRANCH_STANDARD_EVENT.VIEW_ITEM).addContentItems(buo).logEvent(context);
        ```

    - *Kotlin*

        ```java
        BranchEvent(BRANCH_STANDARD_EVENT.VIEW_ITEM).addContentItems(buo).logEvent(context)
        ```

- ### 사용자 트래킹

    - 이벤트, 딥링크, Referral에 사용자에 대한 식별자(email, ID, UUID, etc)를 설정합니다. 사용자의 식별자 설정의 경우 꼭 사내 개인정보보호 관련부서와 사전 논의합니다.

    - 설정가능한 사용자 식별자의 최대 길이는 `127`입니다.

    - [Branch Dashboard](https://dashboard.branch.io/liveview/identities)에서 데이터를 검증합니다.

    - *Java*

        ```java
        // login
        Branch.getInstance().setIdentity("your_user_id");

        // logout
        Branch.getInstance().logout();
        ```

    - *Kotlin*

        ```java
        // login
        Branch.getInstance().setIdentity("your_user_id")

        // logout
        Branch.getInstance().logout()
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

        - *Java*

            ```java
            Branch.getInstance().redeemRewards(5);
            ```

        - *Kotlin*

            ```java
            Branch.getInstance().redeemRewards(5)
            ```

    - Load credits (크레딧 로딩)

        - *Java*

            ```java
            Branch.getInstance().loadRewards(new BranchReferralStateChangedListener() {
                @Override
                public void onStateChanged(boolean changed, Branch.BranchError error) {
                    int credits = branch.getCredits();
                }
            });
            ```

        - *Kotlin*

            ```java
            Branch.getInstance().loadRewards { changed, error ->
                if (error != null) {
                    Log.i("BRANCH SDK", "branch load rewards failed. Caused by -" + error.message)
                } else {
                    Log.i("BRANCH SDK", "changed = " + changed)
                    Log.i("BRANCH SDK", "rewards = " + branch.credits)
                }
            }
            ```

    - Load history (히스토리 로딩)

        - *Java*

            ```java
            Branch.getInstance().getCreditHistory(new BranchListResponseListener() {
                public void onReceivingResponse(JSONArray list, Branch.BranchError error) {
                    if (error != null) {
                        Log.i("BRANCH SDK", "branch load rewards failed. Caused by -" + error.message)
                    } else {
                        Log.i("BRANCH SDK", list);
                    }
                }
            });
            ```

        - *Kotlin*

            ```java
            Branch.getInstance().getCreditHistory { history, error ->
                if (error != null) {
                    Log.i("BRANCH SDK", "branch load credit history failed. Caused by -" + error.message)
                } else {
                    if (history.length() > 0) {
                        Log.i("BRANCH SDK", history.toString(2))
                    } else {
                        Log.i("BRANCH SDK", "no history found")
                    }
                }
            }
            ```

- ### 푸시알림 처리

    - Result Intent에 브랜치 링크를 추가해서 GCM 푸시 알림을 통한 컨텐츠로의 딥링킹이 처리됩니다.

    - *Java*

        ```java
        Intent resultIntent = new Intent(this, TargetClass.class);
        intent.putExtra("branch","http://xxxx.app.link/testlink");
        intent.putExtra("branch_force_new_session",true);
        PendingIntent resultPendingIntent =  PendingIntent.getActivity(this, 0, resultIntent, PendingIntent.FLAG_UPDATE_CURRENT);
        ```

    - *Kotlin*

        ```java
        val resultIntent = Intent(this, TargetClass::class.java)
        intent.putExtra("branch", "http://xxxx.app.link/testlink")
        val resultPendingIntent = PendingIntent.getActivity(this, 0, resultIntent, PendingIntent.FLAG_UPDATE_CURRENT)
        intent.putExtra("branch_force_new_session", true)
        ```

- ### 앱 내에서 링크 처리

    - Chrome Intent를 실행해서 앱내에서 현재앱내로의 딥링킹을 수행할수 있습니다.

    - *Java*

        ```java
        Intent intent = new Intent(this, ActivityToLaunch.class);
        intent.putExtra("branch","http://xxxx.app.link/testlink");
        intent.putExtra("branch_force_new_session",true);
        startActivity(intent);
        ```

    - *Kotlin*

        ```java
        val intent = Intent(this, ActivityToLaunch::class.java)
        intent.putExtra("branch", "http://xxxx.app.link/testlink")
        intent.putExtra("branch_force_new_session", true)
        startActivity(intent)
        ```

    - "http://xxxx.app.link/testlink"를 실제 링크 URL로 변경하세요.

!!! warning
    앱내에서 새로운 딥링크를 처리하는 경우 현재의 세션 데이터가 지워지고, 새로 참조된 "open"으로 애트리뷰션이 됩니다.

- ### 100% 정확도 매칭 활성화

    - 애트리뷰션의 정확도를 향상 시키기위해 `Chrome Tabs`을 사용합니다.

    - `build.gradle`파일에 `compile 'com.android.support:customtabs:23.3.0'`을 추가합니다.

- ### 사용자 트래킹 활성화 / 비활성화

    GDPR관련 또는 다른 목적으로 트래킹을 원치 않는 사용자의 요청에 대응할 필요가 있다면, 네트워크 데이터전송을 차단하여 해당 사용자에 대한 트래킹을 중단할 수 있습니다. 이 기능은 특정링크 또는 브랜치 링크를 통해서 어떤 사용자에게든 활성화 할 수 있습니다.

    ```java
    Branch.getInstance().disableTracking(true);
    ```

    앱이 실행되는 동안 호출이 가능하며, 한번 호출이 되면 브랜치 SDK의 모든 네트워크 데이터 전송이 차단됩니다. 링크생성 기능은 계속 동작합니다만, 해당 유저를 식별할 수 있는 정보는 포함되지 않을 것입니다. 딥링킹도 계속 동작하지만 해당 유저에 대한 분석정보는 트래킹되지 않을 것입니다.


## 문제 해결

- ### 로깅기능 활성화

    - *Java*

        ```java
        Branch.enableLogging();
        ```

- ### 브랜치 연동 테스트

    메인 Activity의 onStart()메쏘드 내에서 `IntegrationValidator.validate`메쏘드를 호출해서 브랜치연동에 관련된 항목들을 테스트 할수 있습니다. ADB Logcat을 통해서 SDK 연동 테스트가 통과 되는지 확인하시기 바랍니다. 상용/릴리즈 빌드에서는 `IntegrationValidator.validate` 메쏘드를 꼭 주척처리해서 제거 해주어야 합니다.

    - *Java*

        ```java
        IntegrationValidator.validate(MainActivity.this);
        ```


- ### 샘플 테스트 앱

    - [Branchsters](https://github.com/BranchMetrics/Branch-Example-Deep-Linking-Branchster-Android)

    - [Testbed](https://github.com/BranchMetrics/android-branch-deep-linking/tree/master/Branch-SDK-TestBed)

- ### 인스톨 시뮬레이션

    - 기기의 hardware_id 수집을 우회합니다.

        - `AndroidManifest.xml`에서 아래와 같이 `true`로 설정합니다.

            ```xml
            <meta-data android:name="io.branch.sdk.TestMode" android:value="true" />
            ```
        - *[또는]* `Branch.getInstance().initSession()` 호출 이전에 `Branch.enableTestMode();` 을 추가합니다.

        - 상용/릴리즈 빌드나 Google Play Store 제출용 버전에서는 `TestMode`를 사용하면 안됩니다.

    - 기기에서 앱을 삭제

    - 브랜치 딥링크를 클릭합니다. (앱이 설치되어있지 않으므로 fallback URL로 이동 할것입니다.)

    - 앱을 재설치 합니다.

    - `Branch.getInstance().initSession()`에서 딥링크 데이터를 읽어 `+is_first_session=true`이 반환되는지 확인합니다.

- ### 컨텐츠 속성 트래킹

    - [컨텐츠 트래킹](#컨텐츠-트래킹)에 사용됩니다.

        | Key | Value
        | --- | ---
        | BNCRegisterViewEvent | 오브젝트 조회
        | BNCAddToWishlistEvent | Wishlist에 오브젝트 추가
        | BNCAddToCartEvent | Cart에 오브젝트 추가
        | BNCPurchaseInitiatedEvent | Check-out 시작
        | BNCPurchasedEvent | 아이템 구매완료
        | BNCShareInitiatedEvent | 오브젝트 공유 시작
        | BNCShareCompletedEvent | 오브젝트 공유 완료

- ### bnc.lt 또는 커스텀 링크 도메인 사용

    - *bnc.lt link domain*

        ```xml
        <activity android:name="com.yourapp.your_activity">
            <!-- App Link your activity to Branch links-->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                 <data android:scheme="https" android:host="bnc.lt" />
                 <data android:scheme="https" android:host="bnc.lt" />
            </intent-filter>
        </activity>
        ```

    - *custom link domain*

        ```xml
        <activity android:name="com.yourapp.your_activity">
            <!-- App Link your activity to Branch links-->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                 <data android:scheme="https" android:host="your.app.com" />
                 <data android:scheme="https" android:host="your.app.com" />
            </intent-filter>
        </activity>
        ```

    - 아래의 커스텀 도메인을 [Branch Dashboard](https://dashboard.branch.io/settings/link)에 설정된 값으로 변경합니다.

        - `your.app.com`


 - ### 브랜치와 Fabric Answers

    - `answers-shim`의 임포트를 원하지 않을 경우

        ```
        compile ('io.branch.sdk.android:library:2.+') {
          exclude module: 'answers-shim'
        }
        ```

- ### 딥링크 라우팅

    - 아래와 같은 특정 URL Scheme Path를 로딩합니다.
        - `$deeplink_path="content/123"`
        - `$android_deeplink_path="content/123"`

    - [컨텐츠로의 이동](#컨텐츠로의-이동)의 사용을 권장합니다.

        ```xml
        <meta-data android:name="io.branch.sdk.auto_link_path" android:value="content/123/, another/path/, another/path/*" />
        ```

- ### 앱내의 딥링크 라우딩

    - 앱내에서 HTML을 정상적으로 렌더링하기 위해서 `WebView`와 `ChromeTab`이 사용됩니다.

    - `WebView`내의 브랜치 링크는 앱내로 라우팅 되지만 다른 컨텐츠들은 앱외부로 라우팅 됩니다.

    - `Web View`로 브랜치 딥링크 열기

        - *Java*

            ```java
            @Override
            protected void onCreate(Bundle savedInstanceState) {
                super.onCreate(savedInstanceState);
                setContentView(R.layout.activity_main);
                WebView webView = (WebView) findViewById(R.id.webView);
                webView.setWebViewClient(new BranchWebViewController(YOUR_DOMAIN, MainActivity.class)); //YOUR_DOMAIN example: appname.app.link
                webView.loadUrl(URL_TO_LOAD);
            }

            public class BranchWebViewController extends WebViewClient {

                private String myDomain_;
                private Class activityToLaunch_;

                BranchWebViewController(@NonNull String myDomain, Class activityToLaunch) {
                    myDomain_ = myDomain;
                    activityToLaunch_ = activityToLaunch;
                }

                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();

                    if (url.contains(myDomain_)) {
                        Intent i = new Intent(view.getContext(), activityToLaunch_);
                        i.putExtra("branch", url);
                        i.putExtra("branch_force_new_session", true);
                        startActivity(i);
                        //finish(); if launching same activity
                    } else {
                        view.loadUrl(url);
                    }

                    return true;
                }
            }
            ```

        - *Kotlin*

            ```java
            override fun onCreate(savedInstanceState: Bundle?) {
                super.onCreate(savedInstanceState)
                setContentView(R.layout.activity_main)
                val webView = findViewById(R.id.webView) as WebView
                webView!!.webViewClient = BranchWebViewController("appname.app.link", MainActivity2::class.java)
                webView!!.loadUrl(URL_TO_LOAD)
            }

            inner class BranchWebViewController internal constructor(private val myDomain_: String, private val activityToLaunch_: Class<*>) : WebViewClient() {

                override fun onLoadResource(view: WebView, url: String) {
                    super.onLoadResource(view, url)
                }

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val url = request.url.toString()

                    if (url.contains(myDomain_)) {
                        val i = Intent(view.context, activityToLaunch_)
                        i.putExtra("branch", url)
                        i.putExtra("branch_force_new_session", true)
                  //finish(); if launching same activity
                        startActivity(i)
                    } else {
                        view.loadUrl(url)
                    }

                    return true
                }
            }
            ```

    - `Chrome Tabs`로 브랜치 딥링크 열기

        - *Java*

            ```java
            CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
            CustomTabsIntent customTabsIntent = builder.build();
            customTabsIntent.intent.putExtra("branch", BRANCH_LINK_TO_LOAD);
            customTabsIntent.intent.putExtra("branch_force_new_session", true);
            customTabsIntent.launchUrl(MainActivity.this, Uri.parse(BRANCH_LINK_TO_LOAD));
            //finish(); if launching same activity
            ```

        - *Kotlin*

            ```java
            val builder = CustomTabsIntent.Builder()
            val customTabsIntent = builder.build()
            customTabsIntent.intent.putExtra("branch", BRANCH_LINK_TO_LOAD)
            customTabsIntent.intent.putExtra("branch_force_new_session", true)
            customTabsIntent.launchUrl(this@MainActivity2, Uri.parse(BRANCH_LINK_TO_LOAD))
            //finish() if launching same activity
            ```

- ### 딥링크 Activity의 종료

    - 딥링크 Activity가 종료될때 알림을 받는 방법

        ```xml
        <meta-data android:name="io.branch.sdk.auto_link_request_code" android:value="@integer/AutoDeeplinkRequestCode" />
        ```

    - *Java*

        ```java
        @Override
        protected void onActivityResult(int requestCode, int resultCode, Intent data) {
            super.onActivityResult(requestCode, resultCode, data);

            // Checking if the previous activity is launched on branch Auto deep link.
            if(requestCode == getResources().getInteger(R.integer.AutoDeeplinkRequestCode)){
                //Decide here where  to navigate  when an auto deep linked activity finishes.
                //For e.g. Go to HomeActivity or a  SignUp Activity.
                Intent i = new Intent(getApplicationContext(), CreditHistoryActivity.class);
                startActivity(i);
            }
        }
        ```

    - *Kotlin*

        ```java
        override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
            super.onActivityResult(requestCode, resultCode, data)

            // Checking if the previous activity is launched on branch Auto deep link.
            if (requestCode == resources.getInteger(R.integer.AutoDeeplinkRequestCode)) {
                //Decide here where  to navigate  when an auto deep linked activity finishes.
                //For e.g. Go to HomeActivity or a  SignUp Activity.
                val i = Intent(applicationContext, CreditHistoryActivity::class.java)
                startActivity(i)
            }
        }
        ```

- ### 브랜치링크에 대한 딥링크 테스트

    브랜치 링크에 `?bnc_validate=true`를 추가한 뒤 (시뮬레이터가 아닌) 실제 기기에서 클릭하여 테스트 합니다. 예를들면 샘플 브랜치 링크 `"https://<yourapp\>.app.link/NdJ6nFzRbK"`에 대해서 `"https://<yourapp\>.app.link/NdJ6nFzRbK?bnc_validate=true"`링크를 클릭합니다.


- ### Android 15 이전 버전 지원

    - `Branch SDK 1.14.5`를 사용합니다.

    - `onStart()`와 `onStop()`에 아래의 코드를 추가 합니다.

    - *Java*

        ```java
        @Override
        protected void onStart() {
            super.onStart();
            Branch.getInstance(getApplicationContext()).initSession();
        }

        @Override
        protected void onStop() {
            super.onStop();
            branch.closeSession();
        }
        ```

    - *Kotlin*

        ```java
        override fun onStart() {
            super.onStart()
            Branch.getInstance().initSession()
        }

        override fun onStop() {
            super.onStop()
            Branch.getInstance().closeSession()
        }
        ```

- ### 디폴트 Application 클래스 사용

    - 앱에 Application클래스가 없는 경우

        ```xml
        <application android:name="io.branch.referral.BranchApp">
        ```

- ### 커스텀 Install Referrer 리시버

    - 안드로이드에서는 앱당 하나의 `BroadcastReceiver`만 허용됩니다.

    - `AndroidManifest.xml`에 아래의 내용을 추가합니다.

        ```xml
        <receiver android:name="com.BRANCH SDK.CustomInstallListener" android:exported="true">
          <intent-filter>
            <action android:name="com.android.vending.INSTALL_REFERRER" />
          </intent-filter>
        </receiver>
        ```

    - `onReceive()`내에서 `io.branch.referral.InstallListener` 인스턴스를 생성합니다.

    - *Java*

        ```java
        InstallListener listener = new InstallListener();
        listener.onReceive(context, intent);
        ```

    - *Kotlin*

        ```java
        val listener = InstallListener()
        listener.onReceive(context, intent)
        ```

- ### Signing Certificate 생성

    - Android `App Links` 딥링킹 지원을 위한 것입니다.

    - 키스토어 파일의 디렉토리로 이동합니다.

    - `keytool -list -v -keystore my-release-key.keystore`를 실행합니다.

    - `AA:C9:D9:A5:E9:76:3E:51:1B:FB:35:00:06:9B:56:AC:FB:A6:28:CE:F3:D6:65:38:18:E3:9C:63:94:FB:D2:C1`와 같은 값이 생성될것입니다.

    - 이 값을 [Branch Dashboard](https://dashboard.branch.io/link-settings)에 복사합니다.

- ### 인스톨 리스너를 통한 매칭

    - 구글플레이에서 브랜치로의 `link_click_id`전달 기능을 활성화 시킵니다.

    - 이를 통해 애트리뷰션과 Deferred Deep Linking의 정확도를 향상됩니다.

    - 브랜치의 기본설정은 `1.5`초 동안 구글 플레이로부터 인스톨 레퍼러 수신을 대기 합니다.

    - 필요에 따라서 해당 값을 최적화 할수 있습니다. (예. `0`, `5000`, `10000`)

    - Application클래스의 `getAutoInstance` ([브랜치 로딩](#브랜치-로딩)) 앞에 추가합니다.

    - *Java*

        ```java
        Branch.setPlayStoreReferrerCheckTimeout(5000);
        ```

    - *Kotlin*

        ```java
        Branch.setPlayStoreReferrerCheckTimeout(5_000)
        ```

    - 테스트

        ```sh
        adb shell am broadcast -a com.android.vending.INSTALL_REFERRER -n io.branch.androidexampledemo/io.branch.referral.InstallListener --es "referrer" "link_click_id=123"
        ```

- ### Multidexing 활성화

    - 참조할 라이브러리들이 추가되면서 Dex 제한을 초과하는 경우 `NoClassDefFoundError` 또는 `ClassNotFoundException`이 발생될 수 있습니다.

    - `build.gradle`에 추가합니다.

        ```java
        defaultConfig {
            multiDexEnabled true
        }
        ```

    - `Application class`에 다음의 코드를 추가해서 `MultiDexApplication`를 상속합니다.

    - *Java*

        ```java
        @Override
        protected void attachBaseContext(Context base) {
            super.attachBaseContext(base);
            MultiDex.install(this);
        }
        ```

    - *Kotlin*

        ```java
        override fun attachBaseContext(base: Context?) {
            super.attachBaseContext(base)
            MultiDex.install(this)
        }
        ```

- ### InvalidClassException, ClassLoadingError, 또는 VerificationError

    - 종종 `Proguard`의 버그로 인해 발생합니다. 최신 버전의 Proguard를 사용하거나 `-dontoptimize`설정을 사용해서 Proguard의 최적화 기능을 비활성화 합니다.

- ### answers-shim모듈 관련 Proguard warning 또는 error

    - `answers-shim`을 제외시킬때 종종 발생합니다. `-dontwarn com.crashlytics.android.answers.shim.**`을 `Proguard`파일에 추가합니다.

- ### AppIndexing 모듈 관련 Proguard warning 또는 error

    - 브랜치 SDK는 Firebase의 컨텐츠 리스팅 기능과 새로운 Android Install Referrer Library지원을 위해서 Firebase의 앱 인덱싱 모듈과 안드로이드 인스톨 레퍼러 클래스들에 대한 선택적 의존성을 가지고 있습니다. 이로 인해 Progard 설정에 따라 Progard warning이 발생할 수 있습니다. 이 이슈를 해결하기 위해서는 다음의 내용을 Progard파일에 추가해야 합니다.

    `-dontwarn com.google.firebase.appindexing.**`  `-dontwarn com.android.installreferrer.api.**`

- ### Play Services Ads 모듈을 제외하는 Proguard rule

  - 브랜치 SDK는 GAID 수집해서 매칭에 활용하기 위해 Paly Services Ads에 대한 선택적 의존성을 가지고 있습니다. Progard사용시에 GAID수집에 관련된 문제가 없도록 하기 위해서는 다음의 내용을 Progard파일에 추가 해야 합니다.

    ```
    -keep class com.google.android.gms.ads.identifier.AdvertisingIdClient {
        com.google.android.gms.ads.identifier.AdvertisingIdClient$Info getAdvertisingIdInfo(android.content.Context);
    }
    -keep class com.google.android.gms.ads.identifier.AdvertisingIdClient$Info {
        java.lang.String getId();
        boolean isLimitAdTrackingEnabled();
    }
    ```

- ### 이 링크를 열수 없다는 에러

    - URI Scheme 리다이렉션이 실패할경우 발생합니다.
    - `$deeplink_path`가 없도록 하거나 `AndroidManifest.xml`에서 허용된 `$deeplink_path`를 지정해야 합니다.

- ### `initState_ == SESSION_STATE.INITIALISING` 상태에서 멈추어 있을 경우

    - Branch SDK가 올바른 Application Context를 Activity에서 가져오지 못한 경우 종종 발생합니다. Branch 인스턴스에 접근할때 아래와 같이 싱글톤 클래스로 전달해서 문제를 해결할 수 있습니다.

    ```java
    Branch.getInstance(getApplicationContext());
    ```

- ### 최소 지원 안드로이드 버전
    API Level 9(Android 2.3 GINGERBREAD)까지 앱에서 지원하기 위해서는 1.14.5를 사용해야 합니다. API Level 15(Android 4.0.3 ICE_CREAM_SANDWICH_MR1)까지 지원하기 위해서는 2.x버전을 사용해야 합니다. Branch SDK 3.x에서 지원하는 최소 Android API Level은 16(Android 4.1 JELLY_BEAN) 입니다.
