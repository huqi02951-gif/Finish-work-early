import sys
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        # We don't need a browser for pure API testing, but Playwright's APIRequestContext is very nice
        request_context = p.request.new_context(base_url="http://localhost:3000")
        
        print("======== PHASE 1 BACKEND API TESTS ========\n")

        # 1. Health check
        print("[1] Testing /health endpoint...")
        resp = request_context.get("/health")
        assert resp.ok, f"Health check failed: {resp.status}"
        assert resp.text() == "OK", f"Expected 'OK', got {resp.text()}"
        print("✅ Health check passed!\n")

        # 2. Register
        print("[2] Testing /auth/register endpoint...")
        register_payload = {"username": "testuser_playwright", "password": "123"}
        resp = request_context.post("/auth/register", data=register_payload)
        if resp.status == 400 and "already exists" in resp.text():
            print("⚠️ User already exists, skipping register step...")
        else:
             assert resp.ok, f"Register failed: {resp.status} {resp.text()}"
        print("✅ User registration logic passed!\n")

        # 3. Login
        print("[3] Testing /auth/login endpoint...")
        resp = request_context.post("/auth/login", data=register_payload)
        assert resp.ok, f"Login failed: {resp.status} {resp.text()}"
        token = resp.json().get("access_token")
        assert token, "No access token received!"
        print("✅ Login passed! Token acquired.\n")

        # Set Authorization header for subsequent requests
        headers = {"Authorization": f"Bearer {token}"}

        # 4. Get current user
        print("[4] Testing /users/me endpoint...")
        resp = request_context.get("/users/me", headers=headers)
        assert resp.ok, f"Get me failed: {resp.status} {resp.text()}"
        user_id = resp.json().get("id")
        assert user_id, "User ID not found in /users/me response"
        print(f"✅ Self query passed! User ID: {user_id}\n")

        # 5. Create post
        print("[5] Testing POST /posts endpoint...")
        post_payload = {"title": "Automated Post", "content": "This is sent by Playwright automation."}
        resp = request_context.post("/posts", data=post_payload, headers=headers)
        assert resp.ok, f"Create post failed: {resp.status} {resp.text()}"
        post_id = resp.json().get("id")
        assert post_id, "Post ID not found in response"
        print(f"✅ Create post passed! Post ID: {post_id}\n")

        # 6. Create comment
        print("[6] Testing POST /posts/:postId/comments endpoint...")
        comment_payload = {"content": "This is an automated comment!"}
        resp = request_context.post(f"/posts/{post_id}/comments", data=comment_payload, headers=headers)
        assert resp.ok, f"Create comment failed: {resp.status} {resp.text()}"
        print("✅ Create comment passed!\n")

        # 7. Get posts and post details
        print("[7] Testing GET /posts endpoint...")
        resp = request_context.get("/posts")
        assert resp.ok, f"Get posts failed: {resp.status} {resp.text()}"
        posts = resp.json()
        assert isinstance(posts, list) and len(posts) > 0, "No posts returned"
        print("✅ Get post list passed!\n")

        print("[8] Testing GET /posts/:postId endpoint...")
        resp = request_context.get(f"/posts/{post_id}")
        assert resp.ok, f"Get post detail failed: {resp.status} {resp.text()}"
        post_detail = resp.json()
        assert post_detail.get("id") == post_id, "Post detail mismatch"
        comments = post_detail.get("comments", [])
        assert len(comments) > 0, "No comments found on post"
        print("✅ Get post details and interrelated comments passed!\n")

        print("🎉 ALL PHASE 1 TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {str(e)}")
        sys.exit(1)
