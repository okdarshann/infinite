# Infinite

**We deserve better.**

Infinite is a free goal and progress tracker. It runs in the browser and installs as a native Android and iOS app
from the same code. Track your year, month and week, set daily to yearly goals, plan on a life calendar, take notes,
work with friends in teams, and get motivational stories and songs picked for your goals.

Live site: okdarshann.github.io/infinite/
APK Downlaod: https://okdarshann.github.io/infinite-apk-site/

> **Credit**: Inspired by [twi-exe/life-is-short](https://github.com/twi-exe/life-is-short). Credit to the original creator for the core concept 

## Features

- **Progress dashboard**: live progress for the year, quarter, month and week, with a quote of the day.
- **Goals**: daily, weekly, monthly and yearly goals with a habit tracker sheet.
- **Life Calendar**: see your whole year at a glance.
- **Notepad & Docs**: rich text notes with highlighting. Notes you share with a team stay in sync both ways -- a teammate's edit is merged back into your original note and tagged with who changed it.
- **Team Goals**: create or join a team with an invite code, share goals, chat and cheer each other on. Shared docs open from a chat bubble in a big live popup showing exactly what each member is allowed to do.
- **Inspire Feed**: paste any YouTube video or song link under **My Links** and it shows as a clickable thumbnail (click to open on YouTube). Also motivational stories and song previews matched to your goals, updated automatically.
- **Android and iOS apps**: the same pages packaged with Capacitor, so the tracker installs from a store and opens
  without a browser. Guest data and cloud sync behave exactly as they do on the web.
- **Accounts and cloud sync**: email login with Firebase, or use it as a guest without an account. Google sign-in is
  offered on the web and hidden in the apps -- see [Sign-in protection](#sign-in-protection).
- **Light and dark mode**, responsive on desktop and mobile.

## Tech

Plain HTML, CSS and JavaScript. Firebase Authentication and Firestore for accounts and sync. GitHub Pages for hosting
and GitHub Actions for the Inspire Feed. Capacitor packages the same files into the Android and iOS apps. The site
itself needs no build step.

## Run locally

Open the folder in VS Code and start the **Live Server** extension, or run any static server:

```
python3 -m http.server 5500
```

Then visit http://127.0.0.1:5500

## Deploy

1. Push the code to the `main` branch.
2. In **Settings > Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. Every push to `main` is published automatically at `https://<username>.github.io/<repo>/`.

## Mobile app (Android and iOS)

The app is this website, packaged with [Capacitor](https://capacitorjs.com). No page is rewritten for mobile: the
files in the app bundle are the same ones GitHub Pages serves, copied into `www/` by `scripts/build-mobile.js`.

```bash
npm install              # once
npm run mobile:apk       # build the Android APK into dist/
npm run mobile:sync      # build www/ and copy it into android/ and ios/
npm run mobile:android   # open Android Studio
npm run mobile:ios       # open Xcode (macOS only)
npm run mobile:run:android   # build and install on a connected device
```

`www/` is generated and gitignored: delete it whenever you like, `npm run mobile:sync` brings it back. Run the sync
after every change to a page, a style or a script, or the app keeps the old copy.

Requirements: JDK 17 or newer and the Android SDK for Android; macOS with Xcode 16+ for iOS. `npm run
mobile:icons` regenerates the launcher icon and splash screens from `deserve.png` when the artwork changes.

### The APK in `dist/`

`dist/Infinite-1.0-android-debug.apk` is a built, ready-to-install Android app: the whole site in the repo, packaged
and signed. It needs no Android Studio, no SDK and no build step to use. Copy it to a phone and open it, or install it
over USB:

```bash
adb install -r dist/Infinite-1.0-android-debug.apk
```

Opened on the phone itself, the file asks to allow "install unknown apps" for the app you opened it from -- allow it
once and Infinite installs like anything from the store. It runs on Android 7.0 (API 24) and newer, which is every
phone still receiving updates.

It is a **debug** build, and that is what makes it installable with nothing else set up: it is signed with the
standard Android debug key. That signature is enough for a phone and not enough for Play Store, which will not take
the file, and it means no other build can ever update this one in place. Rebuilding is one command, and it re-derives
`www/` from the site first so the APK can never be a stale copy of a page you have since edited:

```bash
npm run mobile:apk       # writes dist/Infinite-<versionName>-android-debug.apk
```

For a release build, make a keystore and hand it to Gradle. The keystore is yours and stays out of the repo, along
with every `*.jks` -- see [Not in this repo](#not-in-this-repo):

```bash
keytool -genkeypair -v -keystore android/keystore/infinite-release.jks \
  -alias infinite -keyalg RSA -keysize 2048 -validity 10000
cd android
./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file="$PWD/keystore/infinite-release.jks" \
  -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias=infinite \
  -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
```

Keep that file. Android only installs an update signed with the same key, so losing it means every future release
starts with uninstalling the old app.

### Why there is no iOS file in `dist/`

An iPhone cannot run an APK -- the two formats are not interchangeable, and no conversion exists. The iOS app is the
same code already in `ios/`, but it becomes an `.ipa` only on macOS, where Xcode signs it with an Apple certificate:

```bash
npm run mobile:sync   # copy the site into ios/
npm run mobile:ios    # Xcode: pick your team, then Product > Archive
```

That archive step cannot be run on Linux or Windows, so no `.ipa` is committed here. To get the app onto an iPhone
without a paid account, connect the device and use **Product > Run** in Xcode instead of Archive: it installs
straight to that phone with a free personal team, and the signature lasts seven days before Xcode has to sign it
again.

What differs inside the app, and why:

- **Email and password sign-in only.** Google sign-in opens a popup, which an embedded WebView cannot host, so the
  button and its divider are hidden by the `.native-app` rules in `static/css/mobile.css`.
- **External links leave the app.** YouTube videos, `mailto:` and `tel:` links are handed to the system browser or
  mail app by `static/js/native.js`.
- **The back gesture walks the page history** and leaves the app from the dashboard.
- **The dashboard needs no connection**; accounts and sync do, because the Firebase SDK and your data live online.

Before publishing, change `appId` in `capacitor.config.json`, run `npx cap sync`, then set your version and signing
in Android Studio and Xcode.

## Firebase setup

1. Create a Firebase project and register a web app.
2. Paste the web config into `static/js/auth.js`.
3. Enable **Authentication > Sign-in method > Email/Password**.
4. Add your `<username>.github.io` domain under **Authentication > Settings > Authorized domains**.
5. Create a **Firestore** database. The rules are **`firestore.rules`**, but the committed copy is a *template*:
   `owner@example.com` stands in for your own account, so the admin address stays out of this repository. The real
   one lives in **`firestore.rules.deploy`**, which is gitignored and never pushed.
6. To publish, put the real address back and deploy:

   ```bash
   cp firestore.rules.deploy firestore.rules
   firebase deploy --only firestore
   ```

   Skipping step 6 means Firestore rules stay at the template, which still protects teams and users.

> The Firebase Web API key ships in every page that uses Firebase, and the site's JavaScript has to name the admin
> account so the browser can draw the admin UI -- so neither is treated as a secret here. Knowing the address is not
> access: every admin-only rule also requires the request to come from a signed-in session on that account. Real
> secrets (the AI provider token, the Gemini key) are never committed -- see
> [Not in this repo](#not-in-this-repo).

The template's own header says the same thing:

```
// Firestore security rules for Infinite.
//
// PUBLIC COPY: owner@example.com below is a placeholder for your own account -- the one
// allowed to read every message and to hold the developer key. The copy you deploy lives
// in firestore.rules.deploy (gitignored), with the real address in it: copy it over this
// file before running `firebase deploy --only firestore`, or the admin inbox stays shut
// for everyone, yourself included. Note that the live site's JavaScript still names the
// admin account in clear text -- a browser has to recognise it to draw the UI -- so this
// placeholder hides the address from a reader of the repo, not from a reader of the site.
```

And the rules themselves, which are the same text:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Contact page messages (top-level collection: /contactMessages/{id}).
    //  create: anyone, exactly these fields. "uid" is optional and, if present, must be the sender's own.
    //  read:   the developer (all messages) or a signed-in sender (only their own, matched by uid).
    //  update/delete: the developer, or the signed-in sender of that message (see below).
    match /contactMessages/{messageId} {
      allow create: if request.resource.data.keys()
                      .hasOnly(['name', 'email', 'message', 'createdAt', 'to', 'uid', 'read'])
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 80
        && request.resource.data.email is string
        && request.resource.data.email.size() > 0
        && request.resource.data.email.size() <= 120
        && request.resource.data.message is string
        && request.resource.data.message.size() > 0
        && request.resource.data.message.size() <= 2000
        && request.resource.data.createdAt is timestamp
        && request.resource.data.to == 'connect.darshanparmar@gmail.com'
        && (!('uid' in request.resource.data)
            || (request.auth != null && request.resource.data.uid == request.auth.uid))
        && (!('read' in request.resource.data) || request.resource.data.read == false);
      allow read: if request.auth != null && (
        request.auth.token.email == 'owner@example.com'
        || ('uid' in resource.data && resource.data.uid == request.auth.uid));
      // developer: only the "read" flag.  sender (signed in, own message): only the text, and it goes back to unread.
      allow update: if request.auth != null && (
        (request.auth.token.email == 'owner@example.com'
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']))
        || ('uid' in resource.data && resource.data.uid == request.auth.uid
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['message', 'editedAt', 'read'])
          && request.resource.data.message is string
          && request.resource.data.message.size() > 0
          && request.resource.data.message.size() <= 2000
          && request.resource.data.editedAt is timestamp
          && request.resource.data.read == false));
      // developer can delete anything; a signed-in sender can delete their own message.
      allow delete: if request.auth != null && (
        request.auth.token.email == 'owner@example.com'
        || ('uid' in resource.data && resource.data.uid == request.auth.uid));
    }

    // Developer's public profile photo (a small image). Anyone can read it; only the admin can write it.
    match /publicProfile/{docId} {
      allow read: if true;
      allow create, update: if request.auth != null
        && request.auth.token.email == 'owner@example.com'
        && request.resource.data.keys().hasOnly(['photo', 'updatedAt'])
        && request.resource.data.photo is string
        && request.resource.data.photo.size() < 100000;
      allow delete: if request.auth != null
        && request.auth.token.email == 'owner@example.com';
    }

    // Developer key (hash only). Readable and writable by the developer's account and nobody else.
    match /adminConfig/{docId} {
      allow read, write: if request.auth != null
        && request.auth.token.email == 'owner@example.com';
    }

    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      allow update: if request.auth != null && (
        request.auth.uid in resource.data.memberIds ||
        (
          request.auth.uid in request.resource.data.memberIds &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['memberIds', 'members'])
        )
      );

      match /goals/{goalId} {
        allow read, create, update: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
      match /messages/{messageId} {
        allow read, create: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        // a sender can delete their own message; the team owner can delete any (used by "Clear chat")
        allow delete: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds &&
          (resource.data.senderId == request.auth.uid ||
           get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId == request.auth.uid);
      }
      // "Seen" receipts: each member writes only their own doc
      match /reads/{uid} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        allow create, update, delete: if request.auth != null && request.auth.uid == uid &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
      // "Typing…" indicator: each member writes only their own doc
      match /typing/{uid} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        allow create, update, delete: if request.auth != null && request.auth.uid == uid &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
      // ------------------------------------------------------------------
      // Shared docs.
      //
      // This block is what actually keeps a "view only" doc view only. The UI in
      // static/js/team.js and notepad/index.html is only the first half of the
      // lock; everything below is the half a hand-edited page cannot get past.
      //
      //   read  -> nobody may change anything except the person who shared the
      //            doc. No teammate, and not even the owner of the team.
      //   write -> every member may change title/body/updated* and nothing else.
      //
      // `permission` and `ownerId` are not in the member allow-list below, so a
      // teammate can never turn a locked doc into an editable one, and only the
      // owner can move between 'read' and 'write' at all.
      // ------------------------------------------------------------------
      match /docs/{docId} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        allow create: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds &&
          request.resource.data.ownerId == request.auth.uid &&
          request.resource.data.permission in ['read', 'write'];
        allow update: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds && (
            // the person who shared the doc owns it: they may relock it, rename it,
            // anything -- but the doc stays theirs and stays one of the two values
            (resource.data.ownerId == request.auth.uid &&
             request.resource.data.ownerId == resource.data.ownerId &&
             request.resource.data.permission in ['read', 'write']) ||
            // anybody else: only while the doc is unlocked, and only the text
            (resource.data.permission == 'write' &&
             request.resource.data.updatedBy == request.auth.uid &&
             request.resource.data.diff(resource.data).affectedKeys()
               .hasOnly(['title', 'body', 'updatedAt', 'updatedBy', 'updatedByName']))
          );
        // the doc owner or the team owner can delete (a delete, never an edit)
        allow delete: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds &&
          (resource.data.ownerId == request.auth.uid ||
           get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId == request.auth.uid);
      }
      match /rewards/{rewardId} {
        allow read, create, update: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
    }
  }
}
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Contact page messages (top-level collection: /contactMessages/{id}).
    //  create: anyone, exactly these fields. "uid" is optional and, if present, must be the sender's own.
    //  read:   the developer (all messages) or a signed-in sender (only their own, matched by uid).
    //  update/delete: the developer, or the signed-in sender of that message (see below).
    match /contactMessages/{messageId} {
      allow create: if request.resource.data.keys()
                      .hasOnly(['name', 'email', 'message', 'createdAt', 'to', 'uid', 'read'])
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 80
        && request.resource.data.email is string
        && request.resource.data.email.size() > 0
        && request.resource.data.email.size() <= 120
        && request.resource.data.message is string
        && request.resource.data.message.size() > 0
        && request.resource.data.message.size() <= 2000
        && request.resource.data.createdAt is timestamp
        && request.resource.data.to == 'connect.darshanparmar@gmail.com'
        && (!('uid' in request.resource.data)
            || (request.auth != null && request.resource.data.uid == request.auth.uid))
        && (!('read' in request.resource.data) || request.resource.data.read == false);
      allow read: if request.auth != null && (
        request.auth.token.email == 'owner@example.com'
        || ('uid' in resource.data && resource.data.uid == request.auth.uid));
      // developer: only the "read" flag.  sender (signed in, own message): only the text, and it goes back to unread.
      allow update: if request.auth != null && (
        (request.auth.token.email == 'owner@example.com'
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']))
        || ('uid' in resource.data && resource.data.uid == request.auth.uid
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['message', 'editedAt', 'read'])
          && request.resource.data.message is string
          && request.resource.data.message.size() > 0
          && request.resource.data.message.size() <= 2000
          && request.resource.data.editedAt is timestamp
          && request.resource.data.read == false));
      // developer can delete anything; a signed-in sender can delete their own message.
      allow delete: if request.auth != null && (
        request.auth.token.email == 'owner@example.com'
        || ('uid' in resource.data && resource.data.uid == request.auth.uid));
    }

    // Developer's public profile photo (a small image). Anyone can read it; only the admin can write it.
    match /publicProfile/{docId} {
      allow read: if true;
      allow create, update: if request.auth != null
        && request.auth.token.email == 'owner@example.com'
        && request.resource.data.keys().hasOnly(['photo', 'updatedAt'])
        && request.resource.data.photo is string
        && request.resource.data.photo.size() < 100000;
      allow delete: if request.auth != null
        && request.auth.token.email == 'owner@example.com';
    }

    // Developer key (hash only). Readable and writable by the developer's account and nobody else.
    match /adminConfig/{docId} {
      allow read, write: if request.auth != null
        && request.auth.token.email == 'owner@example.com';
    }

    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      allow update: if request.auth != null && (
        request.auth.uid in resource.data.memberIds ||
        (
          request.auth.uid in request.resource.data.memberIds &&
          request.resource.data.diff(resource.data).affectedKeys().hasOnly(['memberIds', 'members'])
        )
      );

      match /goals/{goalId} {
        allow read, create, update: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
      match /messages/{messageId} {
        allow read, create: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        // a sender can delete their own message; the team owner can delete any (used by "Clear chat")
        allow delete: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds &&
          (resource.data.senderId == request.auth.uid ||
           get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId == request.auth.uid);
      }
      // "Seen" receipts: each member writes only their own doc
      match /reads/{uid} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        allow create, update, delete: if request.auth != null && request.auth.uid == uid &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
      // "Typing…" indicator: each member writes only their own doc
      match /typing/{uid} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        allow create, update, delete: if request.auth != null && request.auth.uid == uid &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
      // ------------------------------------------------------------------
      // Shared docs.
      //
      // This block is what actually keeps a "view only" doc view only. The UI in
      // static/js/team.js and notepad/index.html is only the first half of the
      // lock; everything below is the half a hand-edited page cannot get past.
      //
      //   read  -> nobody may change anything except the person who shared the
      //            doc. No teammate, and not even the owner of the team.
      //   write -> every member may change title/body/updated* and nothing else.
      //
      // `permission` and `ownerId` are not in the member allow-list below, so a
      // teammate can never turn a locked doc into an editable one, and only the
      // owner can move between 'read' and 'write' at all.
      // ------------------------------------------------------------------
      match /docs/{docId} {
        allow read: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
        allow create: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds &&
          request.resource.data.ownerId == request.auth.uid &&
          request.resource.data.permission in ['read', 'write'];
        allow update: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds && (
            // the person who shared the doc owns it: they may relock it, rename it,
            // anything -- but the doc stays theirs and stays one of the two values
            (resource.data.ownerId == request.auth.uid &&
             request.resource.data.ownerId == resource.data.ownerId &&
             request.resource.data.permission in ['read', 'write']) ||
            // anybody else: only while the doc is unlocked, and only the text
            (resource.data.permission == 'write' &&
             request.resource.data.updatedBy == request.auth.uid &&
             request.resource.data.diff(resource.data).affectedKeys()
               .hasOnly(['title', 'body', 'updatedAt', 'updatedBy', 'updatedByName']))
          );
        // the doc owner or the team owner can delete (a delete, never an edit)
        allow delete: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds &&
          (resource.data.ownerId == request.auth.uid ||
           get(/databases/$(database)/documents/teams/$(teamId)).data.ownerId == request.auth.uid);
      }
      match /rewards/{rewardId} {
        allow read, create, update: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/teams/$(teamId)).data.memberIds;
      }
    }
  }
}
```

`tests/docs.test.js` runs the real `static/js/doc-attrib.js` in a DOM and checks the access table, that attribution
survives editing / moving / retyping a line, that the sanitizer cannot be used to fake a name chip, that no doc surface
still ships editable, and that the rules in `firestore.rules` and the rules printed in this README have not drifted
apart. `tests/notepad.test.js` covers the Notepad & Docs surfaces the same way. Run them after any change to the
docs feature.

## Inspire Feed setup

The feed is a static file (`static/data/news.json`) refreshed every 6 hours by a GitHub Action.

1. In **Settings > Actions > General**, set **Workflow permissions** to **Read and write**.
2. Optional: add a free Gemini key from https://aistudio.google.com/apikey as a repository secret named `GEMINI_API_KEY` (**Settings > Secrets and variables > Actions**).
3. Open the **Actions** tab, choose **Update inspire feed** and click **Run workflow** once.

Stories come from public RSS feeds. Songs are 30-second previews from the iTunes Search API. Everything used is free.

## Sign-in protection

The sign-in, sign-up and reset forms no longer carry a captcha. They used to sit behind Cloudflare Turnstile; the widget went when the AI backend was removed. What is left is Firebase's own protection:

- turn on **email enumeration protection** in **Authentication > Settings**, so a wrong password cannot be told apart
  from an address that has no account;
- register the web app under **Firebase > App Check** and enforce it on Authentication, so a script cannot skip the
  page and call Firebase's API directly;
- Firebase's rate limits are the last line, and the free plan stops there instead of billing you.

If you wire a captcha back in, the place to do it is `setAuthOverlayVisible()` and the two submit handlers in
`static/js/auth.js`. Keep the secret on a server: a check the browser can skip is decoration.

## Project structure

```
├── index.html            Dashboard
├── calendar.html         Legacy redirect to calendar/index.html
├── calendar/             Life calendar
├── lifesheet/            Habit tracker / spreadsheet
├── notepad/              Notes and docs
├── team/                 Team goals, chat and rewards
├── static/
│   ├── css/              Styles, including the .native-* rules for the app shell
│   ├── js/               auth, native shell, dashboard, team, notes, life sheet, date picker + access control,
│   │                     inspire feed, developer key
│   └── data/news.json    Inspire Feed data (auto-generated)
├── android/              Capacitor Android project (Gradle) -- the Play Store build
├── ios/                  Capacitor iOS project (Xcode) -- the App Store build
├── assets/               Icon and splash sources for scripts/build-icons.js
├── capacitor.config.json App id, app name, webDir and native settings
├── www/                  generated app bundle copied into both platforms (gitignored)
├── dist/                 ready-built Android APK (npm run mobile:apk)
├── scripts/              build-mobile.js, build-apk.js, build-icons.js, fetch-news.js
├── tests/                Docs ACL/attribution and Notepad tests (npm test)
├── firestore.rules       Firestore security rules -- the half of the lock the browser cannot bypass
├── .github/workflows/    Scheduled feed update
├── robots.txt
├── sitemap.xml
└── .nojekyll
```

## Not in this repo

Kept out on purpose, so a fork cannot walk into the live project:

| Missing | Where it lives instead |
| --- | --- |
| the admin email address | in `firestore.rules.deploy` (gitignored) and, unavoidably, in the site's JavaScript |
| `GEMINI_API_KEY` | a GitHub Actions secret, for the feed only |
| native signing keys | your own keystore (`android/`) and Apple certificates (`ios/`) |

The Firebase Web API key is *not* on that list, and cannot be: it ships in `static/js/auth.js` to every visitor.
It identifies the project, it does not grant access -- the rules decide that.

Two things cannot be hidden from a reader of this repo, and pretending otherwise would be the real mistake:

- **the admin address**, because `static/js/auth.js` ships it to the browser -- the page has to know which signed-in account to offer the Developer box to. That is precisely why the inbox is protected by rules rather than by the address being a secret;
- **the Firebase Web API key**, which ships in `static/js/auth.js`. It identifies the project; the rules decide access.

## Licence

Do what you like with it. If you ship it, keep the part you like and drop the rest.
