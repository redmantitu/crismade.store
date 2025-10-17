import os
from playwright.sync_api import sync_playwright, expect

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to the local index.html file
        path = os.path.abspath("index.html")
        page.goto(f"file://{path}")

        # Check the first product order link
        first_order_link = page.locator('.product-order-link').first
        expect(first_order_link).to_have_attribute('href', 'mailto:comenzi.crismade.store@gmail.com?subject=Comanda%20Lumanare%20Botez%20-%20Ursulet%20v1')

        # Check the contact email link
        contact_link = page.locator('#contact-email-link')
        expect(contact_link).to_have_attribute('href', 'mailto:comenzi.crismade.store@gmail.com')
        expect(contact_link.locator('span')).to_have_text('comenzi.crismade.store@gmail.com')

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run_test()