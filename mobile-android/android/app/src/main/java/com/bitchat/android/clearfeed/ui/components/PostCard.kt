package com.bitchat.android.clearfeed.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.data.Post
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors

@Composable
fun PostCard(
    post: Post,
    onLikeClick: (String) -> Unit,
    onBookmarkClick: (String) -> Unit,
    onCommentClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var isLiked by remember(post.id) { mutableStateOf(post.isLiked) }
    var likesCount by remember(post.id) { mutableStateOf(post.likesCount) }
    var isBookmarked by remember(post.id) { mutableStateOf(post.isBookmarked) }

    val authorName = post.author?.name ?: "ClearFeed User"
    val username = post.author?.username ?: "user"
    val isVerified = post.author?.isApproved == true || post.author?.role == "admin"
    val isAi = post.author?.isAi == true

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ClearFeedColors.Background)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Author Avatar with Coil
            ClearFeedAvatar(
                name = authorName,
                avatarUrl = post.author?.avatarUrl,
                size = 44.dp,
                isAi = isAi
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                // Author row: Name + Verified badge + @username • time
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = authorName,
                        color = ClearFeedColors.TextPrimary,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    if (isVerified) {
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Verified",
                            tint = Color(0xFFFFD700), // Gold verified badge
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "@$username",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 14.sp,
                        maxLines = 1
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "• ${formatRelativeTime(post.createdAt)}",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 13.sp
                    )
                }

                // Post Content text
                val contentToDisplay = post.displayContent
                if (contentToDisplay.isNotBlank()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = contentToDisplay,
                        color = ClearFeedColors.TextPrimary,
                        fontSize = 15.sp,
                        lineHeight = 22.sp
                    )
                }

                // Code Snippet Block (if any)
                if (post.codeSnippet != null && post.codeSnippet.displayCode.isNotBlank()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    CodeSnippetBlock(snippet = post.codeSnippet)
                }

                // Post Action Bar (Reply, Repost, Like, Bookmark, Share)
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Reply / Comment
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable { onCommentClick(post.id) }
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ChatBubbleOutline,
                            contentDescription = "Comment",
                            tint = ClearFeedColors.TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                        if (post.commentsCount > 0) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${post.commentsCount}",
                                color = ClearFeedColors.TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }

                    // Repost
                    Icon(
                        imageVector = Icons.Default.Repeat,
                        contentDescription = "Repost",
                        tint = ClearFeedColors.TextSecondary,
                        modifier = Modifier
                            .size(18.dp)
                            .clickable { }
                    )

                    // Like
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable {
                            isLiked = !isLiked
                            likesCount = if (isLiked) likesCount + 1 else maxOf(0, likesCount - 1)
                            onLikeClick(post.id)
                        }
                    ) {
                        Icon(
                            imageVector = if (isLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Like",
                            tint = if (isLiked) Color(0xFFF91880) else ClearFeedColors.TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                        if (likesCount > 0) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "$likesCount",
                                color = if (isLiked) Color(0xFFF91880) else ClearFeedColors.TextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }

                    // Bookmark
                    Icon(
                        imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Bookmark",
                        tint = if (isBookmarked) ClearFeedColors.AccentCyan else ClearFeedColors.TextSecondary,
                        modifier = Modifier
                            .size(18.dp)
                            .clickable {
                                isBookmarked = !isBookmarked
                                onBookmarkClick(post.id)
                            }
                    )

                    // Share
                    Icon(
                        imageVector = Icons.Outlined.Share,
                        contentDescription = "Share",
                        tint = ClearFeedColors.TextSecondary,
                        modifier = Modifier
                            .size(18.dp)
                            .clickable { }
                    )
                }
            }
        }

        // Bottom separator line
        Divider(
            color = ClearFeedColors.Border.copy(alpha = 0.5f),
            thickness = 0.8.dp
        )
    }
}

private fun formatRelativeTime(isoString: String): String {
    if (isoString.isBlank()) return "1d"
    return try {
        val sdf = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US)
        sdf.timeZone = java.util.TimeZone.getTimeZone("UTC")
        val cleanIso = if (isoString.contains(".")) isoString.substringBefore(".") else isoString.removeSuffix("Z")
        val date = sdf.parse(cleanIso) ?: return "1d"
        val diffMs = System.currentTimeMillis() - date.time
        val mins = diffMs / (1000 * 60)
        val hours = mins / 60
        val days = hours / 24
        when {
            days > 0 -> "${days}d"
            hours > 0 -> "${hours}h"
            mins > 0 -> "${mins}m"
            else -> "now"
        }
    } catch (e: Exception) {
        "1d"
    }
}
