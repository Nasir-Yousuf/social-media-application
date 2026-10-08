using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public class CarTransparentExtractor
{
    public static void ProcessImage(string srcPath, string dstPath)
    {
        using (Bitmap src = new Bitmap(srcPath))
        using (Bitmap dst = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb))
        {
            int w = src.Width;
            int h = src.Height;

            Rectangle rect = new Rectangle(0, 0, w, h);
            BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
            BitmapData dstData = dst.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

            int bytes = Math.Abs(srcData.Stride) * h;
            byte[] pixelData = new byte[bytes];
            Marshal.Copy(srcData.Scan0, pixelData, 0, bytes);

            bool[] visited = new bool[w * h];
            int[] queue = new int[w * h];
            int qHead = 0;
            int qTail = 0;

            // Seed top edge, left/right edges, and bottom edge
            for (int x = 0; x < w; x++)
            {
                int topIdx = 0 * w + x;
                queue[qTail++] = topIdx;
                visited[topIdx] = true;

                int botIdx = (h - 1) * w + x;
                queue[qTail++] = botIdx;
                visited[botIdx] = true;
            }

            for (int y = 0; y < h; y++)
            {
                int leftIdx = y * w + 0;
                if (!visited[leftIdx]) { queue[qTail++] = leftIdx; visited[leftIdx] = true; }

                int rightIdx = y * w + (w - 1);
                if (!visited[rightIdx]) { queue[qTail++] = rightIdx; visited[rightIdx] = true; }
            }

            while (qHead < qTail)
            {
                int curr = queue[qHead++];
                int cx = curr % w;
                int cy = curr / w;

                int pIdx = curr * 4;
                byte b = pixelData[pIdx];
                byte g = pixelData[pIdx + 1];
                byte r = pixelData[pIdx + 2];

                int maxVal = Math.Max(r, Math.Max(g, b));
                int minVal = Math.Min(r, Math.Min(g, b));
                int diff = maxVal - minVal;

                bool isBackdrop = false;

                // Top & side area backdrop
                if (cy < h * 0.72)
                {
                    // Dark neutral studio
                    if (maxVal < 80 && diff < 30) isBackdrop = true;
                }
                else if (cy >= h * 0.72 && cy < h * 0.86)
                {
                    // Mid-low area outside car
                    if ((cx < w * 0.16 || cx > w * 0.84) && maxVal < 140 && diff < 30) isBackdrop = true;
                    else if (maxVal < 65 && diff < 20) isBackdrop = true;
                }
                else
                {
                    // Floor area underneath car: neutral grey concrete floor
                    if (maxVal < 155 && diff < 30) isBackdrop = true;
                }

                if (isBackdrop)
                {
                    // Set alpha = 0
                    pixelData[pIdx + 3] = 0;

                    // 4-neighbors
                    int nx, ny, nIdx;

                    // Left
                    if (cx > 0) { nx = cx - 1; ny = cy; nIdx = ny * w + nx; if (!visited[nIdx]) { visited[nIdx] = true; queue[qTail++] = nIdx; } }
                    // Right
                    if (cx < w - 1) { nx = cx + 1; ny = cy; nIdx = ny * w + nx; if (!visited[nIdx]) { visited[nIdx] = true; queue[qTail++] = nIdx; } }
                    // Up
                    if (cy > 0) { nx = cx; ny = cy - 1; nIdx = ny * w + nx; if (!visited[nIdx]) { visited[nIdx] = true; queue[qTail++] = nIdx; } }
                    // Down
                    if (cy < h - 1) { nx = cx; ny = cy + 1; nIdx = ny * w + nx; if (!visited[nIdx]) { visited[nIdx] = true; queue[qTail++] = nIdx; } }
                }
            }

            // Soft anti-alias boundary
            for (int y = 1; y < h - 1; y++)
            {
                for (int x = 1; x < w - 1; x++)
                {
                    int idx = (y * w + x) * 4;
                    if (pixelData[idx + 3] > 0)
                    {
                        int topA = pixelData[((y - 1) * w + x) * 4 + 3];
                        int botA = pixelData[((y + 1) * w + x) * 4 + 3];
                        int leftA = pixelData[(y * w + x - 1) * 4 + 3];
                        int rightA = pixelData[(y * w + x + 1) * 4 + 3];

                        if (topA == 0 || botA == 0 || leftA == 0 || rightA == 0)
                        {
                            pixelData[idx + 3] = (byte)(pixelData[idx + 3] * 0.75f);
                        }
                    }
                }
            }

            Marshal.Copy(pixelData, 0, dstData.Scan0, bytes);
            src.UnlockBits(srcData);
            dst.UnlockBits(dstData);

            dst.Save(dstPath, ImageFormat.Png);
            Console.WriteLine("Successfully created: " + dstPath);
        }
    }
}
