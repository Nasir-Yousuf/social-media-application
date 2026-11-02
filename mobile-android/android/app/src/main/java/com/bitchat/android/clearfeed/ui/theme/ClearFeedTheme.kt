package com.bitchat.android.clearfeed.ui.theme

import android.content.Context
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

enum class ThemePreset(
    val id: String,
    val title: String,
    val subtitle: String,
    val badge: String,
    val isDark: Boolean,
    val background: Color,
    val surface: Color,
    val surfaceVariant: Color,
    val border: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val accent: Color
) {
    LIGHTS_OUT(
        id = "dark",
        title = "Lights Out",
        subtitle = "Pure OLED Black",
        badge = "Night",
        isDark = true,
        background = Color(0xFF000000),
        surface = Color(0xFF16181C),
        surfaceVariant = Color(0xFF202327),
        border = Color(0xFF2F3336),
        textPrimary = Color(0xFFE7E9EA),
        textSecondary = Color(0xFF71767B),
        accent = Color(0xFF00A6F4)
    ),
    DIM_NAVY(
        id = "dim",
        title = "Dim Navy",
        subtitle = "Midnight Twilight Blue",
        badge = "Dim",
        isDark = true,
        background = Color(0xFF15202B),
        surface = Color(0xFF1E2732),
        surfaceVariant = Color(0xFF273340),
        border = Color(0xFF38444D),
        textPrimary = Color(0xFFF7F9F9),
        textSecondary = Color(0xFF8B98A5),
        accent = Color(0xFF00A6F4)
    ),
    DAY(
        id = "light",
        title = "Day",
        subtitle = "Crisp & Clean Light",
        badge = "Daylight",
        isDark = false,
        background = Color(0xFFFFFFFF),
        surface = Color(0xFFF7F9F9),
        surfaceVariant = Color(0xFFFFFFFF),
        border = Color(0xFFEFF3F4),
        textPrimary = Color(0xFF0F1419),
        textSecondary = Color(0xFF536471),
        accent = Color(0xFF00A6F4)
    ),
    CODEHUB_MATRIX(
        id = "emerald",
        title = "CodeHub Matrix",
        subtitle = "Obsidian & Neon Emerald",
        badge = "CodeHub",
        isDark = true,
        background = Color(0xFF080F0C),
        surface = Color(0xFF0F1D17),
        surfaceVariant = Color(0xFF152B22),
        border = Color(0xFF1B382B),
        textPrimary = Color(0xFFECFDF5),
        textSecondary = Color(0xFF6EE7B7),
        accent = Color(0xFF10B981)
    ),
    DUSK_SUNSET(
        id = "sunset",
        title = "Dusk Sunset",
        subtitle = "Deep Amethyst & Amber",
        badge = "Sunset",
        isDark = true,
        background = Color(0xFF141113),
        surface = Color(0xFF1F1A1D),
        surfaceVariant = Color(0xFF2A2227),
        border = Color(0xFF3A2E36),
        textPrimary = Color(0xFFFDF4FF),
        textSecondary = Color(0xFFC084FC),
        accent = Color(0xFFF97316)
    ),
    CYBER_HACKER(
        id = "hacker",
        title = "Cyber Hacker",
        subtitle = "Matrix CRT & Phosphor Green",
        badge = "Matrix",
        isDark = true,
        background = Color(0xFF020603),
        surface = Color(0xFF051007),
        surfaceVariant = Color(0xFF0A1D0D),
        border = Color(0xFF0F3818),
        textPrimary = Color(0xFF34D399),
        textSecondary = Color(0xFF059669),
        accent = Color(0xFF00FF66)
    );

    companion object {
        fun fromId(id: String): ThemePreset = values().firstOrNull { it.id == id } ?: LIGHTS_OUT
    }
}

val LocalThemePreset = compositionLocalOf { ThemePreset.LIGHTS_OUT }

object ClearFeedColors {
    val Background: Color @Composable get() = LocalThemePreset.current.background
    val Surface: Color @Composable get() = LocalThemePreset.current.surface
    val SurfaceVariant: Color @Composable get() = LocalThemePreset.current.surfaceVariant
    val SurfaceHighlight: Color @Composable get() = LocalThemePreset.current.surfaceVariant
    val Border: Color @Composable get() = LocalThemePreset.current.border

    val PrimaryEmerald = Color(0xFF00BA7C)
    val AccentGreen = Color(0xFF00BA7C)
    val AccentCyan = Color(0xFF00A6F4)
    val AccentBlue: Color @Composable get() = LocalThemePreset.current.accent
    val ErrorRed = Color(0xFFFF453A)
    val CodeBg = Color(0xFF0D1117)

    val TextPrimary: Color @Composable get() = LocalThemePreset.current.textPrimary
    val TextSecondary: Color @Composable get() = LocalThemePreset.current.textSecondary
}

@Composable
fun ClearFeedTheme(
    selectedTheme: ThemePreset = ThemePreset.LIGHTS_OUT,
    content: @Composable () -> Unit
) {
    val colorScheme = if (selectedTheme.isDark) {
        darkColorScheme(
            primary = selectedTheme.accent,
            onPrimary = Color.White,
            secondary = ClearFeedColors.AccentCyan,
            onSecondary = Color.White,
            background = selectedTheme.background,
            onBackground = selectedTheme.textPrimary,
            surface = selectedTheme.surface,
            onSurface = selectedTheme.textPrimary,
            surfaceVariant = selectedTheme.surfaceVariant,
            onSurfaceVariant = selectedTheme.textSecondary,
            outline = selectedTheme.border,
            error = ClearFeedColors.ErrorRed
        )
    } else {
        lightColorScheme(
            primary = selectedTheme.accent,
            onPrimary = Color.White,
            secondary = ClearFeedColors.AccentCyan,
            onSecondary = Color.Black,
            background = selectedTheme.background,
            onBackground = selectedTheme.textPrimary,
            surface = selectedTheme.surface,
            onSurface = selectedTheme.textPrimary,
            surfaceVariant = selectedTheme.surfaceVariant,
            onSurfaceVariant = selectedTheme.textSecondary,
            outline = selectedTheme.border,
            error = ClearFeedColors.ErrorRed
        )
    }

    CompositionLocalProvider(LocalThemePreset provides selectedTheme) {
        MaterialTheme(
            colorScheme = colorScheme,
            content = content
        )
    }
}