package com.bitchat.android.clearfeed.auth

import android.content.Context
import android.content.SharedPreferences
import com.bitchat.android.clearfeed.data.User
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("clearfeed_session_prefs", Context.MODE_PRIVATE)
    private val gson = Gson()

    private val _currentUserFlow = MutableStateFlow<User?>(getUser())
    val currentUserFlow: StateFlow<User?> = _currentUserFlow.asStateFlow()

    private val _tokenFlow = MutableStateFlow<String?>(getToken())
    val tokenFlow: StateFlow<String?> = _tokenFlow.asStateFlow()

    companion object {
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_USER = "user_json"
        private const val KEY_SERVER_URL = "server_base_url"
        const val DEFAULT_SERVER_URL = "http://10.0.2.2:5000" // Standard Android emulator localhost

        @Volatile
        private var instance: SessionManager? = null

        fun getInstance(context: Context): SessionManager {
            return instance ?: synchronized(this) {
                instance ?: SessionManager(context.applicationContext).also { instance = it }
            }
        }
    }

    fun saveSession(token: String, user: User) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_USER, gson.toJson(user))
            .apply()
        _tokenFlow.value = token
        _currentUserFlow.value = user
    }

    fun clearSession() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USER)
            .apply()
        _tokenFlow.value = null
        _currentUserFlow.value = null
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUser(): User? {
        val json = prefs.getString(KEY_USER, null) ?: return null
        return try {
            gson.fromJson(json, User::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun isLoggedIn(): Boolean = !getToken().isNullOrBlank()

    fun getServerUrl(): String = prefs.getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL

    fun setServerUrl(url: String) {
        val cleanUrl = url.trim().removeSuffix("/")
        prefs.edit().putString(KEY_SERVER_URL, cleanUrl).apply()
    }
}
