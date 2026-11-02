package com.bitchat.android.clearfeed.ui.components

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.auth.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.abs

private val AVATAR_PALETTE = listOf(
    Color(0xFF00A6F4),
    Color(0xFF00BA7C),
    Color(0xFFF91880),
    Color(0xFFFFD700),
    Color(0xFF7856FF),
    Color(0xFFFF7A00)
)

private val avatarBitmapCache = ConcurrentHashMap<String, Bitmap>()
private val okHttpClient = OkHttpClient()

fun resolveAvatarUrl(rawUrl: String?, serverBaseUrl: String): String? {
    if (rawUrl.isNullOrBlank()) return null
    val trimmed = rawUrl.trim()
    if (trimmed.contains("api.dicebear.com") && trimmed.contains("/svg")) {
        return trimmed.replace("/svg", "/png")
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image")) {
        return trimmed
    }
    val cleanBase = serverBaseUrl.trim().removeSuffix("/api").removeSuffix("/")
    val path = if (trimmed.startsWith("/")) trimmed else "/$trimmed"
    return "$cleanBase$path"
}

@Composable
fun ClearFeedAvatar(
    name: String?,
    avatarUrl: String?,
    modifier: Modifier = Modifier,
    size: Dp = 42.dp,
    isAi: Boolean = false
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val serverBase = sessionManager.getServerUrl()
    val resolvedUrl = remember(avatarUrl, serverBase) { resolveAvatarUrl(avatarUrl, serverBase) }

    val displayName = name?.trim() ?: "User"
    val initials = remember(displayName) {
        val parts = displayName.split(Regex("\\s+")).filter { it.isNotEmpty() }
        if (parts.size >= 2) {
            "${parts[0].first().uppercase()}${parts[1].first().uppercase()}"
        } else if (parts.isNotEmpty()) {
            parts[0].take(2).uppercase()
        } else {
            "?"
        }
    }

    val fallbackColor = remember(displayName) {
        val hash = abs(displayName.hashCode())
        AVATAR_PALETTE[hash % AVATAR_PALETTE.size]
    }

    var loadedBitmap by remember(resolvedUrl) {
        mutableStateOf(resolvedUrl?.let { avatarBitmapCache[it] })
    }

    LaunchedEffect(resolvedUrl) {
        if (resolvedUrl.isNullOrBlank() || loadedBitmap != null) return@LaunchedEffect

        withContext(Dispatchers.IO) {
            try {
                if (resolvedUrl.startsWith("data:image")) {
                    val base64Data = resolvedUrl.substringAfter("base64,")
                    val decodedBytes = Base64.decode(base64Data, Base64.DEFAULT)
                    val bmp = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                    if (bmp != null) {
                        avatarBitmapCache[resolvedUrl] = bmp
                        withContext(Dispatchers.Main) { loadedBitmap = bmp }
                    }
                } else {
                    val request = Request.Builder().url(resolvedUrl).build()
                    val response = okHttpClient.newCall(request).execute()
                    if (response.isSuccessful) {
                        val bytes = response.body?.bytes()
                        if (bytes != null) {
                            val bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                            if (bmp != null) {
                                avatarBitmapCache[resolvedUrl] = bmp
                                withContext(Dispatchers.Main) { loadedBitmap = bmp }
                            }
                        }
                    }
                }
            } catch (_: Exception) {
                // Silently fall back to initial avatar
            }
        }
    }

    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(fallbackColor),
        contentAlignment = Alignment.Center
    ) {
        val bmp = loadedBitmap
        if (bmp != null) {
            Image(
                bitmap = bmp.asImageBitmap(),
                contentDescription = displayName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape)
            )
        } else {
            Text(
                text = if (isAi) "🤖" else initials,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = (size.value * 0.4f).sp
            )
        }
    }
}
