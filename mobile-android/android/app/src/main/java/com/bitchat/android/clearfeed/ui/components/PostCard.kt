package com.bitchat.android.clearfeed.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
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
    modifier: Modifier = Modifier
) {
    var isLiked by remember(post.id) { mutableStateOf(post.isLiked) }
    var likesCount by remember(post.id) { mutableStateOf(post.likesCount) }
    var isBookmarked by remember(post.id) { mutableStateOf(post.isBookmarked) }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(ClearFeedColors.Surface)
            .border(1.dp, ClearFeedColors.Border, RoundedCornerShape(14.dp))
            .padding(14.dp)
    ) {
        // Author Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val authorName = post.author?.name ?: "ClearFeed User"
            val username = post.author?.username ?: "user"
            val initial = authorName.firstOrNull()?.uppercase() ?: "C"

            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(ClearFeedColors.PrimaryEmerald),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = initial,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column {
                Text(
                    text = authorName,
                    color = ClearFeedColors.TextPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "@$username",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 12.sp
                )
            }
        }

        // Post Text
        if (post.text.isNotBlank()) {
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = post.text,
                color = ClearFeedColors.TextPrimary,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
        }

        // Optional Code Snippet Block
        post.codeSnippet?.let { snippet ->
            if (snippet.code.isNotBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                CodeSnippetBlock(snippet = snippet)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Actions Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Like
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = {
                        isLiked = !isLiked
                        likesCount += if (isLiked) 1 else -1
                        onLikeClick(post.id)
                    },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = if (isLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Like",
                        tint = if (isLiked) Color(0xFFF91880) else ClearFeedColors.TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Text(
                    text = "$likesCount",
                    color = if (isLiked) Color(0xFFF91880) else ClearFeedColors.TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Comment
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ChatBubbleOutline,
                        contentDescription = "Comments",
                        tint = ClearFeedColors.TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Text(
                    text = "${post.commentsCount}",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Bookmark
            IconButton(
                onClick = {
                    isBookmarked = !isBookmarked
                    onBookmarkClick(post.id)
                },
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                    contentDescription = "Bookmark",
                    tint = if (isBookmarked) ClearFeedColors.AccentCyan else ClearFeedColors.TextSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }

            // Share
            IconButton(
                onClick = { },
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = "Share",
                    tint = ClearFeedColors.TextSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
