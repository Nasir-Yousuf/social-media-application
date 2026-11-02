package com.bitchat.android.clearfeed.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.ui.auth.AuthScreen
import com.bitchat.android.clearfeed.ui.feed.FeedScreen
import com.bitchat.android.clearfeed.ui.learn.LearnStudioScreen
import com.bitchat.android.clearfeed.ui.messages.OnlineMessagesScreen
import com.bitchat.android.clearfeed.ui.settings.SettingsScreen
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import com.bitchat.android.clearfeed.ui.theme.ClearFeedTheme
import com.bitchat.android.clearfeed.ui.theme.ThemePreset
import com.bitchat.android.ui.theme.toBitchatColorScheme
import com.bitchat.android.ui.theme.toBitchatPalette
import com.bitchat.android.ui.ChatScreen
import com.bitchat.android.ui.ChatViewModel

enum class ClearFeedTab(
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    FEED("Feed", Icons.Filled.Home, Icons.Outlined.Home),
    BEECHAT("BeeChat", Icons.Filled.Bluetooth, Icons.Outlined.Bluetooth),
    MESSAGES("Messages", Icons.Filled.ChatBubble, Icons.Outlined.ChatBubbleOutline),
    LEARN("Learn", Icons.Filled.School, Icons.Outlined.School),
    SETTINGS("Settings", Icons.Filled.Settings, Icons.Outlined.Settings)
}

@Composable
fun ClearFeedApp(
    chatViewModel: ChatViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    var isLoggedIn by remember { mutableStateOf(sessionManager.isLoggedIn()) }
    var currentTab by remember { mutableStateOf(ClearFeedTab.FEED) }
    var isMeshChatActive by remember { mutableStateOf(false) }
    var currentTheme by remember { mutableStateOf(ThemePreset.LIGHTS_OUT) }

    ClearFeedTheme(selectedTheme = currentTheme) {
        if (!isLoggedIn && !isMeshChatActive) {
            AuthScreen(
                onAuthSuccess = {
                    isLoggedIn = sessionManager.isLoggedIn()
                },
                onOpenMeshChat = {
                    isMeshChatActive = true
                }
            )
        } else if (isMeshChatActive) {
            // BLE Mesh Chat mode
            BackHandler {
                if (chatViewModel.handleBackPressed()) {
                    // ChatViewModel handled back (e.g. exit room)
                } else {
                    isMeshChatActive = false
                }
            }
            Scaffold(
                modifier = modifier.fillMaxSize(),
                containerColor = ClearFeedColors.Background,
                topBar = {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF0F172A))
                            .statusBarsPadding()
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Wifi,
                                contentDescription = null,
                                tint = Color(0xFF00BA7C),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Clearfeed Mesh (Offline)",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF1E293B))
                                .clickable { isMeshChatActive = false }
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Close",
                                color = ClearFeedColors.AccentCyan,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            ) { padding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                ) {
                    androidx.compose.runtime.CompositionLocalProvider(
                        com.bitchat.android.ui.theme.LocalBitchatPalette provides currentTheme.toBitchatPalette()
                    ) {
                        MaterialTheme(
                            colorScheme = currentTheme.toBitchatColorScheme(),
                            typography = com.bitchat.android.ui.theme.Typography
                        ) {
                            ChatScreen(viewModel = chatViewModel)
                        }
                    }
                }
            }
        } else {
            BackHandler(enabled = currentTab != ClearFeedTab.FEED) {
                if (currentTab == ClearFeedTab.BEECHAT && chatViewModel.handleBackPressed()) {
                    // ChatViewModel handled back inside BeeChat
                } else {
                    currentTab = ClearFeedTab.FEED
                }
            }

            Scaffold(
                modifier = modifier.fillMaxSize(),
                containerColor = ClearFeedColors.Background,
                bottomBar = {
                    // Bottom Navigation Bar matching the 5 tabs in all screenshots
                    NavigationBar(
                        containerColor = ClearFeedColors.Background,
                        contentColor = ClearFeedColors.TextPrimary,
                        tonalElevation = 0.dp
                    ) {
                        ClearFeedTab.values().forEach { tab ->
                            val isSelected = currentTab == tab
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = { currentTab = tab },
                                icon = {
                                    Icon(
                                        imageVector = if (isSelected) tab.selectedIcon else tab.unselectedIcon,
                                        contentDescription = tab.label,
                                        tint = if (isSelected) ClearFeedColors.AccentCyan else ClearFeedColors.TextSecondary,
                                        modifier = Modifier.size(24.dp)
                                    )
                                },
                                label = {
                                    Text(
                                        text = tab.label,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) ClearFeedColors.AccentCyan else ClearFeedColors.TextSecondary
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = ClearFeedColors.AccentCyan,
                                    selectedTextColor = ClearFeedColors.AccentCyan,
                                    indicatorColor = Color.Transparent,
                                    unselectedIconColor = ClearFeedColors.TextSecondary,
                                    unselectedTextColor = ClearFeedColors.TextSecondary
                                )
                            )
                        }
                    }
                }
            ) { padding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                ) {
                    when (currentTab) {
                        ClearFeedTab.FEED -> {
                            FeedScreen(
                                onNavigateToMesh = { currentTab = ClearFeedTab.BEECHAT }
                            )
                        }
                        ClearFeedTab.BEECHAT -> {
                            androidx.compose.runtime.CompositionLocalProvider(
                                com.bitchat.android.ui.theme.LocalBitchatPalette provides currentTheme.toBitchatPalette()
                            ) {
                                MaterialTheme(
                                    colorScheme = currentTheme.toBitchatColorScheme(),
                                    typography = com.bitchat.android.ui.theme.Typography
                                ) {
                                    ChatScreen(viewModel = chatViewModel)
                                }
                            }
                        }
                        ClearFeedTab.MESSAGES -> {
                            OnlineMessagesScreen(
                                onNavigateToMesh = { currentTab = ClearFeedTab.BEECHAT }
                            )
                        }
                        ClearFeedTab.LEARN -> {
                            LearnStudioScreen()
                        }
                        ClearFeedTab.SETTINGS -> {
                            SettingsScreen(
                                currentTheme = currentTheme,
                                onThemeSelect = { selected -> currentTheme = selected },
                                onLogout = { isLoggedIn = false },
                                onNavigateToMesh = { currentTab = ClearFeedTab.BEECHAT }
                            )
                        }
                    }
                }
            }
        }
    }
}
