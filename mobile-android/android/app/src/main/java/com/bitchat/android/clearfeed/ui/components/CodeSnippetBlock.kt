package com.bitchat.android.clearfeed.ui.components

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bitchat.android.clearfeed.data.CodeSnippet
import com.bitchat.android.clearfeed.ui.theme.ClearFeedColors

@Composable
fun CodeSnippetBlock(
    snippet: CodeSnippet,
    modifier: Modifier = Modifier
) {
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current
    val hScrollState = rememberScrollState()

    var isExpanded by remember { mutableStateOf(false) }

    val rawCode = snippet.displayCode.trimEnd()
    val allLines = remember(rawCode) { rawCode.split("\n") }
    val totalLines = allLines.size
    val previewLineLimit = 3
    val hasMore = totalLines > previewLineLimit
    val visibleLines = if (hasMore && !isExpanded) allLines.take(previewLineLimit) else allLines
    val hiddenCount = totalLines - previewLineLimit

    val lang = snippet.displayLanguage.lowercase()
    val dotColor = when (lang) {
        "html", "htm" -> Color(0xFFFF5722)
        "css" -> Color(0xFF2196F3)
        "js", "javascript" -> Color(0xFFFFD600)
        "ts", "typescript" -> Color(0xFF3178C6)
        "py", "python" -> Color(0xFF4CAF50)
        else -> ClearFeedColors.AccentCyan
    }

    val filesCount = snippet.displayFilesCount
    val fileLabel = if (filesCount > 1) "$filesCount files" else "1 file"

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF0D1117))
            .border(1.dp, Color(0xFF30363D), RoundedCornerShape(12.dp))
    ) {
        // Top Toolbar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF161B22))
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(dotColor)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = snippet.title ?: "code snippet",
                    color = Color(0xFFE6EDF3),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.width(10.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0xFF21262D))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = "$totalLines lines • $fileLabel",
                        color = Color(0xFF8B949E),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            IconButton(
                onClick = {
                    clipboardManager.setText(AnnotatedString(snippet.displayCode))
                    Toast.makeText(context, "Code copied", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.size(24.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ContentCopy,
                    contentDescription = "Copy code",
                    tint = Color(0xFF8B949E),
                    modifier = Modifier.size(14.dp)
                )
            }
        }

        // Code Body with Line Numbers
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(hScrollState)
                .padding(horizontal = 12.dp, vertical = 10.dp)
        ) {
            // Line numbers column
            Column(
                modifier = Modifier.padding(end = 12.dp),
                horizontalAlignment = Alignment.End
            ) {
                visibleLines.indices.forEach { index ->
                    Text(
                        text = "${index + 1}",
                        color = Color(0xFF484F58),
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 20.sp
                    )
                }
            }

            // Code content column
            Column {
                visibleLines.forEach { line ->
                    Text(
                        text = highlightSyntax(line, lang),
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 20.sp
                    )
                }
            }
        }

        // Expand/Collapse Button
        if (hasMore) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF161B22))
                    .clickable { isExpanded = !isExpanded }
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = ClearFeedColors.AccentCyan,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (isExpanded) "</> Collapse code" else "</> Show $hiddenCount more lines",
                        color = ClearFeedColors.AccentCyan,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}

private fun highlightSyntax(line: String, lang: String): AnnotatedString {
    return buildAnnotatedString {
        val words = line.split(Regex("(?<=[\\s(),;{}<>=])|(?=[\\s(),;{}<>=])"))
        for (w in words) {
            val color = when {
                w in listOf("function", "var", "let", "const", "return", "if", "else", "import", "from", "export", "class", "def") ->
                    Color(0xFFFF7B72)
                w in listOf("<!doctype", "html", "head", "body", "div", "span", "p", "h1", "h2", "script", "style") ->
                    Color(0xFF7EE787)
                w.startsWith("\"") || w.startsWith("'") || w.endsWith("\"") || w.endsWith("'") ->
                    Color(0xFFA5D6FF)
                w.matches(Regex("\\d+")) ->
                    Color(0xFF79C0FF)
                w.startsWith("//") || w.startsWith("/*") ->
                    Color(0xFF8B949E)
                else -> Color(0xFFC9D1D9)
            }
            append(AnnotatedString(w, spanStyle = SpanStyle(color = color)))
        }
    }
}
