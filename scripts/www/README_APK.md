# 将Web应用打包为APK指南

由于当前环境网络限制，无法直接安装依赖并打包APK。以下是在您本地环境中完成打包的详细步骤：

## 前提条件

1. **Node.js 和 npm**
   - 下载并安装 Node.js (https://nodejs.org/)
   - npm 会随 Node.js 一起安装

2. **Java Development Kit (JDK)**
   - 下载并安装 JDK 8 或 11 (https://adoptopenjdk.net/)

3. **Android Studio**
   - 下载并安装 Android Studio (https://developer.android.com/studio/)
   - 安装时选择包含 Android SDK 的选项

## 步骤 1: 安装 Cordova

打开命令提示符或终端，运行以下命令：

```bash
npm install -g cordova
```

## 步骤 2: 创建 Cordova 项目

```bash
# 导航到您想要创建项目的目录
cd /path/to/your/directory

# 创建一个新的 Cordova 项目
cordova create AssetInventory com.example.assetinventory "Asset Inventory"

# 导航到项目目录
cd AssetInventory
```

## 步骤 3: 添加 Android 平台

```bash
cordova platform add android
```

## 步骤 4: 替换 Web 内容

1. 删除 `www` 目录下的所有文件
2. 将您的 Web 应用文件（`index.html`, `css`, `js`, `images` 等）复制到 `www` 目录

## 步骤 5: 配置应用

编辑 `config.xml` 文件以配置您的应用：

```xml
<widget id="com.example.assetinventory" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>Asset Inventory</name>
    <description>Asset Inventory Management System</description>
    <author email="your.email@example.com" href="http://yourwebsite.com">Your Name</author>
    <content src="index.html" />
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    <platform name="android">
        <allow-intent href="market:*" />
        <icon density="ldpi" src="res/icon/android/icon-36-ldpi.png" />
        <icon density="mdpi" src="res/icon/android/icon-48-mdpi.png" />
        <icon density="hdpi" src="res/icon/android/icon-72-hdpi.png" />
        <icon density="xhdpi" src="res/icon/android/icon-96-xhdpi.png" />
    </platform>
</widget>
```

## 步骤 6: 构建 APK

```bash
# 调试版本
cordova build android

# 发布版本
cordova build android --release
```

## 步骤 7: 签名 APK (可选)

对于发布版本，您需要签名 APK：

1. 生成签名密钥：
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
   ```

2. 创建 `build.json` 文件：
   ```json
   {
     "android": {
       "release": {
         "keystore": "path/to/my-release-key.keystore",
         "storePassword": "your-keystore-password",
         "alias": "alias_name",
         "password": "your-alias-password"
       }
     }
   }
   ```

3. 使用签名构建：
   ```bash
   cordova build android --release --buildConfig
   ```

## 步骤 8: 查找 APK 文件

构建成功后，您可以在以下位置找到 APK 文件：

- 调试版本: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- 发布版本: `platforms/android/app/build/outputs/apk/release/app-release.apk`

## 提示

- 确保您的 Web 应用是响应式的，以适应不同尺寸的移动设备屏幕。
- 考虑使用 `cordova-plugin-splashscreen` 和 `cordova-plugin-statusbar` 等插件来增强用户体验。
- 对于需要访问设备功能（如相机、GPS 等）的应用，您需要安装相应的 Cordova 插件。

## 故障排除

- 如果遇到构建错误，请确保所有依赖项都已正确安装。
- 检查 Android Studio 中的 SDK Manager，确保已安装所需的 SDK 版本。
- 查看 `cordova requirements` 命令的输出，确保满足所有构建要求。