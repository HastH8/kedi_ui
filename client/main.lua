local Config = {
    NotificationDefaults = {
        duration = 5000,
        position = 'top',
        sound = true
    },
    ProgressDefaults = {
        position = 'bottom',
        sound = true
    },
    TextUIDefaults = {
        position = 'bottom',
        sound = true
    }
}

function ShowNotification(data)
    if type(data) == 'string' then
        data = { message = data }
    end
    
    SendNUIMessage({
        type = 'notification',
        title = data.title or 'Notification',
        message = data.message,
        duration = data.duration or Config.NotificationDefaults.duration,
        notificationType = data.type or 'info',
        icon = data.icon,
        gameTime = GetGameTime()
    })
end

function StartProgress(data)
    if type(data) == 'string' then
        data = { label = data }
    end

    local id = data.id or tostring(GetGameTimer())
    local canCancel = data.canCancel
    local animation = data.animation
    local animDict = nil
    local animName = nil
    local flags = nil

    -- Handle animation if provided
    if animation then
        animDict = animation.dict
        animName = animation.name
        flags = animation.flags or 1

        if animDict and animName then
            RequestAnimDict(animDict)
            while not HasAnimDictLoaded(animDict) do
                Wait(0)
            end
            TaskPlayAnim(PlayerPedId(), animDict, animName, 8.0, -8.0, -1, flags, 0, false, false, false)
        end
    end

    -- Start progress bar
    SendNUIMessage({
        type = 'progress',
        action = 'start',
        id = id,
        label = data.label,
        duration = data.duration,
        canCancel = canCancel
    })

    -- Handle cancellation
    local cancelled = false
    if canCancel then
        CreateThread(function()
            while true do
                Wait(0)
                if IsControlJustPressed(0, 73) then -- 'X' key
                    cancelled = true
                    EndProgress(id)
                    if data.onCancel then
                        data.onCancel()
                    end
                    break
                end
            end
        end)
    end

    -- Wait for completion if duration is set
    if data.duration then
        Wait(data.duration)
        if not cancelled and data.onComplete then
            data.onComplete()
        end
    end

    -- Clean up animation
    if animation and animDict then
        StopAnimTask(PlayerPedId(), animDict, animName, 1.0)
    end
    
    return id
end

function UpdateProgress(id, progress, label)
    SendNUIMessage({
        type = 'progress',
        action = 'update',
        id = id,
        progress = progress,
        label = label
    })
end

function EndProgress(id)
    SendNUIMessage({
        type = 'progress',
        action = 'end',
        id = id
    })
end


function ShowTextUI(data)
    if type(data) == 'string' then
        data = { message = data }
    end

    local canInteract = data.canInteract ~= false -- Default to true if not specified
    local isDisabled = data.isDisabled or false
    
    SendNUIMessage({
        type = 'textui',
        action = 'show',
        key = data.key or 'E',
        message = data.message,
        duration = data.duration,
        hideOnKey = data.hideOnKey,
        canInteract = canInteract,
        isDisabled = isDisabled
    })

    -- Handle key press if interaction is enabled
    if data.hideOnKey and canInteract and not isDisabled then
        CreateThread(function()
            while true do
                Wait(0)
                if IsControlJustPressed(0, GetKeyFromInput(data.key)) then
                    if data.onPress then
                        data.onPress()
                    end
                    if data.hideOnKey then
                        HideTextUI()
                    end
                    break
                end
            end
        end)
    end
end

function UpdateTextUI(data)
    SendNUIMessage({
        type = 'textui',
        action = 'update',
        title = data.title,
        message = data.message
    })
end

function HideTextUI()
    SendNUIMessage({
        type = 'textui',
        action = 'hide'
    })
end

function GetKeyFromInput(key)
    local keys = {
        ['E'] = 38,
        ['F'] = 23,
        ['G'] = 47,
        -- Add more key mappings as needed
    }
    return keys[string.upper(key)] or 38
end

function GetGameTime()
    local hours = GetClockHours()
    local minutes = GetClockMinutes()
    -- Format time to ensure leading zeros
    return string.format("%02d:%02d", hours, minutes)
end


-- Exports
exports('ShowNotification', ShowNotification)
exports('StartProgress', StartProgress)
exports('UpdateProgress', UpdateProgress)
exports('EndProgress', EndProgress)
exports('ShowTextUI', ShowTextUI)
exports('UpdateTextUI', UpdateTextUI)
exports('HideTextUI', HideTextUI)

RegisterCommand('testnotify', function(source, args, rawCommand)
    local type = args[1] or 'info' -- success, error, warning, info
    ShowNotification({
        type = type,
        title = 'Test Notification',
        message = 'This is a test notification message',
        duration = 5000,
        icon = nil
    })
end)

RegisterCommand('testprogress', function(source, args, rawCommand)
    local duration = tonumber(args[1]) or 5000
    local label = table.concat(args, ' ', 2) or 'Testing Progress...'
    
    StartProgress({
        label = label,
        duration = duration,
        canCancel = true,
        animation = {
            dict = "mini@repair",
            name = "fixing_a_ped",
            flags = 49
        },
        onComplete = function()
            ShowNotification({
                type = 'success',
                title = 'Progress Complete',
                message = 'Task completed successfully!'
            })
        end,
        onCancel = function()
            ShowNotification({
                type = 'error',
                title = 'Cancelled',
                message = 'Task was cancelled'
            })
        end
    })
end)

RegisterCommand('testtextui', function(source, args, rawCommand)
    local key = args[1] or 'E'
    local duration = tonumber(args[2]) or nil
    local hideOnKey = args[3] == 'true'
    local message = table.concat(args, ' ', 4) or 'Interact'

    ShowTextUI({
        key = key,
        message = message,
        duration = duration,
        hideOnKey = hideOnKey,
        canInteract = true,
        isDisabled = false,
        onPress = function()
            ShowNotification({
                type = 'info',
                title = 'Button Pressed',
                message = 'You pressed ' .. key
            })
        end
    })
end)

RegisterCommand('hidetextui', function()
    HideTextUI()
end)

TriggerEvent('chat:addSuggestion', '/testnotify', 'Test notification system', {
    { name = "type", help = "Notification type (success/error/warning/info)" }
})

TriggerEvent('chat:addSuggestion', '/testprogress', 'Test progress bar', {
    { name = "duration", help = "Duration in ms (default: 5000)" },
    { name = "label", help = "Progress bar label" }
})

TriggerEvent('chat:addSuggestion', '/testtextui', 'Test text UI', {
    { name = "key", help = "Key to display (default: E)" },
    { name = "duration", help = "Duration in ms (optional)" },
    { name = "hideOnKey", help = "Hide on key press (true/false)" },
    { name = "message", help = "Message to display" }
})

TriggerEvent('chat:addSuggestion', '/hidetextui', 'Hide the text UI')