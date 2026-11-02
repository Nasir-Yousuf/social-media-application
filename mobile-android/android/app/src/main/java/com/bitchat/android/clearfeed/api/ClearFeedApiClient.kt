package com.bitchat.android.clearfeed.api

import android.content.Context
import android.util.Log
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.data.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

class ClearFeedApiClient private constructor(context: Context) {

    private val sessionManager = SessionManager.getInstance(context)
    private val gson = Gson()
    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .followRedirects(true)
        .followSslRedirects(true)
        .addInterceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
            sessionManager.getToken()?.let { token ->
                if (token.isNotBlank()) {
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }
            }
            requestBuilder.addHeader("Accept", "application/json")
            chain.proceed(requestBuilder.build())
        }
        .build()

    companion object {
        private const val TAG = "ClearFeedApi"

        @Volatile
        private var instance: ClearFeedApiClient? = null

        fun getInstance(context: Context): ClearFeedApiClient {
            return instance ?: synchronized(this) {
                instance ?: ClearFeedApiClient(context.applicationContext).also { instance = it }
            }
        }
    }

    /**
     * Constructs a safe absolute API URL without risking double /api prefix.
     */
    fun apiEndpoint(path: String): String {
        val raw = sessionManager.getServerUrl().trim().removeSuffix("/")
        val cleanBase = if (raw.endsWith("/api")) raw.removeSuffix("/api") else raw
        val cleanPath = if (path.startsWith("/")) path else "/$path"
        return "$cleanBase$cleanPath"
    }

    // ==========================================
    // 1. AUTHENTICATION
    // ==========================================
    suspend fun login(login: String, pass: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val bodyObj = mapOf("login" to login, "password" to pass)
            val reqBody = gson.toJson(bodyObj).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/auth/login"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val err = parseErrorMessage(respString, "Login failed (${response.code})")
                return@withContext Result.failure(IOException(err))
            }

            val authResp = gson.fromJson(respString, AuthResponse::class.java)
            if (authResp.token.isNotBlank() && authResp.user != null) {
                sessionManager.saveSession(authResp.token, authResp.user)
            }
            Result.success(authResp)
        } catch (e: Exception) {
            Log.e(TAG, "Login error", e)
            Result.failure(e)
        }
    }

    suspend fun register(name: String, username: String, email: String, pass: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val bodyObj = mapOf("name" to name, "username" to username, "email" to email, "password" to pass)
            val reqBody = gson.toJson(bodyObj).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/auth/register"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val err = parseErrorMessage(respString, "Registration failed (${response.code})")
                return@withContext Result.failure(IOException(err))
            }

            val authResp = gson.fromJson(respString, AuthResponse::class.java)
            if (authResp.token.isNotBlank() && authResp.user != null) {
                sessionManager.saveSession(authResp.token, authResp.user)
            }
            Result.success(authResp)
        } catch (e: Exception) {
            Log.e(TAG, "Registration error", e)
            Result.failure(e)
        }
    }

    suspend fun guestLogin(): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/auth/guest"))
                .post("{}".toRequestBody(jsonMediaType))
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (response.isSuccessful) {
                val authResp = gson.fromJson(respString, AuthResponse::class.java)
                if (authResp.token.isNotBlank() && authResp.user != null) {
                    sessionManager.saveSession(authResp.token, authResp.user)
                }
                return@withContext Result.success(authResp)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Guest login network unreachable, fallback to offline guest session: ${e.message}")
        }

        // Offline fallback: create local guest session so user can access offline features (BeeChat, etc.)
        val offlineUser = User(
            id = "guest_${System.currentTimeMillis()}",
            name = "Guest User",
            username = "guest",
            role = "guest"
        )
        val offlineResp = AuthResponse(
            token = "offline_guest_token",
            user = offlineUser,
            message = "Offline Guest Mode"
        )
        sessionManager.saveSession(offlineResp.token, offlineUser)
        Result.success(offlineResp)
    }

    // ==========================================
    // 2. POSTS & FEED
    // ==========================================
    suspend fun getFeed(page: Int = 1, tab: String = "all"): Result<List<Post>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/posts/feed?page=$page&limit=20&tab=$tab"))
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Feed fetch error (${response.code})"))
            }

            val posts: List<Post> = try {
                val feedResp = gson.fromJson(respString, FeedResponse::class.java)
                if (feedResp?.posts != null) {
                    feedResp.posts
                } else {
                    val listType = object : TypeToken<List<Post>>() {}.type
                    gson.fromJson(respString, listType) ?: emptyList()
                }
            } catch (e: Exception) {
                val listType = object : TypeToken<List<Post>>() {}.type
                gson.fromJson(respString, listType) ?: emptyList()
            }

            Result.success(posts)
        } catch (e: Exception) {
            Log.e(TAG, "Feed fetch failed", e)
            Result.failure(e)
        }
    }

    suspend fun createPost(text: String, code: String? = null, language: String? = null): Result<Post> = withContext(Dispatchers.IO) {
        try {
            val cleanLang = (language ?: "javascript").lowercase().trim()
            val payload = mutableMapOf<String, Any>(
                "content" to text,
                "text" to text,
                "visibility" to "public",
                "replyPolicy" to "everyone"
            )

            if (!code.isNullOrBlank()) {
                val ext = when (cleanLang) {
                    "python", "py" -> "py"
                    "kotlin", "kt" -> "kt"
                    "cpp", "c++" -> "cpp"
                    "java" -> "java"
                    "sql" -> "sql"
                    "html", "htm" -> "html"
                    "css" -> "css"
                    else -> "js"
                }
                payload["codeSnippet"] = mapOf(
                    "title" to (if (text.isNotBlank()) text.take(60) else "code snippet"),
                    "language" to cleanLang,
                    "code" to code,
                    "files" to listOf(
                        mapOf(
                            "name" to "snippet.$ext",
                            "language" to cleanLang,
                            "code" to code
                        )
                    )
                )
            }

            val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/posts"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val err = parseErrorMessage(respString, "Create post failed (${response.code})")
                return@withContext Result.failure(IOException(err))
            }

            val post: Post = try {
                val wrapper = gson.fromJson(respString, CreatePostResponse::class.java)
                wrapper.post ?: gson.fromJson(respString, Post::class.java)
            } catch (e: Exception) {
                gson.fromJson(respString, Post::class.java)
            }

            Result.success(post)
        } catch (e: Exception) {
            Log.e(TAG, "Create post exception", e)
            Result.failure(e)
        }
    }

    suspend fun toggleLike(postId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/posts/$postId/like"))
                .post("{}".toRequestBody(jsonMediaType))
                .build()

            val response = okHttpClient.newCall(request).execute()
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleBookmark(postId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/posts/$postId/bookmark"))
                .post("{}".toRequestBody(jsonMediaType))
                .build()

            val response = okHttpClient.newCall(request).execute()
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==========================================
    // 3. ONLINE MESSAGING & GOOGLE GEMINI AI
    // ==========================================
    suspend fun getConversations(): Result<List<Conversation>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/messages/conversations"))
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Conversations error: ${response.code}"))
            }

            val convs: List<Conversation> = try {
                val resp = gson.fromJson(respString, ConversationsResponse::class.java)
                if (resp?.conversations != null) {
                    resp.conversations
                } else {
                    val listType = object : TypeToken<List<Conversation>>() {}.type
                    gson.fromJson(respString, listType) ?: emptyList()
                }
            } catch (e: Exception) {
                val listType = object : TypeToken<List<Conversation>>() {}.type
                gson.fromJson(respString, listType) ?: emptyList()
            }

            Result.success(convs)
        } catch (e: Exception) {
            Log.e(TAG, "getConversations error", e)
            Result.failure(e)
        }
    }

    suspend fun getMessages(conversationId: String): Result<List<OnlineMessage>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/messages/conversations/$conversationId"))
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Messages error: ${response.code}"))
            }

            val msgs: List<OnlineMessage> = try {
                val resp = gson.fromJson(respString, MessagesResponse::class.java)
                if (resp?.messages != null) {
                    resp.messages
                } else {
                    val listType = object : TypeToken<List<OnlineMessage>>() {}.type
                    gson.fromJson(respString, listType) ?: emptyList()
                }
            } catch (e: Exception) {
                val listType = object : TypeToken<List<OnlineMessage>>() {}.type
                gson.fromJson(respString, listType) ?: emptyList()
            }

            Result.success(msgs)
        } catch (e: Exception) {
            Log.e(TAG, "getMessages error", e)
            Result.failure(e)
        }
    }

    suspend fun sendMessage(conversationId: String, text: String, code: String? = null, language: String? = null): Result<OnlineMessage> = withContext(Dispatchers.IO) {
        try {
            val payload = mutableMapOf<String, Any>(
                "conversationId" to conversationId,
                "text" to text
            )
            if (!code.isNullOrBlank()) {
                payload["codeSnippet"] = mapOf("code" to code, "language" to (language ?: "javascript"))
            }

            val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/messages/send"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Send message failed: ${response.code}"))
            }

            val msg: OnlineMessage = try {
                val wrapper = gson.fromJson(respString, SendMessageResponse::class.java)
                wrapper.message ?: wrapper.data ?: gson.fromJson(respString, OnlineMessage::class.java)
            } catch (e: Exception) {
                gson.fromJson(respString, OnlineMessage::class.java)
            }

            Result.success(msg)
        } catch (e: Exception) {
            Log.e(TAG, "sendMessage error", e)
            Result.failure(e)
        }
    }

    /**
     * Start or open official Gemini AI Companion conversation (@ai)
     */
    suspend fun startAiConversation(): Result<Conversation> = withContext(Dispatchers.IO) {
        try {
            // Check if AI conversation already exists in conversations list
            val existing = getConversations().getOrNull()?.find {
                it.isAiChat || it.otherUser?.username == "ai" || it.otherUser?.isAi == true ||
                it.participants.any { u -> u.isAi || u.username == "ai" }
            }
            if (existing != null) {
                return@withContext Result.success(existing)
            }

            // Create new conversation with AI user
            val body = mapOf("recipientUsername" to "ai")
            val reqBody = gson.toJson(body).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/messages/conversations"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Start AI chat failed: ${response.code}"))
            }

            val conv: Conversation = try {
                val wrapper = gson.fromJson(respString, ConversationResponse::class.java)
                wrapper.conversation ?: gson.fromJson(respString, Conversation::class.java)
            } catch (e: Exception) {
                gson.fromJson(respString, Conversation::class.java)
            }

            Result.success(conv)
        } catch (e: Exception) {
            Log.e(TAG, "startAiConversation error", e)
            Result.failure(e)
        }
    }

    /**
     * Update Google Gemini Persona (Best friend, Coding mentor, English partner, etc.)
     */
    suspend fun updateAiSettings(conversationId: String, aiSettings: AiSettings): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(aiSettings).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/messages/conversations/$conversationId/ai-settings"))
                .put(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==========================================
    // 4. LEARNING & PROGRESS (EARN XP)
    // ==========================================
    suspend fun getLearningProgress(): Result<LearningProgress> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/learning/progress"))
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Get progress failed: ${response.code}"))
            }

            val resp = gson.fromJson(respString, LearningProgressResponse::class.java)
            Result.success(resp.progress ?: LearningProgress())
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun completeLesson(lessonId: String, track: String): Result<LearningProgressResponse> = withContext(Dispatchers.IO) {
        try {
            val body = mapOf("lessonId" to lessonId, "track" to track)
            val reqBody = gson.toJson(body).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/learning/progress/complete"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Complete lesson failed: ${response.code}"))
            }

            val resp = gson.fromJson(respString, LearningProgressResponse::class.java)
            Result.success(resp)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==========================================
    // 5. COMMENTS
    // ==========================================
    suspend fun getComments(postId: String): Result<List<Comment>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/posts/$postId/comments"))
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Get comments error (${response.code})"))
            }

            val comments: List<Comment> = try {
                val resp = gson.fromJson(respString, CommentsResponse::class.java)
                resp?.comments ?: emptyList()
            } catch (e: Exception) {
                val listType = object : TypeToken<List<Comment>>() {}.type
                gson.fromJson(respString, listType) ?: emptyList()
            }

            Result.success(comments)
        } catch (e: Exception) {
            Log.e(TAG, "getComments error", e)
            Result.failure(e)
        }
    }

    suspend fun addComment(postId: String, content: String): Result<Pair<Comment?, Int>> = withContext(Dispatchers.IO) {
        try {
            val bodyObj = mapOf("content" to content.trim())
            val reqBody = gson.toJson(bodyObj).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url(apiEndpoint("/api/posts/$postId/comments"))
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val err = parseErrorMessage(respString, "Post comment failed (${response.code})")
                return@withContext Result.failure(IOException(err))
            }

            val resp = gson.fromJson(respString, CreateCommentResponse::class.java)
            Result.success(Pair(resp?.comment, resp?.commentsCount ?: 0))
        } catch (e: Exception) {
            Log.e(TAG, "addComment error", e)
            Result.failure(e)
        }
    }

    suspend fun deleteComment(commentId: String): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(apiEndpoint("/api/comments/$commentId"))
                .delete()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val err = parseErrorMessage(respString, "Delete comment failed (${response.code})")
                return@withContext Result.failure(IOException(err))
            }

            val resp = gson.fromJson(respString, DeleteCommentResponse::class.java)
            Result.success(resp?.commentsCount ?: 0)
        } catch (e: Exception) {
            Log.e(TAG, "deleteComment error", e)
            Result.failure(e)
        }
    }

    private fun parseErrorMessage(json: String, fallback: String): String {
        return try {
            val map = gson.fromJson(json, Map::class.java)
            (map["message"] ?: map["error"] ?: fallback).toString()
        } catch (e: Exception) {
            fallback
        }
    }
}
