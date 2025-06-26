#!/bin/bash

echo "🔍 Debugging Deployed App - White Screen Issue"
echo "============================================="

# Get the deployed URL from user
echo "Enter your deployed app URL (e.g., https://your-domain.com):"
read DEPLOYED_URL

if [ -z "$DEPLOYED_URL" ]; then
    DEPLOYED_URL="http://localhost:3000"
fi

echo -e "\nChecking: $DEPLOYED_URL"

# 1. Check if index.html is served
echo -e "\n1. Testing index.html:"
curl -s "$DEPLOYED_URL" | head -20

# 2. Check if main JS file loads
echo -e "\n2. Checking for main JavaScript file:"
MAIN_JS=$(curl -s "$DEPLOYED_URL" | grep -o 'src="[^"]*\.js"' | head -1 | cut -d'"' -f2)
if [ ! -z "$MAIN_JS" ]; then
    # Handle relative paths
    if [[ "$MAIN_JS" == /* ]]; then
        JS_URL="${DEPLOYED_URL}${MAIN_JS}"
    else
        JS_URL="${DEPLOYED_URL}/${MAIN_JS}"
    fi
    echo "Found main JS: $JS_URL"
    echo "Testing JS file..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$JS_URL")
    echo "JS file HTTP status: $HTTP_CODE"
    
    # Check if environment variables are in the built JS
    echo -e "\n3. Checking for Supabase URL in built files:"
    curl -s "$JS_URL" | grep -o "supabase\.co" | head -5
    if [ $? -ne 0 ]; then
        echo "⚠️  WARNING: No Supabase URL found in JavaScript files!"
        echo "This suggests environment variables were NOT included in the build."
    fi
else
    echo "❌ No JavaScript file found in index.html"
fi

# 3. Common issues to check
echo -e "\n4. Common White Screen Causes:"
echo "================================"
echo ""
echo "1. Environment Variables Not Set During Build"
echo "   - Check if VITE_SUPABASE_URL was set as build arg"
echo "   - Check if VITE_SUPABASE_ANON_KEY was set as build arg"
echo ""
echo "2. Check Browser Console (F12):"
echo "   a) Network tab - any 404 errors?"
echo "   b) Console tab - JavaScript errors?"
echo "   c) Common errors:"
echo "      - 'Cannot read property of undefined'"
echo "      - 'Failed to fetch'"
echo "      - 'CORS policy' errors"
echo ""
echo "3. Verify in Container:"
echo "   docker exec <container> sh -c 'grep -r "supabase.co" /usr/share/nginx/html || echo "No Supabase URL found"'"
echo ""
echo "4. Check Coolify Build Logs:"
echo "   - Look for 'Building with:' lines"
echo "   - Verify VITE_ variables are shown"
echo ""

# 4. Generate test HTML
echo -e "\n5. Test HTML to verify deployment works:"
cat > test-deployment.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Deployment Test</title>
</head>
<body>
    <h1>Deployment Test</h1>
    <div id="test"></div>
    <script>
        // Test if environment variables are available
        const testData = {
            timestamp: new Date().toISOString(),
            env: typeof import !== 'undefined' && import.meta && import.meta.env ? import.meta.env : 'Not available',
            userAgent: navigator.userAgent
        };
        
        document.getElementById('test').innerHTML = `
            <h2>Test Results:</h2>
            <pre>${JSON.stringify(testData, null, 2)}</pre>
            <p>If you see environment variables above, the deployment is working.</p>
            <p>If not, environment variables were not set during build.</p>
        `;
    </script>
</body>
</html>
EOF

echo "Created test-deployment.html - upload this to test basic deployment"
echo ""
echo "Next Steps:"
echo "1. Open $DEPLOYED_URL in browser"
echo "2. Open DevTools (F12) and check Console for errors"
echo "3. Share any error messages you see"