# Backend API Test Script
Write-Host "=== Backend API Test ===" -ForegroundColor Green

# 1. Login Test
Write-Host "`n1. Login Test" -ForegroundColor Yellow
$loginBody = @{
    username = "kim"
    password = "test1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $global:token = $loginResponse.accessToken
    Write-Host "Login SUCCESS!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Cyan
} catch {
    Write-Host "Login FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please register first." -ForegroundColor Yellow
    exit 1
}

# 2. Create Post Test (requires authentication)
Write-Host "`n2. Create Post Test" -ForegroundColor Yellow
$postBody = @{
    title = "Test Post Title"
    content = "This is a test post that will be saved to the database."
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $postResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/posts" -Method POST -Body $postBody -Headers $headers
    Write-Host "Post created SUCCESS!" -ForegroundColor Green
    Write-Host "Post ID: $($postResponse.id)" -ForegroundColor Cyan
    Write-Host "Author: $($postResponse.user.username)" -ForegroundColor Cyan
    Write-Host "Title: $($postResponse.title)" -ForegroundColor Cyan
    
    $global:postId = $postResponse.id
} catch {
    Write-Host "Post creation FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Get Post Test (no authentication required)
Write-Host "`n3. Get Post Test" -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/posts/$postId" -Method GET
    Write-Host "Post retrieval SUCCESS!" -ForegroundColor Green
    Write-Host "Content: $($getResponse.content.Substring(0, [Math]::Min(50, $getResponse.content.Length)))..." -ForegroundColor Cyan
} catch {
    Write-Host "Post retrieval FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Create Comment Test
Write-Host "`n4. Create Comment Test" -ForegroundColor Yellow
$commentBody = @{
    postId = $postId
    content = "This is a test comment."
} | ConvertTo-Json

try {
    $commentResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/comments" -Method POST -Body $commentBody -Headers $headers
    Write-Host "Comment created SUCCESS!" -ForegroundColor Green
    Write-Host "Comment ID: $($commentResponse.id)" -ForegroundColor Cyan
    Write-Host "Author: $($commentResponse.user.username)" -ForegroundColor Cyan
} catch {
    Write-Host "Comment creation FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "`nPlease check the POSTS and COMMENTS tables in Oracle database!" -ForegroundColor Yellow

