package com.bitchat.android.clearfeed.ui.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Send
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
import com.bitchat.android.clearfeed.api.ClearFeedApiClient
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.data.AiSettings
import com.bitchat.android.clearfeed.data.Conversation
import com.bitchat.android.clearfeed.data.OnlineMessage
import com.bitchat.android.clearfeed.ui.components.AiSettingsDialog
import com.bitchat.android.clearfeed.ui.components.CodeSnippetBlock
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnlineMessagesScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val currentUserId = sessionManager.getUser()?.id ?: ""
    val scope = rememberCoroutineScope()

    var activeConversation by remember { mutableStateOf<Conversation?>(null) }
    var conversations by remember { mutableStateOf<List<Conversation>>(emptyList()) }
    var messages by remember { mutableStateOf<List<OnlineMessage>>(emptyList()) }
    var inputText by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(true) }
    var showAiSettingsDialog by remember { mutableStateOf(false) }

    fun loadConversations() {
        scope.launch {
            val res = apiClient.getConversations()
            res.onSuccess {
                conversations = it
                isLoading = false
            }.onFailure {
                isLoading = false
            }
        }
    }

    fun loadMessages(convId: String) {
        scope.launch {
            val res = apiClient.getMessages(convId)
            res.onSuccess {
                messages = it
            }
        }
    }

    LaunchedEffect(Unit) {
        loadConversations()
    }

    // Auto-poll messages when active conversation is open
    LaunchedEffect(activeConversation?.id) {
        val convId = activeConversation?.id ?: return@LaunchedEffect
        while (true) {
            loadMessages(convId)
            delay(2000)
        }
    }

    if (activeConversation != null) {
        val conv = activeConversation!!
        val other = conv.getOtherUser(currentUserId)
        val isAiChat = conv.isAiChat || other?.isAi == true || other?.username == "ai"

        Scaffold(
            modifier = modifier.fillMaxSize(),
            containerColor = ClearFeedColors.Background,
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = if (isAiChat) "Clearfeed AI ✨" else (other?.name ?: "Chat"),
                                    color = ClearFeedColors.TextPrimary,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                if (isAiChat) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(ClearFeedColors.AccentCyan)
                                            .padding(horizontal = 4.dp, vertical = 2.dp)
                                    ) {
                                        Text("Gemini", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Black)
                                    }
                                }
                            }
                            Text(
                                text = if (isAiChat) "Google Gemini Companion" else "@${other?.username ?: ""}",
                                color = ClearFeedColors.TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = { activeConversation = null }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = ClearFeedColors.TextPrimary)
                        }
                    },
                    actions = {
                        if (isAiChat) {
                            IconButton(onClick = { showAiSettingsDialog = true }) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = "AI Persona Settings",
                                    tint = ClearFeedColors.PrimaryEmerald
                                )
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = ClearFeedColors.Surface)
                )
            },
            bottomBar = {
                Surface(
                    color = ClearFeedColors.Surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        OutlinedTextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = { Text(if (isAiChat) "Ask Gemini anything or debug code..." else "Type a message...", color = ClearFeedColors.TextSecondary) },
                            modifier = Modifier.weight(1f),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = ClearFeedColors.TextPrimary,
                                unfocusedTextColor = ClearFeedColors.TextPrimary,
                                focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                                unfocusedBorderColor = ClearFeedColors.Border
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        IconButton(
                            onClick = {
                                val textToSend = inputText.trim()
                                if (textToSend.isNotBlank()) {
                                    inputText = ""
                                    scope.launch {
                                        apiClient.sendMessage(conv.id, textToSend)
                                        loadMessages(conv.id)
                                    }
                                }
                            },
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(ClearFeedColors.PrimaryEmerald)
                        ) {
                            Icon(Icons.Default.Send, contentDescription = "Send", tint = Color.White, modifier = Modifier.size(20.dp))
                        }
                    }
                }
            }
        ) { padding ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    val isMe = msg.sender?.id == currentUserId
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start
                    ) {
                        Column(
                            modifier = Modifier
                                .widthIn(max = 290.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isMe) ClearFeedColors.PrimaryEmerald else ClearFeedColors.Surface)
                                .border(1.dp, if (isMe) Color.Transparent else ClearFeedColors.Border, RoundedCornerShape(16.dp))
                                .padding(12.dp)
                        ) {
                            if (!isMe && isAiChat) {
                                Text(
                                    text = "Gemini AI",
                                    color = ClearFeedColors.AccentCyan,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(bottom = 4.dp)
                                )
                            }
                            Text(
                                text = msg.text,
                                color = if (isMe) Color.White else ClearFeedColors.TextPrimary,
                                fontSize = 14.sp,
                                lineHeight = 19.sp
                            )
                            msg.codeSnippet?.let { snippet ->
                                if (snippet.code.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    CodeSnippetBlock(snippet = snippet)
                                }
                            }
                        }
                    }
                }
            }

            if (showAiSettingsDialog) {
                AiSettingsDialog(
                    currentSettings = conv.aiSettings,
                    onDismiss = { showAiSettingsDialog = false },
                    onSave = { newSettings ->
                        scope.launch {
                            apiClient.updateAiSettings(conv.id, newSettings)
                        }
                    }
                )
            }
        }
    } else {
        // Conversations List
        Scaffold(
            modifier = modifier.fillMaxSize(),
            containerColor = ClearFeedColors.Background,
            topBar = {
                TopAppBar(
                    title = {
                        Text("Online Messages", color = Color.White, fontWeight = FontWeight.Bold)
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = ClearFeedColors.Surface)
                )
            }
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // Banner to Chat with Google Gemini AI
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(ClearFeedColors.SurfaceVariant)
                        .border(1.dp, ClearFeedColors.PrimaryEmerald, RoundedCornerShape(14.dp))
                        .clickable {
                            scope.launch {
                                val res = apiClient.startAiConversation()
                                res.onSuccess { activeConversation = it }
                            }
                        }
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(ClearFeedColors.PrimaryEmerald),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = "Gemini AI", tint = Color.White)
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Clearfeed AI Companion",
                                color = ClearFeedColors.TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(ClearFeedColors.AccentCyan)
                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                            ) {
                                Text("Gemini", color = Color.White, fontSize = 9.sp, fontWeight = FontWeight.Black)
                            }
                        }
                        Text(
                            text = "Coding mentor, best friend & English partner",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }

                // Conversations List
                if (isLoading) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = ClearFeedColors.PrimaryEmerald)
                    }
                } else if (conversations.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No online conversations yet", color = ClearFeedColors.TextSecondary)
                    }
                } else {
                    LazyColumn(modifier = Modifier.fillMaxSize()) {
                        items(conversations, key = { it.id }) { conv ->
                            val other = conv.getOtherUser(currentUserId)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { activeConversation = conv }
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(44.dp)
                                        .clip(CircleShape)
                                        .background(if (conv.isAiChat || other?.isAi == true) ClearFeedColors.AccentCyan else ClearFeedColors.PrimaryEmerald),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = (other?.name?.firstOrNull() ?: 'U').uppercase(),
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp
                                    )
                                }

                                Spacer(modifier = Modifier.width(12.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = other?.name ?: "User",
                                        color = ClearFeedColors.TextPrimary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp
                                    )
                                    Text(
                                        text = conv.lastMessage?.text ?: "No messages yet",
                                        color = ClearFeedColors.TextSecondary,
                                        fontSize = 13.sp,
                                        maxLines = 1
                                    )
                                }
                            }
                            HorizontalDivider(color = ClearFeedColors.Border, thickness = 0.5.dp)
                        }
                    }
                }
            }
        }
    }
}
