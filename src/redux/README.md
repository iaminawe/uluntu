# Redux DevTools Integration

This application uses Redux for state management and includes an enhanced configuration for Redux DevTools, making it easier to debug application state.

## Features Added

The Redux DevTools configuration now includes:

1. **Custom Instance Name**: The Redux store instance is labeled as "Kootenay Tech Community" in the DevTools interface.

2. **Action Tracing**: Action execution paths through middleware, enhancers, and reducers are traced for better debugging.

3. **History Control**: The history is limited to 50 actions to prevent memory issues.

4. **Data Sanitization**: Sensitive information like passwords and tokens are automatically redacted in the DevTools interface.

5. **Development-Only**: DevTools are only enabled in non-production environments.

## How to Use

1. **Install the Redux DevTools Extension**:
   - [Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

2. **Open DevTools in your browser**:
   - Use F12 or right-click and select "Inspect"
   - Navigate to the "Redux" tab

3. **Features available**:
   - State inspection
   - Action history
   - Time travel debugging
   - Action dispatching
   - State diffing between actions
   - Import/Export of state

4. **Keyboard Shortcuts**:
   - Ctrl+H: Toggle visibility
   - Ctrl+Q: Move to the left
   - Ctrl+M: Monitor toggle

## Security Considerations

The configuration automatically redacts:
- Passwords in authentication actions
- Access tokens in the state

This ensures sensitive information isn't exposed in the browser DevTools.

## Additional Resources

- [Redux DevTools Extension Documentation](https://github.com/reduxjs/redux-devtools/tree/main/extension#documentation)
- [Redux Toolkit DevTools Documentation](https://redux-toolkit.js.org/api/configureStore#devtools)
