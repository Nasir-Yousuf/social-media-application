package com.bitchat.android.clearfeed.ui.settings

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.ui.components.ClearFeedAvatar
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import com.bitchat.android.clearfeed.ui.theme.ThemePreset

@Composable
fun SettingsScreen(
    currentTheme: ThemePreset,
    onThemeSelect: (ThemePreset) -> Unit,
    onLogout: () -> Unit,
    onNavigateToMesh: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val user = sessionManager.getUser()

    var serverUrl by remember { mutableStateOf(sessionManager.getServerUrl()) }
    var customUrlInput by remember { mutableStateOf(serverUrl) }
    var showCustomInput by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ClearFeedColors.Background)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Settings",
                    color = Color.White,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Display & theme preferences",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 13.sp
                )
            }
            Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = null,
                tint = ClearFeedColors.AccentCyan,
                modifier = Modifier.size(24.dp)
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Profile Preview Card matching Screenshot 4
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF16181C))
                .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(14.dp))
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                ClearFeedAvatar(
                    name = user?.name ?: "Nasir Yousuf",
                    avatarUrl = user?.avatarUrl,
                    size = 46.dp
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = user?.name ?: "Nasir Yousuf",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "@${user?.username ?: "nasir"}",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 13.sp
                    )
                }
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF1B2A38))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "Profile",
                    color = ClearFeedColors.AccentCyan,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Display & Themes Header
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Palette,
                contentDescription = null,
                tint = ClearFeedColors.AccentCyan,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Display & Themes",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Text(
            text = "Personalize your Clearfeed appearance. Saved automatically across devices.",
            color = ClearFeedColors.TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
        )

        // Live Theme Preview Card matching Screenshot 4
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF16181C))
                .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(14.dp))
                .padding(14.dp)
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(ClearFeedColors.AccentGreen),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("CL", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Clearfeed", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("• preview", color = ClearFeedColors.TextSecondary, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "A modern chronological platform for developers and learners. Selected theme updates instantly!",
                    color = Color.White,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "#cleanarchitecture #pulse518",
                    color = ClearFeedColors.AccentCyan,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Themes List matching Screenshots 4 & 5
        ThemePreset.values().forEach { preset ->
            val isSelected = currentTheme == preset
            val radioBorder = if (isSelected) ClearFeedColors.AccentCyan else Color(0xFF38444D)
            val cardBorder = if (isSelected) ClearFeedColors.AccentCyan else Color(0xFF2F3336)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF16181C))
                    .border(if (isSelected) 1.5.dp else 1.dp, cardBorder, RoundedCornerShape(12.dp))
                    .clickable { onThemeSelect(preset) }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(preset.background)
                            .border(1.dp, preset.border, RoundedCornerShape(8.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(CircleShape)
                                .background(preset.accent)
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = preset.title,
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(Color(0xFF202327))
                                    .padding(horizontal = 6.dp, vertical = 1.dp)
                            ) {
                                Text(
                                    text = preset.badge,
                                    color = ClearFeedColors.AccentCyan,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Text(
                            text = preset.subtitle,
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }

                // Radio Button Checkmark
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(if (isSelected) ClearFeedColors.AccentCyan else Color.Transparent)
                        .border(1.5.dp, radioBorder, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    if (isSelected) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Selected",
                            tint = Color.Black,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Clearfeed Mesh Section matching Screenshot 5
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Hub,
                contentDescription = null,
                tint = Color(0xFF00BA7C),
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Clearfeed Mesh",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Text(
            text = "Connect nearby. Communicate offline.",
            color = ClearFeedColors.TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF16181C))
                .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(14.dp))
                .clickable { onNavigateToMesh() }
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF0F3818)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Wifi,
                        contentDescription = null,
                        tint = Color(0xFF00BA7C),
                        modifier = Modifier.size(20.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Mesh Chat (Offline)",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Local peer discovery & end-to-end encrypted messaging without internet",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 11.sp,
                        maxLines = 2
                    )
                }
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = ClearFeedColors.TextSecondary,
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Backend Server & Calling matching Screenshot 5
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF16181C))
                .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(14.dp))
                .padding(14.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Cloud,
                            contentDescription = null,
                            tint = ClearFeedColors.AccentCyan,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Backend Server & Calling",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Online Status Tag
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF0A2B14))
                            .border(1.dp, Color(0xFF00BA7C), RoundedCornerShape(12.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF00BA7C))
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Online",
                                color = Color(0xFF00BA7C),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Connected to: ☁️ Railway Cloud",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(6.dp))

                // URL Display Field
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF0D1117))
                        .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(8.dp))
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = serverUrl,
                        color = Color(0xFFC9D1D9),
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Presets: [ Railway Cloud ] [ Local Wi-Fi ] [ Custom ]
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Railway Cloud Button
                    val isRailway = serverUrl.contains("railway")
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isRailway) ClearFeedColors.AccentCyan else Color(0xFF202327))
                            .clickable {
                                val url = "https://clearfeed518.up.railway.app/api"
                                sessionManager.setServerUrl(url)
                                serverUrl = url
                                Toast.makeText(context, "Switched to Railway Cloud", Toast.LENGTH_SHORT).show()
                            }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "☁️ Railway Cloud",
                            color = if (isRailway) Color.White else ClearFeedColors.TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Local Wi-Fi Button
                    val isLocal = serverUrl.contains("10.0.2.2") || serverUrl.contains("192.168")
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isLocal) ClearFeedColors.AccentCyan else Color(0xFF202327))
                            .clickable {
                                val url = "http://10.0.2.2:5180"
                                sessionManager.setServerUrl(url)
                                serverUrl = url
                                Toast.makeText(context, "Switched to Local Wi-Fi", Toast.LENGTH_SHORT).show()
                            }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "💻 Local Wi-Fi",
                            color = if (isLocal) Color.White else ClearFeedColors.TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    // Custom Button
                    Box(
                        modifier = Modifier
                            .weight(0.8f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF202327))
                            .clickable { showCustomInput = !showCustomInput }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "✏️ Custom",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                if (showCustomInput) {
                    Spacer(modifier = Modifier.height(10.dp))
                    OutlinedTextField(
                        value = customUrlInput,
                        onValueChange = { customUrlInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Server Base URL") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClearFeedColors.AccentCyan,
                            unfocusedBorderColor = Color(0xFF2F3336)
                        )
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Button(
                        onClick = {
                            if (customUrlInput.isNotBlank()) {
                                sessionManager.setServerUrl(customUrlInput.trim())
                                serverUrl = customUrlInput.trim()
                                showCustomInput = false
                                Toast.makeText(context, "Server URL updated", Toast.LENGTH_SHORT).show()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = ClearFeedColors.AccentCyan)
                    ) {
                        Text("Save URL")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Version Info
        Text(
            text = "Clearfeed v2.4 • Pulse CS518 Architecture",
            color = ClearFeedColors.TextSecondary,
            fontSize = 12.sp,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Log out of ClearFeed Button (matching Screenshot 5)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .border(1.dp, Color(0xFFE0245E), RoundedCornerShape(24.dp))
                .clickable {
                    sessionManager.clearSession()
                    onLogout()
                }
                .padding(vertical = 14.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.ExitToApp,
                    contentDescription = null,
                    tint = Color(0xFFE0245E),
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Log out of Clearfeed",
                    color = Color(0xFFE0245E),
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}

