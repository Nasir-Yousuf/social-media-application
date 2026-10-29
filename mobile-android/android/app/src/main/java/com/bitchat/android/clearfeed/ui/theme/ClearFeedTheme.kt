package com.bitchat.android.clearfeed.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

object ClearFeedColors {
    val Background = Color(0xFF000000)
    val Surface = Color(0xFF16181C)
    val SurfaceVariant = Color(0xFF1E2024)
    val Border = Color(0xFF2F3336)
    
    val PrimaryEmerald = Color(0xFF00BA7C)
    val AccentCyan = Color(0xFF00A6F4)
    val ErrorRed = Color(0xFFFF453A)

    val TextPrimary = Color(0xFFE7E9EA)
    val TextSecondary = Color(0xFF71767B)
    val CodeBg = Color(0xFF0D1117)
}

val ClearFeedDarkColorScheme = darkColorScheme(
    primary = ClearFeedColors.PrimaryEmerald,
    onPrimary = Color.White,
    secondary = ClearFeedColors.AccentCyan,
    onSecondary = Color.White,
    background = ClearFeedColors.Background,
    onBackground = ClearFeedColors.TextPrimary,
    surface = ClearFeedColors.Surface,
    onSurface = ClearFeedColors.TextPrimary,
    surfaceVariant = ClearFeedColors.SurfaceVariant,
    onSurfaceVariant = ClearFeedColors.TextSecondary,
    outline = ClearFeedColors.Border,
    error = ClearFeedColors.ErrorRed
)
