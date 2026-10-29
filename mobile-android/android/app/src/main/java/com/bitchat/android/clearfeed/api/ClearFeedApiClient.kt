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
        .addInterceptor { chain ->
            val requestBuilder = chain.request().newBuilder()
            sessionManager.getToken()?.let { token ->
                requestBuilder.addHeader("Authorization", "Bearer $token")
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

    private fun baseUrl(): String = sessionManager.getServerUrl()

    // ==========================================
    // 1. AUTHENTICATION
    // ==========================================
    suspend fun login(login: String, pass: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val bodyObj = mapOf("login" to login, "password" to pass)
            val reqBody = gson.toJson(bodyObj).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url("${baseUrl()}/api/auth/login")
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
                .url("${baseUrl()}/api/auth/register")
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
                .url("${baseUrl()}/api/auth/guest")
                .post("{}".toRequestBody(jsonMediaType))
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Guest login failed (${response.code})"))
            }

            val authResp = gson.fromJson(respString, AuthResponse::class.java)
            if (authResp.token.isNotBlank() && authResp.user != null) {
                sessionManager.saveSession(authResp.token, authResp.user)
            }
            Result.success(authResp)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ==========================================
    // 2. POSTS & FEED
    // ==========================================
    suspend fun getFeed(page: Int = 1): Result<List<Post>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("${baseUrl()}/api/posts/feed?page=$page&limit=20")
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Feed fetch error (${response.code})"))
            }

            // Could be array or { posts: [...] }
            val listType = object : TypeToken<List<Post>>() {}.type
            try {
                val posts = gson.fromJson<List<Post>>(respString, listType)
                return@withContext Result.success(posts)
            } catch (e: Exception) {
                val feedResp = gson.fromJson(respString, FeedResponse::class.java)
                return@withContext Result.success(feedResp.posts)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Feed fetch failed", e)
            Result.failure(e)
        }
    }

    suspend fun createPost(text: String, code: String? = null, language: String? = null): Result<Post> = withContext(Dispatchers.IO) {
        try {
            val payload = mutableMapOf<String, Any>("text" to text)
            if (!code.isNullOrBlank()) {
                payload["codeSnippet"] = mapOf(
                    "code" to code,
                    "language" to (language ?: "javascript")
                )
            }

            val reqBody = gson.toJson(payload).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url("${baseUrl()}/api/posts")
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Create post failed: ${response.code}"))
            }

            val post = gson.fromJson(respString, Post::class.java)
            Result.success(post)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun toggleLike(postId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("${baseUrl()}/api/posts/$postId/like")
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
                .url("${baseUrl()}/api/posts/$postId/bookmark")
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
                .url("${baseUrl()}/api/messages/conversations")
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Conversations error: ${response.code}"))
            }

            val listType = object : TypeToken<List<Conversation>>() {}.type
            val convs = gson.fromJson<List<Conversation>>(respString, listType)
            Result.success(convs)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMessages(conversationId: String): Result<List<OnlineMessage>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("${baseUrl()}/api/messages/conversations/$conversationId")
                .get()
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Messages error: ${response.code}"))
            }

            val listType = object : TypeToken<List<OnlineMessage>>() {}.type
            val msgs = gson.fromJson<List<OnlineMessage>>(respString, listType)
            Result.success(msgs)
        } catch (e: Exception) {
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
                .url("${baseUrl()}/api/messages/send")
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Send message failed: ${response.code}"))
            }

            val msg = gson.fromJson(respString, OnlineMessage::class.java)
            Result.success(msg)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Start or open official Gemini AI Companion conversation (@ai)
     */
    suspend fun startAiConversation(): Result<Conversation> = withContext(Dispatchers.IO) {
        try {
            // Check if AI conversation already exists in conversations list
            val existing = getConversations().getOrNull()?.find { it.isAiChat || it.participants.any { u -> u.isAi || u.username == "ai" } }
            if (existing != null) {
                return@withContext Result.success(existing)
            }

            // Create new conversation with AI user
            val body = mapOf("recipientUsername" to "ai")
            val reqBody = gson.toJson(body).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url("${baseUrl()}/api/messages/conversations")
                .post(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            val respString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(IOException("Start AI chat failed: ${response.code}"))
            }

            val conv = gson.fromJson(respString, Conversation::class.java)
            Result.success(conv)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update Google Gemini Persona (Best friend, Coding mentor, English partner, Girlfriend/Boyfriend, etc.)
     */
    suspend fun updateAiSettings(conversationId: String, aiSettings: AiSettings): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val reqBody = gson.toJson(aiSettings).toRequestBody(jsonMediaType)
            val request = Request.Builder()
                .url("${baseUrl()}/api/messages/conversations/$conversationId/ai-settings")
                .put(reqBody)
                .build()

            val response = okHttpClient.newCall(request).execute()
            Result.success(response.isSuccessful)
        } catch (e: Exception) {
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
