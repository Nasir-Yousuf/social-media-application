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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors

val SUPPORTED_LANGUAGES = listOf("javascript", "python", "kotlin", "cpp", "java", "sql", "html", "css")

@Composable
fun ComposePostDialog(
    onDismiss: () -> Unit,
    onSubmit: (text: String, code: String?, language: String?) -> Unit
) {
    var text by remember { mutableStateOf("") }
    var showCodeInput by remember { mutableStateOf(false) }
    var codeText by remember { mutableStateOf("") }
    var selectedLanguage by remember { mutableStateOf("javascript") }
    var isSubmitting by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight()
                .clip(RoundedCornerShape(16.dp)),
            color = ClearFeedColors.Surface
        ) {
            Column(
                modifier = Modifier
                    .padding(18.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "New Post",
                    color = ClearFeedColors.TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    placeholder = { Text("What are you building or thinking?", color = ClearFeedColors.TextSecondary) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = ClearFeedColors.TextPrimary,
                        unfocusedTextColor = ClearFeedColors.TextPrimary,
                        focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                        unfocusedBorderColor = ClearFeedColors.Border
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Toggle Code Snippet
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { showCodeInput = !showCodeInput }
                        .padding(vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = showCodeInput,
                        onCheckedChange = { showCodeInput = it },
                        colors = CheckboxDefaults.colors(checkedColor = ClearFeedColors.PrimaryEmerald)
                    )
                    Text(
                        text = "Attach Code Snippet",
                        color = ClearFeedColors.AccentCyan,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (showCodeInput) {
                    Spacer(modifier = Modifier.height(8.dp))

                    // Language Selector
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        SUPPORTED_LANGUAGES.take(4).forEach { lang ->
                            val isSel = lang == selectedLanguage
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSel) ClearFeedColors.PrimaryEmerald else ClearFeedColors.SurfaceVariant)
                                    .clickable { selectedLanguage = lang }
                                    .padding(vertical = 4.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = lang.uppercase(),
                                    color = if (isSel) Color.White else ClearFeedColors.TextSecondary,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = codeText,
                        onValueChange = { codeText = it },
                        placeholder = { Text("// Paste your code here...", color = ClearFeedColors.TextSecondary) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(ClearFeedColors.CodeBg, RoundedCornerShape(8.dp)),
                        minLines = 5,
                        textStyle = LocalTextStyle.current.copy(
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            color = Color(0xFFC9D1D9)
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClearFeedColors.PrimaryEmerald,
                            unfocusedBorderColor = ClearFeedColors.Border
                        )
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

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
                            if (text.isNotBlank() || (showCodeInput && codeText.isNotBlank())) {
                                isSubmitting = true
                                onSubmit(
                                    text,
                                    if (showCodeInput && codeText.isNotBlank()) codeText else null,
                                    if (showCodeInput && codeText.isNotBlank()) selectedLanguage else null
                                )
                            }
                        },
                        enabled = !isSubmitting && (text.isNotBlank() || (showCodeInput && codeText.isNotBlank())),
                        colors = ButtonDefaults.buttonColors(containerColor = ClearFeedColors.PrimaryEmerald)
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                        } else {
                            Text("Post", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
