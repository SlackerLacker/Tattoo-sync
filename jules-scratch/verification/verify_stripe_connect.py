from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Log in
        page.get_by_label("Email").fill("admin@tattoosync.com")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Log in").click()

        # Go to settings
        page.goto("http://localhost:3000/settings")

        # Click on the payments tab
        page.get_by_role("tab", name="Payments").click()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/stripe_connect.png")

        browser.close()

if __name__ == "__main__":
    run()
