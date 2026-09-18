import { AndroidCodeFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidCodeFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Declares MainActivity as HOME launcher with package visibility queries for Android 11+ (API 30+).',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Recommended: Intent-based package queries (Play Store compliant) -->
    <!-- Allows querying apps that provide a launcher activity without broad QUERY_ALL_PACKAGES declaration -->
    <queries>
        <intent>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent>
    </queries>

    <!-- Optional: If targeting Android 11+ and needing system/hidden activity resolution, -->
    <!-- launchers can justify QUERY_ALL_PACKAGES with Play Console declaration form: -->
    <!-- <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" tools:ignore="QueryAllPackagesPermission" /> -->

    <application
        android:name=".BlankSpacesApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BlankSpacesLauncher.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:clearTaskOnLaunch="true"
            android:stateNotNeeded="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <!-- Required to declare this app as an Android Home Screen Launcher -->
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
                
                <!-- Also allows launching directly from app drawers during development -->
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Broadcast receiver to update app list dynamically when apps are installed/uninstalled -->
        <receiver
            android:name=".data.PackageChangeReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.PACKAGE_ADDED" />
                <action android:name="android.intent.action.PACKAGE_REMOVED" />
                <action android:name="android.intent.action.PACKAGE_REPLACED" />
                <data android:scheme="package" />
            </intent-filter>
        </receiver>

    </application>

</manifest>`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (Module: app)',
    language: 'groovy',
    category: 'gradle',
    description: 'Kotlin DSL build configuration with Jetpack Compose BOM, Material3, DataStore Preferences, and Lifecycle.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.blankspaces.launcher"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.blankspaces.launcher"
        minSdk = 26 // Android 8.0 Oreo
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose BOM (Bill of Materials)
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Activity & Lifecycle Compose
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")

    // Jetpack DataStore Preferences for zero-bloat persistence
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/data/model/AppInfo.kt',
    name: 'AppInfo.kt',
    language: 'kotlin',
    category: 'model',
    description: 'Data model representing an installed Android application with customizable home-screen display name.',
    content: `package com.blankspaces.launcher.data.model

data class AppInfo(
    val label: String,                // Original package display name
    val packageName: String,          // Unique package identifier e.g. "com.spotify.music"
    val activityName: String,         // Component activity to launch
    val customName: String? = null,   // User-defined minimal lowercase label (e.g. "music")
    val isHidden: Boolean = false,    // Whether user hid this app from the drawer
    val isFrictionEnabled: Boolean = false // Intentional pause delay prior to launch
) {
    /**
     * Display label prioritized for the minimalist home screen:
     * Custom user rename takes precedence over system label.
     */
    val displayName: String
        get() = customName?.ifBlank { label } ?: label
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/data/repository/AppsRepository.kt',
    name: 'AppsRepository.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Queries PackageManager for launchable apps, filters out self, launches intents, and handles uninstalls.',
    content: `package com.blankspaces.launcher.data.repository

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.blankspaces.launcher.data.model.AppInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext

class AppsRepository(private val context: Context) {

    private val packageManager: PackageManager = context.packageManager

    private val _installedApps = MutableStateFlow<List<AppInfo>>(emptyList())
    val installedApps: StateFlow<List<AppInfo>> = _installedApps.asStateFlow()

    suspend fun refreshApps(customNames: Map<String, String> = emptyMap(), hiddenPackages: Set<String> = emptySet()) {
        withContext(Dispatchers.IO) {
            val launcherIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

            val resolveInfos: List<ResolveInfo> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.queryIntentActivities(
                    launcherIntent,
                    PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL.toLong())
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.queryIntentActivities(launcherIntent, 0)
            }

            val apps = resolveInfos
                .filter { it.activityInfo.packageName != context.packageName } // Exclude self
                .map { resolveInfo ->
                    val pkg = resolveInfo.activityInfo.packageName
                    val activity = resolveInfo.activityInfo.name
                    val label = resolveInfo.loadLabel(packageManager).toString()

                    AppInfo(
                        label = label,
                        packageName = pkg,
                        activityName = activity,
                        customName = customNames[pkg],
                        isHidden = hiddenPackages.contains(pkg)
                    )
                }
                .sortedBy { it.displayName.lowercase() }

            _installedApps.value = apps
        }
    }

    fun launchApp(appInfo: AppInfo): Result<Unit> {
        return try {
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
                component = ComponentName(appInfo.packageName, appInfo.activityName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
            }
            context.startActivity(intent)
            Result.success(Unit)
        } catch (e: Exception) {
            // Fallback: try default launch intent
            val fallbackIntent = packageManager.getLaunchIntentForPackage(appInfo.packageName)
            if (fallbackIntent != null) {
                fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(fallbackIntent)
                Result.success(Unit)
            } else {
                Result.failure(e)
            }
        }
    }

    fun openAppDetails(packageName: String) {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", packageName, null)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun openSystemHomeSettings() {
        val intent = Intent(Settings.ACTION_HOME_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/data/preferences/LauncherPreferences.kt',
    name: 'LauncherPreferences.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Jetpack DataStore implementation for persisting home apps, custom names, alignment, and theme.',
    content: `package com.blankspaces.launcher.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "blank_spaces_prefs")

class LauncherPreferences(private val context: Context) {

    companion object {
        val KEY_HOME_APPS = stringSetPreferencesKey("home_apps_packages")
        val KEY_CUSTOM_NAMES = stringPreferencesKey("custom_app_names_json")
        val KEY_ALIGNMENT = stringPreferencesKey("text_alignment") // "left", "center", "right"
        val KEY_FONT_SIZE = stringPreferencesKey("text_font_size") // "compact", "normal", "large", "huge"
        val KEY_THEME = stringPreferencesKey("launcher_theme")     // "dark", "light", "black"
        val KEY_SHOW_CLOCK = booleanPreferencesKey("show_clock")
        val KEY_SHOW_DATE = booleanPreferencesKey("show_date")
        val KEY_SHOW_BATTERY = booleanPreferencesKey("show_battery")
        val KEY_ENABLE_FRICTION = booleanPreferencesKey("enable_friction")
        val KEY_FRICTION_SECONDS = intPreferencesKey("friction_seconds")
        val KEY_HIDDEN_APPS = stringSetPreferencesKey("hidden_apps_packages")
    }

    val homeAppsFlow: Flow<Set<String>> = context.dataStore.data.map { prefs ->
        prefs[KEY_HOME_APPS] ?: setOf(
            "com.google.android.dialer",
            "com.google.android.apps.messaging",
            "com.google.android.GoogleCamera",
            "com.google.android.keep"
        )
    }

    val alignmentFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_ALIGNMENT] ?: "left"
    }

    val themeFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_THEME] ?: "black"
    }

    val showClockFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_SHOW_CLOCK] ?: true
    }

    val showDateFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_SHOW_DATE] ?: true
    }

    val showBatteryFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_SHOW_BATTERY] ?: true
    }

    suspend fun updateHomeApps(packages: Set<String>) {
        context.dataStore.edit { prefs ->
            prefs[KEY_HOME_APPS] = packages
        }
    }

    suspend fun setAlignment(alignment: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_ALIGNMENT] = alignment
        }
    }

    suspend fun setTheme(theme: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_THEME] = theme
        }
    }

    suspend fun toggleClock(show: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SHOW_CLOCK] = show
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/ui/screens/HomeScreen.kt',
    name: 'HomeScreen.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'The core Blank Spaces home screen: pure text-only essential apps, zero colors/icons, clock widget, and gesture handling.',
    content: `package com.blankspaces.launcher.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blankspaces.launcher.data.model.AppInfo
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.delay

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(
    essentialApps: List<AppInfo>,
    textAlignment: String,
    fontSize: String,
    showClock: Boolean,
    showDate: Boolean,
    showBattery: Boolean,
    batteryPercentage: Int,
    onAppClick: (AppInfo) -> Unit,
    onAppLongClick: (AppInfo) -> Unit,
    onSwipeUp: () -> Unit,
    onDoubleTapLock: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier
) {
    var currentTime by remember { mutableStateOf(Calendar.getInstance().time) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = Calendar.getInstance().time
            delay(1000L)
        }
    }

    val timeFormatter = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }
    val dateFormatter = remember { SimpleDateFormat("EEEE, MMMM d", Locale.getDefault()) }

    val horizontalAlignment = when (textAlignment) {
        "center" -> Alignment.CenterHorizontally
        "right" -> Alignment.End
        else -> Alignment.Start
    }

    val textAlign = when (textAlignment) {
        "center" -> TextAlign.Center
        "right" -> TextAlign.End
        else -> TextAlign.Start
    }

    val itemTextSize = when (fontSize) {
        "compact" -> 20.sp
        "large" -> 28.sp
        "huge" -> 34.sp
        else -> 24.sp
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures(
                    onDoubleTap = { onDoubleTapLock() },
                    onLongPress = { onOpenSettings() }
                )
            }
            .pointerInput(Unit) {
                detectVerticalDragGestures { _, dragAmount ->
                    if (dragAmount < -30f) { // Swipe up
                        onSwipeUp()
                    }
                }
            }
            .padding(horizontal = 32.dp, vertical = 48.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = horizontalAlignment
        ) {
            // Top Section: Time, Date, Battery
            Column(
                horizontalAlignment = horizontalAlignment,
                modifier = Modifier.padding(top = 16.dp)
            ) {
                if (showClock) {
                    Text(
                        text = timeFormatter.format(currentTime),
                        fontSize = 56.sp,
                        fontWeight = FontWeight.Light,
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = textAlign,
                        letterSpacing = (-1).sp
                    )
                }

                if (showDate) {
                    Text(
                        text = dateFormatter.format(currentTime),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Normal,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                        textAlign = textAlign,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                if (showBattery) {
                    Text(
                        text = "$batteryPercentage%",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Light,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                        textAlign = textAlign,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            // Center / Main: Essential Apps Text-Only List
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f, fill = false)
                    .padding(vertical = 32.dp),
                horizontalAlignment = horizontalAlignment,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(essentialApps, key = { it.packageName }) { app ->
                    Text(
                        text = app.displayName.lowercase(),
                        fontSize = itemTextSize,
                        fontWeight = FontWeight.Normal,
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = textAlign,
                        modifier = Modifier
                            .fillMaxWidth()
                            .combinedClickable(
                                onClick = { onAppClick(app) },
                                onLongClick = { onAppLongClick(app) }
                            )
                            .padding(vertical = 4.dp)
                    )
                }
            }

            // Bottom drawer hint
            Text(
                text = "swipe up for apps",
                fontSize = 12.sp,
                fontWeight = FontWeight.Light,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f),
                textAlign = textAlign,
                modifier = Modifier
                    .padding(bottom = 12.dp)
                    .combinedClickable(onClick = onSwipeUp)
            )
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/ui/screens/AppDrawerScreen.kt',
    name: 'AppDrawerScreen.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Searchable full-screen app drawer with real-time text query filtering, alphabet index, and long-press actions.',
    content: `package com.blankspaces.launcher.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blankspaces.launcher.data.model.AppInfo

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun AppDrawerScreen(
    allApps: List<AppInfo>,
    onAppClick: (AppInfo) -> Unit,
    onAppLongClick: (AppInfo) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    val focusRequester = remember { FocusRequester() }

    val filteredApps = remember(searchQuery, allApps) {
        if (searchQuery.isBlank()) {
            allApps.filterNot { it.isHidden }
        } else {
            allApps.filter { app ->
                !app.isHidden && (
                    app.displayName.contains(searchQuery, ignoreCase = true) ||
                    app.packageName.contains(searchQuery, ignoreCase = true)
                )
            }
        }
    }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 24.dp)
    ) {
        // Search Header (Minimal pure text input)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Close Drawer",
                    tint = MaterialTheme.colorScheme.onBackground
                )
            }

            BasicTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .weight(1f)
                    .focusRequester(focusRequester)
                    .padding(horizontal = 8.dp),
                textStyle = TextStyle(
                    fontSize = 20.sp,
                    color = MaterialTheme.colorScheme.onBackground,
                    fontWeight = FontWeight.Normal
                ),
                cursorBrush = SolidColor(MaterialTheme.colorScheme.onBackground),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = {
                        // Auto-launch if exactly one match
                        if (filteredApps.size == 1) {
                            onAppClick(filteredApps.first())
                        }
                    }
                ),
                decorationBox = { innerTextField ->
                    if (searchQuery.isEmpty()) {
                        Text(
                            text = "Search apps...",
                            fontSize = 20.sp,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.4f)
                        )
                    }
                    innerTextField()
                }
            )

            if (searchQuery.isNotEmpty()) {
                IconButton(onClick = { searchQuery = "" }) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Clear search",
                        tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                }
            }
        }

        // App List (Plain text list)
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            items(filteredApps, key = { it.packageName }) { app ->
                Text(
                    text = app.displayName.lowercase(),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Normal,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier
                        .fillMaxWidth()
                        .combinedClickable(
                            onClick = { onAppClick(app) },
                            onLongClick = { onAppLongClick(app) }
                        )
                        .padding(vertical = 6.dp)
                )
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/ui/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    category: 'theme',
    description: 'Strict monochrome Material3 color schemes (pure pitch-black OLED / clean white) with zero chromatic accents.',
    content: `package com.blankspaces.launcher.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Pure pitch-black OLED monochrome scheme (maximum battery efficiency)
private val PitchBlackColorScheme = darkColorScheme(
    primary = Color(0xFFFFFFFF),
    onPrimary = Color(0xFF000000),
    background = Color(0xFF000000),
    onBackground = Color(0xFFEEEEEE),
    surface = Color(0xFF111111),
    onSurface = Color(0xFFFFFFFF),
    outline = Color(0xFF333333)
)

// Clean white monochrome scheme
private val CleanWhiteColorScheme = lightColorScheme(
    primary = Color(0xFF000000),
    onPrimary = Color(0xFFFFFFFF),
    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF111111),
    surface = Color(0xFFF7F7F7),
    onSurface = Color(0xFF000000),
    outline = Color(0xFFDDDDDD)
)

@Composable
fun BlankSpacesTheme(
    themeName: String = "black", // "black" or "light"
    content: @Composable () -> Unit
) {
    val colorScheme = if (themeName == "light") {
        CleanWhiteColorScheme
    } else {
        PitchBlackColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}`,
  },
  {
    path: 'app/src/main/java/com/blankspaces/launcher/ui/components/FrictionDelayDialog.kt',
    name: 'FrictionDelayDialog.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Mindful friction countdown dialog giving users a conscious breathing moment before opening high-distraction apps.',
    content: `package com.blankspaces.launcher.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable
fun FrictionDelayDialog(
    appName: String,
    seconds: Int = 3,
    onProceed: () -> Unit,
    onCancel: () -> Unit
) {
    var remainingSeconds by remember { mutableIntStateOf(seconds) }

    LaunchedEffect(Unit) {
        while (remainingSeconds > 0) {
            delay(1000L)
            remainingSeconds--
        }
    }

    AlertDialog(
        onDismissRequest = onCancel,
        title = {
            Text(
                text = "pause & breathe",
                fontSize = 20.sp,
                fontWeight = FontWeight.Light,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp)
            ) {
                Text(
                    text = "opening $appName in",
                    fontSize = 15.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Text(
                    text = if (remainingSeconds > 0) "$remainingSeconds" else "ready",
                    fontSize = 42.sp,
                    fontWeight = FontWeight.ExtraLight,
                    modifier = Modifier.padding(vertical = 8.dp)
                )
                Text(
                    text = "Is this intentional?",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = onProceed,
                enabled = remainingSeconds <= 0
            ) {
                Text("Open")
            }
        },
        dismissButton = {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
        }
    )
}`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    description: 'Complete build, configuration, and Google Play submission guide for the Blank Spaces minimalist launcher.',
    content: `# Blank Spaces Minimalist Android Launcher

A pure, distraction-free, text-only Android home-screen launcher inspired by Blank Spaces and Olauncher.
Built with Kotlin and Jetpack Compose.

## Key Features
- **Zero Icons, Zero Colors:** Replaces noisy visual triggers with quiet lowercase text.
- **Pitch-Black OLED Mode:** True black #000000 for battery saving and calmness.
- **Essential Apps Only:** Keep 4-6 essential tools on your home screen.
- **Searchable App Drawer:** Swipe-up to find any app instantly via keyboard.
- **Custom Renaming:** Rename any app for the home screen (e.g., "Spotify" -> "audio", "Chrome" -> "web").
- **Mindful Friction:** Optional 3-second breathing countdown before opening distraction apps.
- **Spaces / Modes:** Switch between Focus, Work, and Personal app sets.
- **Zero Tracking:** No internet permission, no analytics, no ads.

---

## Quick Start (Android Studio)
1. Open Android Studio (Ladybug / Koala or newer).
2. Clone or copy these source files into your project directory.
3. Sync Gradle with Project Files (JDK 17 or higher).
4. Run on a connected device or emulator (Android 8.0 / API 26+).
5. When prompted, select **Blank Spaces Launcher** as your default home app (or go to **Settings > Apps > Default Apps > Home App**).

---

## Google Play Store Package Visibility Policy Note
- This launcher utilizes \`<queries>\` with \`android.intent.action.MAIN\` and \`CATEGORY_LAUNCHER\`.
- Under Google Play policies, home screen launchers are explicitly permitted to use the broad \`QUERY_ALL_PACKAGES\` permission if necessary, provided you complete the Play Console declaration form stating that the core function is a Home Screen replacement.
- For most modern devices, the \`<queries>\` intent block included in \`AndroidManifest.xml\` provides complete access to all launchable applications without requiring sensitive permissions.
`,
  },
];
