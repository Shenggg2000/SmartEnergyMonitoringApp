# Installation Guide

## Introduction

This installation guide explain the prerequisites and installation steps to install Smart Energy Monitoring Application on your devices.

## Prerequisites

**Software to Install**
1. Node.js (Version >= 19.6.0) [Download](https://nodejs.org/en/download/current)
2. JDK (Version >= 12.1.0) [Download](https://www.oracle.com/my/java/technologies/downloads/#java20)
3. Android Studio (with Android SDK, Android SDK Platform, Android Virtual Device) [Download](https://developer.android.com/studio) | [Guide](https://reactnative.dev/docs/environment-setup?guide=native#android-studio)
4. WampServer [Download](https://www.wampserver.com/en/download-wampserver-64bits/)

**Software to Register**
1. Gmail Account with App Password for sending verification email. [Guide](https://support.google.com/accounts/answer/185833?hl=en)
2. Create Firebase Android App for push notification. [Guide](https://firebase.google.com/docs/android/setup)
3. Create Firebase Web App for realtime database. [Guide](https://firebase.google.com/docs/web/setup)

## Installation Steps

1. Clone this repository.

**app**
1. Go to **`app`** folder and execute command `npm i`
2. Go to **`app/android/app`** folder and insert your Firebase Android App Configuration File named **`google-services.json`** 
(Configuration File can get when complete prerequisite No.2)

**server**
1. Go to **`server`** folder and execute command `npm i`
2. Go to **`server`** folder and modify the Firebase Web App configuration to your own in file **`key2.example.json`** (Configuration info can get when complete prerequisite No.3)
3. Rename **`key2.example.json`** to **`key2.json`**
4. Go to **`server`** folder and modify the default email address, email password to your own in file **`config.example.js`** 
5. Go to **`server`** folder and modify the default database information to your own in file **`config.example.js`**
6. Go to **`server`** folder and modify the default Firebase URL to your own in file **`config.example.js`**
7. Rename **`config.example.js`** to **`config.js`**
8. Launch WampServer and import **`smart_energy_monitoring.sql`** to your phpmyadmin
8. Launch Firebase Console and import **`socket-real-time-data.json`** to your realtime database

## Configuration
1. Go to **`app`** folder and execute command `npm run start`
2. Go to **`app`** folder and execute command `npx react-native run-android`
3. You will see the application installed in your emulator or physical device after completion.
4. Go to **`server`** folder and execute command `npm run dev`
5. You may start to use the application.
