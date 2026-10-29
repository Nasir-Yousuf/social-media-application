package com.bitchat.android.clearfeed.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.bitchat.android.clearfeed.data.AiSettings
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors

data class PresetItem(val id: String, val label: String, val description: String)

val AI_PRESETS = listOf(
    PresetItem("best friend", "Best Friend 🤝", "Chill, supportive, talks about life and coding"),
    PresetItem("coding mentor", "Coding Mentor 💡", "Senior engineer who reviews code and debugs bugs"),
    PresetItem("english partner", "English Partner 🇬🇧", "Chats, practices vocabulary, and fixes mistakes"),
    PresetItem("girlfriend", "Girlfriend ❤️", "Affectionate, caring, sweet, and supportive"),
    PresetItem("boyfriend", "Boyfriend 💙", "Protective, warm, thoughtful, and playful"),
    PresetItem("study buddy", "Study Buddy 📚", "Focused study classmate keeping you motivated")
)

val AI_LANGUAGES = listOf(
    "auto" to "Auto Detect 🌐",
    "english" to "English 🇬🇧",
    "bangla" to "Bangla 🇧🇩"
)

@Composable
fun AiSettingsDialog(
    currentSettings: AiSettings?,
    onDismiss: () -> Unit,
    onSave: (AiSettings) -> Unit
) {
    var selectedPreset by remember { mutableStateOf(currentSettings?.relationship ?: "best friend") }
    var selectedLanguage by remember { mutableStateOf(currentSettings?.language ?: "auto") }
    var customInstructions by remember { mutableStateOf(currentSettings?.customInstructions ?: "") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight()
                .clip(RoundedCornerShape(18.dp)),
            color = ClearFeedColors.Surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Google Gemini AI Settings ✨",
                    color = ClearFeedColors.TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Customize your Clearfeed AI companion persona and language",
                    color = ClearFeedColors.TextSecondary,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                )

                // Presets Section
                Text(
                    text = "CHOOSE PERSONALITY",
                    color = ClearFeedColors.AccentCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                AI_PRESETS.forEach { preset ->
                    val isSelected = preset.id == selectedPreset
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) ClearFeedColors.SurfaceVariant else Color.Transparent)
                            .border(
                                1.dp,
                                if (isSelected) ClearFeedColors.PrimaryEmerald else ClearFeedColors.Border,
                                RoundedCornerShape(10.dp)
                            )
                            .clickable { selectedPreset = preset.id }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = isSelected,
                            onClick = { selectedPreset = preset.id },
                            colors = RadioButtonDefaults.colors(
                                selectedColor = ClearFeedColors.PrimaryEmerald
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = preset.label,
                                color = ClearFeedColors.TextPrimary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = preset.description,
                                color = ClearFeedColors.TextSecondary,
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Language Section
                Text(
                    text = "RESPONSE LANGUAGE",
                    color = ClearFeedColors.AccentCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    AI_LANGUAGES.forEach { (code, label) ->
                        val isLangSelected = code == selectedLanguage
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isLangSelected) ClearFeedColors.PrimaryEmerald else ClearFeedColors.SurfaceVariant)
                                .clickable { selectedLanguage = code }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                color = if (isLangSelected) Color.White else ClearFeedColors.TextSecondary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = ClearFeedColors.TextSecondary)
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            onSave(
                                AiSettings(
                                    relationship = selectedPreset,
                                    language = selectedLanguage,
                                    customInstructions = customInstructions.ifBlank { null }
                                )
                            )
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = ClearFeedColors.PrimaryEmerald
                        )
                    ) {
                        Text("Save & Apply", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
