package com.bitchat.android.clearfeed.data

import com.google.gson.annotations.SerializedName

data class LearningProgress(
    val completedLessons: List<String> = emptyList(),
    val passedQuizzes: List<String> = emptyList(),
    val currentTrack: String = "html",
    val currentLessonId: String = "html-intro",
    val xp: Int = 0,
    val streak: Int = 1
)

data class LearningProgressResponse(
    val progress: LearningProgress? = null,
    val message: String? = null,
    val xpEarned: Int? = null
)

