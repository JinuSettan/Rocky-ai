The workflow `.github/workflows/build-android-apk.yml` compiles a complete native Android Gradle project into a debug APK and uploads it as a GitHub Actions artifact.

## Use
1. Put a complete Android project in `android-project/` (or choose another repository-relative folder in the workflow input).
2. Ensure the folder contains `gradlew`, `settings.gradle` or `settings.gradle.kts`, and a valid Android app module.
3. Open GitHub → Actions → Build Android APK → Run workflow.
4. After a successful run, download the `rocky-ai-android-debug-apk` artifact from the workflow run.

## Current limitation
This is the APK compilation stage only, not yet a complete prompt-to-APK generator. The current Rocky AI repository is a Vite/React web app and does not contain a native Android Gradle project. AI-generated files are not yet automatically transformed into a complete Android project. Without that export/integration stage, the workflow deliberately fails with a clear error instead of claiming an APK was built.

The workflow creates a debug APK for testing. A Play Store release needs a securely stored signing key and a release build. Never commit keystores or passwords.