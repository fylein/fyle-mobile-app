# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Basic proguard rules

-optimizations !code/simplification/arithmetic
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keep class **.R$*
-dontskipnonpubliclibraryclasses
-forceprocessing
-optimizationpasses 5
-overloadaggressively

# Removing logging code

-assumenosideeffects class android.util.Log {
  public static *** d();
  public static *** v();
  public static *** i();
  public static *** w();
  public static *** e();
}

# Crashlytics code as given below which one can exclude

-keep class com.crashlytics.** { *; }
-keep class com.crashlytics.android.**
-keepattributes SourceFile,LineNumberTable

# Rules for Capacitor v3 plugins and annotations
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * {
  @com.getcapacitor.annotation.PermissionCallback <methods>;
  @com.getcapacitor.annotation.ActivityCallback <methods>;
  @com.getcapacitor.annotation.Permission <methods>;
  @com.getcapacitor.PluginMethod public <methods>;
}

# Rules for Capacitor v2 plugins and annotations
-keep @com.getcapacitor.NativePlugin public class * {
  @com.getcapacitor.PluginMethod public <methods>;
}

# Rules for Cordova plugins
-keep public class * extends org.apache.cordova.* {
  public <methods>;
  public <fields>;
}

-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }