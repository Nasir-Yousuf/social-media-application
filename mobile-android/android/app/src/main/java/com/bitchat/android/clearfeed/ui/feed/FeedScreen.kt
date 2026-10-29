package com.bitchat.android.clearfeed.ui.feed

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.api.ClearFeedApiClient
import com.bitchat.android.clearfeed.data.Post
import com.bitchat.android.clearfeed.ui.components.ComposePostDialog
import com.bitchat.android.clearfeed.ui.components.PostCard
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val scope = rememberCoroutineScope()

    var posts by remember { mutableStateOf<List<Post>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showComposeDialog by remember { mutableStateOf(false) }

    fun loadFeed() {
        isLoading = true
        errorMessage = null
        scope.launch {
            val result = apiClient.getFeed()
            result.onSuccess { fetched ->
                posts = fetched
                isLoading = false
            }.onFailure { err ->
                errorMessage = err.message ?: "Failed to load feed"
                isLoading = false
            }
        }
    }

    LaunchedEffect(Unit) {
        loadFeed()
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = ClearFeedColors.Background,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Clear",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "feed",
                            color = ClearFeedColors.PrimaryEmerald,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { loadFeed() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = ClearFeedColors.TextSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClearFeedColors.Surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showComposeDialog = true },
                containerColor = ClearFeedColors.PrimaryEmerald,
                contentColor = Color.White
            ) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Compose Post")
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
                        color = ClearFeedColors.PrimaryEmerald,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }

                errorMessage != null && posts.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = errorMessage ?: "",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { loadFeed() },
                            colors = ButtonDefaults.buttonColors(containerColor = ClearFeedColors.PrimaryEmerald)
                        ) {
                            Text("Retry")
                        }
                    }
                }

                posts.isEmpty() -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "No posts in your feed yet",
                            color = ClearFeedColors.TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        Text(
                            text = "Be the first to share code or write a post!",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(12.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(posts, key = { it.id }) { post ->
                            PostCard(
                                post = post,
                                onLikeClick = { postId ->
                                    scope.launch { apiClient.toggleLike(postId) }
                                },
                                onBookmarkClick = { postId ->
                                    scope.launch { apiClient.toggleBookmark(postId) }
                                }
                            )
                        }
                    }
                }
            }
        }

        if (showComposeDialog) {
            ComposePostDialog(
                onDismiss = { showComposeDialog = false },
                onSubmit = { text, code, language ->
                    scope.launch {
                        val result = apiClient.createPost(text, code, language)
                        result.onSuccess {
                            showComposeDialog = false
                            loadFeed()
                        }
                    }
                }
            )
        }
    }
}
