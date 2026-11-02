package com.bitchat.android.clearfeed.data

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val username: String = "",
    val email: String? = null,
    val avatarUrl: String? = null,
    val bio: String? = null,
    val role: String? = "student",
    val status: String? = null,
    val isAi: Boolean = false,
    val isApproved: Boolean = true,
    val badges: List<String> = emptyList()
)

data class CodeFile(
    val name: String = "",
    val language: String = "javascript",
    val code: String = ""
)

data class CodeSnippet(
    val title: String? = null,
    val code: String = "",
    val language: String? = "javascript",
    val files: List<CodeFile> = emptyList()
) {
    val displayCode: String
        get() = when {
            code.isNotBlank() -> code
            files.isNotEmpty() -> files.first().code
            else -> ""
        }

    val displayLanguage: String
        get() = language?.ifBlank { null }
            ?: files.firstOrNull()?.language?.ifBlank { null }
            ?: "javascript"

    val displayFilesCount: Int
        get() = if (files.isNotEmpty()) files.size else 1
}

data class Post(
    @SerializedName("_id") val id: String = "",
    val author: User? = null,
    val content: String? = null,
    val text: String? = null,
    val codeSnippet: CodeSnippet? = null,
    val mediaUrls: List<String> = emptyList(),
    val likes: List<String> = emptyList(),
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val viewsCount: Int = 0,
    val isLiked: Boolean = false,
    val isBookmarked: Boolean = false,
    val isAnnouncement: Boolean = false,
    val isPinned: Boolean = false,
    val createdAt: String = ""
) {
    val displayContent: String
        get() = (content ?: text ?: "").trim()
}

data class PaginationInfo(
    val page: Int = 1,
    val limit: Int = 20,
    val totalPosts: Int = 0,
    val hasMore: Boolean = false
)

data class FeedResponse(
    val posts: List<Post> = emptyList(),
    val pagination: PaginationInfo? = null,
    val page: Int = 1,
    val totalPages: Int = 1
)

data class CreatePostResponse(
    val message: String? = null,
    val post: Post? = null
)

data class AuthResponse(
    val token: String = "",
    val user: User? = null,
    val message: String? = null
)

data class AiSettings(
    val customName: String? = "Clearfeed AI",
    val relationship: String = "best friend",
    val languagePref: String = "auto",
    val language: String = "auto",
    val customInstructions: String? = null
)

data class OnlineMessage(
    @SerializedName("_id") val id: String = "",
    @SerializedName("conversation") val conversationId: String = "",
    val sender: Any? = null,
    val recipient: Any? = null,
    val text: String? = null,
    val content: String? = null,
    val codeSnippet: CodeSnippet? = null,
    val createdAt: String = "",
    val isRead: Boolean = false
) {
    val displayText: String
        get() = (text ?: content ?: "").trim()

    fun getSenderId(): String {
        return when (sender) {
            is String -> sender
            is Map<*, *> -> (sender["_id"] ?: sender["id"] ?: "").toString()
            else -> ""
        }
    }

    fun isSentBy(userId: String): Boolean {
        if (userId.isBlank()) return false
        val sId = getSenderId()
        return sId == userId
    }
}

data class ConversationsResponse(
    val conversations: List<Conversation> = emptyList()
)

data class MessagesResponse(
    val conversation: Conversation? = null,
    val messages: List<OnlineMessage> = emptyList()
)

data class SendMessageResponse(
    val message: OnlineMessage? = null,
    val data: OnlineMessage? = null,
    val success: Boolean = true
)

data class ConversationResponse(
    val conversation: Conversation? = null
)

data class Conversation(
    @SerializedName("_id") val id: String = "",
    val otherUser: User? = null,
    val participants: List<User> = emptyList(),
    val lastMessage: OnlineMessage? = null,
    val unreadCount: Int = 0,
    val isAiChat: Boolean = false,
    val customAiSettings: AiSettings? = null
) {
    fun getOtherUser(currentUserId: String): User? {
        return otherUser
            ?: participants.firstOrNull { it.id != currentUserId }
            ?: participants.firstOrNull()
    }
}


data class Comment(
    @SerializedName("_id") val id: String = "",
    val post: String = "",
    val author: User? = null,
    val content: String = "",
    val createdAt: String = "",
    val isOwner: Boolean = false,
    val isAccepted: Boolean = false
)

data class CommentsResponse(
    val comments: List<Comment> = emptyList(),
    val commentsCount: Int = 0
)

data class CreateCommentResponse(
    val message: String? = null,
    val comment: Comment? = null,
    val commentsCount: Int = 0
)

data class DeleteCommentResponse(
    val message: String? = null,
    val commentsCount: Int = 0
)
