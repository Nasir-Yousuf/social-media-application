package com.bitchat.android.clearfeed.ui.components

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.outlined.ChatBubbleOutline
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.bitchat.android.clearfeed.api.ClearFeedApiClient
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.data.Comment
import com.bitchat.android.clearfeed.data.Post
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

@Composable
fun CommentsBottomSheet(
    post: Post,
    onDismiss: () -> Unit,
    onCommentCountChanged: (Int) -> Unit = {}
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val sessionManager = remember { SessionManager.getInstance(context) }
    val currentUser = sessionManager.getUser()
    val scope = rememberCoroutineScope()

    var comments by remember { mutableStateOf<List<Comment>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var newCommentText by remember { mutableStateOf("") }
    var isPosting by remember { mutableStateOf(false) }

    fun loadComments() {
        scope.launch {
            isLoading = true
            val res = apiClient.getComments(post.id)
            isLoading = false
            res.onSuccess { list ->
                comments = list
                onCommentCountChanged(list.size)
            }.onFailure { err ->
                Toast.makeText(context, "Could not load replies: ${err.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    LaunchedEffect(post.id) {
        loadComments()
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.88f)
                .padding(top = 40.dp)
                .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
            color = ClearFeedColors.Surface
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(ClearFeedColors.Surface)
            ) {
                // Top Header Handle + Title
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    Column(
                        modifier = Modifier.align(Alignment.Center),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .width(36.dp)
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(ClearFeedColors.Border)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Replies (${comments.size})",
                            color = ClearFeedColors.TextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.align(Alignment.CenterEnd)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = ClearFeedColors.TextSecondary
                        )
                    }
                }

                // Post Context Snippet
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                        .background(ClearFeedColors.SurfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        .padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ClearFeedAvatar(
                        name = post.author?.name,
                        avatarUrl = post.author?.avatarUrl,
                        size = 32.dp,
                        isAi = post.author?.isAi == true
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = post.author?.name ?: "ClearFeed User",
                            color = ClearFeedColors.TextPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        val preview = post.displayContent.ifBlank { "Code snippet / Post" }
                        Text(
                            text = preview.take(90) + if (preview.length > 90) "..." else "",
                            color = ClearFeedColors.TextSecondary,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                    }
                }

                Divider(
                    color = ClearFeedColors.Border.copy(alpha = 0.5f),
                    thickness = 0.8.dp
                )

                // Comments List
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    when {
                        isLoading && comments.isEmpty() -> {
                            CircularProgressIndicator(
                                modifier = Modifier.align(Alignment.Center),
                                color = ClearFeedColors.PrimaryEmerald
                            )
                        }
                        comments.isEmpty() -> {
                            Column(
                                modifier = Modifier
                                    .align(Alignment.Center)
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.ChatBubbleOutline,
                                    contentDescription = null,
                                    tint = ClearFeedColors.TextSecondary.copy(alpha = 0.6f),
                                    modifier = Modifier.size(48.dp)
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "No replies yet",
                                    color = ClearFeedColors.TextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Be the first to share your thoughts or answers!",
                                    color = ClearFeedColors.TextSecondary,
                                    fontSize = 13.sp
                                )
                            }
                        }
                        else -> {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                items(comments, key = { it.id.ifBlank { it.hashCode().toString() } }) { comment ->
                                    val isAuthor = comment.isOwner || (currentUser != null && comment.author?.id == currentUser.id)
                                    val isAdmin = currentUser?.role == "admin"
                                    val canDelete = isAuthor || isAdmin
                                    val authorName = comment.author?.name ?: "ClearFeed User"
                                    val authorUsername = comment.author?.username ?: "user"
                                    val isVerified = comment.author?.isApproved == true || comment.author?.role == "admin"

                                    Row(
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        ClearFeedAvatar(
                                            name = authorName,
                                            avatarUrl = comment.author?.avatarUrl,
                                            size = 36.dp,
                                            isAi = comment.author?.isAi == true
                                        )
                                        Spacer(modifier = Modifier.width(10.dp))
                                        Column(modifier = Modifier.weight(1f)) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                modifier = Modifier.fillMaxWidth()
                                            ) {
                                                Text(
                                                    text = authorName,
                                                    color = ClearFeedColors.TextPrimary,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 13.sp
                                                )
                                                if (isVerified) {
                                                    Spacer(modifier = Modifier.width(3.dp))
                                                    Icon(
                                                        imageVector = Icons.Default.CheckCircle,
                                                        contentDescription = "Verified",
                                                        tint = Color(0xFFFFD700),
                                                        modifier = Modifier.size(13.dp)
                                                    )
                                                }
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(
                                                    text = "@$authorUsername",
                                                    color = ClearFeedColors.TextSecondary,
                                                    fontSize = 12.sp
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    text = "• ${formatRelativeCommentTime(comment.createdAt)}",
                                                    color = ClearFeedColors.TextSecondary,
                                                    fontSize = 11.sp
                                                )

                                                Spacer(modifier = Modifier.weight(1f))

                                                if (canDelete) {
                                                    Icon(
                                                        imageVector = Icons.Default.Delete,
                                                        contentDescription = "Delete",
                                                        tint = ClearFeedColors.TextSecondary.copy(alpha = 0.7f),
                                                        modifier = Modifier
                                                            .size(16.dp)
                                                            .clickable {
                                                                scope.launch {
                                                                    val res = apiClient.deleteComment(comment.id)
                                                                    res.onSuccess { count ->
                                                                        comments = comments.filter { it.id != comment.id }
                                                                        onCommentCountChanged(count)
                                                                        Toast.makeText(context, "Reply deleted", Toast.LENGTH_SHORT).show()
                                                                    }.onFailure { err ->
                                                                        Toast.makeText(context, "Delete failed: ${err.message}", Toast.LENGTH_SHORT).show()
                                                                    }
                                                                }
                                                            }
                                                    )
                                                }
                                            }

                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = comment.content,
                                                color = ClearFeedColors.TextPrimary,
                                                fontSize = 13.sp,
                                                lineHeight = 18.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Divider(
                    color = ClearFeedColors.Border.copy(alpha = 0.5f),
                    thickness = 0.8.dp
                )

                // Input Bar at the Bottom
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ClearFeedAvatar(
                        name = currentUser?.name,
                        avatarUrl = currentUser?.avatarUrl,
                        size = 34.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedTextField(
                        value = newCommentText,
                        onValueChange = { newCommentText = it },
                        placeholder = {
                            Text(
                                text = "Write a thoughtful reply...",
                                color = ClearFeedColors.TextSecondary,
                                fontSize = 13.sp
                            )
                        },
                        modifier = Modifier.weight(1f),
                        maxLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = ClearFeedColors.TextPrimary,
                            unfocusedTextColor = ClearFeedColors.TextPrimary,
                            focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                            unfocusedBorderColor = ClearFeedColors.Border,
                            focusedContainerColor = ClearFeedColors.SurfaceVariant.copy(alpha = 0.4f),
                            unfocusedContainerColor = ClearFeedColors.SurfaceVariant.copy(alpha = 0.4f)
                        ),
                        shape = RoundedCornerShape(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            if (newCommentText.isNotBlank() && !isPosting) {
                                isPosting = true
                                scope.launch {
                                    val res = apiClient.addComment(post.id, newCommentText.trim())
                                    isPosting = false
                                    res.onSuccess { pair ->
                                        val addedComment = pair.first
                                        val newCount = pair.second
                                        if (addedComment != null) {
                                            comments = comments + addedComment
                                        } else {
                                            loadComments()
                                        }
                                        newCommentText = ""
                                        onCommentCountChanged(newCount)
                                        Toast.makeText(context, "Reply posted!", Toast.LENGTH_SHORT).show()
                                    }.onFailure { err ->
                                        Toast.makeText(context, "Reply error: ${err.message}", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            }
                        },
                        enabled = newCommentText.isNotBlank() && !isPosting,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(
                                if (newCommentText.isNotBlank()) ClearFeedColors.PrimaryEmerald
                                else ClearFeedColors.SurfaceVariant
                            )
                    ) {
                        if (isPosting) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Send",
                                tint = if (newCommentText.isNotBlank()) Color.White else ClearFeedColors.TextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun formatRelativeCommentTime(isoString: String): String {
    if (isoString.isBlank()) return "just now"
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
        sdf.timeZone = TimeZone.getTimeZone("UTC")
        val cleanIso = if (isoString.contains(".")) isoString.substringBefore(".") else isoString.removeSuffix("Z")
        val date = sdf.parse(cleanIso) ?: return "just now"
        val diffMs = System.currentTimeMillis() - date.time
        val mins = diffMs / (1000 * 60)
        val hours = mins / 60
        val days = hours / 24
        when {
            days > 0 -> "${days}d ago"
            hours > 0 -> "${hours}h ago"
            mins > 0 -> "${mins}m ago"
            else -> "just now"
        }
    } catch (e: Exception) {
        "just now"
    }
}

