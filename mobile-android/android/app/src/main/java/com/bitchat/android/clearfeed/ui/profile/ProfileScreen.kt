package com.bitchat.android.clearfeed.ui.profile

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val sessionManager = remember { SessionManager.getInstance(context) }
    val user = sessionManager.getUser()
    var showServerDialog by remember { mutableStateOf(false) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = ClearFeedColors.Background,
        topBar = {
            TopAppBar(
                title = { Text("Profile & Settings", color = Color.White, fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ClearFeedColors.Surface)
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            val name = user?.name ?: "ClearFeed User"
            val username = user?.username ?: "user"
            val initial = name.firstOrNull()?.uppercase() ?: "C"

            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(ClearFeedColors.PrimaryEmerald),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = initial,
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = 32.sp
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
                text = name,
                color = ClearFeedColors.TextPrimary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "@$username",
                color = ClearFeedColors.TextSecondary,
                fontSize = 14.sp
            )

            if (!user?.bio.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = user!!.bio!!,
                    color = ClearFeedColors.TextPrimary,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Settings Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(ClearFeedColors.Surface)
                    .border(1.dp, ClearFeedColors.Border, RoundedCornerShape(12.dp))
                    .padding(16.dp)
            ) {
                Text(
                    text = "SETTINGS & CONNECTION",
                    color = ClearFeedColors.AccentCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Server Host",
                            color = ClearFeedColors.TextPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = sessionManager.getServerUrl(),
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 12.sp
                        )
                    }

                    IconButton(onClick = { showServerDialog = true }) {
                        Icon(Icons.Default.Settings, contentDescription = "Edit Server", tint = ClearFeedColors.PrimaryEmerald)
                    }
                }

                HorizontalDivider(color = ClearFeedColors.Border, modifier = Modifier.padding(vertical = 12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Bluetooth Mesh Engine",
                            color = ClearFeedColors.TextPrimary,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "BitChat-compatible BLE Dual-Role Mesh active",
                            color = ClearFeedColors.PrimaryEmerald,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            OutlinedButton(
                onClick = {
                    sessionManager.clearSession()
                    onLogout()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = ClearFeedColors.ErrorRed)
            ) {
                Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out", tint = ClearFeedColors.ErrorRed)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Sign Out", fontWeight = FontWeight.Bold)
            }
        }
    }

    if (showServerDialog) {
        var tempUrl by remember { mutableStateOf(sessionManager.getServerUrl()) }
        AlertDialog(
            onDismissRequest = { showServerDialog = false },
            title = { Text("Edit Server URL", color = ClearFeedColors.TextPrimary) },
            text = {
                OutlinedTextField(
                    value = tempUrl,
                    onValueChange = { tempUrl = it },
                    label = { Text("Base URL") }
                )
            },
            confirmButton = {
                Button(onClick = {
                    sessionManager.setServerUrl(tempUrl)
                    showServerDialog = false
                    Toast.makeText(context, "Server host saved", Toast.LENGTH_SHORT).show()
                }) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showServerDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
