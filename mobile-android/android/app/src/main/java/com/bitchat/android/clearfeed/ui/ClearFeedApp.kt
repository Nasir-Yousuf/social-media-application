package com.bitchat.android.clearfeed.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.ui.auth.AuthScreen
import com.bitchat.android.clearfeed.ui.feed.FeedScreen
import com.bitchat.android.clearfeed.ui.messages.OnlineMessagesScreen
import com.bitchat.android.clearfeed.ui.profile.ProfileScreen
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import com.bitchat.android.clearfeed.ui.theme.ClearFeedTheme
import com.bitchat.android.ui.ChatScreen
import com.bitchat.android.ui.ChatViewModel

enum class ClearFeedTab(val label: String) {
    FEED("Feed"),
    ONLINE_CHAT("Chat & AI"),
    MESH("BLE Mesh"),
    PROFILE("Profile")
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

    ClearFeedTheme {
        if (!isLoggedIn) {
            AuthScreen(
                onAuthSuccess = {
                    isLoggedIn = sessionManager.isLoggedIn()
                }
            )
        } else {
            // If on Mesh tab and chatViewModel handles back, let it handle; otherwise return to FEED
            BackHandler(enabled = currentTab != ClearFeedTab.FEED) {
                if (currentTab == ClearFeedTab.MESH && chatViewModel.handleBackPressed()) {
                    // ChatViewModel handled the back press (e.g., closed private chat or sheet)
                } else {
                    currentTab = ClearFeedTab.FEED
                }
            }

            Scaffold(
                modifier = modifier.fillMaxSize(),
                containerColor = ClearFeedColors.Background,
                bottomBar = {
                    NavigationBar(
                        containerColor = ClearFeedColors.Surface,
                        contentColor = ClearFeedColors.TextPrimary
                    ) {
                        NavigationBarItem(
                            selected = currentTab == ClearFeedTab.FEED,
                            onClick = { currentTab = ClearFeedTab.FEED },
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.Home,
                                    contentDescription = "Feed"
                                )
                            },
                            label = {
                                Text(
                                    text = "Feed",
                                    fontSize = 11.sp,
                                    fontWeight = if (currentTab == ClearFeedTab.FEED) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ClearFeedColors.AccentBlue,
                                selectedTextColor = ClearFeedColors.AccentBlue,
                                indicatorColor = ClearFeedColors.SurfaceHighlight,
                                unselectedIconColor = ClearFeedColors.TextSecondary,
                                unselectedTextColor = ClearFeedColors.TextSecondary
                            )
                        )

                        NavigationBarItem(
                            selected = currentTab == ClearFeedTab.ONLINE_CHAT,
                            onClick = { currentTab = ClearFeedTab.ONLINE_CHAT },
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.Email,
                                    contentDescription = "Chat & AI"
                                )
                            },
                            label = {
                                Text(
                                    text = "Chat & AI",
                                    fontSize = 11.sp,
                                    fontWeight = if (currentTab == ClearFeedTab.ONLINE_CHAT) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ClearFeedColors.AccentBlue,
                                selectedTextColor = ClearFeedColors.AccentBlue,
                                indicatorColor = ClearFeedColors.SurfaceHighlight,
                                unselectedIconColor = ClearFeedColors.TextSecondary,
                                unselectedTextColor = ClearFeedColors.TextSecondary
                            )
                        )

                        NavigationBarItem(
                            selected = currentTab == ClearFeedTab.MESH,
                            onClick = { currentTab = ClearFeedTab.MESH },
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.Bluetooth,
                                    contentDescription = "BLE Mesh"
                                )
                            },
                            label = {
                                Text(
                                    text = "BLE Mesh",
                                    fontSize = 11.sp,
                                    fontWeight = if (currentTab == ClearFeedTab.MESH) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ClearFeedColors.AccentGreen,
                                selectedTextColor = ClearFeedColors.AccentGreen,
                                indicatorColor = ClearFeedColors.SurfaceHighlight,
                                unselectedIconColor = ClearFeedColors.TextSecondary,
                                unselectedTextColor = ClearFeedColors.TextSecondary
                            )
                        )

                        NavigationBarItem(
                            selected = currentTab == ClearFeedTab.PROFILE,
                            onClick = { currentTab = ClearFeedTab.PROFILE },
                            icon = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Profile"
                                )
                            },
                            label = {
                                Text(
                                    text = "Profile",
                                    fontSize = 11.sp,
                                    fontWeight = if (currentTab == ClearFeedTab.PROFILE) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ClearFeedColors.AccentBlue,
                                selectedTextColor = ClearFeedColors.AccentBlue,
                                indicatorColor = ClearFeedColors.SurfaceHighlight,
                                unselectedIconColor = ClearFeedColors.TextSecondary,
                                unselectedTextColor = ClearFeedColors.TextSecondary
                            )
                        )
                    }
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    when (currentTab) {
                        ClearFeedTab.FEED -> FeedScreen()
                        ClearFeedTab.ONLINE_CHAT -> OnlineMessagesScreen()
                        ClearFeedTab.MESH -> ChatScreen(viewModel = chatViewModel)
                        ClearFeedTab.PROFILE -> ProfileScreen(
                            onLogout = {
                                sessionManager.clearSession()
                                isLoggedIn = false
                            }
                        )
                    }
                }
            }
        }
    }
}

