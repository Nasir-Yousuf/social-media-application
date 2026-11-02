package com.bitchat.android.clearfeed.ui.feed

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.filled.Search
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.api.ClearFeedApiClient
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.data.Post
import com.bitchat.android.clearfeed.ui.components.ClearFeedAvatar
import com.bitchat.android.clearfeed.ui.components.ComposePostDialog
import com.bitchat.android.clearfeed.ui.components.CommentsBottomSheet
import com.bitchat.android.clearfeed.ui.components.PostCard
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.launch

@Composable
fun FeedScreen(
    onNavigateToMesh: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val currentUser = sessionManager.getUser()
    val scope = rememberCoroutineScope()

    var activeTab by remember { mutableStateOf("all") } // "all" | "following"
    var posts by remember { mutableStateOf<List<Post>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showComposeDialog by remember { mutableStateOf(false) }
    var selectedPostForComments by remember { mutableStateOf<Post?>(null) }

    fun loadFeed() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = apiClient.getFeed(page = 1, tab = activeTab)
            result.onSuccess { fetched ->
                posts = fetched
                isLoading = false
            }.onFailure { err ->
                errorMessage = err.message ?: "Failed to load feed"
                isLoading = false
            }
        }
    }

    LaunchedEffect(activeTab) {
        loadFeed()
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = ClearFeedColors.Background,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ClearFeedColors.Background)
                    .statusBarsPadding()
            ) {
                // Top Action Bar matching Screenshot 1
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Current User Profile Avatar on top left
                    ClearFeedAvatar(
                        name = currentUser?.name ?: "Nasir",
                        avatarUrl = currentUser?.avatarUrl,
                        size = 36.dp
                    )

                    // Logo & App Name with Pulse Ring
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .border(2.dp, ClearFeedColors.AccentCyan, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(ClearFeedColors.AccentCyan)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Clearfeed",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black
                        )
                    }

                    // Top Action Icons: Search, Notifications, Bookmarks, Mesh Pill
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp).clickable { }
                        )
                        Icon(
                            imageVector = Icons.Default.NotificationsNone,
                            contentDescription = "Notifications",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp).clickable { }
                        )
                        Icon(
                            imageVector = Icons.Default.BookmarkBorder,
                            contentDescription = "Bookmarks",
                            tint = Color.White,
                            modifier = Modifier.size(22.dp).clickable { }
                        )
                        // Green Mesh Chat Pill
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0D2818))
                                .border(1.dp, Color(0xFF00BA7C), RoundedCornerShape(8.dp))
                                .clickable { onNavigateToMesh() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Bluetooth,
                                contentDescription = "BeeChat Mesh",
                                tint = Color(0xFF00BA7C),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }

                // Feed Sub-tabs: [All Feed] [Following]
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // All Feed Button
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (activeTab == "all") ClearFeedColors.AccentCyan else ClearFeedColors.SurfaceVariant
                            )
                            .clickable { activeTab = "all" }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "All Feed",
                            color = if (activeTab == "all") Color.Black else ClearFeedColors.TextSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }

                    // Following Button
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (activeTab == "following") ClearFeedColors.AccentCyan else ClearFeedColors.SurfaceVariant
                            )
                            .clickable { activeTab = "following" }
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "Following",
                            color = if (activeTab == "following") Color.Black else ClearFeedColors.TextSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }

                Divider(
                    color = ClearFeedColors.Border.copy(alpha = 0.5f),
                    thickness = 0.8.dp
                )
            }
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showComposeDialog = true },
                containerColor = ClearFeedColors.AccentCyan,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier
                    .size(56.dp)
                    .offset(y = (-10).dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Create,
                    contentDescription = "Compose Post",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                isLoading && posts.isEmpty() -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = ClearFeedColors.AccentCyan
                    )
                }
                errorMessage != null && posts.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Connection Notice",
                            color = ClearFeedColors.TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = errorMessage ?: "Failed to reach server.",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        Button(
                            onClick = { loadFeed() },
                            colors = ButtonDefaults.buttonColors(containerColor = ClearFeedColors.AccentCyan)
                        ) {
                            Text("Retry", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                posts.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "No posts found yet",
                            color = ClearFeedColors.TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Be the first to share your text or code snippet!",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 13.sp
                        )
                    }
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(posts, key = { it.id }) { post ->
                            PostCard(
                                post = post,
                                onLikeClick = { id ->
                                    scope.launch { apiClient.toggleLike(id) }
                                },
                                onBookmarkClick = { id ->
                                    scope.launch { apiClient.toggleBookmark(id) }
                                },
                                onCommentClick = { _ ->
                                    selectedPostForComments = post
                                }
                            )
                        }
                    }
                }
            }
        }

        selectedPostForComments?.let { activePost ->
            CommentsBottomSheet(
                post = activePost,
                onDismiss = { selectedPostForComments = null },
                onCommentCountChanged = { newCount ->
                    posts = posts.map { if (it.id == activePost.id) it.copy(commentsCount = newCount) else it }
                    selectedPostForComments = activePost.copy(commentsCount = newCount)
                }
            )
        }

        if (showComposeDialog) {
            ComposePostDialog(
                onDismiss = { showComposeDialog = false },
                onSubmit = { text, code, language ->
                    scope.launch {
                        val res = apiClient.createPost(text, code, language)
                        showComposeDialog = false
                        res.onSuccess { newPost ->
                            Toast.makeText(context, "Post published!", Toast.LENGTH_SHORT).show()
                            if (newPost.id.isNotBlank()) {
                                posts = listOf(newPost) + posts.filter { it.id != newPost.id }
                            }
                            loadFeed()
                        }.onFailure { err ->
                            Toast.makeText(context, "Post error: ${err.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            )
        }
    }
}
