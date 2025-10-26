
import time
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Login to the application first
            page.goto("http://localhost:3000/login")
            page.fill("input[name='email']", "admin@tattoosync.com")
            page.fill("input[name='password']", "password")
            page.click("button[type='submit']")

            # Wait for the redirect to the schedule page
            page.wait_for_url("http://localhost:3000/schedule")
            page.wait_for_load_state('networkidle')

            # Find a checkout button and click it. We'll take the first one.
            checkout_button = page.locator('button:has-text("Checkout")').first
            expect(checkout_button).to_be_visible()
            checkout_button.click()

            # The button opens a dialog, so we need to click the card payment button inside the dialog.
            card_payment_button = page.locator('button:has-text("Credit/Debit Card")')
            expect(card_payment_button).to_be_visible()
            card_payment_button.click()

            # Wait for the navigation to Stripe
            page.wait_for_url("https://checkout.stripe.com/**", timeout=15000)

            # Verify we are on the Stripe page
            expect(page).to_have_title("Stripe Checkout")

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/checkout_verification.png")

            print("Verification successful!")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
