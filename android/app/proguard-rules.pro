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

// Basic proguard rules
-optimizations !code/simplification/arithmetic
-keepattributes <em>Annotation</em>
-keepattributes InnerClasses
-keepattributes EnclosingMethod
-keep class *<em>.R$</em>
-dontskipnonpubliclibraryclasses
-forceprocessing
-optimizationpasses 5
-overloadaggressively
// Removing logging code
-assumenosideeffects class android.util.Log {
public static *** d();
public static *** v();
public static *** i();
public static *** w();
public static *** e();
}
// Crashlytics code as given below which one can exclude
-keep class com.crashlytics.** { *; }
-keep class com.crashlytics.android.**
-keepattributes SourceFile,LineNumberTable
