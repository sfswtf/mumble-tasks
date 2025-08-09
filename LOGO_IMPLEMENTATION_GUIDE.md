# Logo Implementation Guide

## Overview
The Mumble application has been updated to support custom logo branding in the header navigation.

## File Structure
Your logo files should be placed in the following directory:

```
public/
└── assets/
    └── images/
        ├── mumble-logo.png          # Static logo (required)
        └── mumble-logo-animated.gif # Animated logo (optional)
```

## Logo Requirements

### Static Logo (Required)
- **File name**: `mumble-logo.png` (or `.svg`, `.jpg`)
- **Recommended size**: Height should be optimized for 48-64px display
- **Format**: PNG with transparent background preferred
- **Aspect ratio**: Should maintain the original proportions of your design

### Animated Logo (Optional)
- **File name**: `mumble-logo-animated.gif`
- **Format**: GIF, WEBP, or MP4
- **Size**: Keep file size under 1MB for optimal loading
- **Animation**: Should be subtle and not distracting

## Implementation Features

### Interactive Animation
- **Static State**: Shows the static logo by default
- **Hover State**: Switches to animated logo when user hovers over it
- **Fallback**: If animated logo fails to load, falls back to static logo
- **Responsive**: Scales appropriately on mobile devices (h-12) and desktop (h-16)

### Accessibility
- **Alt Text**: Includes proper alt text for screen readers
- **Keyboard Navigation**: Logo is focusable and accessible via keyboard
- **Loading States**: Graceful handling of image loading errors

## How to Add Your Logos

1. **Create the directory structure** (if not already present):
   ```bash
   mkdir -p public/assets/images
   ```

2. **Add your logo files**:
   - Save your static logo as `public/assets/images/mumble-logo.png`
   - Save your animated logo as `public/assets/images/mumble-logo-animated.gif`

3. **Test the implementation**:
   ```bash
   npm run dev
   ```

4. **Verify functionality**:
   - Logo should display correctly
   - Hovering should trigger animation (if animated logo is present)
   - Clicking logo should navigate to home page
   - Logo should be responsive on different screen sizes

## Customization Options

If you need to modify the logo behavior, edit `src/components/Header.tsx`:

### Change Logo Sizes
```tsx
className="h-12 w-auto sm:h-16" // Modify these values
```

### Modify Animation Trigger
Currently set to hover, but can be changed to:
- Click
- Focus
- Time-based
- Scroll-based

### Add Loading States
You can add a loading placeholder while the logo loads.

## Troubleshooting

### Logo Not Displaying
1. Check file path: Ensure files are in `public/assets/images/`
2. Check file names: Must match exactly `mumble-logo.png` and `mumble-logo-animated.gif`
3. Check file permissions: Ensure files are readable
4. Clear browser cache: Force refresh with Ctrl+F5 (Cmd+Shift+R on Mac)

### Animation Not Working
1. Verify animated file exists and is valid
2. Check console for errors
3. Test with different browsers
4. Ensure file size is reasonable (<1MB recommended)

### Performance Issues
1. Optimize image file sizes
2. Use appropriate formats (WebP for static, optimized GIF for animated)
3. Consider lazy loading for large files

## Current Implementation Details

The logo replacement removes:
- Old FileAudio icon
- "Mumble Tasks" text title
- Subtitle text

And adds:
- Custom logo image
- Hover-based animation
- Error handling
- Responsive sizing
- Accessibility features 