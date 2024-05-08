package com.ionicframework.fyle595781.utils;


import android.content.Context;
import android.content.pm.PackageManager;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

public class RootCheck {
    private static Context mContext;
    private static final String TAG = "RootCheck";
    private String[] binaryPaths= {
            "/data/local/",
            "/data/local/bin/",
            "/data/local/xbin/",
            "/sbin/",
            "/su/bin/",
            "/system/bin/",
            "/system/bin/.ext/",
            "/system/bin/failsafe/",
            "/system/sd/xbin/",
            "/system/usr/we-need-root/",
            "/system/xbin/",
            "/system/app/Superuser.apk",
            "/cache",
            "/data",
            "/dev"
    };
    private String[] dangerousPackages = {
            "com.devadvance.rootcloak",
            "com.devadvance.rootcloakplus",
            "com.koushikdutta.superuser",
            "com.thirdparty.superuser",
            "com.topjohnwu.magisk",
            "org.lsposed.manager",
            "com.devadvance.rootcloak2"
    };
    public RootCheck(Context ct) {
        mContext = ct;
    }
    public Boolean rootBeerCheck() {
        return (DetectTestKeys() || checkSuExists() || checkForBusyBoxBinary() || checkForSuBinary()
                || checkPackages(mContext));
    }
    private boolean DetectTestKeys() {
        String buildTags = android.os.Build.TAGS;
        return buildTags != null && buildTags.contains("test-keys");
    }
    private boolean checkForBinary(String filename) {
        for (String path : binaryPaths) {
            File f = new File(path, filename);
            boolean fileExists = f.exists();
            if (fileExists) {
                return true;
            }
        }
        return false;
    }
    private boolean checkForSuBinary() {
        return checkForBinary("su"); //checking for su binary
    }
    private boolean checkForBusyBoxBinary() {
        return checkForBinary("busybox"); //checking for busybox
    }
    private boolean checkSuExists() {
        Process process = null;
        try {
            process = Runtime.getRuntime().exec(new String[]
                    {"/system /xbin/which", "su"}); //Checking if su binary exists
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
            String line = in.readLine();
            process.destroy();
            return line != null;
        } catch (Exception e) {
            if (process != null) {
                process.destroy();
            }
            return false;
        }
    }
    private boolean checkPackages(Context ctx) {
        PackageManager pm = ctx.getPackageManager();
        for(String name:dangerousPackages){
            if(isPackageInstalled(name,pm)){ //Checking if dangerous applications are installed
                return true;
            }
        }
        return false;
    }
    private boolean isPackageInstalled(String packageName, PackageManager packageManager) {
        try {
            return packageManager.getApplicationInfo(packageName, 0).enabled;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }}