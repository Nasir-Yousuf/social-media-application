package com.bitchat.android.clearfeed.ui.auth

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CompassCalibration
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.Bluetooth
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
import com.bitchat.android.clearfeed.data.User
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    onAuthSuccess: () -> Unit,
    onOpenMeshChat: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val scope = rememberCoroutineScope()

    var isSignUpMode by remember { mutableStateOf(false) }
    var loginInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var nameInput by remember { mutableStateOf("") }
    var emailInput by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(ClearFeedColors.Background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.height(40.dp))

            // Pulse Logo matching Screenshot 2
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .border(3.dp, ClearFeedColors.AccentCyan, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(18.dp)
                        .clip(CircleShape)
                        .background(ClearFeedColors.AccentCyan)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Clearfeed Logo & Tagline
            Text(
                text = "Clearfeed",
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black
            )

            Text(
                text = "The Anti-Algorithm Minimalist Social Network",
                color = ClearFeedColors.TextSecondary,
                fontSize = 13.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 28.dp)
            )

            // Auth Card matching Screenshot 2
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color(0xFF16181C))
                    .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(18.dp))
                    .padding(20.dp)
            ) {
                Column {
                    Text(
                        text = if (isSignUpMode) "Create an account" else "Sign in to Clearfeed",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    if (isSignUpMode) {
                        OutlinedTextField(
                            value = nameInput,
                            onValueChange = { nameInput = it },
                            placeholder = { Text("Full Name", color = ClearFeedColors.TextSecondary) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF0D1117),
                                unfocusedContainerColor = Color(0xFF0D1117),
                                focusedBorderColor = ClearFeedColors.AccentCyan,
                                unfocusedBorderColor = Color(0xFF2F3336),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = emailInput,
                            onValueChange = { emailInput = it },
                            placeholder = { Text("Email", color = ClearFeedColors.TextSecondary) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF0D1117),
                                unfocusedContainerColor = Color(0xFF0D1117),
                                focusedBorderColor = ClearFeedColors.AccentCyan,
                                unfocusedBorderColor = Color(0xFF2F3336),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            shape = RoundedCornerShape(10.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    // Email or Username
                    OutlinedTextField(
                        value = loginInput,
                        onValueChange = { loginInput = it },
                        placeholder = {
                            Text(
                                if (isSignUpMode) "Username" else "Email or Username",
                                color = ClearFeedColors.TextSecondary
                            )
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF0D1117),
                            unfocusedContainerColor = Color(0xFF0D1117),
                            focusedBorderColor = ClearFeedColors.AccentCyan,
                            unfocusedBorderColor = Color(0xFF2F3336),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Password
                    OutlinedTextField(
                        value = passwordInput,
                        onValueChange = { passwordInput = it },
                        placeholder = { Text("Password", color = ClearFeedColors.TextSecondary) },
                        singleLine = true,
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = null,
                                    tint = ClearFeedColors.TextSecondary
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF0D1117),
                            unfocusedContainerColor = Color(0xFF0D1117),
                            focusedBorderColor = ClearFeedColors.AccentCyan,
                            unfocusedBorderColor = Color(0xFF2F3336),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp)
                    )

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = errorMessage ?: "",
                            color = Color(0xFFFF453A),
                            fontSize = 12.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Primary Action Button (Log In / Create Account)
                    Button(
                        onClick = {
                            if (loginInput.isBlank() || passwordInput.isBlank()) {
                                errorMessage = "Please enter your credentials"
                                return@Button
                            }
                            isLoading = true
                            errorMessage = null
                            scope.launch {
                                val result = if (isSignUpMode) {
                                    apiClient.register(
                                        name = nameInput.ifBlank { loginInput },
                                        username = loginInput.trim(),
                                        email = emailInput.ifBlank { "${loginInput.trim()}@clearfeed.local" },
                                        pass = passwordInput
                                    )
                                } else {
                                    apiClient.login(loginInput.trim(), passwordInput)
                                }

                                isLoading = false
                                result.onSuccess {
                                    onAuthSuccess()
                                }.onFailure { e ->
                                    errorMessage = e.message ?: "Authentication failed"
                                }
                            }
                        },
                        enabled = !isLoading,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ClearFeedColors.AccentCyan,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(24.dp)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = if (isSignUpMode) "Sign Up" else "Log In",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Divider with "OR"
                    Spacer(modifier = Modifier.height(18.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Divider(modifier = Modifier.weight(1f), color = Color(0xFF2F3336))
                        Text(
                            text = "  OR  ",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Divider(modifier = Modifier.weight(1f), color = Color(0xFF2F3336))
                    }
                    Spacer(modifier = Modifier.height(18.dp))

                    // Continue as Guest Button matching Screenshot 2
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF202327))
                            .clickable(enabled = !isLoading) {
                                isLoading = true
                                errorMessage = null
                                scope.launch {
                                    val res = apiClient.guestLogin()
                                    isLoading = false
                                    res.onSuccess {
                                        onAuthSuccess()
                                    }.onFailure { e ->
                                        errorMessage = e.message ?: "Guest login failed"
                                        Toast.makeText(context, "Guest login failed: ${e.message}", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Explore,
                                contentDescription = null,
                                tint = ClearFeedColors.AccentCyan,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Continue as Guest",
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Open Mesh Chat (Offline) matching Screenshot 2
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF071A0E))
                            .border(1.dp, Color(0xFF00BA7C), RoundedCornerShape(12.dp))
                            .clickable { onOpenMeshChat() }
                            .padding(vertical = 12.dp, horizontal = 14.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(
                                imageVector = Icons.Default.Bluetooth,
                                contentDescription = "BeeChat Bluetooth",
                                tint = Color(0xFF00BA7C),
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Open BeeChat (Bluetooth Mesh)",
                                    color = Color(0xFF00BA7C),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Connect nearby without Wi-Fi, internet, or account",
                                    color = ClearFeedColors.TextSecondary,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Don't have an account? Create one
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = if (isSignUpMode) "Already have an account? " else "Don't have an account? ",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 13.sp
                        )
                        Text(
                            text = if (isSignUpMode) "Sign In" else "Create one",
                            color = ClearFeedColors.AccentCyan,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable {
                                isSignUpMode = !isSignUpMode
                                errorMessage = null
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Server Connection selector pill at bottom
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .clickable {
                        val current = sessionManager.getServerUrl()
                        if (current.contains("railway")) {
                            sessionManager.setServerUrl("http://10.0.2.2:5180")
                            Toast.makeText(context, "Switched to Local (10.0.2.2:5180)", Toast.LENGTH_SHORT).show()
                        } else {
                            sessionManager.setServerUrl("https://clearfeed518.up.railway.app/api")
                            Toast.makeText(context, "Switched to Railway Cloud", Toast.LENGTH_SHORT).show()
                        }
                    }
                    .padding(8.dp)
            ) {
                Text(
                    text = "⚙️ Server Connection (☁️ Cloud) ⌄",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 12.sp
                )
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}
