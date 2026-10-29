package com.bitchat.android.clearfeed.ui.auth

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.api.ClearFeedApiClient
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    onAuthSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val scope = rememberCoroutineScope()

    var isLoginTab by remember { mutableStateOf(true) }
    var loginInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var nameInput by remember { mutableStateOf("") }
    var usernameInput by remember { mutableStateOf("") }
    var emailInput by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showServerConfigDialog by remember { mutableStateOf(false) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(ClearFeedColors.Background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // App Brand
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "Clear",
                    color = Color.White,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "feed",
                    color = ClearFeedColors.PrimaryEmerald,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black
                )
            }
            Text(
                text = "Minimalist social network for text & code",
                color = ClearFeedColors.TextSecondary,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
            )

            // Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(ClearFeedColors.Surface)
                    .padding(4.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isLoginTab) ClearFeedColors.PrimaryEmerald else Color.Transparent)
                        .clickable { isLoginTab = true }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Sign In",
                        color = if (isLoginTab) Color.White else ClearFeedColors.TextSecondary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (!isLoginTab) ClearFeedColors.PrimaryEmerald else Color.Transparent)
                        .clickable { isLoginTab = false }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Register",
                        color = if (!isLoginTab) Color.White else ClearFeedColors.TextSecondary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            if (errorMessage != null) {
                Text(
                    text = errorMessage!!,
                    color = ClearFeedColors.ErrorRed,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

            if (isLoginTab) {
                OutlinedTextField(
                    value = loginInput,
                    onValueChange = { loginInput = it },
                    label = { Text("Username or Email") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = passwordInput,
                    onValueChange = { passwordInput = it },
                    label = { Text("Password") },
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = "Toggle password",
                                tint = ClearFeedColors.TextSecondary
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )
            } else {
                OutlinedTextField(
                    value = nameInput,
                    onValueChange = { nameInput = it },
                    label = { Text("Full Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = usernameInput,
                    onValueChange = { usernameInput = it },
                    label = { Text("Username") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = emailInput,
                    onValueChange = { emailInput = it },
                    label = { Text("Email Address") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = passwordInput,
                    onValueChange = { passwordInput = it },
                    label = { Text("Password (min 6 characters)") },
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = "Toggle password",
                                tint = ClearFeedColors.TextSecondary
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Button(
                onClick = {
                    isLoading = true
                    errorMessage = null
                    scope.launch {
                        if (isLoginTab) {
                            val res = apiClient.login(loginInput.trim(), passwordInput.trim())
                            res.onSuccess {
                                isLoading = false
                                onAuthSuccess()
                            }.onFailure { err ->
                                isLoading = false
                                errorMessage = err.message ?: "Authentication failed"
                            }
                        } else {
                            val res = apiClient.register(
                                name = nameInput.trim(),
                                username = usernameInput.trim(),
                                email = emailInput.trim(),
                                pass = passwordInput.trim()
                            )
                            res.onSuccess {
                                isLoading = false
                                onAuthSuccess()
                            }.onFailure { err ->
                                isLoading = false
                                errorMessage = err.message ?: "Registration failed"
                            }
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                enabled = !isLoading,
                colors = ButtonDefaults.buttonColors(containerColor = ClearFeedColors.PrimaryEmerald)
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                } else {
                    Text(
                        text = if (isLoginTab) "Sign In" else "Create Account",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = {
                    isLoading = true
                    scope.launch {
                        val res = apiClient.guestLogin()
                        res.onSuccess {
                            isLoading = false
                            onAuthSuccess()
                        }.onFailure { err ->
                            isLoading = false
                            errorMessage = err.message ?: "Guest login failed"
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text("Explore as Guest", color = ClearFeedColors.AccentCyan)
            }

            Spacer(modifier = Modifier.height(24.dp))

            TextButton(
                onClick = { showServerConfigDialog = true }
            ) {
                Icon(Icons.Default.Settings, contentDescription = "Server URL", tint = ClearFeedColors.TextSecondary, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Server Host: ${sessionManager.getServerUrl()}", color = ClearFeedColors.TextSecondary, fontSize = 11.sp)
            }
        }
    }

    if (showServerConfigDialog) {
        var tempUrl by remember { mutableStateOf(sessionManager.getServerUrl()) }
        AlertDialog(
            onDismissRequest = { showServerConfigDialog = false },
            title = { Text("ClearFeed Server URL", color = ClearFeedColors.TextPrimary) },
            text = {
                OutlinedTextField(
                    value = tempUrl,
                    onValueChange = { tempUrl = it },
                    label = { Text("Backend URL") },
                    placeholder = { Text("http://10.0.2.2:5000") }
                )
            },
            confirmButton = {
                Button(onClick = {
                    sessionManager.setServerUrl(tempUrl)
                    showServerConfigDialog = false
                    Toast.makeText(context, "Server URL updated", Toast.LENGTH_SHORT).show()
                }) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showServerConfigDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
