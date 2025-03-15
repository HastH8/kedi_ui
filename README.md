# KS UI System
A modern, iOS-inspired UI system for FiveM servers featuring notifications, progress bars, and text UI elements.

## 🌟 Features
- 📱 iOS-inspired design with smooth animations
- 🌓 Automatic dark/light mode support
- 🎨 Multiple notification types (success, error, warning, info)
- ⏳ Customizable progress bars with animations
- 💬 Interactive text UI elements
- 🎮 Full game time integration
- ⌨️ Extensive key binding support
- 🎭 Animation support for progress actions

## 📚 Documentation

### Notifications
```lua
exports['ks_ui']:ShowNotification({
    type = 'success', -- 'success', 'error', 'warning', 'info'
    title = 'Title',
    message = 'Your message here',
    duration = 5000, -- milliseconds
    icon = 'url' -- optional
})
```

### Progress Bar
```lua
exports['ks_ui']:StartProgress({
    label = 'Loading...',
    duration = 5000, -- milliseconds
    canCancel = true, -- allow cancellation with X key
    animation = {
        dict = "mini@repair",
        name = "fixing_a_ped",
        flags = 49
    },
    onComplete = function()
        -- Code to run when completed
    end,
    onCancel = function()
        -- Code to run when cancelled
    end
})

-- Update progress manually
exports['ks_ui']:UpdateProgress(id, progress, label)

-- End progress
exports['ks_ui']:EndProgress(id)
```

### Text UI
```lua
exports['ks_ui']:ShowTextUI({
    key = 'E',
    message = 'Open Door',
    duration = 5000, -- optional auto-hide
    hideOnKey = true, -- hide when key is pressed
    canInteract = true, -- enable/disable interaction
    isDisabled = false, -- visual disabled state
    onPress = function()
        -- Code to run when key is pressed
    end
})

-- Update text UI
exports['ks_ui']:UpdateTextUI({
    message = 'New message'
})

-- Hide text UI
exports['ks_ui']:HideTextUI()
```

## 🛠️ Test Commands
- `/testnotify [type]` - Test notifications
- `/testprogress [duration] [label]` - Test progress bar
- `/testtextui [key] [duration] [hideOnKey] [message]` - Test text UI
- `/hidetextui` - Hide text UI


