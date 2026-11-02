package com.bitchat.android.ui.theme

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color
import com.bitchat.android.clearfeed.ui.theme.ThemePreset

fun ThemePreset.toBitchatColorScheme(): ColorScheme {
    return if (this.isDark) {
        darkColorScheme(
            primary = this.accent,
            onPrimary = Color.Black,
            primaryContainer = this.surfaceVariant,
            onPrimaryContainer = this.textPrimary,
            secondary = Color(0xFF00A6F4),
            onSecondary = Color.Black,
            secondaryContainer = this.surfaceVariant,
            onSecondaryContainer = this.textPrimary,
            tertiary = this.accent,
            onTertiary = Color.Black,
            background = this.background,
            onBackground = this.textPrimary,
            surface = this.surface,
            onSurface = this.textPrimary,
            surfaceVariant = this.surfaceVariant,
            onSurfaceVariant = this.textSecondary,
            outline = this.border,
            outlineVariant = this.border,
            error = Color(0xFFFF453A),
            onError = Color.Black
        )
    } else {
        lightColorScheme(
            primary = this.accent,
            onPrimary = Color.White,
            primaryContainer = Color(0xFFEFF3F4),
            onPrimaryContainer = Color(0xFF0F1419),
            secondary = Color(0xFF00A6F4),
            onSecondary = Color.White,
            secondaryContainer = Color(0xFFEFF3F4),
            onSecondaryContainer = Color(0xFF0F1419),
            tertiary = this.accent,
            onTertiary = Color.White,
            background = this.background,
            onBackground = this.textPrimary,
            surface = this.surface,
            onSurface = this.textPrimary,
            surfaceVariant = this.surfaceVariant,
            onSurfaceVariant = this.textSecondary,
            outline = this.border,
            outlineVariant = this.border,
            error = Color(0xFFD70015),
            onError = Color.White
        )
    }
}

fun ThemePreset.toBitchatPalette(): BitchatPalette {
    return BitchatPalette(
        inputOutline = this.border,
        inputOutlineFocused = this.accent,
        inputSurface = if (this.isDark) this.surface else Color(0xFFF7F9F9),
        inputSurfaceFocused = if (this.isDark) this.surfaceVariant else Color(0xFFFFFFFF),
        inputButton = if (this.isDark) this.surfaceVariant else Color(0xFFEFF3F4),
        textTertiary = this.textSecondary.copy(alpha = 0.7f),
        accentOrange = this.accent,
        accentPurple = Color(0xFFBF5AF2),
        peerColors = if (this.isDark) PeerColorStyle.Dark else PeerColorStyle.Light
    )
}

