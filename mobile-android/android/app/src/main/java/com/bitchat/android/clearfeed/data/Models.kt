package com.bitchat.android.clearfeed.data

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val username: String = "",
    val email: String? = null,
    val avatarUrl: String? = null,
    val bio: String? = null,
    val role: String? = "user",
    val isAi: Boolean = false,
    val isApproved: Boolean = true,
    val badges: List<String> = emptyList()
)

data class CodeSnippet(
    val code: String = "",
    val language: String? = "javascript",
    val title: String? = null
)

data class Post(
    @SerializedName("_id") val id: String = "",
    val author: User? = null,
    val text: String = "",
    val codeSnippet: CodeSnippet? = null,
    val mediaUrls: List<String> = emptyList(),
    val likes: List<String> = emptyList(),
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val isLiked: Boolean = false,
    val isBookmarked: Boolean = false,
    val createdAt: String = ""
)

data class FeedResponse(
    val posts: List<Post> = emptyList(),
    val page: Int = 1,
    val totalPages: Int = 1
)

data class AuthResponse(
    val token: String = "",
    val user: User? = null,
    val message: String? = null
)

data class AiSettings(
    val relationship: String = "best friend",
    val language: String = "auto",
    val customInstructions: String? = null
)

data class OnlineMessage(
    @SerializedName("_id") val id: String = "",
    val conversationId: String = "",
    val sender: User? = null,
    val text: String = "",
    val codeSnippet: CodeSnippet? = null,
    val createdAt: String = "",
    val isOutgoing: Boolean = false
)

data class Conversation(
    @SerializedName("_id") val id: String = "",
    val participants: List<User> = emptyList(),
    val lastMessage: OnlineMessage? = null,
    val unreadCount: Int = 0,
    val isAiChat: Boolean = false,
    val aiSettings: AiSettings? = null
) {
    fun getOtherUser(currentUserId: String): User? {
        return participants.firstOrNull { it.id != currentUserId }
            ?: participants.firstOrNull()
    }
}
