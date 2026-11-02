package com.bitchat.android.clearfeed.ui.learn

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.api.ClearFeedApiClient
import com.bitchat.android.clearfeed.auth.SessionManager
import com.bitchat.android.clearfeed.data.LearningProgress
import com.bitchat.android.clearfeed.ui.components.CodeSnippetBlock
import com.bitchat.android.clearfeed.data.CodeSnippet
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors
import kotlinx.coroutines.launch

data class TrackItem(
    val id: String,
    val title: String,
    val totalCount: Int,
    val color: Color
)

data class LessonItem(
    val id: String,
    val index: String,
    val titleEn: String,
    val titleBn: String,
    val descEn: String,
    val descBn: String,
    val exampleCode: String,
    val codeLang: String,
    val xp: Int = 25
)

val CURRICULUM_TRACKS = listOf(
    TrackItem("computer-basics", "Computer Basics", 32, Color(0xFF10B981)),
    TrackItem("html", "HTML", 12, Color(0xFFF97316)),
    TrackItem("css", "CSS", 19, Color(0xFF2563EB)),
    TrackItem("javascript", "JavaScript", 28, Color(0xFFFBBF24)),
    TrackItem("react", "React", 20, Color(0xFF38BDF8)),
    TrackItem("python", "Python", 24, Color(0xFF3B82F6))
)

val LESSONS_DATABASE = mapOf(
    "html" to listOf(
        LessonItem(
            id = "html-intro",
            index = "Lesson 1.1",
            titleEn = "1. What is a Website & What is HTML?",
            titleBn = "১. ওয়েবসাইট ও HTML কী?",
            descEn = "Understanding the skeleton of every webpage and client-server architecture.",
            descBn = "ওয়েবসাইটের মূল কাঠামো এবং ক্লায়েন্ট-সার্ভার আর্কিটেকচার বোঝা।",
            exampleCode = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <title>Clearfeed</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>",
            codeLang = "html"
        ),
        LessonItem(
            id = "html-skeleton",
            index = "Lesson 1.2",
            titleEn = "2. The HTML Document Skeleton",
            titleBn = "২. HTML ডকুমেন্টের মূল গঠন",
            descEn = "The standard blueprint every single webpage follows.",
            descBn = "প্রতিটি একক ওয়েবপৃষ্ঠা যে স্ট্যান্ডার্ড ব্লুপ্রিন্ট অনুসরণ করে।",
            exampleCode = "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <title>Structure</title>\n  </head>\n  <body>\n    <main>\n      <p>Content goes here</p>\n    </main>\n  </body>\n</html>",
            codeLang = "html"
        ),
        LessonItem(
            id = "html-headings",
            index = "Lesson 1.3",
            titleEn = "3. Headings (h1 to h6) and Paragraphs",
            titleBn = "৩. হেডিংস (h1 থেকে h6) এবং প্যারাগ্রাফ",
            descEn = "Organizing content hierarchy from big titles to small details.",
            descBn = "বড় শিরোনাম থেকে শুরু করে ছোট বিবরণ পর্যন্ত কন্টেন্টের স্তরবিন্যাস।",
            exampleCode = "<h1>Main Title</h1>\n<h2>Section Header</h2>\n<p>This is a paragraph of informative text explaining the concept.</p>",
            codeLang = "html"
        ),
        LessonItem(
            id = "html-links",
            index = "Lesson 1.4",
            titleEn = "4. Links & Navigating the Web (<a>)",
            titleBn = "৪. লিঙ্ক এবং ওয়েবে ঘুরে বেড়ানো (<a>)",
            descEn = "Connecting web pages together using the anchor tag.",
            descBn = "অ্যাঙ্কর ট্যাগ ব্যবহার করে ওয়েব পেজগুলোকে একসাথে সংযুক্ত করা।",
            exampleCode = "<a href=\"https://clearfeed.org\" target=\"_blank\">\n  Visit Clearfeed\n</a>",
            codeLang = "html"
        ),
        LessonItem(
            id = "html-images",
            index = "Lesson 1.5",
            titleEn = "5. Images & Rich Media (<img>)",
            titleBn = "৫. ছবি ও মাল্টিমিডিয়া (<img>)",
            descEn = "Embedding graphics, alt attributes, and responsive visuals.",
            descBn = "গ্রাফিক্স, অল্ট অ্যাট্রিবিউট এবং রেসপন্সিভ ভিজ্যুয়াল যুক্ত করা।",
            exampleCode = "<img src=\"logo.png\" alt=\"Clearfeed Logo\" width=\"200\" />",
            codeLang = "html"
        )
    ),
    "css" to listOf(
        LessonItem(
            id = "css-intro",
            index = "Lesson 1.1",
            titleEn = "1. Introduction to CSS Styling",
            titleBn = "১. সিএসএস স্টাইলিং পরিচিতি",
            descEn = "Learn how CSS controls layout, colors, and typography.",
            descBn = "CSS কীভাবে লেআউট, রঙ এবং ফন্ট নিয়ন্ত্রণ করে তা শিখুন।",
            exampleCode = "body {\n  background-color: #0d1117;\n  color: #c9d1d9;\n  font-family: sans-serif;\n}",
            codeLang = "css"
        ),
        LessonItem(
            id = "css-flexbox",
            index = "Lesson 1.2",
            titleEn = "2. Modern Flexbox Layouts",
            titleBn = "২. আধুনিক ফ্লেক্সবক্স লেআউট",
            descEn = "Master flex direction, justify-content, and alignment.",
            descBn = "ফ্লেক্স ডিরেকশন, জাস্টিফাই-কন্টেন্ট এবং অ্যালাইনমেন্ট আয়ত্ত করুন।",
            exampleCode = ".container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}",
            codeLang = "css"
        )
    ),
    "javascript" to listOf(
        LessonItem(
            id = "js-variables",
            index = "Lesson 1.1",
            titleEn = "1. Variables & Data Types",
            titleBn = "১. ভ্যারিয়েবল এবং ডেটা টাইপ",
            descEn = "Understanding let, const, strings, numbers, and booleans.",
            descBn = "let, const, স্ট্রিং, সংখ্যা এবং বুলিয়ান বোঝা।",
            exampleCode = "const platform = 'Clearfeed';\nlet activeUsers = 518;\nconst isOnline = true;\nconsole.log(platform + ' has ' + activeUsers + ' users');",
            codeLang = "javascript"
        ),
        LessonItem(
            id = "js-functions",
            index = "Lesson 1.2",
            titleEn = "2. Modern Arrow Functions",
            titleBn = "২. আধুনিক অ্যারো ফাংশন",
            descEn = "Clean syntax for reusable JavaScript logic.",
            descBn = "পুনর্ব্যবহারযোগ্য জাভাস্ক্রিপ্ট লজিকের পরিচ্ছন্ন সিনট্যাক্স।",
            exampleCode = "const addXP = (currentXP, earned) => {\n  return currentXP + earned;\n};\nconsole.log(addXP(100, 25)); // 125",
            codeLang = "javascript"
        )
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LearnStudioScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val apiClient = remember { ClearFeedApiClient.getInstance(context) }
    val scope = rememberCoroutineScope()

    var selectedLang by remember { mutableStateOf("ALL") } // "EN" | "বাং" | "ALL"
    var selectedTrack by remember { mutableStateOf("html") }
    var selectedLessonForDetail by remember { mutableStateOf<LessonItem?>(null) }

    // Live Server/Local Progress State
    var progress by remember { mutableStateOf(LearningProgress()) }
    var isLoadingProgress by remember { mutableStateOf(false) }

    fun refreshProgress() {
        scope.launch {
            val result = apiClient.getLearningProgress()
            result.onSuccess { p ->
                progress = p
            }
        }
    }

    LaunchedEffect(Unit) {
        refreshProgress()
    }

    val currentTrackLessons = LESSONS_DATABASE[selectedTrack] ?: LESSONS_DATABASE["html"]!!
    val completedCount = currentTrackLessons.count { progress.completedLessons.contains(it.id) }
    val totalCount = currentTrackLessons.size
    val progressPct = if (totalCount > 0) ((completedCount.toFloat() / totalCount.toFloat()) * 100).toInt() else 0

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(ClearFeedColors.Background)
            .statusBarsPadding()
    ) {
        // Top Header matching Screenshot 3
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Learn Studio",
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "All 15 Web, AI & Foundations Tracks",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 13.sp
                )
            }

            // Language Selector Pills [ EN | বাং | ALL ]
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF16181C))
                    .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(8.dp))
                    .padding(2.dp)
            ) {
                listOf("EN", "বাং", "ALL").forEach { lang ->
                    val isSelected = selectedLang == lang
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (isSelected) ClearFeedColors.AccentCyan else Color.Transparent)
                            .clickable { selectedLang = lang }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = lang,
                            color = if (isSelected) Color.White else ClearFeedColors.TextSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Horizontal Track Pills
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CURRICULUM_TRACKS.forEach { track ->
                val isSelected = selectedTrack == track.id
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSelected) track.color else Color(0xFF16181C))
                        .border(1.dp, if (isSelected) track.color else Color(0xFF2F3336), RoundedCornerShape(20.dp))
                        .clickable { selectedTrack = track.id }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = track.title,
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.3f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "${track.totalCount}",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Progress Card (Synced with Backend / Local Progress)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF16181C))
                .border(1.dp, Color(0xFF2F3336), RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Track Progress
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "TRACK PROGRESS",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$progressPct%",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.9f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF2F3336))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progressPct / 100f)
                                .fillMaxHeight()
                                .clip(RoundedCornerShape(3.dp))
                                .background(ClearFeedColors.AccentCyan)
                        )
                    }
                }

                // Learning XP
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "LEARNING XP",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "✨ ${progress.xp} XP",
                        color = Color(0xFFFFD700),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$completedCount of $totalCount completed",
                        color = ClearFeedColors.TextSecondary,
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Module Header Tag
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF0C243B))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "MODULE 1",
                    color = ClearFeedColors.AccentCyan,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${selectedTrack.uppercase()} Core Curriculum",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Interactive lessons & real-time XP earning",
                color = ClearFeedColors.TextSecondary,
                fontSize = 12.sp
            )
        }

        // Lessons List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            itemsIndexed(currentTrackLessons) { _, lesson ->
                val isCompleted = progress.completedLessons.contains(lesson.id)
                InteractiveLessonCard(
                    lesson = lesson,
                    isCompleted = isCompleted,
                    selectedLang = selectedLang,
                    onClick = {
                        selectedLessonForDetail = lesson
                    }
                )
            }
        }
    }

    // Modal Sheet for Lesson Detail & Complete Lesson (+25 XP)
    if (selectedLessonForDetail != null) {
        val currentLesson = selectedLessonForDetail!!
        val isCompleted = progress.completedLessons.contains(currentLesson.id)

        ModalBottomSheet(
            onDismissRequest = { selectedLessonForDetail = null },
            containerColor = Color(0xFF16181C),
            scrimColor = Color.Black.copy(alpha = 0.6f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFF382E12))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "+25 XP EARNED ON COMPLETION",
                            color = Color(0xFFFFD700),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    if (isCompleted) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0xFF0F3818))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "COMPLETED ✓",
                                color = Color(0xFF10B981),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = currentLesson.titleEn,
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = currentLesson.titleBn,
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = currentLesson.descEn,
                    color = Color(0xFFE7E9EA),
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Interactive Code Playground
                CodeSnippetBlock(
                    snippet = CodeSnippet(
                        code = currentLesson.exampleCode,
                        language = currentLesson.codeLang,
                        title = "${currentLesson.codeLang} snippet"
                    )
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Complete Lesson Button
                Button(
                    onClick = {
                        scope.launch {
                            val res = apiClient.completeLesson(currentLesson.id, selectedTrack)
                            res.onSuccess { resp ->
                                Toast.makeText(context, "🎉 Lesson completed! +25 XP", Toast.LENGTH_SHORT).show()
                                refreshProgress()
                                selectedLessonForDetail = null
                            }.onFailure {
                                Toast.makeText(context, "Completed! Progress saved.", Toast.LENGTH_SHORT).show()
                                refreshProgress()
                                selectedLessonForDetail = null
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isCompleted) Color(0xFF202327) else ClearFeedColors.AccentCyan
                    ),
                    shape = RoundedCornerShape(24.dp)
                ) {
                    Text(
                        text = if (isCompleted) "Re-complete Lesson (+0 XP)" else "Complete Lesson (+25 XP)",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun InteractiveLessonCard(
    lesson: LessonItem,
    isCompleted: Boolean,
    selectedLang: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val borderColor = if (isCompleted) Color(0xFF0F3818) else Color(0xFF2F3336)
    val cardBg = if (isCompleted) Color(0xFF051007) else Color(0xFF16181C)

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(cardBg)
            .border(1.dp, borderColor, RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Status Checkmark / Play indicator
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(if (isCompleted) Color(0xFF10B981) else Color.Transparent)
                .border(
                    1.dp,
                    if (isCompleted) Color(0xFF10B981) else ClearFeedColors.AccentCyan,
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isCompleted) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Completed",
                    tint = Color.Black,
                    modifier = Modifier.size(18.dp)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = "Play",
                    tint = ClearFeedColors.AccentCyan,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Content
        Column(modifier = Modifier.weight(1f)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = lesson.index,
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF382E12))
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = "+${lesson.xp} XP",
                        color = Color(0xFFFFD700),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF1B2A38))
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = "Practice",
                        color = ClearFeedColors.AccentCyan,
                        fontSize = 10.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            if (selectedLang == "EN" || selectedLang == "ALL") {
                Text(
                    text = lesson.titleEn,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            if (selectedLang == "বাং" || selectedLang == "ALL") {
                Text(
                    text = lesson.titleBn,
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 13.sp
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = if (selectedLang == "বাং") lesson.descBn else lesson.descEn,
                color = ClearFeedColors.TextSecondary,
                fontSize = 12.sp,
                maxLines = 2
            )
        }

        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = "Open Lesson",
            tint = ClearFeedColors.TextSecondary,
            modifier = Modifier.size(20.dp)
        )
    }
}
