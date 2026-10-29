//
// Theme.swift
// ClearFeed Mesh (adapted from bitchat)
//
// Unencumbered software released into the public domain.
//

import SwiftUI

/// A user-selectable app-wide visual theme. Persisted by raw value.
enum AppTheme: String, CaseIterable, Identifiable {
    case clearfeedDark = "clearfeedDark"
    case clearfeedEmerald = "clearfeedEmerald"
    case matrix = "matrix"
    case liquidGlass = "liquidGlass"

    var id: String { rawValue }

    /// UserDefaults key backing the theme selection.
    static let storageKey = "appTheme"

    var displayNameKey: LocalizedStringKey {
        switch self {
        case .clearfeedDark: return "ClearFeed Dark"
        case .clearfeedEmerald: return "CodeHub Emerald"
        case .matrix: return "app_info.appearance.matrix"
        case .liquidGlass: return "app_info.appearance.liquid_glass"
        }
    }

    /// Font design used for themed text. Matrix keeps the terminal monospace;
    /// Clearfeed and liquid glass use clean system default typography.
    var bodyFontDesign: Font.Design {
        switch self {
        case .clearfeedDark, .clearfeedEmerald: return .default
        case .matrix: return .monospaced
        case .liquidGlass: return .default
        }
    }

    /// Whether chrome surfaces render with rich elevated floating panels.
    var usesGlassChrome: Bool {
        switch self {
        case .clearfeedDark, .clearfeedEmerald, .liquidGlass: return true
        case .matrix: return false
        }
    }

    /// Discriminator mixed into per-message formatting caches.
    var formatCacheVariant: String {
        switch self {
        case .clearfeedDark: return "cfd:"
        case .clearfeedEmerald: return "cfe:"
        case .matrix: return ""
        case .liquidGlass: return "lg:"
        }
    }

    /// Resolves the semantic color palette for this theme under the given color scheme.
    func palette(for colorScheme: ColorScheme) -> ThemePalette {
        switch self {
        case .clearfeedDark:
            return .clearfeedDark(colorScheme)
        case .clearfeedEmerald:
            return .clearfeedEmerald(colorScheme)
        case .matrix:
            return .matrix(colorScheme)
        case .liquidGlass:
            return .liquidGlass(colorScheme)
        }
    }
}

/// Semantic colors for the active theme, resolved against the current color scheme.
/// Views consume these via `@ThemedPalette` rather than computing colors inline.
struct ThemePalette {
    /// Primary window/sheet background.
    let background: Color
    /// Primary text color.
    let primary: Color
    /// De-emphasized text (timestamps, hints, captions).
    let secondary: Color
    /// Interactive tint (buttons, toggles, selection).
    let accent: Color
    /// Location/geohash channel accent (badges, counts, subtitles).
    let locationAccent: Color
    /// Informational accent (links, read receipts, teleport markers).
    let accentBlue: Color
    /// Destructive/error accent.
    let alertRed: Color
    /// Hairline separators.
    let divider: Color

    /// Clearfeed Signature Dark (Pure OLED Black & Mint Emerald)
    static func clearfeedDark(_ colorScheme: ColorScheme) -> ThemePalette {
        let isDark = colorScheme == .dark
        let emerald = Color(red: 0.0, green: 0.729, blue: 0.486) // #00ba7c
        let cyan = Color(red: 0.0, green: 0.651, blue: 0.957)    // #00A6F4
        let bg = isDark ? Color.black : Color.white
        let textPrimary = isDark ? Color(red: 0.906, green: 0.914, blue: 0.918) : Color(red: 0.059, green: 0.078, blue: 0.098) // #e7e9ea
        let textSecondary = isDark ? Color(red: 0.443, green: 0.463, blue: 0.482) : Color(red: 0.325, green: 0.392, blue: 0.443) // #71767b
        let divider = isDark ? Color(red: 0.184, green: 0.200, blue: 0.212) : Color(red: 0.937, green: 0.953, blue: 0.957) // #2f3336

        return ThemePalette(
            background: bg,
            primary: textPrimary,
            secondary: textSecondary,
            accent: emerald,
            locationAccent: emerald,
            accentBlue: cyan,
            alertRed: Color(red: 0.957, green: 0.129, blue: 0.180), // #f4212e
            divider: divider
        )
    }

    /// Clearfeed CodeHub Obsidian & Neon Emerald
    static func clearfeedEmerald(_ colorScheme: ColorScheme) -> ThemePalette {
        let isDark = colorScheme == .dark
        let neonEmerald = Color(red: 0.063, green: 0.725, blue: 0.506) // #10b981
        let cyan = Color(red: 0.0, green: 0.651, blue: 0.957)
        let darkBg = Color(red: 0.031, green: 0.059, blue: 0.047) // #080f0c
        return ThemePalette(
            background: isDark ? darkBg : Color.white,
            primary: isDark ? Color(red: 0.925, green: 0.992, blue: 0.961) : Color(red: 0.059, green: 0.078, blue: 0.098),
            secondary: isDark ? Color(red: 0.431, green: 0.906, blue: 0.718) : Color(red: 0.325, green: 0.392, blue: 0.443),
            accent: neonEmerald,
            locationAccent: neonEmerald,
            accentBlue: cyan,
            alertRed: Color(red: 0.957, green: 0.129, blue: 0.180),
            divider: isDark ? Color(red: 0.106, green: 0.220, blue: 0.169) : Color(red: 0.937, green: 0.953, blue: 0.957)
        )
    }

    static func matrix(_ colorScheme: ColorScheme) -> ThemePalette {
        let isDark = colorScheme == .dark
        let green = isDark ? Color.green : Color(red: 0, green: 0.5, blue: 0)
        return ThemePalette(
            background: isDark ? Color.black : Color.white,
            primary: green,
            secondary: green.opacity(0.8),
            accent: green,
            locationAccent: green,
            accentBlue: Color(red: 0.0, green: 0.478, blue: 1.0),
            alertRed: Color(red: 0.75, green: 0.1, blue: 0.1),
            divider: isDark ? Color.white.opacity(0.12) : Color.black.opacity(0.08)
        )
    }

    static func liquidGlass(_: ColorScheme) -> ThemePalette {
        ThemePalette(
            background: systemBackground,
            primary: .primary,
            secondary: .secondary,
            accent: .blue,
            locationAccent: .green,
            accentBlue: .blue,
            alertRed: .red,
            divider: separator
        )
    }

    private static var systemBackground: Color {
        #if os(iOS)
        Color(UIColor.systemBackground)
        #else
        Color(NSColor.windowBackgroundColor)
        #endif
    }

    private static var separator: Color {
        #if os(iOS)
        Color(UIColor.separator)
        #else
        Color(NSColor.separatorColor)
        #endif
    }
}

private struct AppThemeKey: EnvironmentKey {
    static let defaultValue: AppTheme = .clearfeedDark
}

extension EnvironmentValues {
    var appTheme: AppTheme {
        get { self[AppThemeKey.self] }
        set { self[AppThemeKey.self] = newValue }
    }
}

/// Resolves the active theme's palette against the view's color scheme.
@propertyWrapper
struct ThemedPalette: DynamicProperty {
    @Environment(\.appTheme) private var theme
    @Environment(\.colorScheme) private var colorScheme

    var wrappedValue: ThemePalette { theme.palette(for: colorScheme) }
}

// MARK: - Themed view helpers

private struct ThemedFontModifier: ViewModifier {
    @Environment(\.appTheme) private var theme
    let size: CGFloat
    let weight: Font.Weight

    func body(content: Content) -> some View {
        content.font(.bitchatSystem(size: size, weight: weight, design: theme.bodyFontDesign))
    }
}

/// Root backdrop with ClearFeed deep OLED styling and ambient wireless glow.
struct ThemedRootBackground: View {
    @Environment(\.appTheme) private var theme
    @Environment(\.colorScheme) private var colorScheme
    @ThemedPalette private var palette

    var body: some View {
        if theme == .clearfeedDark || theme == .clearfeedEmerald {
            let isDark = colorScheme == .dark
            ZStack {
                (theme == .clearfeedDark
                    ? Color(red: 0.0, green: 0.0, blue: 0.0)
                    : Color(red: 0.031, green: 0.059, blue: 0.047)
                )
                .ignoresSafeArea()

                // Subtle mesh ambient aura
                RadialGradient(
                    colors: [palette.accent.opacity(isDark ? 0.09 : 0.04), .clear],
                    center: .topLeading,
                    startRadius: 0,
                    endRadius: 500
                )
                RadialGradient(
                    colors: [palette.accentBlue.opacity(isDark ? 0.07 : 0.03), .clear],
                    center: .bottomTrailing,
                    startRadius: 0,
                    endRadius: 600
                )
            }
            .ignoresSafeArea()
        } else if theme.usesGlassChrome {
            let isDark = colorScheme == .dark
            ZStack {
                LinearGradient(
                    colors: isDark
                        ? [Color(red: 0.09, green: 0.10, blue: 0.15), Color(red: 0.04, green: 0.04, blue: 0.07)]
                        : [Color(red: 0.93, green: 0.95, blue: 1.0), Color(red: 0.98, green: 0.97, blue: 0.99)],
                    startPoint: .top,
                    endPoint: .bottom
                )
                RadialGradient(
                    colors: [Color.blue.opacity(isDark ? 0.22 : 0.12), .clear],
                    center: .topLeading,
                    startRadius: 0,
                    endRadius: 600
                )
                RadialGradient(
                    colors: [Color.purple.opacity(isDark ? 0.14 : 0.08), .clear],
                    center: .bottomTrailing,
                    startRadius: 0,
                    endRadius: 500
                )
            }
            .ignoresSafeArea()
        } else {
            palette.background
                .ignoresSafeArea()
        }
    }
}

private struct GlassPanel<S: Shape>: ViewModifier {
    let shape: S

    @ViewBuilder
    func body(content: Content) -> some View {
        #if compiler(>=6.2)
        if #available(iOS 26.0, macOS 26.0, *) {
            content.glassEffect(.regular, in: shape)
        } else {
            materialFallback(content)
        }
        #else
        materialFallback(content)
        #endif
    }

    private func materialFallback(_ content: Content) -> some View {
        content
            .background(shape.fill(.ultraThinMaterial))
            .overlay(shape.stroke(Color.white.opacity(0.15), lineWidth: 0.5))
    }
}

private struct ThemedChromePanelModifier: ViewModifier {
    @Environment(\.appTheme) private var theme
    @Environment(\.colorScheme) private var colorScheme
    @ThemedPalette private var palette
    let edge: VerticalEdge

    @ViewBuilder
    func body(content: Content) -> some View {
        if theme == .clearfeedDark || theme == .clearfeedEmerald {
            let isDark = colorScheme == .dark
            let surface = isDark ? Color(red: 0.086, green: 0.094, blue: 0.110) : Color(red: 0.969, green: 0.976, blue: 0.980) // #16181c
            let border = isDark ? Color(red: 0.184, green: 0.200, blue: 0.212) : Color(red: 0.88, green: 0.90, blue: 0.92)
            content
                .background(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(surface.opacity(0.92))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(border.opacity(0.7), lineWidth: 0.8)
                        )
                )
                .padding(.horizontal, 8)
                .padding(edge == .top ? .top : .bottom, 4)
        } else if theme.usesGlassChrome {
            content
                .modifier(GlassPanel(shape: RoundedRectangle(cornerRadius: 18, style: .continuous)))
                .padding(.horizontal, 8)
                .padding(edge == .top ? .top : .bottom, 4)
        } else {
            content.background(palette.background.opacity(0.95))
        }
    }
}

private struct ThemedInputBackgroundModifier: ViewModifier {
    @Environment(\.appTheme) private var theme
    @Environment(\.colorScheme) private var colorScheme

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: 14, style: .continuous)
    }

    @ViewBuilder
    func body(content: Content) -> some View {
        if theme == .clearfeedDark || theme == .clearfeedEmerald {
            let isDark = colorScheme == .dark
            let inputBg = isDark ? Color(red: 0.125, green: 0.137, blue: 0.153) : Color(red: 0.93, green: 0.94, blue: 0.95) // #202327
            let border = isDark ? Color(red: 0.22, green: 0.24, blue: 0.26) : Color(red: 0.85, green: 0.86, blue: 0.88)
            content.background(
                shape.fill(inputBg)
                    .overlay(shape.stroke(border, lineWidth: 0.8))
            )
        } else if theme.usesGlassChrome {
            content
        } else {
            content.background(
                shape.fill(colorScheme == .dark ? Color.black.opacity(0.35) : Color.white.opacity(0.7))
            )
        }
    }
}

extension View {
    func bitchatFont(size: CGFloat, weight: Font.Weight = .regular) -> some View {
        modifier(ThemedFontModifier(size: size, weight: weight))
    }

    func themedChromePanel(edge: VerticalEdge) -> some View {
        modifier(ThemedChromePanelModifier(edge: edge))
    }

    func themedInputBackground() -> some View {
        modifier(ThemedInputBackgroundModifier())
    }

    func themedOverlayPanel() -> some View {
        modifier(ThemedOverlayPanelModifier())
    }

    func themedSheetBackground() -> some View {
        background(ThemedRootBackground())
    }

    func themedSurface(opacity: Double = 1.0) -> some View {
        modifier(ThemedSurfaceModifier(opacity: opacity))
    }
}

private struct ThemedSurfaceModifier: ViewModifier {
    @Environment(\.appTheme) private var theme
    @ThemedPalette private var palette
    let opacity: Double

    @ViewBuilder
    func body(content: Content) -> some View {
        if theme.usesGlassChrome {
            content
        } else {
            content.background(palette.background.opacity(opacity))
        }
    }
}

private struct ThemedOverlayPanelModifier: ViewModifier {
    @Environment(\.appTheme) private var theme
    @ThemedPalette private var palette

    @ViewBuilder
    func body(content: Content) -> some View {
        if theme.usesGlassChrome {
            content.modifier(GlassPanel(shape: RoundedRectangle(cornerRadius: 12, style: .continuous)))
        } else {
            content
                .background(palette.background)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(palette.secondary.opacity(0.3), lineWidth: 1)
                )
        }
    }
}
